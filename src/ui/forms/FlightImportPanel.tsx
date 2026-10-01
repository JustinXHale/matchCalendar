import { useState, type FormEvent } from 'react';
import { Button } from '@patternfly/react-core';
import type { FlightSegment } from '@/domain/match';
import {
  flightLookupToSegmentPatch,
  type FlightLookupMovement,
  type FlightLookupOption,
} from '@/features/matches/flightImport';
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
};

function formatMovementTime(movement: FlightLookupMovement): string {
  if (!movement.scheduledUtc) return 'Time unavailable';
  const date = new Date(movement.scheduledUtc);
  if (Number.isNaN(date.getTime())) return 'Time unavailable';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...(movement.timeZone ? { timeZone: movement.timeZone } : {}),
  }).format(date);
}

function routeLabel(flight: FlightLookupOption): string {
  const departure = flight.departure.airportCode || flight.departure.airportName;
  const arrival = flight.arrival.airportCode || flight.arrival.airportName;
  return `${departure || 'Unknown'} → ${arrival || 'Unknown'}`;
}

export function FlightImportPanel({ segment, onImport, onCancel }: Props) {
  const [flightNumber, setFlightNumber] = useState(segment.flightNumber ?? '');
  const [departureDate, setDepartureDate] = useState(
    segment.flightLookupDepartureDate ?? toDateInputValue(segment.departureAt),
  );
  const [results, setResults] = useState<FlightLookupOption[] | null>(null);
  const [error, setError] = useState<string>();
  const [searching, setSearching] = useState(false);

  const search = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedNumber = flightNumber.replace(/\s+/g, '').toUpperCase();
    if (!normalizedNumber || !departureDate) {
      setError('Enter a flight number and departure date.');
      return;
    }

    setSearching(true);
    setError(undefined);
    setResults(null);
    try {
      const flights = await searchFlightData(normalizedNumber, departureDate);
      setResults(flights);
      if (flights.length === 0) {
        setError('No matching flight was found. Check the number and departure date.');
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
        Search using the airline code and flight number shown on your itinerary.
      </p>
      <div className="rs-form-row">
        <NativeInput
          id={`flight-import-number-${segment.id}`}
          label="Flight number"
          value={flightNumber}
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
      </div>
      {error ? <span className="rs-form-error" role="alert">{error}</span> : null}
      <div className="rs-flight-import__actions">
        <Button type="button" variant="link" onClick={onCancel} isDisabled={searching}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={searching} isDisabled={searching}>
          Find flight
        </Button>
      </div>

      {results && results.length > 0 ? (
        <div className="rs-flight-import__results" aria-label="Matching flights">
          <p className="rs-flight-import__results-label">
            Select the flight that matches your itinerary.
          </p>
          {results.map((flight) => (
            <button
              key={flight.id}
              type="button"
              className="rs-flight-import__result"
              onClick={() => onImport(flightLookupToSegmentPatch(flight, {
                flightNumber: flightNumber.replace(/\s+/g, '').toUpperCase(),
                departureDate,
              }))}
            >
              <strong>{flight.number} · {routeLabel(flight)}</strong>
              <span>
                {[flight.airline, formatMovementTime(flight.departure), flight.status]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </button>
          ))}
        </div>
      ) : null}
      <FlightDataAttribution />
    </form>
  );
}
