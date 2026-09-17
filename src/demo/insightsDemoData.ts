import type { Expense, FlightInfo, Match } from '@/domain/match';
import type { Tournament } from '@/domain/tournament';
import { POSITION_OPTIONS } from '@/domain/matchConstants';

type SampleFlightRoute = {
  legs: [string, string][];
  legMinutes: number[];
  departHour: number;
};

const SAMPLE_FLIGHT_ROUTES: SampleFlightRoute[] = [
  {
    legs: [['DEN', 'IAH'], ['IAH', 'DEN']],
    legMinutes: [110, 125],
    departHour: 7,
  },
  {
    legs: [['MCO', 'TPA'], ['TPA', 'MCO']],
    legMinutes: [50, 75],
    departHour: 10,
  },
  {
    legs: [['LAX', 'SAN'], ['SAN', 'LAX']],
    legMinutes: [65, 70],
    departHour: 8,
  },
  {
    legs: [['DFW', 'AUS'], ['AUS', 'DFW']],
    legMinutes: [55, 60],
    departHour: 9,
  },
];

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

/** Sample records for the Insights preview only; never written to storage. */
export function createInsightsDemoData(): { matches: Match[]; tournaments: Tournament[] } {
  const createdAt = new Date(2026, 0, 1, 12);

  const sampleFlight = (index: number): FlightInfo => {
    const route = SAMPLE_FLIGHT_ROUTES[index % SAMPLE_FLIGHT_ROUTES.length];
    const day = index % 6 + 1;
    const month = Math.floor(index / 6);

    return {
      segments: route.legs.map(([departureAirport, arrivalAirport], leg) => {
        const departureAt = new Date(2026, month, day + leg, route.departHour + leg, 15);
        const arrivalAt = addMinutes(departureAt, route.legMinutes[leg]);

        return {
          id: `sample-flight-${index}-${leg}`,
          airline: 'Demo Air',
          flightNumber: `DA ${1000 + index + leg}`,
          departureAirport,
          arrivalAirport,
          departureAt,
          arrivalAt,
          confirmation: `DEMO-${index}`,
        };
      }),
      selfPaid: true,
      amountPaid: 350 + index * 4,
      reimbursementStatus: 'reimbursed',
      reimbursedAmount: 350 + index * 4,
      reimbursedAt: createdAt,
    };
  };
  const organizations = ['NCR', 'Texas Rugby Union', 'USA Rugby', 'College Rugby Association', 'Regional Rugby Union', 'Metro Rugby'];
  const cost = (id: string, category: Expense['category'], amount: number, reimbursedAmount = 0): Expense => ({
    id, category, amount, createdAt,
    reimbursementStatus: reimbursedAmount > 0 ? 'reimbursed' : 'not_expected',
    reimbursedAmount: reimbursedAmount > 0 ? reimbursedAmount : undefined,
  });
  const matches: Match[] = Array.from({ length: 48 }, (_, index) => {
    const role = POSITION_OPTIONS[index % POSITION_OPTIONS.length];
    const fee = 125 + (index % 7) * 25;
    const expenses = [
      { ...cost(`sample-parking-${index}`, 'parking', 45 + (index % 4) * 15), note: 'Airport parking' },
      cost(`sample-food-${index}`, 'food', 32 + index % 10, 12),
      cost(`sample-gas-${index}`, 'gas', 28 + index % 8),
      cost(`sample-tolls-${index}`, 'tolls', 8 + index % 5),
      cost(`sample-rideshare-${index}`, 'rideshare', 22 + index % 9, 10),
      { ...cost(`sample-driven-${index}`, 'miles_driven', 0), miles: 80 + index * 7 },
    ];
    if (index % 3 === 0) {
      expenses.push(cost(`sample-airfare-${index}`, 'airfare', 350 + index * 4, 350 + index * 4));
    }
    return {
      id: `insights-sample-${index}`, ownerUid: 'insights-sample',
      title: `Sample assignment ${index + 1}`, location: 'Sample venue',
      kickoffAt: new Date(2026, Math.floor(index / 6), index % 6 + 1, 14),
      createdAt, updatedAt: createdAt, status: 'completed',
      position: role.label, positionPreset: role.value,
      matchType: index < 24 ? 'xvs' : index < 38 ? '7s' : index < 44 ? '10s' : 'other',
      competition: organizations[index % organizations.length],
      expectedPay: fee, payStatus: index % 9 === 0 ? 'unpaid' : 'paid',
      paidAmount: index % 9 === 0 ? undefined : fee, payCurrency: 'USD',
      ...(index % 3 === 0 ? { flight: sampleFlight(index) } : {}),
      expenses, source: { type: 'manual' },
    };
  });
  const tournaments: Tournament[] = Array.from({ length: 4 }, (_, index) => ({
    id: `insights-sample-tournament-${index}`, ownerUid: 'insights-sample',
    title: `Sample cup ${index + 1}`, startDate: `2026-0${index + 3}-14`, endDate: `2026-0${index + 3}-15`,
    createdAt, updatedAt: createdAt, location: 'Sample tournament venue',
    matchDefaults: { competition: organizations[index], positionPreset: 'referee' },
    settlement: { status: 'completed', payStatus: 'paid', paidAmount: 500 + index * 100 },
    flight: sampleFlight(100 + index),
    expenses: [cost(`sample-hotel-${index}`, 'lodging', 320, 320), cost(`sample-cup-parking-${index}`, 'parking', 95)],
  }));
  for (const [index, tournament] of tournaments.entries()) {
    for (let game = 0; game < 3; game++) {
      matches.push({
        ...matches[index], id: `insights-sample-child-${index}-${game}`, tournamentId: tournament.id,
        title: `Individual match ${game + 1}`, competition: '', matchType: '7s',
        payStatus: 'not_tracked', expectedPay: undefined, paidAmount: undefined, expenses: [],
      });
    }
  }
  return { matches, tournaments };
}
