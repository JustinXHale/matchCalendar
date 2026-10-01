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
  onImport: (patch: Partial<FlightSegment>) => void;
  onCancel: () => void;
  onAddSegment: () => void;
};

export function FlightImportPanel({
  segment,
  onImport,
  onCancel,
  onAddSegment,
}: Props) {
  const [flightNumber, setFlightNumber] = useState(segment.flightNumber ?? '');
  const [departureDate, setDepartureDate] = useState(
    segment.flightLookupDepartureDate ?? toDateInputValue(segment.departureAt),
  );
  const [departureAirport, setDepartureAirport] = useState(
    segment.departureAirport ?? '',
  );
  const [error, setError] = useState<string>();
  const [searching, setSearching] = useState(false);

  const search = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedNumber = flightNumber.replace(/\s+/g, '').toUpperCase();
    const normalizedAirport = departureAirport.trim().toUpperCase();
    if (!normalizedNumber || !departureDate || !normalizedAirport) {
      setError(
        'Enter the flight number, departure date, and departing airport.',
      );
      return;
    }

    setSearching(true);
    setError(undefined);
    try {
      const flights = await searchFlightData(
        normalizedNumber,
        departureDate,
        normalizedAirport,
      );
      if (flights.length === 0) {
        setError('No matching flight was found. Check all three fields.');
      } else if (flights.length > 1) {
        setError(
          'More than one flight matched. Check the flight and airport codes.',
        );
      } else {
        onImport(
          flightLookupToSegmentPatch(flights[0], {
            flightNumber: normalizedNumber,
            departureDate,
          }),
        );
      }
    } catch (lookupError) {
      setError(flightImportErrorMessage(lookupError));
    } finally {
      setSearching(false);
    }
  };

  return (
    <form className="rs-flight-import" onSubmit={(event) => void search(event)}>
      <p className="rs-form-hint">
        Enter the codes shown on your itinerary. A unique match imports immediately.
      </p>
      <div className="rs-form-row rs-form-row--3">
        <NativeInput
          id={`flight-import-number-${segment.id}`}
          label="Flight number"
          value={flightNumber}
          placeholder="e.g. DL1073"
          autoUppercase
          isRequired
          onChange={setFlightNumber}
        />
        <NativeInput
          id={`flight-import-date-${segment.id}`}
          label="Departure date"
          type="date"
          value={departureDate}
          isRequired
          onChange={setDepartureDate}
        />
        <NativeInput
          id={`flight-import-airport-${segment.id}`}
          label="Departing airport"
          value={departureAirport}
          placeholder="e.g. SAT"
          autoUppercase
          isRequired
          onChange={setDepartureAirport}
        />
      </div>
      <Button
        type="button"
        variant="secondary"
        className="rs-flight-import__add-segment"
        onClick={onAddSegment}
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
          Import flight
        </Button>
      </div>
      <FlightDataAttribution />
    </form>
  );
}
