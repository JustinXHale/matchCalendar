import { useEffect, useState } from 'react';
import { Button, FormGroup } from '@patternfly/react-core';
import { FormTextInput } from '@/ui/forms/FormTextInput';
import type {
  FlightInfo,
  FlightSegment,
  GroundTravelInfo,
  LodgingInfo,
} from '@/domain/match';
import {
  emptyFlightSegment,
  getFlightSegments,
  hasFlightSegmentData,
} from '@/features/matches/flightUtils';
import {
  formatTravelDuration,
  getTotalFlightMinutes,
} from '@/features/matches/travelDuration';
import { DateTimeInput } from '@/ui/forms/DateTimeInput';
import { NativeInput } from '@/ui/forms/NativeInput';
import { TravelPaidFields } from '@/ui/forms/TravelPaidFields';
import { FlightImportPanel } from '@/ui/forms/FlightImportPanel';
import { hasFlightImportAccess } from '@/services/flightImport';
import { hasAeroDataBoxImport } from '@/features/matches/flightImport';
import { FlightDataAttribution } from '@/ui/FlightDataAttribution';

type FlightProps = {
  flight: FlightInfo;
  onChange: (patch: Partial<FlightInfo>) => void;
};

type LodgingProps = {
  lodging: LodgingInfo;
  onChange: (patch: Partial<LodgingInfo>) => void;
};

type GroundProps = {
  groundTravel: GroundTravelInfo;
  onChange: (patch: Partial<GroundTravelInfo>) => void;
};

function FlightSegmentFields({
  segment,
  index,
  canRemove,
  canImport,
  onAddSegment,
  onClear,
  onChange,
  onRemove,
}: {
  segment: FlightSegment;
  index: number;
  canRemove: boolean;
  canImport: boolean;
  onAddSegment: () => void;
  onClear: () => void;
  onChange: (patch: Partial<FlightSegment>) => void;
  onRemove: () => void;
}) {
  const idPrefix = `flight-${segment.id}`;
  const [importing, setImporting] = useState(false);

  return (
    <div className="rs-flight-segment">
      <div className="rs-flight-segment__header">
        <span className="rs-flight-segment__title">Segment {index + 1}</span>
        <div className="rs-flight-segment__actions">
          {!importing ? (
            <Button variant="link" isInline onClick={onClear}>
              Clear segment
            </Button>
          ) : null}
          {!importing && canImport ? (
            <span className="rs-flight-segment__action-separator" aria-hidden>
              |
            </span>
          ) : null}
          {canImport ? (
            <Button variant="link" isInline onClick={() => setImporting((value) => !value)}>
              {importing ? 'Cancel import' : 'Import flight'}
            </Button>
          ) : null}
          {canRemove ? (
            <Button variant="link" isInline onClick={onRemove}>
              Remove
            </Button>
          ) : null}
        </div>
      </div>

      {importing ? (
        <FlightImportPanel
          segment={segment}
          onCancel={() => setImporting(false)}
          onAddSegment={onAddSegment}
          onImport={(patch) => {
            onChange(patch);
            setImporting(false);
          }}
        />
      ) : (
        <>
          <div className="rs-form-row rs-flight-identity">
            <NativeInput
              id={`${idPrefix}-airline`}
              label="Airline"
              list={`${idPrefix}-airlines`}
              value={segment.airline ?? ''}
              onChange={(value) => onChange({ airline: value })}
            />
            <NativeInput
              id={`${idPrefix}-number`}
              label="Flight #"
              autoUppercase
              value={segment.flightNumber ?? ''}
              onChange={(value) => onChange({ flightNumber: value })}
            />
            <NativeInput
              id={`${idPrefix}-confirmation`}
              label="Confirmation"
              autoUppercase
              value={segment.confirmation ?? ''}
              onChange={(value) => onChange({ confirmation: value })}
            />
          </div>

          <datalist id={`${idPrefix}-airlines`}>
            {['American Airlines', 'Delta Air Lines', 'United Airlines', 'Southwest Airlines', 'JetBlue', 'Alaska Airlines', 'Air Canada', 'British Airways', 'Lufthansa', 'Emirates'].sort((a, b) => a.localeCompare(b)).map((airline) => <option key={airline} value={airline} />)}
          </datalist>
          <div className="rs-form-row">
            <NativeInput
              id={`${idPrefix}-departure-airport`}
              label="Departing airport"
              autoUppercase
              value={segment.departureAirport ?? ''}
              onChange={(departureAirport) => onChange({ departureAirport })}
            />
            <DateTimeInput
              id={`${idPrefix}-departure`}
              label="Departure date & time"
              value={segment.departureAt}
              onChange={(departureAt) => onChange({ departureAt })}
            />
          </div>
          <div className="rs-form-row">
            <NativeInput
              id={`${idPrefix}-arrival-airport`}
              label="Arriving airport"
              autoUppercase
              value={segment.arrivalAirport ?? ''}
              onChange={(arrivalAirport) => onChange({ arrivalAirport })}
            />
            <DateTimeInput
              id={`${idPrefix}-arrival`}
              label="Arrival date & time"
              value={segment.arrivalAt}
              onChange={(arrivalAt) => onChange({ arrivalAt })}
            />
          </div>
        </>
      )}
    </div>
  );
}

export function FlightFields({ flight, onChange }: FlightProps) {
  const segments = getFlightSegments(flight);
  const totalFlightMinutes = getTotalFlightMinutes(flight);
  const [canImport, setCanImport] = useState(false);

  useEffect(() => {
    let active = true;
    void hasFlightImportAccess()
      .then((enabled) => {
        if (active) setCanImport(enabled);
      })
      .catch(() => {
        if (active) setCanImport(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateSegments = (nextSegments: FlightSegment[]) => {
    onChange({ segments: nextSegments });
  };

  const updateSegment = (segmentId: string, patch: Partial<FlightSegment>) => {
    updateSegments(
      segments.map((segment) =>
        segment.id === segmentId ? { ...segment, ...patch } : segment,
      ),
    );
  };

  const clearSegment = (segmentId: string) => {
    updateSegments(
      segments.map((segment) =>
        segment.id === segmentId ? { id: segment.id } : segment,
      ),
    );
  };

  const addSegment = () => {
    const previousSegment = segments[segments.length - 1];
    updateSegments([
      ...segments,
      {
        ...emptyFlightSegment(),
        ...(previousSegment?.arrivalAirport
          ? { departureAirport: previousSegment.arrivalAirport }
          : {}),
      },
    ]);
  };

  const removeSegment = (segmentId: string) => {
    const nextSegments = segments.filter((segment) => segment.id !== segmentId);
    updateSegments(nextSegments.length > 0 ? nextSegments : [emptyFlightSegment()]);
  };

  return (
    <div className="rs-form-stack rs-form-stack--compact">
      <div className="rs-flight-segments">
        {segments.map((segment, index) => (
          <FlightSegmentFields
            key={segment.id}
            segment={segment}
            index={index}
            canRemove={segments.length > 1}
            canImport={canImport}
            onAddSegment={addSegment}
            onClear={() => clearSegment(segment.id)}
            onChange={(patch) => updateSegment(segment.id, patch)}
            onRemove={() => removeSegment(segment.id)}
          />
        ))}
      </div>

      {segments.some(hasAeroDataBoxImport) ? <FlightDataAttribution /> : null}

      {totalFlightMinutes != null ? (
        <p className="rs-flight-total-time">
          Total air time: {formatTravelDuration(totalFlightMinutes)}
        </p>
      ) : null}

      <TravelPaidFields
        idPrefix="flight"
        values={flight}
        onChange={onChange}
      />

      <FormGroup label="Notes" fieldId="flight-notes">
        <FormTextInput
          id="flight-notes"
          value={flight.notes ?? ''}
          onChange={(_event, value) => onChange({ notes: value })}
        />
      </FormGroup>
    </div>
  );
}

export function LodgingFields({ lodging, onChange }: LodgingProps) {
  return (
    <div className="rs-form-stack rs-form-stack--compact">
      <div className="rs-form-row">
        <NativeInput
          id="lodging-check-in"
          label="Check-in"
          type="date"
          value={lodging.checkInDate ?? ''}
          onChange={(value) => onChange({ checkInDate: value })}
        />
        <NativeInput
          id="lodging-check-out"
          label="Check-out"
          type="date"
          value={lodging.checkOutDate ?? ''}
          onChange={(value) => onChange({ checkOutDate: value })}
        />
      </div>

      <div className="rs-form-row">
        <NativeInput
          id="lodging-property"
          label="Property name"
          value={lodging.propertyName ?? ''}
          onChange={(value) => onChange({ propertyName: value })}
        />
        <NativeInput
          id="lodging-confirmation"
          label="Confirmation"
          value={lodging.confirmation ?? ''}
          onChange={(value) => onChange({ confirmation: value })}
        />
      </div>

      <NativeInput
        id="lodging-address"
        label="Address"
        value={lodging.address ?? ''}
        onChange={(value) => onChange({ address: value })}
      />

      <TravelPaidFields
        idPrefix="lodging"
        values={lodging}
        onChange={onChange}
      />

      <FormGroup label="Notes" fieldId="lodging-notes">
        <FormTextInput
          id="lodging-notes"
          value={lodging.notes ?? ''}
          onChange={(_event, value) => onChange({ notes: value })}
        />
      </FormGroup>
    </div>
  );
}

export function GroundTravelFields({ groundTravel, onChange }: GroundProps) {
  return (
    <div className="rs-form-stack rs-form-stack--compact">
      <NativeInput
        id="ground-provider"
        label="Provider"
        value={groundTravel.provider ?? ''}
        onChange={(value) => onChange({ provider: value })}
      />

      <div className="rs-form-row">
        <DateTimeInput
          id="ground-pickup"
          label="Pickup"
          value={groundTravel.pickupAt}
          onChange={(pickupAt) => onChange({ pickupAt })}
        />
        <DateTimeInput
          id="ground-return"
          label="Return"
          value={groundTravel.returnAt}
          onChange={(returnAt) => onChange({ returnAt })}
        />
      </div>

      <NativeInput
        id="ground-confirmation"
        label="Confirmation"
        value={groundTravel.confirmation ?? ''}
        onChange={(value) => onChange({ confirmation: value })}
      />

      <TravelPaidFields
        idPrefix="ground"
        values={groundTravel}
        onChange={onChange}
      />

      <FormGroup label="Notes" fieldId="ground-notes">
        <FormTextInput
          id="ground-notes"
          value={groundTravel.notes ?? ''}
          onChange={(_event, value) => onChange({ notes: value })}
        />
      </FormGroup>
    </div>
  );
}

function selfPaidSummary(info: {
  selfPaid?: boolean;
  amountPaid?: number;
  reimbursementStatus?: FlightInfo['reimbursementStatus'];
}): string | undefined {
  if (!info.selfPaid || info.amountPaid == null) return undefined;

  const amount = `$${info.amountPaid}`;
  if (info.reimbursementStatus === 'reimbursed') return `${amount} · reimbursed`;
  if (info.reimbursementStatus === 'pending') return `${amount} · awaiting reimbursement`;
  return amount;
}

export function flightSectionSummary(flight: FlightInfo): string | undefined {
  const segments = getFlightSegments(flight).filter(hasFlightSegmentData);
  const first = segments[0];
  const leg = first
    ? [first.airline, first.flightNumber].filter(Boolean).join(' ')
    : undefined;
  const parts = [
    leg,
    segments.length > 1 ? `${segments.length} segments` : undefined,
    selfPaidSummary(flight),
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' · ') : undefined;
}

export function lodgingSectionSummary(lodging: LodgingInfo): string | undefined {
  const parts = [
    lodging.propertyName,
    lodging.checkInDate,
    selfPaidSummary(lodging),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : undefined;
}

export function groundTravelSectionSummary(
  groundTravel: GroundTravelInfo,
): string | undefined {
  const parts = [
    groundTravel.provider,
    selfPaidSummary(groundTravel),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : undefined;
}

export function expensesSectionSummary(count: number): string | undefined {
  return count > 0 ? `${count} expense${count === 1 ? '' : 's'}` : undefined;
}
