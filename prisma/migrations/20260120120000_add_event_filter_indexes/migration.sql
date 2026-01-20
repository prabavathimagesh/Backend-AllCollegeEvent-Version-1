-- Event filters
CREATE INDEX IF NOT EXISTS idx_event_mode
ON ace_event(mode);

CREATE INDEX IF NOT EXISTS idx_event_cert
ON ace_event("certIdentity");

CREATE INDEX IF NOT EXISTS idx_event_view
ON ace_event("viewCount");

-- Location
CREATE INDEX IF NOT EXISTS idx_location_country
ON ace_event_location(country);

-- Calendar
CREATE INDEX IF NOT EXISTS idx_calendar_dates
ON ace_event_calendar("startDate", "endDate");

-- Ticket
CREATE INDEX IF NOT EXISTS idx_ticket_price
ON ace_event_ticket(price);

-- Array fields (VERY IMPORTANT)
CREATE INDEX IF NOT EXISTS idx_event_tags
ON ace_event USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_event_eligible_dept
ON ace_event USING GIN ("eligibleDeptIdentities");
