import { useEffect, useRef, useState } from 'react';
import { Button, FormGroup } from '@patternfly/react-core';
import { FormTextInput } from '@/ui/forms/FormTextInput';
import { useLocation, useNavigate } from 'react-router-dom';
import { closeQuickMatch } from '@/app/navigation';
import { routes } from '@/app/routes';
import { backFromLocation } from '@/nav/backDefaults';
import { backState } from '@/nav/backNav';
import { useProfile } from '@/features/profile/ProfileProvider';
import {
  buildMatchFromForm,
  createEmptyMatchForm,
} from '@/features/matches/matchFormUtils';
import { useMatchesContext } from '@/features/matches/MatchesProvider';
import {
  hasFormErrors,
  validateMatchForm,
  type MatchFormErrors,
  type MatchFormValues,
} from '@/features/matches/matchValidation';
import { NativeInput } from '@/ui/forms/NativeInput';
import { PresetSelectFields } from '@/ui/forms/PresetSelectFields';

export function QuickMatchModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);
  const { createMatch } = useMatchesContext();
  const { profile } = useProfile();
  const [values, setValues] = useState<MatchFormValues>(() =>
    createEmptyMatchForm(profile.defaultPositionPreset),
  );
  const [errors, setErrors] = useState<MatchFormErrors>({});

  const close = () => closeQuickMatch(navigate);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const onChange = (patch: Partial<MatchFormValues>) => {
    setValues((current) => ({ ...current, ...patch }));
  };

  const save = () => {
    const nextErrors = validateMatchForm(values);
    setErrors(nextErrors);
    if (hasFormErrors(nextErrors)) return;

    createMatch(buildMatchFromForm(values));
    close();
  };

  const goToFull = () => {
    navigate(routes.fullMatch, {
      replace: true,
      state: {
        draft: values,
        ...backState(backFromLocation(location)),
      },
    });
  };

  return (
    <div className="rs-modal-backdrop" onClick={close}>
      <div
        ref={panelRef}
        className="rs-modal rs-modal--sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-match-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="rs-modal__header">
          <h2 id="quick-match-title" className="rs-modal__title">
            Quick Match
          </h2>
          <button
            type="button"
            className="rs-modal__close"
            aria-label="Close"
            onClick={close}
          >
            ×
          </button>
        </header>

        <div className="rs-modal__body rs-form-stack rs-form-stack--compact">
          <PresetSelectFields
            positionPreset={values.positionPreset}
            customPosition={values.customPosition}
            matchType={values.matchType}
            customMatchType={values.customMatchType}
            positionError={errors.position}
            matchTypeError={errors.customMatchType ?? errors.matchType}
            onChange={onChange}
          />

          <FormGroup label="Match title (optional)" fieldId="quick-title">
            <FormTextInput
              id="quick-title"
              value={values.title}
              onChange={(_event, value) => onChange({ title: value })}
            />
          </FormGroup>

          <div className="rs-form-row">
            <NativeInput
              id="quick-date"
              label="Day"
              type="date"
              isRequired
              value={values.date}
              onChange={(value) => onChange({ date: value })}
              validated={errors.date ? 'error' : 'default'}
              error={errors.date}
            />
            <NativeInput
              id="quick-time"
              label="Time"
              type="time"
              isRequired
              value={values.time}
              onChange={(value) => onChange({ time: value })}
              validated={errors.time ? 'error' : 'default'}
              error={errors.time}
            />
          </div>

          <div className="rs-form-row">
            <FormGroup label="Home" fieldId="quick-home">
              <FormTextInput
                id="quick-home"
                value={values.home}
                onChange={(_event, value) => onChange({ home: value })}
              />
            </FormGroup>

            <FormGroup label="Away" fieldId="quick-away">
              <FormTextInput
                id="quick-away"
                value={values.away}
                onChange={(_event, value) => onChange({ away: value })}
              />
            </FormGroup>
          </div>

          {errors.teams ? (
            <span className="rs-form-error" role="alert">{errors.teams}</span>
          ) : null}

          <FormGroup label="Location" isRequired fieldId="quick-location">
            <FormTextInput
              id="quick-location"
              value={values.location}
              onChange={(_event, value) => onChange({ location: value })}
              validated={errors.location ? 'error' : 'default'}
            />
            {errors.location ? (
              <span className="rs-form-error" role="alert">
                {errors.location}
              </span>
            ) : null}
          </FormGroup>

          <div className="rs-form-row">
            <FormGroup label="Pay (optional)" fieldId="quick-pay">
              <FormTextInput
                id="quick-pay"
                type="number"
                inputMode="decimal"
                value={values.expectedPay}
                onChange={(_event, value) => onChange({ expectedPay: value })}
              />
            </FormGroup>

            <FormGroup label="Who owes pay?" fieldId="quick-pay-owed-by">
              <FormTextInput
                id="quick-pay-owed-by"
                value={values.payOwedBy}
                placeholder="Assigner, union, club…"
                onChange={(_event, value) => onChange({ payOwedBy: value })}
              />
            </FormGroup>
          </div>
        </div>

        <footer className="rs-modal__footer rs-form-actions">
          <Button variant="primary" isBlock onClick={save}>
            Save Match
          </Button>
          <Button variant="link" isBlock onClick={goToFull}>
            Full Match
          </Button>
        </footer>
      </div>
    </div>
  );
}
