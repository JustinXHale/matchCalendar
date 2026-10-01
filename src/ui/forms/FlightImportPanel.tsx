import { useState, type FormEvent } from 'react';
import { Button } from '@patternfly/react-core';
import type { FlightSegment } from '@/domain/match';
import { flightLookupToSegmentPatch } from '@/features/matches/flightImport';
import {
  flightImportErrorMessage,
  searchFlightData,
} from '@/services/flightImport';
import { NativeInput } from '@/ui/forms/NativeInput';
import { toDateInputValue } from '@/ui/forms/formDateUtils';
import { FlightDataAttribution } from '@/ui/FlightDataAttribution';

type Props = {
  segment: FlightSegment;
  onImport: (patches: Partial<FlightSegment>[]) => void;
  onCancel: () => void;
};

type ImportDraft = {
  id: string;
  confirmation: string;
  departureAirport: string;
  departureDate: string;
  flightNumber: string;
};

type LookupField = 'departureAirport' | 'departureDate' | 'flightNumber';
type DraftFieldErrors = Partial<Record<LookupField, true>>;

function initialDraft(segment: FlightSegment): ImportDraft {
  return {
    id: crypto.randomUUID(),
    confirmation: segment.confirmation ?? '',
    departureAirport: segment.departureAirport ?? '',
    departureDate:
      segment.flightLookupDepartureDate ?? toDateInputValue(segment.departureAt),
    flightNumber: segment.flightNumber ?? '',
  };
}

function emptyDraft(departureAirport = ''): ImportDraft {
  return {
    id: crypto.randomUUID(),
    confirmation: '',
    departureAirport,
    departureDate: '',
    flightNumber: '',
  };
}

export function FlightImportPanel({ segment, onImport, onCancel }: Props) {
  const [drafts, setDrafts] = useState<ImportDraft[]>(() => [
    initialDraft(segment),
  ]);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, DraftFieldErrors>
  >({});
  const [searching, setSearching] = useState(false);

  const markFieldErrors = (id: string, fields: LookupField[]) => {
    setFieldErrors((current) => ({
      ...current,
      [id]: Object.fromEntries(fields.map((field) => [field, true])),
    }));
  };

  const clearFieldError = (id: string, field: LookupField) => {
    setFieldErrors((current) => {
      if (!current[id]?.[field]) return current;
      const nextForDraft = { ...current[id] };
      delete nextForDraft[field];
      return { ...current, [id]: nextForDraft };
    });
  };

  const updateDraft = (id: string, patch: Partial<ImportDraft>) => {
    setDrafts((current) =>
      current.map((draft) =>
        draft.id === id ? { ...draft, ...patch } : draft,
      ),
    );
  };

  const addDraft = () => {
    setDrafts((current) => [
      ...current,
      emptyDraft(current.length === 1 ? segment.arrivalAirport ?? '' : ''),
    ]);
  };

  const removeDraft = (id: string) => {
    setDrafts((current) => current.filter((draft) => draft.id !== id));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const search = async (event: FormEvent) => {
    event.preventDefault();
    setSearching(true);
    setError(undefined);
    setFieldErrors({});

    const patches: Partial<FlightSegment>[] = [];
    let previousArrivalAirport = '';

    try {
      for (const [index, draft] of drafts.entries()) {
        const flightNumber = draft.flightNumber.replace(/\s+/g, '').toUpperCase();
        const departureAirport =
          draft.departureAirport.trim().toUpperCase() || previousArrivalAirport;
        const confirmation = draft.confirmation.trim().toUpperCase();

        const invalidFields: LookupField[] = [];
        if (!/^(?:[A-Z0-9]{2}|[A-Z]{3})\d{1,4}[A-Z]?$/.test(flightNumber)) {
          invalidFields.push('flightNumber');
        }
        if (!draft.departureDate) invalidFields.push('departureDate');
        if (!/^[A-Z]{3}$/.test(departureAirport)) {
          invalidFields.push('departureAirport');
        }

        if (invalidFields.length > 0) {
          markFieldErrors(draft.id, invalidFields);
          throw new Error(
            `Segment ${index + 1}: check the highlighted lookup fields.`,
          );
        }

        const flights = await searchFlightData(
          flightNumber,
          draft.departureDate,
          departureAirport,
        );
        if (flights.length === 0) {
          markFieldErrors(draft.id, [
            'departureAirport',
            'departureDate',
            'flightNumber',
          ]);
          throw new Error(
            `Segment ${index + 1}: no matching flight was found. Check the three lookup fields.`,
          );
        }
        if (flights.length > 1) {
          markFieldErrors(draft.id, ['departureAirport', 'flightNumber']);
          throw new Error(
            `Segment ${index + 1}: more than one flight matched. Check the flight and airport codes.`,
          );
        }

        const flight = flights[0];
        previousArrivalAirport =
          flight.arrival.airportCode?.toUpperCase() ?? '';
        patches.push({
          ...flightLookupToSegmentPatch(flight, {
            flightNumber,
            departureDate: draft.departureDate,
          }),
          confirmation,
        });
      }

      onImport(patches);
    } catch (lookupError) {
      setError(flightImportErrorMessage(lookupError));
    } finally {
      setSearching(false);
    }
  };

  return (
    <form
      className="rs-flight-import"
      noValidate
      onSubmit={(event) => void search(event)}
    >
      <p className="rs-form-hint">
        Enter the codes shown on your itinerary. Unique matches import together.
      </p>

      {drafts.map((draft, index) => (
        <div key={draft.id} className="rs-flight-import__segment">
          {drafts.length > 1 ? (
            <div className="rs-flight-import__segment-header">
              <strong>Import segment {index + 1}</strong>
              {index > 0 ? (
                <Button
                  type="button"
                  variant="link"
                  isInline
                  onClick={() => removeDraft(draft.id)}
                  isDisabled={searching}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          ) : null}

          <div className="rs-form-row">
            <NativeInput
              id={`flight-import-confirmation-${draft.id}`}
              label="Confirmation #"
              value={draft.confirmation}
              placeholder="Optional"
              autoUppercase
              onChange={(confirmation) =>
                updateDraft(draft.id, { confirmation })
              }
            />
            <NativeInput
              id={`flight-import-airport-${draft.id}`}
              label="Departing airport"
              value={draft.departureAirport}
              placeholder={index > 0 ? 'Auto from prior arrival' : 'e.g. SAT'}
              autoUppercase
              isRequired={index === 0}
              validated={
                fieldErrors[draft.id]?.departureAirport ? 'error' : 'default'
              }
              onChange={(departureAirport) => {
                updateDraft(draft.id, { departureAirport });
                clearFieldError(draft.id, 'departureAirport');
              }}
            />
          </div>
          <div className="rs-form-row">
            <NativeInput
              id={`flight-import-date-${draft.id}`}
              label="Departure date"
              type="date"
              value={draft.departureDate}
              isRequired
              validated={
                fieldErrors[draft.id]?.departureDate ? 'error' : 'default'
              }
              onChange={(departureDate) => {
                updateDraft(draft.id, { departureDate });
                clearFieldError(draft.id, 'departureDate');
              }}
            />
            <NativeInput
              id={`flight-import-number-${draft.id}`}
              label="Flight number"
              value={draft.flightNumber}
              placeholder="e.g. DL1073"
              autoUppercase
              isRequired
              validated={
                fieldErrors[draft.id]?.flightNumber ? 'error' : 'default'
              }
              onChange={(flightNumber) => {
                updateDraft(draft.id, { flightNumber });
                clearFieldError(draft.id, 'flightNumber');
              }}
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        className="rs-flight-import__add-segment"
        onClick={addDraft}
        isDisabled={searching}
      >
        Add segment
      </Button>
      {error ? <span className="rs-form-error" role="alert">{error}</span> : null}
      <div className="rs-flight-import__actions">
        <Button
          type="button"
          variant="link"
          onClick={onCancel}
          isDisabled={searching}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          isLoading={searching}
          isDisabled={searching}
        >
          {drafts.length === 1 ? 'Import flight' : 'Import flights'}
        </Button>
      </div>
      <FlightDataAttribution />
    </form>
  );
}
