# Defect Register (Bug Tracking Log)
## Smart Event Venue Booking, Planning, and Management System with Parking Assistance

**Document Identifier:** SCM-DOC-DR-11  
**Version:** 1.0.0  
**Status:** Approved / Baselined  
**Project:** Smart Event Venue Management System (SCM Course Project)  
**Date:** October 2026  

---

### Defect Tracking Summary Table

| Defect ID | Severity | Category | Title / Summary | Discovered In | Status | Resolution Summary | Verified In |
|:---:|:---:|:---:|:---|:---:|:---:|:---|:---:|
| **DEF-01** | Critical | Backend / Test | Mockito inline class re-definition error on OpenJDK 24 runtime | Unit Testing | **CLOSED** | Segregated `NotificationService` and `AuditService` into clean Java interfaces. Mockito mocks interfaces without bytecode agent conflicts. | `mvn test` (42 passed) |
| **DEF-02** | Major | Backend / JPA | Booking domain entity missing `getUser()` / `setUser()` alias | Service Layer | **CLOSED** | Added bidirectional getter/setter aliases (`getUser()`, `setUser()`, `getCustomer()`, `setCustomer()`) on `Booking.java`. | `BookingServiceTest` |
| **DEF-03** | Minor | REST API | Planner template endpoint failed on query parameter case variation | Smoke Testing | **CLOSED** | Added route alias `@PostMapping({"/templates/apply", "/template"})` and case-insensitive string parsing in `PlannerService.java`. | `smoke.ps1` (Step 15) |
| **DEF-04** | Major | Validation | Event creation rejected with HTTP 400 due to missing `location` field | Smoke Testing | **CLOSED** | Updated `EventDto.EventRequest` to accept `locationName` and `locationAddress`, synthesizing `location` with fallback formatting. | `smoke.ps1` (Step 16) |
| **DEF-05** | Major | Contract | Payment status mismatch between backend (`SUCCESS`) and frontend/smoke (`COMPLETED`) | Smoke Testing | **CLOSED** | Standardized `PaymentService` to set status `COMPLETED` matching the TypeScript `PaymentStatus` union type. | `smoke.ps1` (Step 17) |
| **DEF-06** | Minor | Frontend / TS | TypeScript build failed on invalid `isAuthenticated` property in AuthContext mock | Frontend Build | **CLOSED** | Corrected `Vendors.test.tsx` AuthContext mock to adhere strictly to `AuthContextType` interface (`isCustomer: true`, etc.). | `npm run build` |

---

### Detailed Defect Reports & Root Cause Analyses

#### DEF-01: Mockito ByteBuddy Inline Mock-Maker Failure on OpenJDK 24
- **Root Cause:** When running tests on OpenJDK 24, Mockito's inline mock-maker attempted to redefine loaded concrete classes (`NotificationService`, `AuditService`) via JVM instrumentation, causing:
  ```
  java.lang.IllegalStateException: Could not modify all classes [class com.smartvenue.backend.service.NotificationService, class java.lang.Object]
  ```
- **Corrective Action:** Refactored `NotificationService` and `AuditService` into pure Java interfaces. Created default implementations `DefaultNotificationService` and `DefaultAuditService`. Tests mock interfaces without requiring JVM class redefinition.
- **Verification:** `mvn test` executed all 42 tests cleanly with 0 errors.

#### DEF-02: Booking Entity Accessor Mismatch
- **Root Cause:** Certain test and service components referenced `booking.getUser()`, while the entity had historically named the field `customer` with accessor `getCustomer()`.
- **Corrective Action:** Added alias methods `public User getUser() { return customer; }` and `public void setUser(User user) { this.customer = user; }` to `Booking.java`.
- **Verification:** Compilation succeeded and all booking relationship tests passed.

#### DEF-03: Event Planner Template Endpoint Query Parameter
- **Root Cause:** The frontend invoked `/planner/templates/apply`, while the automated smoke test invoked `/planner/template?templateName=Wedding%20Planner`. Additionally, case casing differed.
- **Corrective Action:** Configured `@PostMapping({"/templates/apply", "/template"})` in `PlannerController.java` and normalized template strings to upper-case before matching enum types.
- **Verification:** Both frontend template button and smoke test step 15 passed cleanly.

#### DEF-04: Event Creation Validation Failure
- **Root Cause:** `EventDto.EventRequest` required `@NotBlank private String location`. The frontend UI and smoke script sent `locationName` and `locationAddress` separately, causing Spring JSR-380 validation to throw HTTP 400 Bad Request.
- **Corrective Action:** Added `locationName` and `locationAddress` properties to `EventRequest`. Implemented custom `getLocation()` logic synthesizing `locationName + ", " + locationAddress` if `location` is absent.
- **Verification:** Event creation succeeded with HTTP 201 in both UI and Step 16 of `smoke.ps1`.

#### DEF-05: Payment Status Enumeration Mismatch
- **Root Cause:** `PaymentService.java` persisted payment records with status `"SUCCESS"`, whereas the frontend TypeScript definition and smoke script expected `"COMPLETED"`.
- **Corrective Action:** Updated `PaymentService.java` to set status `"COMPLETED"`. Added alias methods `getPaymentProvider()` and `getReceiptNumber()` in `PaymentDto.PaymentResponse`.
- **Verification:** Step 17 of `smoke.ps1` verified: `TxRef=TXN-..., Status=COMPLETED`.

#### DEF-06: Frontend TypeScript Build Type Error
- **Root Cause:** In `Vendors.test.tsx`, an outdated property `isAuthenticated: true` was included in `<AuthContext.Provider value={{...}}>`, which violated the strongly typed `AuthContextType`.
- **Corrective Action:** Removed `isAuthenticated` and supplied the required boolean flags (`isCustomer: true`, `isOwner: false`, `isVendor: false`, `isOrganizer: false`, `isAdmin: false`).
- **Verification:** `npm run build` completed with 0 errors and generated production bundle in `dist/`.
