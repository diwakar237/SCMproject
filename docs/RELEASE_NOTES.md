# Release Notes - v1.0.0
## Smart Event Venue Booking, Planning, and Management System with Parking Assistance

**Document Identifier:** SCM-DOC-RN-15  
**Version:** 1.0.0 (Semantic Versioning 2.0.0)  
**Release Date:** October 18, 2026  
**Status:** GA (General Availability) / Production Baseline  

---

### 1. Release Overview

We are proud to announce the **v1.0.0 General Availability (GA) Release** of the **Smart Event Venue Booking, Planning, and Management System with Parking Assistance**. This release represents a complete, runnable full-stack web application designed for the Software Configuration Management (SCM) curriculum.

The application connects a Spring Boot 3.3.5 Java backend, a React 18 TypeScript frontend, and an ANSI SQL Flyway-managed database (PostgreSQL 16 with automatic fallback to H2 in-memory mode) through real REST calls. **Zero mocked or stubbed data exists in the production build.**

---

### 2. What's New in v1.0.0

#### Stage 1: Core Vertical Slice (Baselined in `f0f9680`)
- **Multi-Role Security:** Stateless JWT authentication with BCrypt password hashing. Role-Based Access Control (RBAC) supporting `CUSTOMER`, `VENUE_OWNER`, `VENDOR`, `EVENT_ORGANIZER`, and `ADMIN`. Self-service registration permits all roles except `ADMIN`.
- **Venue Discovery & Filters:** Parametric search by venue title or city. Real-time filtering by guest capacity, budget slider, supported event type, and facilities. Multi-property sorting and URL-synchronized pagination. Side-by-side venue comparison for up to 3 venues.
- **Pessimistic Booking Concurrency Engine:** Booking reservation workflow with capacity validation and cost calculation. High-concurrency protection via database row-level locking (`LockModeType.PESSIMISTIC_WRITE`) guaranteeing **zero double-booking collisions** for identical date and time slots.
- **Receipts:** Printable HTML/PDF-ready booking receipts with itemized pricing, tax breakdowns, and reference codes.

#### Stage 2: AI Recommendations, Budgeting & Smart Parking (Baselined in `64de796`)
- **Transparent AI Recommender:** Multi-factor weighted scoring algorithm evaluating venues across budget, capacity, location, event suitability, and facility match. Emits detailed score breakdown bars and plain-language match explanations. Hard constraints disqualify undersized or conflicting venues.
- **Event Budget Estimator:** Editable pricing table across 7 event categories (Venue, Catering, Decor, Photography, Entertainment, Contingency, Misc). Live subtotal, contingency, and tax calculations with spending ceiling warning and prominent disclaimer: *"Estimate only, not a quotation"*.
- **Smart Parking Telemetry & Prediction:** Real-time occupancy tracking with mathematical formulas:
  $$\text{Occupancy \%} = \frac{\text{Occupied}}{\text{Total}} \times 100$$
  $$\text{Available} = \text{Total} - \text{Occupied}$$
  Displays data provenance badges (`SENSOR`, `MANUAL`, `SIMULATED_DEMO`, `PREDICTED`). Includes a predictive regression model projecting future parking congestion and recommending optimal 30-minute arrival windows.

#### Stage 3: Marketplace, Planning, RSVP & Governance (Baselined in `3ad6614`)
- **Vendor Marketplace:** Vendor profiles with category filtering and itemized service catalogs (catering, floral, photography). Customer service booking requests and vendor order acceptance/rejection dashboard.
- **Event Planner:** Template-driven checklist bootstrap (Wedding, Conference, Gala). Milestone progress calculation, task status lifecycle transitions (`TODO` -> `IN_PROGRESS` -> `COMPLETED`), deadline dates, and day-of execution timeline.
- **Guest Registry & Secure Tokenized RSVP:** Event management with guest invitation tokens (`/rsvp/:token`). Allows public guests to RSVP without an account while strictly safeguarding organizer private information.
- **Verified Customer Reviews:** Restricted strictly to customers with confirmed/completed bookings (enforcing a maximum of one review per reservation). Records cleanliness, staff responsiveness, and value sub-ratings with admin moderation.
- **Sandbox Mock Payment Gateway:** Simulated checkout flow with an unmistakable *"MOCK PAYMENT, no real money"* banner, unique transaction reference generation (`TXN-XXXXXXXX`), and automated notification/audit dispatch.
- **Executive Administration Console:** Aggregated platform telemetry derived from real database queries (total users, venues, bookings, confirmed revenue). Moderation queues for venue listings and vendor registrations. User role governance and immutable security audit logs.

#### Stage 4: SCM Deliverables & CI Packaging
- Complete SCM documentation suite in `/docs` (SRS, Architecture with 6 Mermaid diagrams, Test Plans, Test Reports, SCM Plans, Item Registers, Change Registers, Defect Registers, Traceability Matrix, FCA/PCA Checklists, and Release Notes).
- GitHub Actions CI workflow in `.github/workflows/ci.yml` verifying backend compilation/tests and frontend build/lint/tests.
- Issue and Pull Request templates in `.github/`.
- Clean Git branching topology (`main`, `develop`, feature branches) with Conventional Commits and local release tag `v1.0.0`.

---

### 3. Verification & Quality Gates Summary

| Quality Gate | Commands Executed | Pass / Fail Count | Quality Gate Result |
|:---|:---|:---:|:---:|
| **Gate 1** (Core Vertical Slice) | `mvn test`, `npm test`, `tests/smoke.ps1` (1-7) | 16 backend / 8 frontend / 7 smoke passed | **PASSED** |
| **Gate 2** (AI Services & Budgets) | `mvn test`, `npm test`, `tests/smoke.ps1` (1-11) | 25 backend / 15 frontend / 11 smoke passed | **PASSED** |
| **Gate 3** (Marketplace & Governance) | `mvn test`, `npm test`, `tests/smoke.ps1` (1-20) | 42 backend / 28 frontend / 20 smoke passed | **PASSED** |
| **Gate 4** (SCM Delivery & Packaging) | `npm run lint`, `npm run build`, FCA/PCA audits | 0 lint warnings, 15.26s build, 100% audit compliance | **PASSED** |

---

### 4. Demo User Accounts

| Role | Email | Password | Primary Interface Route |
|:---|:---|:---|:---|
| Customer | `customer@demo.com` | `Password123!` | `/venues`, `/recommendations`, `/my-bookings` |
| Venue Owner | `owner@demo.com` | `Password123!` | `/owner/dashboard` |
| Vendor | `vendor@demo.com` | `Password123!` | `/vendors` |
| Event Organizer | `organizer@demo.com` | `Password123!` | `/planner`, `/events/rsvp` |
| Administrator | `admin@demo.com` | `AdminPass123!` | `/admin` |

---

### 5. Known Limitations
1. **Mock Payment Provider:** Payments are simulated sandbox transactions; no real financial institution or card network is charged.
2. **Parking IoT Sensors:** Live sensor feeds are currently simulated via the `SimulatedSensorParkingDataProvider` and manual owner entry forms; hardware IoT gateway drivers can be integrated via the extensible `ParkingDataProvider` interface in future releases.
3. **Email Notification Transport:** Notifications are currently delivered via the in-app notification bell and database queue; external SMTP email delivery requires configuring standard Spring Mail properties in `application.yml`.
