# User Manual & Operator Guide
## Smart Event Venue Booking, Planning, and Management System with Parking Assistance

**Document Identifier:** SCM-DOC-UM-06  
**Version:** 1.0.0  
**Status:** Approved / Baselined  
**Project:** Smart Event Venue Management System (SCM Course Project)  
**Date:** October 2026  

---

### 1. Introduction & Accessing the System

The **Smart Event Venue Management System** provides an integrated end-to-end platform for exploring venues, booking event slots with real-time double-booking prevention, calculating budgets, viewing smart parking occupancy, contracting vendors, organizing task checklists, collecting guest RSVPs, simulating payments, and moderating platform operations.

#### System URLs
- **Web Application Frontend:** `http://localhost:5173`
- **Backend REST API:** `http://localhost:8081` (or `http://localhost:8080`)
- **Interactive Swagger API Documentation:** `http://localhost:8081/swagger-ui/index.html`
- **H2 Database Console (Developer Fallback):** `http://localhost:8081/h2-console` (JDBC URL: `jdbc:h2:mem:eventdb`, User: `sa`, Password: *empty*)

---

### 2. Demo Credentials Directory

The database is pre-seeded with 5 fictional role accounts for testing and evaluation:

| Role | Email Address | Password | Primary Capabilities |
|:---|:---|:---|:---|
| **CUSTOMER** | `customer@demo.com` | `Password123!` | Search & book venues, use AI recommendations, save budgets, hire vendors, manage events & guests, submit reviews, mock payment. |
| **VENUE OWNER** | `owner@demo.com` | `Password123!` | List venues, approve/reject reservation requests, update real-time parking lot occupancy. |
| **VENDOR** | `vendor@demo.com` | `Password123!` | Publish catering/decor service catalogs, accept or reject incoming customer service bookings. |
| **EVENT ORGANIZER** | `organizer@demo.com` | `Password123!` | Manage comprehensive event timelines, apply planner templates, track guest RSVP statuses. |
| **ADMIN** | `admin@demo.com` | `AdminPass123!` | Access executive telemetry, review venue/vendor moderation queues, alter user access roles, view audit logs. |

---

### 3. Step-by-Step Role Walkthroughs

#### 3.1 Customer Experience
1. **Browse Venues:**
   - Navigate to `/venues`. Use the search bar to query by name or city (e.g., "Ballroom", "New York").
   - Filter by capacity, budget slider, supported event type (Wedding, Gala, Conference), and facilities (Valet Parking, Stage, AV System).
   - Compare venues by selecting up to three cards and clicking **Compare Selected**.
2. **Book a Venue:**
   - On the venue details page (`/venues/:id`), inspect the photo gallery, amenities, and live parking widget.
   - Select an available date, choose a time slot (`MORNING`, `AFTERNOON`, `EVENING`, `FULL_DAY`), and input the guest count.
   - Click **Submit Reservation Request**. A pending booking reference (`BK-XXXXXXXX`) is generated.
3. **AI Recommendations:**
   - Navigate to `/recommendations`. Enter target budget, guest headcount, event style, and preferred facilities.
   - View ranked venues with transparent percentage scores and plain-language match explanations.
4. **Budget Estimator:**
   - Navigate to `/budget`. Customize allocations across Venue, Catering, Decor, Photography, Entertainment, and Contingency.
   - Check total against your spending ceiling. Notice the clear disclaimer: *"Estimate only, not a quotation"*. Click **Save Budget Plan**.
5. **My Bookings & Payments:**
   - Navigate to `/my-bookings`. Review reservation statuses in the timeline (`PENDING`, `CONFIRMED`, `REJECTED`, `CANCELLED`).
   - For confirmed bookings, click **Pay Now (Mock)** to open the sandbox payment modal.
   - Review itemized costs and click **Confirm & Pay (Mock)** to receive a formal transaction receipt.
   - After an event, click **Leave Review** to submit 1-5 star ratings for cleanliness, staff, and overall satisfaction.

#### 3.2 Venue Owner Experience
1. **Manage Booking Requests:**
   - Navigate to `/owner/dashboard`. Review pending reservation cards.
   - Click **Approve** to confirm the reservation or **Reject** with optional remarks.
   - The double-booking prevention engine automatically ensures no overlapping booking can be approved for the same date and slot.
2. **Update Smart Parking Occupancy:**
   - In the Owner Dashboard under **Parking Facilities**, locate your venue's parking decks.
   - Enter current vehicle count and submit. Occupancy rates and available spots update immediately across all customer views.

#### 3.3 Vendor Experience
1. **Manage Service Catalog:**
   - Navigate to `/vendors`. View published catering, floral, audio-visual, and entertainment packages.
2. **Order Fulfillment:**
   - On the **Incoming Orders** tab, inspect booking requests submitted by customers.
   - Accept or decline orders based on schedule availability.

#### 3.4 Event Organizer & RSVP Management
1. **Event Planner:**
   - Navigate to `/planner`. Click **Apply Template** to automatically populate a structured checklist (Wedding, Conference, or Gala).
   - Update task progress (`TODO` -> `IN_PROGRESS` -> `COMPLETED`) and monitor the milestone progress bar.
2. **Guest List & Tokenized RSVP:**
   - Navigate to `/events/rsvp`. Create an event and add guests with their email addresses.
   - Click **Copy Public RSVP Link** or **Print Invitation**.
   - Guests can open the link (`/rsvp/:token`) in any browser without logging in to submit attendance, plus-ones, and dietary restrictions securely.

#### 3.5 Administrator Experience
1. **Executive Telemetry:**
   - Navigate to `/admin`. View live aggregate counters for total registered users, venue inventory, booking volume, and confirmed revenue.
2. **Moderation Queues:**
   - Inspect pending venue listings and vendor registrations. Click **Approve** or **Reject** to govern platform quality.
3. **Role Management & Audit Logs:**
   - Change user roles dynamically in the User Directory table.
   - Inspect the immutable security audit trail logging every administrative, booking, and payment event.

---

### 4. Frequently Asked Questions (FAQ)

**Q: What happens if two customers attempt to book the same slot simultaneously?**  
A: The system uses database-level pessimistic write locking (`SELECT ... FOR UPDATE`). The first transaction to confirm commits successfully, while the concurrent transaction is intercepted and rejected with HTTP 409 Conflict.

**Q: Are real credit cards charged during checkout?**  
A: No. The payment gateway is an explicit sandbox mock designed for course simulation. A prominent *"MOCK PAYMENT, no real money"* banner is displayed at all times.

**Q: Can I use the application if Docker is not installed on my computer?**  
A: Yes! The backend automatically falls back to an in-memory H2 database (`dev-h2` profile) when PostgreSQL is unavailable, with zero configuration changes required.
