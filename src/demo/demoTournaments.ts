import type { Tournament } from '@/domain/tournament';

export const DEMO_TOURNAMENT_ID = 'demo-tournament-7s';

function atDate(offsetDays: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function atDateTime(offsetDays: number, hours: number, minutes = 0): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function createDemoTournaments(): Tournament[] {
  const now = new Date();

  return [
    {
      id: DEMO_TOURNAMENT_ID,
      ownerUid: 'demo',
      title: 'Gulf Coast 7s Championship',
      startDate: atDate(3),
      endDate: atDate(4),
      location: 'Saracens Park, Tampa, FL',
      notes: 'Pool play Saturday, knockout Sunday. Officials meeting 7:30 AM Saturday.',
      payScope: 'per_match',
      matchDefaults: {
        positionPreset: 'referee',
        matchType: '7s',
        competition: 'Florida Rugby Union',
        expectedPay: '25',
        payOwedBy: 'Tournament assigner',
        uniform: 'Blue jersey',
      },
      flight: {
        segments: [
          {
            id: 'demo-tournament-flight-out',
            airline: 'Southwest',
            flightNumber: 'WN 1842',
            departureAirport: 'MCO',
            arrivalAirport: 'TPA',
            departureAt: atDateTime(2, 18, 15),
            arrivalAt: atDateTime(2, 19, 5),
            confirmation: 'GC7S-FLY',
          },
          {
            id: 'demo-tournament-flight-return',
            airline: 'Southwest',
            flightNumber: 'WN 1843',
            departureAirport: 'TPA',
            arrivalAirport: 'MCO',
            departureAt: atDateTime(4, 18, 30),
            arrivalAt: atDateTime(4, 19, 45),
            confirmation: 'GC7S-FLY',
          },
        ],
        notes: 'Booked with tournament room block',
      },
      lodging: {
        propertyName: 'Hyatt Place Tampa',
        address: '619 E Cass St, Tampa, FL',
        checkInDate: atDate(2),
        checkOutDate: atDate(5),
        confirmation: 'GC7S-DEMO',
        notes: 'Room block — book by Tuesday',
      },
      groundTravel: {
        provider: 'Enterprise',
        pickupAt: atDateTime(2, 20),
        returnAt: atDateTime(4, 20),
        confirmation: 'ENT-GC7S',
        notes: 'TPA airport location',
      },
      customItinerary: [
        {
          id: 'demo-tournament-itinerary-1',
          label: 'Officials meeting',
          at: atDateTime(3, 7, 30),
          notes: 'Credential pickup and field walkthrough',
          order: 0,
        },
        {
          id: 'demo-tournament-itinerary-2',
          label: 'Crew dinner',
          at: atDateTime(3, 19, 30),
          notes: 'Optional — Tampa Riverwalk',
          order: 1,
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];
}
