# System Design Document (SDD)
## Smart Event Venue Booking, Planning, and Management System with Parking Assistance

**Document Identifier:** SCM-DOC-SDD-02  
**Version:** 1.0.0  
**Status:** Approved / Baselined  
**Project:** Smart Event Venue Management System (SCM Course Project)  
**Date:** October 2026  

---

### 1. Architectural Overview

The system employs a 3-tier, decoupled client-server architecture:
1. **Presentation Layer (Client):** Single Page Application built with React 18, TypeScript, Tailwind CSS, Vite, and Lucide React.
2. **Application & Business Layer (Server):** Modular REST API powered by Spring Boot 3.3.5 and Java 21/24 with Spring Security (Stateless JWT Filter), Spring Data JPA, and transactional service boundaries.
3. **Persistence Layer (Database):** Relational database managed through Flyway schema migrations (V1 initial schema, V2 seed demo data, V3 stage 2 tables, V4 stage 3 tables) with dialect abstraction supporting PostgreSQL 16 and H2 Database Engine.

```
+-----------------------------------------------------------------------------------+
|                            PRESENTATION TIER (React 18)                           |
|  [Venue Discovery] [Booking Panel] [Recommender] [Budgeting] [Parking Assistance] |
|  [Vendor Portal]   [Event Planner] [Guest RSVP]  [Payments]  [Admin Console]      |
+-----------------------------------------------------------------------------------+
                                          |
                                    HTTPS / REST
                                          |
+-----------------------------------------------------------------------------------+
|                           APPLICATION TIER (Spring Boot 3)                        |
|  +------------------------+  +--------------------------+  +-------------------+  |
|  | Security & Auth Filter |  | Controllers & Validation |  | Business Services |  |
|  | - JWT Bearer Tokens    |  | - JSR-380 (@Valid)       |  | - Pessimistic Lock|  |
|  | - RBAC Authority Map   |  | - RFC-7807 ExceptionHndlr|  | - AI Recommender  |  |
|  +------------------------+  +--------------------------+  +-------------------+  |
+-----------------------------------------------------------------------------------+
                                          |
                                    JPA / Hibernate
                                          |
+-----------------------------------------------------------------------------------+
|                            PERSISTENCE TIER (Flyway DB)                           |
|      [PostgreSQL 16 Engine / H2 In-Memory]  (V1__ -> V2__ -> V3__ -> V4__)        |
|  Tables: users, venues, bookings, booking_status_history, parking_lots, etc.      |
+-----------------------------------------------------------------------------------+
```

---

### 2. Component Decomposition & Interfaces

#### 2.1 Recommendation Subsystem
- **Component:** `com.smartvenue.backend.service.RecommendationEngine` (Interface)
- **Implementation:** `com.smartvenue.backend.service.DefaultRecommendationEngine`
- **Methodology:** Multi-factor weighted score $S_{total} \in [0, 100]$:
  $$S_{total} = w_{budget} \cdot S_{budget} + w_{cap} \cdot S_{cap} + w_{loc} \cdot S_{loc} + w_{event} \cdot S_{event} + w_{fac} \cdot S_{fac} + w_{avail} \cdot S_{avail}$$
- **Hard Constraints:** Venues with capacity less than required guests or conflicting confirmed reservations receive score 0 and are omitted from recommendations.
- **Explainability:** Generates natural language reasoning explaining utilization efficiency, budget cushion, and amenity alignments.

#### 2.2 Smart Parking Subsystem
- **Component:** `com.smartvenue.backend.service.ParkingDataProvider` (Interface)
- **Implementations:**
  - `ManualParkingDataProvider`: Allows venue owners to submit manual counts.
  - `SimulatedSensorParkingDataProvider`: Simulates IoT inductive loop vehicle counters.
- **Formulas:**
  $$\text{Occupancy Rate (\%)} = \frac{\text{Occupied Spots}}{\text{Total Capacity}} \times 100$$
  $$\text{Available Spots} = \text{Total Capacity} - \text{Occupied Spots}$$
- **Predictive Model:** Integrates historical weekday/hour regression curves with confirmed event guest counts to project lot saturation and recommend 30-minute arrival windows.

#### 2.3 Notification & Audit Subsystems
- **Interface Segregation:** `NotificationService` and `AuditService` are defined as clean Java interfaces, decoupling transaction controllers from storage mechanisms and supporting Mockito mocking across JDK 21 through 24.
- **Implementations:** `DefaultNotificationService` and `DefaultAuditService`.

---

### 3. Concurrency & Transaction Management

#### 3.1 Double-Booking Prevention Algorithm
To guarantee that two concurrent customers cannot secure the same venue for the same time slot:
1. `BookingService.createBookingRequest` validates availability within a read-only transaction.
2. `BookingService.approveBooking` acquires an exclusive pessimistic write lock (`LockModeType.PESSIMISTIC_WRITE`) on the `Venue` entity:
   ```java
   venueRepository.findByIdWithLock(venueId);
   ```
3. A conflict query checks existing `CONFIRMED` bookings overlapping date and time slot:
   ```sql
   SELECT COUNT(b) FROM Booking b 
   WHERE b.venue.id = :venueId 
     AND b.eventDate = :eventDate 
     AND b.timeSlot = :timeSlot 
     AND b.status = 'CONFIRMED'
   ```
4. If an overlapping confirmed booking exists, the transaction aborts and throws `Exceptions.ConflictException("Venue is already booked for this slot")`, returning HTTP 409 Conflict.
5. In PostgreSQL production, a GiST exclusion constraint (`EXCLUDE USING gist`) provides defense-in-depth database-level protection.

---

### 4. Database Schema Design (Flyway Baseline)

#### Tables Overview
- **V1__create_initial_schema.sql:**
  - `users`: Core identity, email, password hash, role (`CUSTOMER`, `VENUE_OWNER`, `VENDOR`, `EVENT_ORGANIZER`, `ADMIN`).
  - `venues`: Venue properties, capacity, pricing, cleaning fees, ratings, amenities, approval flag.
  - `bookings`: Reservations, dates, time slots, guest counts, total costs, reference codes (`BK-XXXX`).
  - `booking_status_history`: Audit trail for booking lifecycle transitions (`PENDING`, `CONFIRMED`, `REJECTED`, `CANCELLED`).
- **V2__seed_demo_data.sql:**
  - Populates 5 demo role accounts and 12 distinct event venues across major cities.
- **V3__add_stage2_tables.sql:**
  - `parking_lots`: Capacities, real-time occupancy, data source provenance.
  - `parking_history`: Temporal telemetry records for predictive modeling.
  - `budget_estimates`: Itemized event budget breakdowns and ceiling limits.
- **V4__add_stage3_tables.sql:**
  - `vendors` & `vendor_services`: Vendor profiles and service catalogs.
  - `vendor_bookings`: Vendor service contracts and approval states.
  - `events` & `event_guests`: Event registries, guest tokens, and RSVP states.
  - `planner_tasks`: Checklist items, categories, timelines, and status cycles.
  - `reviews`: Multi-criteria ratings for confirmed reservations.
  - `payments`: Sandbox mock payment transactions and receipts.
  - `notifications`: User notification queue.
  - `audit_logs`: Immutable security and administrative actions.

---

### 5. API Design & Security Specifications

- **Base Path:** `/api`
- **Swagger Documentation:** `/swagger-ui/index.html`, `/v3/api-docs`
- **Security Mechanism:** Stateless Bearer JWT via Authorization header.
- **Error Format:**
  ```json
  {
    "timestamp": "2026-10-18T12:00:00",
    "status": 409,
    "error": "Conflict",
    "message": "Double-booking prevented: Slot already confirmed",
    "path": "/api/bookings/100/status"
  }
  ```
