# Change Request (CR) Register
## Smart Event Venue Booking, Planning, and Management System with Parking Assistance

**Document Identifier:** SCM-DOC-CRR-10  
**Version:** 1.0.0  
**Status:** Approved / Baselined  
**Project:** Smart Event Venue Management System (SCM Course Project)  
**Date:** October 2026  

---

### Change Request Summary Directory

| CR ID | Title | Priority | Requestor | Date Logged | CCB Status | Verification Status | Target Release |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **CR-01** | Dual Database Engine Architecture (PostgreSQL 16 + H2 In-Memory Fallback) | High | Tech Lead | 2026-10-17 | **APPROVED** | Verified (Gate 1) | v1.0.0 |
| **CR-02** | Pessimistic Lock Concurrency Strategy for Double-Booking Prevention | Critical | Architect | 2026-10-17 | **APPROVED** | Verified (Gate 1) | v1.0.0 |
| **CR-03** | Interface Segregation for Mockito Mocking on Java 24 Runtime | High | QA Lead | 2026-10-18 | **APPROVED** | Verified (Gate 3) | v1.0.0 |
| **CR-04** | Normalization of Event Planner Template Endpoints and Parameters | Medium | Frontend Dev | 2026-10-18 | **APPROVED** | Verified (Gate 3) | v1.0.0 |
| **CR-05** | Dual Route Aliasing for Admin Telemetry & Approval Queues | Medium | SCM Lead | 2026-10-18 | **APPROVED** | Verified (Gate 3) | v1.0.0 |

---

### Detailed Change Request Specifications

#### CR-01: Dual Database Engine Architecture
- **Description:** Provide seamless developer and grading ergonomics allowing the backend to start either via Dockerized PostgreSQL 16 or automatically fall back to an in-memory H2 database (`dev-h2` profile) when Docker is unavailable.
- **Architectural Impact:**
  - Flyway migrations must remain completely ANSI SQL compliant without PostgreSQL-specific proprietary types in base migrations.
  - Configured `application-dev-h2.yml` with in-memory dialect and enabled web console.
- **CCB Disposition:** Approved. Essential for portability and grading compliance.
- **Verification Evidence:** Flyway applied all 4 migrations successfully on both PostgreSQL and H2 engine.

#### CR-02: Pessimistic Lock Concurrency Strategy for Double-Booking Prevention
- **Description:** Replace standard application-level status checks with an exclusive database row lock (`LockModeType.PESSIMISTIC_WRITE`) during booking approval to guarantee zero overlapping confirmed reservations under high concurrency.
- **Architectural Impact:**
  - Added `findByIdWithLock(@Param("id") Long id)` query to `VenueRepository`.
  - Transaction boundary on `BookingService.approveBooking` acquires row lock on `venues` before evaluating overlap counts.
- **CCB Disposition:** Approved. Mandated by Project Scope and Gate 1 requirements.
- **Verification Evidence:** `BookingServiceAndConflictTest` concurrent multi-threaded test and step 7 of `smoke.ps1` correctly returning HTTP 409 Conflict.

#### CR-03: Interface Segregation for Mockito Mocking on Java 24 Runtime
- **Description:** In Java 24, ByteBuddy/Mockito inline mock-maker failed when attempting to redefine concrete service classes (`NotificationService`, `AuditService`) with `Could not modify all classes [class NotificationService, class Object]`.
- **Architectural Impact:**
  - Extracted clean interfaces: `NotificationService` and `AuditService`.
  - Implemented concrete default beans: `DefaultNotificationService` and `DefaultAuditService`.
  - Service consumers depend strictly on interfaces.
- **CCB Disposition:** Approved. Eliminates JVM bytecode manipulation failures and restores clean mocking.
- **Verification Evidence:** All 42 backend test cases executed cleanly on OpenJDK 24 without runtime bytecode errors.

#### CR-04: Normalization of Event Planner Template Endpoints and Parameters
- **Description:** Align backend route mappings and request parameters for template checklist generation so that both query parameters (`?templateType=WEDDING`, `?templateName=Wedding%20Planner`) and path variations are supported case-insensitively.
- **Architectural Impact:**
  - Configured `@PostMapping({"/templates/apply", "/template"})` in `PlannerController`.
  - Added case-insensitive template string parser in `PlannerService`.
- **CCB Disposition:** Approved. Eliminates parameter mismatch friction between frontend client and automated smoke script.
- **Verification Evidence:** Step 15 of `smoke.ps1` successfully bootstrapped 6 template tasks.

#### CR-05: Dual Route Aliasing for Admin Telemetry & Approval Queues
- **Description:** Provide consistent route aliases for admin telemetry and pending queues between frontend UI calls (`/admin/stats`, `/admin/venues/pending`) and legacy controller paths (`/admin/dashboard/stats`, `/admin/queues/venues`).
- **Architectural Impact:**
  - Configured multi-path array annotations on `AdminDashboardController` methods.
  - Added `getTotalConfirmedRevenue()` alias in `AdminDashboardDto.DashboardStats`.
- **CCB Disposition:** Approved. Ensures contract compliance across all client consumers.
- **Verification Evidence:** Admin dashboard loaded real DB statistics in browser and passed Step 20 of `smoke.ps1`.
