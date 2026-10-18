-- =========================================================================
-- Stage 2 Database Schema Migration
-- Features: Parking Management, Historical Occupancy Tracking, Event Budgets
-- =========================================================================

CREATE TABLE IF NOT EXISTS parking_lots (
    id BIGSERIAL PRIMARY KEY,
    venue_id BIGINT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    lot_name VARCHAR(100) NOT NULL,
    total_spots INT NOT NULL CHECK (total_spots > 0),
    occupied_spots INT NOT NULL DEFAULT 0 CHECK (occupied_spots >= 0),
    data_source VARCHAR(30) NOT NULL DEFAULT 'MANUAL',
    last_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parking_history (
    id BIGSERIAL PRIMARY KEY,
    parking_lot_id BIGINT NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
    occupied_spots INT NOT NULL CHECK (occupied_spots >= 0),
    data_source VARCHAR(30) NOT NULL DEFAULT 'MANUAL',
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_budgets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_title VARCHAR(150) NOT NULL,
    total_limit NUMERIC(12, 2) NOT NULL CHECK (total_limit >= 0),
    venue_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (venue_cost >= 0),
    catering_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (catering_cost >= 0),
    decoration_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (decoration_cost >= 0),
    photography_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (photography_cost >= 0),
    entertainment_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (entertainment_cost >= 0),
    other_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (other_cost >= 0),
    contingency_percent NUMERIC(5, 2) NOT NULL DEFAULT 10.00 CHECK (contingency_percent >= 0),
    contingency_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (contingency_amount >= 0),
    total_estimated_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_estimated_cost >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_parking_venue_id ON parking_lots(venue_id);
CREATE INDEX idx_parking_history_lot_id ON parking_history(parking_lot_id);
CREATE INDEX idx_budgets_user_id ON event_budgets(user_id);

-- Seed Parking Lots for Demo Venues
INSERT INTO parking_lots (id, venue_id, lot_name, total_spots, occupied_spots, data_source, last_updated_at) VALUES
(1, 1, 'Sapphire Main North Deck', 120, 48, 'SENSOR', CURRENT_TIMESTAMP),
(2, 1, 'Sapphire VIP Valet Underground', 40, 15, 'MANUAL', CURRENT_TIMESTAMP),
(3, 2, 'Skyline Roof & Surface Lot', 80, 65, 'SIMULATED_DEMO', CURRENT_TIMESTAMP),
(4, 3, 'Emerald Garden West Lot', 150, 42, 'SENSOR', CURRENT_TIMESTAMP),
(5, 4, 'Metropolitan Central Garage', 250, 190, 'SENSOR', CURRENT_TIMESTAMP),
(6, 5, 'Golden Sunset Beachside Lot', 90, 30, 'MANUAL', CURRENT_TIMESTAMP),
(7, 6, 'Pinnacle Summit Parking P1', 60, 45, 'SIMULATED_DEMO', CURRENT_TIMESTAMP),
(8, 7, 'Silver Lake East Pavilion Lot', 110, 38, 'SENSOR', CURRENT_TIMESTAMP),
(9, 8, 'Historic Carriage House Lot', 45, 20, 'MANUAL', CURRENT_TIMESTAMP),
(10, 9, 'TechNexus Innovation Deck A', 200, 140, 'SENSOR', CURRENT_TIMESTAMP),
(11, 10, 'Windy City Plaza Deck', 160, 110, 'SENSOR', CURRENT_TIMESTAMP),
(12, 11, 'Redwood Forest Visitor Lot', 75, 22, 'MANUAL', CURRENT_TIMESTAMP);

-- Seed Sample Historical Parking Data for Baseline Predictions
INSERT INTO parking_history (parking_lot_id, occupied_spots, data_source, recorded_at) VALUES
(1, 30, 'SENSOR', CURRENT_TIMESTAMP - INTERVAL '6' HOUR),
(1, 45, 'SENSOR', CURRENT_TIMESTAMP - INTERVAL '4' HOUR),
(1, 60, 'SENSOR', CURRENT_TIMESTAMP - INTERVAL '2' HOUR),
(1, 48, 'SENSOR', CURRENT_TIMESTAMP),
(3, 20, 'SIMULATED_DEMO', CURRENT_TIMESTAMP - INTERVAL '6' HOUR),
(3, 40, 'SIMULATED_DEMO', CURRENT_TIMESTAMP - INTERVAL '4' HOUR),
(3, 65, 'SIMULATED_DEMO', CURRENT_TIMESTAMP),
(4, 25, 'SENSOR', CURRENT_TIMESTAMP - INTERVAL '4' HOUR),
(4, 42, 'SENSOR', CURRENT_TIMESTAMP);

-- Seed Sample Demo Event Budget for Customer
INSERT INTO event_budgets (id, user_id, event_title, total_limit, venue_cost, catering_cost, decoration_cost, photography_cost, entertainment_cost, other_cost, contingency_percent, contingency_amount, total_estimated_cost, currency, created_at, updated_at) VALUES
(1, 1, 'Dream Wedding Reception 2026', 15000.00, 3500.00, 4500.00, 1500.00, 1200.00, 1000.00, 300.00, 10.00, 1200.00, 13200.00, 'USD', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Safe ID restarts for H2 and PostgreSQL sequence auto-increment
ALTER TABLE parking_lots ALTER COLUMN id RESTART WITH 100;
ALTER TABLE parking_history ALTER COLUMN id RESTART WITH 100;
ALTER TABLE event_budgets ALTER COLUMN id RESTART WITH 100;
