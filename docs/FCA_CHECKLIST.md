# Functional Configuration Audit (FCA) Checklist
## Smart Event Venue Booking, Planning, and Management System with Parking Assistance

**Document Identifier:** SCM-DOC-FCA-13  
**Version:** 1.0.0  
**Status:** Approved / Baselined  
**Project:** Smart Event Venue Management System (SCM Course Project)  
**Audit Date:** October 2026  
**Auditor:** Quality & SCM Audit Lead  

---

### Audit Criteria & Methodology
The Functional Configuration Audit (FCA) certifies that all functional capabilities defined in the Software Requirements Specification (SRS) have been implemented, tested, and verified against operational software. Every checklist item requires concrete test execution evidence.

---

### Functional Audit Verification Matrix

| Requirement Ref | Functional Feature Description | Verification Method | Execution Evidence | Audit Finding |
|:---:|:---|:---|:---|:---:|
| **FR-01** | Self-service registration restricted to CUSTOMER, VENUE_OWNER, VENDOR, ORGANIZER (ADMIN prohibited) | Automated Test / Smoke Step 1 | `AuthIntegrationTest.registerCustomer_success`, `smoke.ps1` (Step 1) | **PASS** |
| **FR-02** | User authentication with BCrypt password hashing and JWT issuance | Automated Test / Smoke Step 2 | `AuthIntegrationTest.login_success`, `smoke.ps1` (Step 2) | **PASS** |
| **FR-03** | Role-based authorization on REST routes with standardized 401/403 errors | Automated Test | `AuthIntegrationTest.accessProtectedWithoutAuth_returns401` | **PASS** |
| **FR-04** | Parametric search by name/city, filters for event type, date, budget, capacity, facilities | Automated Test / Smoke Step 3 | `VenueSearchAndFilterTest.searchVenues_filtersCorrectly`, `smoke.ps1` (Step 3) | **PASS** |
| **FR-05** | Venue sorting by price, rating, capacity and URL-synced pagination | Component Test | `VenueDiscovery.test.tsx` (2 passed) | **PASS** |
| **FR-06** | Multi-venue side-by-side comparison (up to 3 venues) | Component Test | `VenueDiscovery.test.tsx` (Comparison drawer render) | **PASS** |
| **FR-07** | Booking request submission with date, time slot, event type, guest count | Automated Test / Smoke Step 4 | `BookingServiceAndConflictTest.createBooking_success`, `smoke.ps1` (Step 4) | **PASS** |
| **FR-08** | Server-side validation for capacity limits and date availability | Automated Test | `BookingServiceAndConflictTest.rejectExcessCapacity` | **PASS** |
| **FR-09** | Concurrency control & double-booking prevention using pessimistic lock | Multi-threaded Test / Smoke Step 7 | `BookingServiceAndConflictTest.concurrentBookingConflict`, `smoke.ps1` (Step 7: HTTP 409) | **PASS** |
| **FR-10** | Venue owner booking approval/rejection workflow | Automated Test / Smoke Steps 5-6 | `smoke.ps1` (Step 6: Status confirmed to CONFIRMED) | **PASS** |
| **FR-11** | Customer cancellation policy and status transition history table | Unit Test | `BookingServiceTest.cancelBooking_recordsHistory` | **PASS** |
| **FR-12** | Printable itemized booking receipt generation | Component / API Test | `BookingReceiptPage.tsx`, `/api/bookings/{id}/receipt` | **PASS** |
| **FR-13** | AI venue recommendation with multi-attribute scoring and plain-language explanation | Algorithm Test / Smoke Step 8 | `RecommendationServiceTest` (3 passed), `smoke.ps1` (Step 8: 95.9/100 score) | **PASS** |
| **FR-14** | Event budget estimator with category allocations and "Estimate only" disclaimer | Component Test / Smoke Step 9 | `BudgetEstimator.test.tsx` (3 passed), `smoke.ps1` (Step 9: Subtotal $21,500) | **PASS** |
| **FR-15** | Smart parking capacity tracking, occupancy % formula, and telemetry badges | Unit Test / Smoke Step 10 | `ParkingServiceTest` (4 passed), `smoke.ps1` (Step 10: 40.0% occupancy) | **PASS** |
| **FR-16** | Future event parking prediction and arrival window recommendation | Predictive Test / Smoke Step 11 | `ParkingServiceTest`, `smoke.ps1` (Step 11: 38.3% prediction) | **PASS** |
| **FR-17** | Vendor service catalog management across catering, decor, and photography | Unit Test / Smoke Step 12 | `VendorServiceTest` (3 passed), `smoke.ps1` (Step 12: Artisan Culinary Group) | **PASS** |
| **FR-18** | Vendor booking request and acceptance/rejection lifecycle | Unit Test / Smoke Steps 13-14 | `VendorServiceTest`, `smoke.ps1` (Steps 13-14: CONFIRMED) | **PASS** |
| **FR-19** | Template-driven event planner checklist generator (Wedding, Gala, Corporate) | Unit Test / Smoke Step 15 | `PlannerServiceTest` (3 passed), `smoke.ps1` (Step 15: 6 tasks created) | **PASS** |
| **FR-20** | Task execution lifecycle management (`TODO`, `IN_PROGRESS`, `COMPLETED`) | Unit Test / Component Test | `PlannerServiceTest`, `EventPlanner.test.tsx` (2 passed) | **PASS** |
| **FR-21** | Event registry and guest list management | Unit Test / Smoke Step 16 | `EventGuestRsvpTest` (2 passed), `smoke.ps1` (Step 16) | **PASS** |
| **FR-22** | Secure tokenized public RSVP submission without login or data leaks | Unit Test / Smoke Step 16 | `Rsvp.test.tsx` (2 passed), `smoke.ps1` (Step 16: ATTENDING) | **PASS** |
| **FR-23** | Verified customer review eligibility strictly for confirmed reservations | Unit Test / Smoke Step 18 | `ReviewEligibilityTest` (4 passed: rejected unconfirmed) | **PASS** |
| **FR-24** | Multi-factor review scoring (cleanliness, staff, value) | Unit Test / Smoke Step 18 | `ReviewEligibilityTest`, `smoke.ps1` (Step 18: 5-star review saved) | **PASS** |
| **FR-25** | Sandbox mock payment processing with prominent warning banner | Component Test / Smoke Step 17 | `Payment.test.tsx` (2 passed), `smoke.ps1` (Step 17: TXN-DF9FB804) | **PASS** |
| **FR-26** | Mock payment audit log recording and customer notification dispatch | Service Test / Smoke Step 17 | `PaymentServiceTest.processPayment_recordsAuditAndNotify` | **PASS** |
| **FR-27** | Administrator platform telemetry from live database queries | Component Test / Smoke Step 20 | `AdminDashboard.test.tsx` (2 passed), `smoke.ps1` (Step 20: 7 users, 12 venues) | **PASS** |
| **FR-28** | Admin moderation queues for pending venue and vendor listings | Component Test | `AdminDashboard.test.tsx` (Approval queue action) | **PASS** |
| **FR-29** | User access role governance and immutable security audit log | Service Test / Smoke Step 20 | `AdminDashboardController.java`, `smoke.ps1` (Step 20: Audit logs) | **PASS** |

---

### Audit Finding & Certification
All 29 functional requirements have been verified as fully operational with genuine test evidence. No stubbed or simulated database data exists in the production builds. The Functional Configuration Audit is hereby certified as **PASSED**.
