# [DRAFT ISSUE #2] Implement smart parking occupancy modeling and predictive arrival curves

*Note: This is a local SCM draft artifact representing Issue #2. It is stored as documentation within the repository and does not claim to exist on GitHub.*

---

## Issue Overview
- **Type:** Feature Request
- **Priority:** High
- **Labels:** `analytics`, `iot`, `parking`
- **Traceability:** FR-15, FR-16, CI-06

---

## Description
Venue attendees frequently face parking congestion when arriving shortly before popular events. The system needs to present real-time capacity telemetry while also projecting future lot saturation based on scheduled bookings and historical baselines.

## Proposed Architectural Solution
1. Define `ParkingDataProvider` interface to cleanly abstract sensor hardware vs manual input.
2. Implement exact mathematical formulas for occupancy rate:
   $$\text{Occupancy \%} = \frac{\text{Occupied}}{\text{Total}} \times 100$$
   $$\text{Available} = \text{Total} - \text{Occupied}$$
3. Display provenance badges (`SENSOR`, `MANUAL`, `SIMULATED_DEMO`, `PREDICTED`).
4. Implement `ParkingService.predictOccupancy` to synthesize historical day-of-week averages with expected event attendance, projecting arrival congestion curves and recommending 30-minute arrival windows.
