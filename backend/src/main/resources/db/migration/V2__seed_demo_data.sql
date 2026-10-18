-- Seed Demo Data for Smart Event Venue System
-- NOTE: All data is clearly labeled as fictional demo data for testing and SCM course evaluation.
-- Passwords:
--   customer@demo.com, owner@demo.com, vendor@demo.com, organizer@demo.com -> Password123!
--   admin@demo.com -> AdminPass123!

-- 1. Demo Users (One per role)
INSERT INTO users (id, email, password, full_name, role, phone, enabled, created_at, updated_at)
VALUES
(1, 'customer@demo.com', '$2a$10$FTzJjzZf5Kzjrc8sDmOuEuGFeMvJJRJvP5083nwdJjJk8oHJKbSUC', 'Alice Customer (Demo)', 'CUSTOMER', '+1-555-0101', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'owner@demo.com', '$2a$10$FTzJjzZf5Kzjrc8sDmOuEuGFeMvJJRJvP5083nwdJjJk8oHJKbSUC', 'Bob VenueOwner (Demo)', 'VENUE_OWNER', '+1-555-0102', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'vendor@demo.com', '$2a$10$FTzJjzZf5Kzjrc8sDmOuEuGFeMvJJRJvP5083nwdJjJk8oHJKbSUC', 'Charlie Vendor (Demo)', 'VENDOR', '+1-555-0103', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'organizer@demo.com', '$2a$10$FTzJjzZf5Kzjrc8sDmOuEuGFeMvJJRJvP5083nwdJjJk8oHJKbSUC', 'Diana Organizer (Demo)', 'EVENT_ORGANIZER', '+1-555-0104', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'admin@demo.com', '$2a$10$zVrhPszBcnW201avNGiJye.TLosawCzsZBsVvZoGaitZ4OWXA/gMC', 'System Administrator (Demo)', 'ADMIN', '+1-555-0100', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Venues (12 Fictional Venues)
INSERT INTO venues (id, owner_id, name, city, address, description, category, capacity, base_price_per_day, cleaning_fee, rating, review_count, supported_event_types, facilities, image_urls, approved, created_at, updated_at)
VALUES
(1, 2, 'The Grand Sapphire Ballroom', 'New York', '100 Madison Ave, New York, NY 10016', 
 'Opulent multi-tier ballroom featuring crystal chandeliers, state-of-the-art acoustic design, and marble foyer. Perfect for grand galas and luxury weddings.',
 'Grand Ballroom', 500, 4500.00, 350.00, 4.90, 42, 
 'WEDDING,CONFERENCE,GALA,ANNIVERSARY,CORPORATE', 
 'WiFi,Valet Parking,Air Conditioning,Audio/Visual,Bridal Suite,Wheelchair Accessible,Catering Kitchen,Full Bar', 
 '/images/venues/grand-ballroom.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(2, 2, 'Emerald Horizon Resort & Gardens', 'San Francisco', '850 Skyline Blvd, San Francisco, CA 94132',
 'Sprawling coastal resort nestled among manicured botanical gardens with panoramic Pacific ocean views and illuminated pergolas.',
 'Luxury Resort', 350, 3800.00, 300.00, 4.85, 38,
 'WEDDING,RECEPTION,RETREAT,BIRTHDAY,ANNIVERSARY',
 'WiFi,Onsite Parking,Outdoor Lawn,Scenic View,Bar Service,Audio/Visual,Fire Pits',
 '/images/venues/emerald-resort.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(3, 2, 'Skyline Glasshouse & Rooftop', 'Chicago', '300 N Michigan Ave, Chicago, IL 60601',
 'Modern architectural glass enclosed rooftop offering 360-degree views of the Chicago skyline, ambient LED lighting, and sleek cocktail bars.',
 'Rooftop Terrace', 200, 2900.00, 250.00, 4.75, 29,
 'CORPORATE,COCKTAIL,BIRTHDAY,NETWORKING,PRODUCT_LAUNCH',
 'WiFi,Elevator,Rooftop Deck,Skyline View,Audio/Visual,Full Bar,Heated Patio',
 '/images/venues/skyline-rooftop.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(4, 2, 'The Heritage Palace & Courtyard', 'Austin', '520 Congress Ave, Austin, TX 78701',
 'Historic 19th-century limestone palace featuring an open-air cobblestone courtyard, fountain centerpiece, and antique chandeliers.',
 'Heritage Palace', 400, 4200.00, 300.00, 4.80, 31,
 'WEDDING,CULTURAL,BANQUET,FESTIVAL,ANNIVERSARY',
 'WiFi,Valet Parking,Courtyard,Bridal Suite,Historic Architecture,Catering Kitchen,Stage',
 '/images/venues/heritage-palace.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(5, 2, 'Oceanview Palms Pavilion', 'Miami', '1200 Ocean Dr, Miami Beach, FL 33139',
 'Sun-drenched beachside pavilion with direct sand access, tropical palm landscape, cabanas, and sunset lighting.',
 'Beachside Lawn', 250, 3200.00, 250.00, 4.90, 45,
 'WEDDING,BEACH_PARTY,BIRTHDAY,CONCERT,CORPORATE',
 'WiFi,Beach Access,Covered Pavilion,Lighting,Sound System,Parking,Restrooms',
 '/images/venues/oceanview-palms.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(6, 2, 'Summit Peak Conference & Expo Center', 'Denver', '700 14th St, Denver, CO 80202',
 'High-capacity smart conference center featuring hybrid livestreaming auditorium, flexible breakout rooms, and high-density gigabit WiFi.',
 'Conference Center', 800, 6500.00, 500.00, 4.70, 56,
 'CONFERENCE,EXPO,SEMINAR,CORPORATE,TECH_TALK',
 'High-Speed WiFi,Auditorium,Breakout Rooms,Livestreaming AV,Ample Parking,Accessible,Catering Kitchen',
 '/images/venues/summit-expo.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(7, 2, 'Artisan Foundry & Industrial Loft', 'Seattle', '1520 1st Ave S, Seattle, WA 98134',
 'Restored industrial loft featuring timber beams, exposed brick, polished concrete floors, and custom steel fixtures for creative gatherings.',
 'Modern Loft', 180, 2400.00, 200.00, 4.65, 23,
 'EXHIBITION,PRODUCT_LAUNCH,COCKTAIL,BIRTHDAY,WORKSHOP',
 'High Ceilings,Natural Light,Exposed Brick,WiFi,Sound System,Prep Kitchen,Loading Dock',
 '/images/venues/artisan-loft.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(8, 2, 'Silverwood Botanical Conservatory', 'Portland', '4000 SW Fairview Blvd, Portland, OR 97221',
 'Lush glass greenhouse brimming with exotic flora, indoor waterfall, and adjacent brick patio for tranquil evening dining.',
 'Botanical Pavilion', 220, 2800.00, 220.00, 4.88, 34,
 'WEDDING,ANNIVERSARY,RETREAT,DINNER,BIRTHDAY',
 'Glass Greenhouse,Floral Gardens,Climate Control,WiFi,Parking,Accessible,Audio/Visual',
 '/images/venues/silverwood-botanical.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(9, 2, 'The Monarch Estate & Country Club', 'Dallas', '1800 Championship Dr, Dallas, TX 75201',
 'Prestigious country club with championship golf course vistas, lakeside veranda, formal dining rooms, and executive boardroom suites.',
 'Country Club', 450, 4900.00, 400.00, 4.92, 40,
 'WEDDING,GOLF_OUTING,GALA,CHARITY,CORPORATE',
 'Golf Course View,Valet Parking,Grand Dining Room,Chandelier Ballroom,Bridal Suite,Tennis Courts',
 '/images/venues/monarch-estate.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(10, 2, 'NeoTech Innovation Hub & Auditorium', 'Boston', '250 Main St, Cambridge, MA 02142',
 'Contemporary tech auditorium equipped with 4K video wall, recording booths, interactive audience polling consoles, and demo showcases.',
 'Conference Center', 300, 3500.00, 250.00, 4.78, 27,
 'HACKATHON,CONFERENCE,WORKSHOP,TECH_TALK,NETWORKING',
 'Fiber Internet,Stage LED Wall,Microphone Rig,Tiered Seating,Podium,Parking,Cafeteria',
 '/images/venues/neotech-hub.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(11, 2, 'Lakeside Willow Terrace', 'Minneapolis', '500 W Lake St, Minneapolis, MN 55408',
 'Scenic lakeside lawn with private wooden dock, covered terrace, and panoramic sunset water views.',
 'Banquet Hall', 280, 2600.00, 200.00, 4.60, 19,
 'WEDDING,REUNION,BIRTHDAY,BABY_SHOWER,BARBECUE',
 'Lakefront Pier,Indoor Hall,Outdoor Patio,Barbecue Grills,Parking,WiFi',
 '/images/venues/lakeside-willow.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(12, 2, 'Vintage Oak Winery & Barrel Cellar', 'Napa', '1250 Oakville Cross Rd, Napa, CA 94558',
 'Boutique estate winery set among rolling Napa hills, featuring private barrel cellar tasting rooms, stone fireplaces, and vineyard terrace.',
 'Luxury Resort', 150, 3900.00, 300.00, 4.95, 51,
 'WEDDING,WINE_TASTING,PRIVATE_DINNER,ANNIVERSARY,RETREAT',
 'Vineyard Tours,Wine Tasting Room,Stone Fireplace,Catering Kitchen,Valet Parking,Sommelier Service',
 '/images/venues/vintage-oak.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. Sample Bookings (Fictional sample bookings)
INSERT INTO bookings (id, booking_reference, venue_id, customer_id, event_date, time_slot, event_type, guest_count, base_cost, service_fee, total_cost, status, notes, created_at, updated_at)
VALUES
(1, 'BK-CONF001', 1, 1, '2026-11-20', 'FULL_DAY', 'WEDDING', 350, 4500.00, 450.00, 5300.00, 'CONFIRMED', 'Demo Confirmed Booking: Grand Sapphire Wedding with catering setup', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'BK-PEND002', 2, 1, '2026-11-25', 'EVENING', 'BIRTHDAY', 120, 2280.00, 228.00, 2808.00, 'PENDING', 'Demo Pending Request: Birthday party celebration on garden lawn', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'BK-CANC003', 3, 1, '2026-12-05', 'FULL_DAY', 'CORPORATE', 150, 2900.00, 290.00, 3440.00, 'CANCELLED', 'Demo Cancelled Booking: Rescheduled corporate conference', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. Booking Status History
INSERT INTO booking_status_history (id, booking_id, from_status, to_status, changed_by_user_id, remarks, created_at)
VALUES
(1, 1, NULL, 'PENDING', 1, 'Initial booking request submitted by customer', CURRENT_TIMESTAMP),
(2, 1, 'PENDING', 'CONFIRMED', 2, 'Booking request approved by venue owner Bob', CURRENT_TIMESTAMP),
(3, 2, NULL, 'PENDING', 1, 'Initial booking request submitted by customer', CURRENT_TIMESTAMP),
(4, 3, NULL, 'PENDING', 1, 'Initial booking request submitted by customer', CURRENT_TIMESTAMP),
(5, 3, 'PENDING', 'CANCELLED', 1, 'Customer cancelled booking due to schedule change (Full refund eligible)', CURRENT_TIMESTAMP);

-- 5. Advance identity sequences past seed rows
ALTER TABLE users ALTER COLUMN id RESTART WITH 100;
ALTER TABLE venues ALTER COLUMN id RESTART WITH 100;
ALTER TABLE bookings ALTER COLUMN id RESTART WITH 100;
ALTER TABLE booking_status_history ALTER COLUMN id RESTART WITH 100;
