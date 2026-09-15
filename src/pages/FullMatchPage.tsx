import { useTournamentsContext } from '@/features/tournaments/TournamentsProvider';
import { useMemo, useState } from 'react';
import { Button, FormGroup, TextInput } from '@patternfly/react-core';
import type { MatchTypePreset } from '@/domain/match';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { routes } from '@/app/routes';
import { useAppBack } from '@/nav/backNav';
import { SCHEDULE_BACK, tournamentBack } from '@/nav/backDefaults';
import { DetailBackButton } from '@/ui/DetailBackButton';
import type {
  CustomField,
  CustomItineraryItem,
  Expense,
  FlightInfo,
  GroundTravelInfo,
  LodgingInfo,
  MatchContact,
} from '@/domain/match';
import {
  validateExpenses,
  validateTravelSections,
} from '@/features/forms/formValidation';
import {
  compactFlight,
  emptyFlight,
  normalizeFlight,
} from '@/features/matches/flightUtils';
import { useProfile } from '@/features/profile/ProfileProvider';
import {
  buildMatchFromForm,
  buildTournamentChildMatchFromForm,
  createEmptyMatchForm,
  createTournamentChildFormValues,
  matchToFormValues,
} from '@/features/matches/matchFormUtils';
import { getMatchById } from '@/features/matches/matchQueries';
import { useMatchesContext } from '@/features/matches/MatchesProvider';
import {
  hasFormErrors,
  validateMatchContacts,
  validateMatchForm,
  validateTournamentChildMatchForm,
  type MatchFormErrors,
  type MatchFormValues,
} from '@/features/matches/matchValidation';
import { useMatches } from '@/features/matches/useMatches';
import {
  buildTournamentPayload,
  createEmptyTournamentForm,
  hasGroundData,
  hasLodgingData,
  isTournamentLumpPay,
  tournamentToFormState,
  validateTournamentForm,
  type TournamentFormState,
} from '@/features/tournaments/tournamentFormUtils';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { ContactsEditor } from '@/ui/forms/ContactsEditor';
import { CustomFieldsEditor } from '@/ui/forms/CustomFieldsEditor';
import { CustomItineraryEditor } from '@/ui/forms/CustomItineraryEditor';
import { ExpandableFormCard } from '@/ui/forms/ExpandableFormCard';
import { ExpenseEditor } from '@/ui/forms/ExpenseEditor';
import { MatchCoreFields } from '@/ui/forms/MatchCoreFields';
import {
  expensesSectionSummary,
  FlightFields,
  flightSectionSummary,
  GroundTravelFields,
  groundTravelSectionSummary,
  LodgingFields,
  lodgingSectionSummary,
} from '@/ui/forms/TravelFields';
import { PageHeader } from '@/ui/PageHeader';

type FullMatchExtras = {
  contacts: MatchContact[];
  customFields: CustomField[];
  flight: FlightInfo;
  lodging: LodgingInfo;
  groundTravel: GroundTravelInfo;
  expenses: Expense[];
  customItinerary: CustomItineraryItem[];
};

function createExtrasFromMatch(existing?: {
  contacts?: MatchContact[];
  customFields?: CustomField[];
  flight?: FlightInfo;
  lodging?: LodgingInfo;
  groundTravel?: GroundTravelInfo;
  expenses?: Expense[];
  customItinerary?: CustomItineraryItem[];
}): FullMatchExtras {
  return {
    contacts: existing?.contacts ?? [],
    customFields: existing?.customFields ?? [],
    flight: normalizeFlight(existing?.flight) ?? emptyFlight(),
    lodging: existing?.lodging ?? {},
    groundTravel: existing?.groundTravel ?? {},
    expenses: existing?.expenses ?? [],
    customItinerary: existing?.customItinerary ?? [],
  };
}

export function FullMatchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { matchId, tournamentId: routeTournamentId } = useParams();
  const { matches } = useMatches();
  const { createMatch, updateMatch } = useMatchesContext();
  const { profile } = useProfile();
  const existing = matchId ? getMatchById(matches, matchId) : undefined;
  const locationState = location.state as {
    draft?: MatchFormValues;
    tournamentId?: string;
    tournamentContainer?: boolean;
  } | null;
  const draft = locationState?.draft;
  const { createTournament, getTournamentById, updateTournament } =
    useTournamentsContext();
  const isTournamentEdit = Boolean(
    routeTournamentId &&
      location.pathname === routes.tournamentEdit(routeTournamentId),
  );
  const editingTournament =
    isTournamentEdit && routeTournamentId
      ? getTournamentById(routeTournamentId)
      : undefined;
  const childTournamentId =
    existing?.tournamentId ?? locationState?.tournamentId;
  const parent =
    childTournamentId && !isTournamentEdit
      ? getTournamentById(childTournamentId)
      : undefined;
  const isTournamentChild = Boolean(childTournamentId && !isTournamentEdit);

  const initialValues = useMemo(() => {
    if (existing) return matchToFormValues(existing);
    if (draft) return draft;
    if (parent) {
      return createTournamentChildFormValues(parent, profile.defaultPositionPreset);
    }
    if (locationState?.tournamentContainer) {
      return {
        ...createEmptyMatchForm(profile.defaultPositionPreset),
        matchType: 'tournament' as MatchTypePreset,
      };
    }
    return createEmptyMatchForm(profile.defaultPositionPreset);
  }, [
    draft,
    existing,
    locationState?.tournamentContainer,
    parent,
    profile.defaultPositionPreset,
  ]);

  const initialTournamentMeta = useMemo(() => {
    if (editingTournament) {
      return tournamentToFormState(
        editingTournament,
        profile.defaultPositionPreset,
      );
    }
    const base = createEmptyTournamentForm(profile.defaultPositionPreset);
    base.defaults.matchType = '7s';
    return base;
  }, [editingTournament, profile.defaultPositionPreset]);

  const initialExtras = useMemo(
    () => createExtrasFromMatch(editingTournament ?? existing),
    [editingTournament, existing],
  );

  const [values, setValues] = useState<MatchFormValues>(initialValues);
  const [tournamentMeta, setTournamentMeta] =
    useState<TournamentFormState>(initialTournamentMeta);
  const [extras, setExtras] = useState<FullMatchExtras>(initialExtras);
  const [errors, setErrors] = useState<MatchFormErrors>({});
  const [formError, setFormError] = useState('');

  const isTournamentForm =
    isTournamentEdit ||
    (!existing && !isTournamentChild && values.matchType === 'tournament');

  const isDirty = useMemo(
    () =>
      isTournamentForm
        ? JSON.stringify({ tournamentMeta, extras }) !==
          JSON.stringify({ tournamentMeta: initialTournamentMeta, extras: initialExtras })
        : JSON.stringify({ values, extras }) !==
          JSON.stringify({ values: initialValues, extras: initialExtras }),
    [
      extras,
      initialExtras,
      initialTournamentMeta,
      initialValues,
      isTournamentForm,
      tournamentMeta,
      values,
    ],
  );

  useUnsavedChangesGuard(isDirty);

  const onChange = (patch: Partial<MatchFormValues>) => {
    setValues((current) => ({ ...current, ...patch }));
  };

  const enterTournamentContainer = () => {
    setTournamentMeta((current) => ({
      ...current,
      startDate: values.date || current.startDate,
      endDate: values.date || current.endDate,
      defaults: {
        ...current.defaults,
        title: values.title,
        location: values.location,
        notes: values.notes,
        positionPreset: values.positionPreset,
        customPosition: values.customPosition,
        matchType:
          current.defaults.matchType === 'tournament'
            ? '7s'
            : current.defaults.matchType,
        customMatchType: values.customMatchType,
        competition: values.competition,
        expectedPay: values.expectedPay,
        payStatus: values.payStatus,
        paidAmount: values.paidAmount,
        paidAt: values.paidAt,
        paymentMethod: values.paymentMethod,
        payOwedBy: values.payOwedBy,
        uniform: values.uniform,
        parking: values.parking,
      },
    }));
    setValues((current) => ({ ...current, matchType: 'tournament' }));
  };

  const exitTournamentContainer = (nextMatchType: MatchTypePreset) => {
    setValues({
      ...tournamentMeta.defaults,
      matchType: nextMatchType,
      customMatchType:
        nextMatchType === 'other' ? tournamentMeta.defaults.customMatchType : '',
      date: values.date,
      time: values.time,
      home: values.home,
      away: values.away,
    });
  };

  const handleMatchChange = (patch: Partial<MatchFormValues>) => {
    if (patch.matchType === 'tournament') {
      enterTournamentContainer();
      return;
    }
    onChange(patch);
  };

  const save = () => {
    if (isTournamentForm) {
      const formErrorMessage = validateTournamentForm(tournamentMeta);
      if (formErrorMessage) {
        setFormError(formErrorMessage);
        return;
      }

      const travelError = validateTravelSections({
        flight: extras.flight,
        lodging: extras.lodging,
        groundTravel: extras.groundTravel,
      });
      if (travelError) {
        setFormError(travelError);
        return;
      }

      const expenseError = validateExpenses(extras.expenses);
      if (expenseError) {
        setFormError(expenseError);
        return;
      }

      setFormError('');
      const payload = buildTournamentPayload({
        ...tournamentMeta,
        flight: extras.flight,
        lodging: extras.lodging,
        groundTravel: extras.groundTravel,
        expenses: extras.expenses,
        customItinerary: extras.customItinerary,
      });

      if (editingTournament) {
        updateTournament(editingTournament.id, payload);
        navigate(routes.tournamentDetail(editingTournament.id), { replace: true });
        return;
      }

      const tournament = createTournament(payload);
      navigate(routes.tournamentDetail(tournament.id), { replace: true });
      return;
    }

    const nextErrors = isTournamentChild
      ? validateTournamentChildMatchForm(values)
      : validateMatchForm(values);
    setErrors(nextErrors);
    if (hasFormErrors(nextErrors)) return;

    if (!isTournamentChild) {
      const travelError = validateTravelSections({
        flight: extras.flight,
        lodging: extras.lodging,
        groundTravel: extras.groundTravel,
      });
      if (travelError) {
        setFormError(travelError);
        return;
      }

      const expenseError = validateExpenses(extras.expenses);
      if (expenseError) {
        setFormError(expenseError);
        return;
      }

      const contactsError = validateMatchContacts(extras.contacts);
      if (contactsError) {
        setFormError(contactsError);
        return;
      }
    }

    setFormError('');

    const payload = isTournamentChild && parent
      ? buildTournamentChildMatchFromForm(values, parent, existing, {
          contacts: extras.contacts,
          customFields: extras.customFields,
        })
      : {
          ...buildMatchFromForm(values, existing, {
            contacts: extras.contacts,
            customFields:
              extras.customFields.length > 0 ? extras.customFields : undefined,
          }),
          flight: compactFlight(extras.flight),
          lodging: hasLodgingData(extras.lodging) ? extras.lodging : undefined,
          groundTravel: hasGroundData(extras.groundTravel)
            ? extras.groundTravel
            : undefined,
          expenses: extras.expenses.length > 0 ? extras.expenses : undefined,
          customItinerary:
            extras.customItinerary.length > 0
              ? extras.customItinerary
              : undefined,
          pitchArrivalOverrideMinutes: existing?.pitchArrivalOverrideMinutes,
          tournamentId: existing?.tournamentId,
        };

    if (existing) {
      updateMatch(existing.id, payload);
      navigate(routes.matchDetail(existing.id), { replace: true });
      return;
    }

    const match = createMatch(payload);
    navigate(
      isTournamentChild && childTournamentId
        ? routes.tournamentDetail(childTournamentId)
        : routes.schedule,
      { replace: true },
    );
    return match;
  };

  const inheritedExpectedPay =
    parent && !isTournamentLumpPay(parent)
      ? parent.matchDefaults?.expectedPay
      : undefined;

  const travelSections = (
    <>
      <ExpandableFormCard
        title="Flight"
        summary={flightSectionSummary(extras.flight)}
      >
        <FlightFields
          flight={extras.flight}
          onChange={(patch) =>
            setExtras((current) => ({
              ...current,
              flight: { ...current.flight, ...patch },
            }))
          }
        />
      </ExpandableFormCard>

      <ExpandableFormCard
        title="Lodging"
        summary={lodgingSectionSummary(extras.lodging)}
      >
        <LodgingFields
          lodging={extras.lodging}
          onChange={(patch) =>
            setExtras((current) => ({
              ...current,
              lodging: { ...current.lodging, ...patch },
            }))
          }
        />
      </ExpandableFormCard>

      <ExpandableFormCard
        title="Ground travel / rental"
        summary={groundTravelSectionSummary(extras.groundTravel)}
      >
        <GroundTravelFields
          groundTravel={extras.groundTravel}
          onChange={(patch) =>
            setExtras((current) => ({
              ...current,
              groundTravel: { ...current.groundTravel, ...patch },
            }))
          }
        />
      </ExpandableFormCard>

      <ExpandableFormCard
        title="Custom itinerary"
        summary={
          extras.customItinerary.length > 0
            ? `${extras.customItinerary.length} item${extras.customItinerary.length === 1 ? '' : 's'}`
            : 'Optional stops (crew dinner, credential pickup, etc.)'
        }
      >
        <CustomItineraryEditor
          items={extras.customItinerary}
          onChange={(customItinerary) =>
            setExtras((current) => ({ ...current, customItinerary }))
          }
        />
      </ExpandableFormCard>

      <ExpandableFormCard
        title="Expenses"
        summary={expensesSectionSummary(extras.expenses.length)}
      >
        <ExpenseEditor
          expenses={extras.expenses}
          onChange={(expenses) =>
            setExtras((current) => ({ ...current, expenses }))
          }
        />
      </ExpandableFormCard>
    </>
  );

  const backFallback = useMemo(() => {
    if (editingTournament) return tournamentBack(editingTournament.id);
    if (existing) {
      return { to: routes.matchDetail(existing.id), label: 'Match' };
    }
    if (childTournamentId) return tournamentBack(childTournamentId);
    return SCHEDULE_BACK;
  }, [childTournamentId, editingTournament, existing]);

  const { goBack } = useAppBack(backFallback);

  if (isTournamentEdit && !editingTournament) {
    return (
      <div className="rs-stack">
        <DetailBackButton fallback={SCHEDULE_BACK} />
        <PageHeader title="Edit Tournament" />
        <div className="rs-placeholder-card">
          <p>Tournament not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rs-stack">
      <DetailBackButton fallback={backFallback} />
      <PageHeader
        title={
          isTournamentEdit
            ? 'Edit Tournament'
            : isTournamentForm
              ? 'Tournament'
              : isTournamentChild
                ? existing
                  ? 'Edit match'
                  : 'Individual match'
                : existing
                  ? 'Edit Match'
                  : 'Full details'
        }
      />
      <section className="rs-form-section">
        <h2 className="rs-form-section-title">
          {isTournamentForm ? 'Tournament' : 'Match'}
        </h2>
        <MatchCoreFields
          values={isTournamentForm ? tournamentMeta.defaults : values}
          errors={isTournamentForm ? {} : errors}
          onChange={(patch) => {
            if (isTournamentForm) {
              setTournamentMeta((current) => ({
                ...current,
                defaults: { ...current.defaults, ...patch },
              }));
              return;
            }
            handleMatchChange(patch);
          }}
          showPayFields={isTournamentForm || !isTournamentChild}
          showStatus={Boolean(existing) && !isTournamentChild}
          tournament={isTournamentForm}
          tournamentContainer={isTournamentForm}
          tournamentPayScope={tournamentMeta.payScope}
          tournamentStartDate={tournamentMeta.startDate}
          tournamentEndDate={tournamentMeta.endDate}
          onTournamentDatesChange={(patch) =>
            setTournamentMeta((current) => ({
              ...current,
              ...patch,
            }))
          }
          onPayScopeChange={(payScope) =>
            setTournamentMeta((current) => ({ ...current, payScope }))
          }
          onExitTournamentContainer={
            isTournamentEdit ? undefined : exitTournamentContainer
          }
          tournamentChild={isTournamentChild}
          inheritedLocation={parent?.location}
          inheritedExpectedPay={inheritedExpectedPay}
        />
      </section>

      {!isTournamentChild && (
        <>
          {travelSections}

          {!isTournamentForm ? (
          <ExpandableFormCard
            title="Additional information"
            summary={
              extras.contacts.length > 0 || extras.customFields.length > 0
                ? `${extras.contacts.length} contact${extras.contacts.length === 1 ? '' : 's'}, ${extras.customFields.length} custom field${extras.customFields.length === 1 ? '' : 's'}`
                : 'Contacts, uniform, parking, notes, custom fields'
            }
          >
            <ContactsEditor
              contacts={extras.contacts}
              onChange={(contacts) =>
                setExtras((current) => ({ ...current, contacts }))
              }
            />
            <FormGroup label="Uniform" fieldId="match-uniform">
              <TextInput
                id="match-uniform"
                value={values.uniform}
                onChange={(_event, value) => onChange({ uniform: value })}
              />
            </FormGroup>
            <FormGroup label="Parking" fieldId="match-parking">
              <TextInput
                id="match-parking"
                value={values.parking}
                onChange={(_event, value) => onChange({ parking: value })}
              />
            </FormGroup>
            <FormGroup label="Notes" fieldId="match-notes">
              <TextInput
                id="match-notes"
                value={values.notes}
                onChange={(_event, value) => onChange({ notes: value })}
              />
            </FormGroup>
            <CustomFieldsEditor
              fields={extras.customFields}
              onChange={(customFields) =>
                setExtras((current) => ({ ...current, customFields }))
              }
            />
          </ExpandableFormCard>
          ) : null}
        </>
      )}

      {formError && <p className="rs-form-error" role="alert">{formError}</p>}

      <div className="rs-form-actions rs-form-actions--sticky rs-form-actions--paired">
        <Button variant="primary" isBlock onClick={save}>
          {isTournamentEdit
            ? 'Save Changes'
            : isTournamentForm
              ? 'Save Tournament'
              : 'Save Match'}
        </Button>
        <Button variant="secondary" isBlock onClick={goBack}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
