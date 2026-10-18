# [DRAFT ISSUE #1] High-concurrency race conditions leading to potential double-bookings

*Note: This is a local SCM draft artifact representing Issue #1. It is stored as documentation within the repository and does not claim to exist on GitHub.*

---

## Issue Overview
- **Type:** Enhancement / Security
- **Priority:** Critical
- **Labels:** `backend`, `concurrency`, `database`
- **Traceability:** FR-09, CI-03, CR-02

---

## Description
Under high concurrent traffic, two users could submit reservation requests for the same venue, same date, and overlapping time slot simultaneously. If both requests pass the initial read-only availability check before either transaction commits, an application-level race condition occurs, resulting in double-booking.

## Proposed Architectural Solution
1. In `BookingService.approveBooking`, wrap the decision process in a database transaction.
2. Obtain a pessimistic write lock on the target venue entity (`LockModeType.PESSIMISTIC_WRITE` -> `SELECT ... FOR UPDATE`).
3. Re-execute an overlap query against confirmed bookings. If count > 0, abort transaction and throw `Exceptions.ConflictException`, returning HTTP 409.
4. Add concurrent multi-threaded integration test (`BookingServiceAndConflictTest`) simulating two competing threads.
