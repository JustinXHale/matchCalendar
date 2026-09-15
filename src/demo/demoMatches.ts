import type { Match } from '@/domain/match';
import { DEMO_TOURNAMENT_ID } from '@/demo/demoTournaments';

function atDate(
  offsetDays: number,
  hours: number,
  minutes = 0,
): Date {
  const date = new Date();

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hours, minutes, 0, 0);

  return date;
}

export function createDemoMatches(): Match[] {
  const now = new Date();

  return [
    {
      id: 'demo-next',
      ownerUid: 'demo',
      kickoffAt: atDate(1, 15),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

      title: 'Texas Cup',
      home: 'Austin Huns',
      away: 'Dallas Rugby',
      location: 'Burr Field, Austin, TX',
      position: 'Referee',
      positionPreset: 'referee',
      matchType: 'xvs',
      competition: 'Texas Rugby Union',

      status: 'upcoming',

      expectedPay: 175,
      payCurrency: 'USD',
      payStatus: 'unpaid',

      contacts: [
        {
          id: 'demo-contact-1',
          name: 'Jordan Smith',
          team: 'Assigner',
          order: 0,
        },
      ],
      uniform: 'Green jersey',
      parking: 'Officials lot behind clubhouse',
      notes: 'Field 1. Check in with tournament desk on arrival.',

      customFields: [
        {
          id: 'demo-field-1',
          label: 'Match number',
          value: 'TC-204',
          order: 0,
        },
      ],

      source: {
        type: 'manual',
      },

      createdAt: now,
      updatedAt: now,
    },

    {
      id: 'demo-travel',
      ownerUid: 'demo',
      kickoffAt: atDate(8, 19, 30),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

      title: 'National Championship Semifinal',
      home: 'Houston SaberCats Academy',
      away: 'Denver Barbarians',
      location: 'Aveva Stadium, Houston, TX',
      position: 'Assistant Referee',
      positionPreset: 'assistant_referee',
      matchType: 'xvs',
      competition: 'USA Rugby',

      status: 'upcoming',

      expectedPay: 250,
      payCurrency: 'USD',
      payStatus: 'unpaid',

      flight: {
        segments: [
          {
            id: 'demo-flight-outbound',
            airline: 'American Airlines',
            flightNumber: 'AA 1842',
            departureAt: atDate(7, 9, 15),
            arrivalAt: atDate(7, 11, 5),
            confirmation: 'DEMO42',
          },
          {
            id: 'demo-flight-return',
            airline: 'American Airlines',
            flightNumber: 'AA 1843',
            departureAt: atDate(9, 14, 30),
            arrivalAt: atDate(9, 16, 45),
            confirmation: 'DEMO42',
          },
        ],
        notes: 'Main Cabin',
        selfPaid: true,
        amountPaid: 420,
        reimbursementStatus: 'not_expected',
      },

      lodging: {
        propertyName: 'Marriott Marquis Houston',
        address: '1777 Walker St, Houston, TX',
        checkInDate: toDateString(atDate(7, 0)),
        checkOutDate: toDateString(atDate(9, 0)),
        confirmation: 'HM-DEMO-551',
        notes: 'Room covered by event organizer',
        selfPaid: true,
        amountPaid: 318,
        reimbursementStatus: 'reimbursed',
        reimbursedAmount: 318,
        reimbursedAt: atDate(6, 14),
      },

      groundTravel: {
        provider: 'Enterprise',
        pickupAt: atDate(7, 12),
        returnAt: atDate(9, 10),
        confirmation: 'ENT-DEMO-22',
        notes: 'Pickup at IAH',
        selfPaid: true,
        amountPaid: 186,
        reimbursementStatus: 'not_expected',
      },

      source: {
        type: 'manual',
      },

      createdAt: now,
      updatedAt: now,
    },

    {
      id: 'demo-tournament-pool-1',
      ownerUid: 'demo',
      tournamentId: DEMO_TOURNAMENT_ID,
      kickoffAt: atDate(3, 9),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

      home: 'Tampa Bay Krewe',
      away: 'Orlando Griffins',
      location: 'Saracens Park, Tampa, FL',
      position: 'Referee',
      positionPreset: 'referee',
      matchType: '7s',
      competition: 'Florida Rugby Union',

      status: 'upcoming',

      expectedPay: 25,
      payCurrency: 'USD',
      payStatus: 'unpaid',
      payOwedBy: 'Tournament assigner',

      source: { type: 'manual' },
      createdAt: now,
      updatedAt: now,
    },

    {
      id: 'demo-tournament-pool-2',
      ownerUid: 'demo',
      tournamentId: DEMO_TOURNAMENT_ID,
      kickoffAt: atDate(3, 11, 30),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

      home: 'Miami Tridents',
      away: 'Jacksonville Axemen',
      location: 'Saracens Park, Tampa, FL',
      position: 'Referee',
      positionPreset: 'referee',
      matchType: '7s',
      competition: 'Florida Rugby Union',

      status: 'upcoming',

      expectedPay: 25,
      payCurrency: 'USD',
      payStatus: 'unpaid',
      payOwedBy: 'Tournament assigner',

      source: { type: 'manual' },
      createdAt: now,
      updatedAt: now,
    },

    {
      id: 'demo-tournament-pool-3',
      ownerUid: 'demo',
      tournamentId: DEMO_TOURNAMENT_ID,
      kickoffAt: atDate(3, 14),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

      home: 'Fort Lauderdale Knights',
      away: 'Boca Raton RFC',
      location: 'Saracens Park, Tampa, FL',
      position: 'Referee',
      positionPreset: 'referee',
      matchType: '7s',
      competition: 'Florida Rugby Union',

      status: 'upcoming',

      expectedPay: 25,
      payCurrency: 'USD',
      payStatus: 'unpaid',
      payOwedBy: 'Tournament assigner',

      source: { type: 'manual' },
      createdAt: now,
      updatedAt: now,
    },

    {
      id: 'demo-tournament-final',
      ownerUid: 'demo',
      tournamentId: DEMO_TOURNAMENT_ID,
      kickoffAt: atDate(4, 15),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

      title: 'Cup Final',
      home: 'Pool A winner',
      away: 'Pool B winner',
      location: 'Saracens Park, Tampa, FL',
      position: 'Referee',
      positionPreset: 'referee',
      matchType: '7s',
      competition: 'Florida Rugby Union',

      status: 'upcoming',

      expectedPay: 50,
      payCurrency: 'USD',
      payStatus: 'unpaid',
      payOwedBy: 'Tournament assigner',

      source: { type: 'manual' },
      createdAt: now,
      updatedAt: now,
    },

    {
      id: 'demo-upcoming-3',
      ownerUid: 'demo',
      kickoffAt: atDate(15, 13),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

      home: 'Miami Tridents',
      away: 'Fort Lauderdale Knights',
      location: 'Tropical Park, Miami, FL',
      position: 'Referee',
      positionPreset: 'referee',
      matchType: 'xvs',

      status: 'upcoming',

      expectedPay: 150,
      payCurrency: 'USD',
      payStatus: 'unpaid',

      source: {
        type: 'matchreadytx',
        externalId: 'DEMO-MRTX-1001',
        importedAt: now,
        lastSyncedAt: now,
      },

      createdAt: now,
      updatedAt: now,
    },

    {
      id: 'demo-history-paid',
      ownerUid: 'demo',
      kickoffAt: atDate(-7, 14),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

      home: 'Orlando RFC',
      away: 'Jacksonville Axemen',
      location: 'Central Winds Park, Winter Springs, FL',
      position: 'Referee',
      positionPreset: 'referee',
      matchType: 'xvs',

      status: 'completed',

      expectedPay: 175,
      payCurrency: 'USD',
      payStatus: 'paid',
      paidAmount: 175,

      expenses: [
        {
          id: 'demo-expense-1',
          category: 'gas',
          amount: 38.42,
          note: 'Round trip fuel',
          reimbursementStatus: 'not_expected',
          createdAt: now,
        },
        {
          id: 'demo-expense-2',
          category: 'food',
          amount: 18.75,
          note: 'Post-match meal',
          reimbursementStatus: 'not_expected',
          createdAt: now,
        },
      ],

      source: {
        type: 'manual',
      },

      createdAt: now,
      updatedAt: now,
    },

    {
      id: 'demo-history-unpaid',
      ownerUid: 'demo',
      kickoffAt: atDate(-16, 18, 30),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

      title: 'Florida Collegiate Championship',
      home: 'University of Florida',
      away: 'Florida State',
      location: 'Gainesville, FL',
      position: 'Assistant Referee',
      positionPreset: 'assistant_referee',
      matchType: 'xvs',

      status: 'completed',

      expectedPay: 125,
      payCurrency: 'USD',
      payStatus: 'unpaid',
      payOwedBy: 'Florida Rugby Union',

      expenses: [
        {
          id: 'demo-expense-3',
          category: 'parking',
          amount: 12,
          reimbursementStatus: 'not_expected',
          createdAt: now,
        },
      ],

      source: {
        type: 'manual',
      },

      createdAt: now,
      updatedAt: now,
    },

    {
      id: 'demo-cancelled',
      ownerUid: 'demo',
      kickoffAt: atDate(-25, 16),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

      home: 'Boca Raton RFC',
      away: 'Naples Hammerheads',
      location: 'Boca Raton, FL',
      position: 'Referee',
      positionPreset: 'referee',
      matchType: 'xvs',

      status: 'cancelled',

      payStatus: 'not_tracked',

      notes: 'Cancelled due to weather.',

      source: {
        type: 'manual',
      },

      createdAt: now,
      updatedAt: now,
    },
  ];
}

function toDateString(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}