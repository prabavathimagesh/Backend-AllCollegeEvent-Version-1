export const EVENT_FULL_INCLUDE = {
  org: true,
  cert: true,
  location: true,
  calendars: true,
  tickets: true,
  eventPerks: { include: { perk: true } },
  eventAccommodations: { include: { accommodation: true } },
  Collaborator: { include: { member: true } },
} as const;
