# Master Test Plan
## Smart Event Venue Booking, Planning, and Management System with Parking Assistance

**Document Identifier:** SCM-DOC-TEST-04  
**Version:** 1.0.0  
**Status:** Approved / Baselined  
**Project:** Smart Event Venue Management System (SCM Course Project)  
**Date:** October 2026  

---

### 1. Introduction & Strategy

#### 1.1 Objective
The Master Test Plan establishes the verification and validation framework for the Smart Event Venue Management System. The objective is to assure functional correctness, concurrency reliability, accessibility compliance, role-based security isolation, and database transaction integrity across all four lifecycle stages.

#### 1.2 Scope of Testing
- **Unit Testing:** Backend services, calculation algorithms (budgeting, parking formulas, AI recommendation weights), and isolated entity behaviors.
- **Integration Testing:** Spring MVC REST controllers, Spring Security authentication filters, JPA repository queries, and database transaction isolation levels.
- **Concurrency & Pessimistic Locking Tests:** Multi-threaded simulated concurrent requests validating zero-collision double-booking prevention.
- **Frontend Component & Page Tests:** Vitest + React Testing Library testing form validations, URL synchronization, role-based navigation guards, and UI state transitions.
- **End-to-End System Smoke Suite:** Automated 20-step verification script executing complete vertical slices against live running instances.

---

### 2. Test Approach & Architecture

```
+-----------------------------------------------------------------------------------+
|                           TEST PYRAMID ARCHITECTURE                               |
|                                                                                   |
|                           / \                                                     |
|                          /   \       End-to-End Smoke Script (20 Steps)           |
|                         / E2E \      (PowerShell / Bash curl against Live App)     |
|                        /-------\                                                  |
|                       /         \    Integration Tests                            |
|                      /Integration\   (MockMvc, SpringBootTest, TestRestTemplate)  |
|                     /-------------\                                               |
|                    /   Frontend    \ Vitest + React Testing Library (28 Tests)    |
|                   /  Component UI   \ (Form validation, navigation, state renders)|
|                  /-------------------\                                            |
|                 /      Backend        \ JUnit 5 + Mockito Unit Tests (42 Tests)   |
|                /   Unit & Services     \ (Domain math, locks, recommender, etc.)  |
|               +-------------------------+                                         |
+-----------------------------------------------------------------------------------+
```

---

### 3. Test Suites & Breakdown

#### 3.1 Backend Test Matrix (42 Test Cases)
- `AuthIntegrationTest` (4 tests):
  - User registration with valid customer data (password BCrypt hash, JWT issuance).
  - Rejection of invalid credentials (HTTP 401).
  - Prevention of self-service registration as `ADMIN` (HTTP 400).
  - RBAC verification for protected endpoints (HTTP 403).
- `VenueSearchAndFilterTest` (5 tests):
  - Parametric search by venue title and city.
  - Multi-criteria filtering by guest capacity, budget, event type, and facilities.
  - Multi-property sorting (price, capacity, rating) and pagination stability.
  - Side-by-side venue comparison metrics calculation.
- `BookingServiceAndConflictTest` (6 tests):
  - Successful booking creation and total cost calculation with cleaning fee.
  - Rejection of booking requests exceeding venue capacity limit.
  - Status transition workflow (`PENDING` -> `CONFIRMED`, `REJECTED`, `CANCELLED`).
  - Pessimistic write lock acquisition and verification.
  - Concurrent multi-threaded request simulation proving zero double-booking.
  - Cancellation policy enforcement and status history recording.
- `RecommendationServiceTest` (3 tests):
  - Multi-attribute weighted scoring algorithm mathematical accuracy.
  - Hard constraint exclusion of undersized or unavailable venues.
  - Plain-language explanation generation with score breakdown transparency.
- `BudgetServiceTest` (2 tests):
  - Category itemization math, contingency calculation, and ceiling limit comparison.
  - Budget estimate persistence and updates.
- `ParkingServiceTest` (4 tests):
  - Occupancy percentage formula: $(\text{occupied} / \text{total}) \times 100$.
  - Available spots calculation: $\text{total} - \text{occupied}$.
  - Predictive model hourly decay and event attendance influx projection.
  - Telemetry source badge assignment (`SENSOR`, `MANUAL`, `SIMULATED_DEMO`, `PREDICTED`).
- `VendorServiceTest` (3 tests):
  - Vendor catalog retrieval and category filtering.
  - Service booking request submission and status transitions.
  - Vendor ownership access control validation.
- `PlannerServiceTest` (3 tests):
  - Template checklist bootstrap (Wedding, Gala, Corporate).
  - Task lifecycle progression (`TODO` -> `IN_PROGRESS` -> `COMPLETED`).
  - Milestone progress calculation and schedule sorting.
- `EventGuestRsvpTest` (2 tests):
  - Secure invitation token generation without exposing organizer private keys.
  - Public RSVP attendance and dietary requirement submission via token.
- `PaymentServiceTest` (3 tests):
  - Mock payment sandbox charge simulation and transaction reference generation.
  - Rejection of unauthorized payment attempts by non-owners.
  - Rejection of payments on cancelled reservations.
- `ReviewEligibilityTest` (4 tests):
  - Rejection of review creation for unconfirmed bookings.
  - Restriction ensuring only the booking customer can review.
  - Enforcement of single review per reservation.
  - Review moderation workflow by administrator.

#### 3.2 Frontend Test Matrix (28 Tests across 12 Files)
- `Auth.test.tsx` (4 tests): Login/register validation, error banners, field-level validation messages.
- `Navigation.test.tsx` (4 tests): Role-based route guards, redirects, 403 Forbidden page.
- `VenueDiscovery.test.tsx` (2 tests): Search input debouncing, filter sidebar sync, comparison drawer.
- `BookingPanel.test.tsx` (1 test): Live capacity limit validation, slot availability, dynamic cost preview.
- `BudgetEstimator.test.tsx` (3 tests): Disclaimer display ("Estimate only, not a quotation"), subtotal calculation, save API call.
- `Parking.test.tsx` (2 tests): Formula rendering, telemetry badge display, predictive forecast styling.
- `Recommendations.test.tsx` (3 tests): Preference inputs, ranked result rendering, score breakdown visualization.
- `Vendors.test.tsx` (1 test): Vendor catalog search, category filtering, booking dialog trigger.
- `EventPlanner.test.tsx` (2 tests): Template checklist applicator, milestone progress bar, status toggle.
- `Rsvp.test.tsx` (2 tests): Secure public invitation view, guest attendance submission.
- `Payment.test.tsx` (2 tests): Mock payment banner display, payment processing modal, receipt view.
- `AdminDashboard.test.tsx` (2 tests): Real database telemetry metric cards, venue approval action.

#### 3.3 End-to-End System Smoke Suite (20 Steps)
Automated script (`tests/smoke.ps1` and `tests/smoke.sh`) verifying complete system integrity against live servers:
1. Customer registration.
2. Customer login.
3. Venue search.
4. Venue booking submission.
5. Venue owner login.
6. Owner booking approval.
7. Double-booking conflict rejection (HTTP 409).
8. AI recommendation query.
9. Budget estimate calculation and save.
10. Parking lot occupancy telemetry.
11. Future event parking prediction.
12. Vendor directory search.
13. Vendor booking request.
14. Vendor order acceptance.
15. Event planner template generation.
16. Event creation, guest invite, and tokenized public RSVP.
17. Mock payment gateway sandbox charge.
18. Verified review submission.
19. Administrator login.
20. Platform telemetry and immutable audit log verification.

---

### 4. Suspension and Exit Criteria
- **Suspension Criteria:** Inability to run tests due to compilation failure, port collisions, or broken database schema migrations.
- **Exit Criteria:**
  - 100% of unit and integration tests passing (0 failures, 0 errors).
  - 100% of frontend component tests passing (0 failures).
  - 0 ESLint errors and 0 ESLint warnings (`--max-warnings 0`).
  - Production frontend build cleanly bundled (`npm run build`).
  - 100% of 20 E2E smoke steps passing with HTTP status code validation.
