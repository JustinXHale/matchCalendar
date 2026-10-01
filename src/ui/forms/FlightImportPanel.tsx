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
  const [searching, setSearching] = useState(false);

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
  };

  const search = async (event: FormEvent) => {
    event.preventDefault();
    setSearching(true);
    setError(undefined);

    const patches: Partial<FlightSegment>[] = [];
    let previousArrivalAirport = '';

    try {
      for (const [index, draft] of drafts.entries()) {
        const flightNumber = draft.flightNumber.replace(/\s+/g, '').toUpperCase();
        const departureAirport =
          draft.departureAirport.trim().toUpperCase() || previousArrivalAirport;
        const confirmation = draft.confirmation.trim().toUpperCase();

        if (!flightNumber || !draft.departureDate || !departureAirport) {
          throw new Error(
            `Segment ${index + 1}: enter the flight number, departure date, and departing airport.`,
          );
        }

        const flights = await searchFlightData(
          flightNumber,
          draft.departureDate,
          departureAirport,
        );
        if (flights.length === 0) {
          throw new Error(
            `Segment ${index + 1}: no matching flight was found. Check the three lookup fields.`,
          );
        }
        if (flights.length > 1) {
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
    <form className="rs-flight-import" onSubmit={(event) => void search(event)}>
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
              onChange={(departureAirport) =>
                updateDraft(draft.id, { departureAirport })
              }
            />
          </div>
          <div className="rs-form-row">
            <NativeInput
              id={`flight-import-date-${draft.id}`}
              label="Departure date"
              type="date"
              value={draft.departureDate}
              isRequired
              onChange={(departureDate) =>
                updateDraft(draft.id, { departureDate })
              }
            />
            <NativeInput
              id={`flight-import-number-${draft.id}`}
              label="Flight number"
              value={draft.flightNumber}
              placeholder="e.g. DL1073"
              autoUppercase
              isRequired
              onChange={(flightNumber) =>
                updateDraft(draft.id, { flightNumber })
              }
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
