# Software Architecture Document
## Smart Event Venue Booking, Planning, and Management System with Parking Assistance

**Document Identifier:** SCM-DOC-ARCH-03  
**Version:** 1.0.0  
**Status:** Approved / Baselined  
**Project:** Smart Event Venue Management System (SCM Course Project)  
**Date:** October 2026  

---

### 1. System Architecture Diagram

```mermaid
graph TD
    subgraph ClientLayer["Frontend Client Tier (React 18 + Vite)"]
        UI_DISCOVERY["Venue Discovery & Compare"]
        UI_BOOKING["Booking & Receipt Panel"]
        UI_AI["AI Recommender & Budgeting"]
        UI_PARKING["Smart Parking Telemetry"]
        UI_MARKET["Vendor & Planner Hub"]
        UI_ADMIN["Admin Governance Console"]
    end

    subgraph SecurityGateway["Security & API Gateway"]
        CORS_FILTER["CORS & WebSecurityConfig"]
        JWT_AUTH["JwtAuthenticationFilter"]
        RBAC_GUARD["Method Security (@PreAuthorize)"]
    end

    subgraph BusinessLayer["Application Services (Spring Boot 3)"]
        AUTH_SVC["AuthService & UserDetails"]
        VENUE_SVC["VenueService & Search"]
        BOOKING_SVC["BookingService (Pessimistic Lock)"]
        AI_SVC["RecommendationEngine"]
        BUDGET_SVC["BudgetService"]
        PARK_SVC["ParkingService & Prediction"]
        VENDOR_SVC["VendorService"]
        PLAN_SVC["PlannerService"]
        EVENT_SVC["Event & RSVP Service"]
        PAY_SVC["PaymentService (Mock Gateway)"]
        AUDIT_SVC["Audit & Notification Service"]
        ADMIN_SVC["AdminDashboardService"]
    end

    subgraph PersistenceLayer["Data Persistence (Flyway Migrations)"]
        POSTGRES_DB[("PostgreSQL 16 Production DB")]
        H2_DB[("H2 In-Memory Fallback DB")]
    end

    UI_DISCOVERY --> CORS_FILTER
    UI_BOOKING --> CORS_FILTER
    UI_AI --> CORS_FILTER
    UI_PARKING --> CORS_FILTER
    UI_MARKET --> CORS_FILTER
    UI_ADMIN --> CORS_FILTER

    CORS_FILTER --> JWT_AUTH
    JWT_AUTH --> RBAC_GUARD

    RBAC_GUARD --> AUTH_SVC
    RBAC_GUARD --> VENUE_SVC
    RBAC_GUARD --> BOOKING_SVC
    RBAC_GUARD --> AI_SVC
    RBAC_GUARD --> BUDGET_SVC
    RBAC_GUARD --> PARK_SVC
    RBAC_GUARD --> VENDOR_SVC
    RBAC_GUARD --> PLAN_SVC
    RBAC_GUARD --> EVENT_SVC
    RBAC_GUARD --> PAY_SVC
    RBAC_GUARD --> AUDIT_SVC
    RBAC_GUARD --> ADMIN_SVC

    BOOKING_SVC --> POSTGRES_DB
    BOOKING_SVC --> H2_DB
    VENUE_SVC --> POSTGRES_DB
    VENUE_SVC --> H2_DB
    PARK_SVC --> POSTGRES_DB
    PARK_SVC --> H2_DB
    EVENT_SVC --> POSTGRES_DB
    EVENT_SVC --> H2_DB
    PAY_SVC --> POSTGRES_DB
    PAY_SVC --> H2_DB
    AUDIT_SVC --> POSTGRES_DB
    AUDIT_SVC --> H2_DB
```

---

### 2. Use Case Diagram

```mermaid
flowchart TD
    actorCustomer["Customer"]
    actorOwner["Venue Owner"]
    actorVendor["Vendor"]
    actorAdmin["Administrator"]

    subgraph VenueModule["Venue Management"]
        UC1["Discover & Filter Venues"]
        UC2["Compare Venues"]
        UC3["Create Venue Listing"]
        UC4["Approve/Reject Venue Listings"]
    end

    subgraph BookingModule["Reservation Lifecycle"]
        UC5["Request Venue Booking"]
        UC6["Review & Approve Booking"]
        UC7["Prevent Overlapping Double-Booking"]
        UC8["View & Print Itemized Receipt"]
    end

    subgraph AIAndSmartServices["AI & Smart Logistics"]
        UC9["Get Weighted AI Venue Recommendations"]
        UC10["Estimate Event Budget"]
        UC11["View Live & Predicted Parking Occupancy"]
        UC12["Update Parking Deck Counts"]
    end

    subgraph MarketAndFulfillment["Event Execution & Marketplace"]
        UC13["Book Vendor Catering / Decor Services"]
        UC14["Accept / Fulfill Vendor Order"]
        UC15["Manage Template Planner Checklist"]
        UC16["Issue Guest Invitations & Token RSVP"]
        UC17["Submit Verified Review"]
        UC18["Process Sandbox Mock Payment"]
    end

    subgraph GovernanceModule["Auditing & Governance"]
        UC19["Monitor Real Telemetry & Audit Logs"]
        UC20["Manage User Roles & Permissions"]
    end

    actorCustomer --> UC1
    actorCustomer --> UC2
    actorCustomer --> UC5
    actorCustomer --> UC8
    actorCustomer --> UC9
    actorCustomer --> UC10
    actorCustomer --> UC11
    actorCustomer --> UC13
    actorCustomer --> UC15
    actorCustomer --> UC16
    actorCustomer --> UC17
    actorCustomer --> UC18

    actorOwner --> UC3
    actorOwner --> UC6
    actorOwner --> UC7
    actorOwner --> UC12

    actorVendor --> UC14

    actorAdmin --> UC4
    actorAdmin --> UC19
    actorAdmin --> UC20
```

---

### 3. Domain Class Diagram

```mermaid
classDiagram
    class User {
        +Long id
        +String email
        +String passwordHash
        +String fullName
        +UserRole role
        +String phone
        +LocalDateTime createdAt
    }

    class Venue {
        +Long id
        +String name
        +String city
        +String address
        +String category
        +Integer capacity
        +BigDecimal basePricePerDay
        +BigDecimal cleaningFee
        +BigDecimal rating
        +Integer reviewCount
        +Boolean approved
    }

    class Booking {
        +Long id
        +String bookingReference
        +LocalDate eventDate
        +TimeSlot timeSlot
        +String eventType
        +Integer guestCount
        +BigDecimal totalCost
        +BookingStatus status
    }

    class BookingStatusHistory {
        +Long id
        +BookingStatus previousStatus
        +BookingStatus newStatus
        +String changedByEmail
        +String remarks
        +LocalDateTime changedAt
    }

    class ParkingLot {
        +Long id
        +String lotName
        +Integer totalCapacity
        +Integer occupiedSpots
        +DataSourceType dataSource
        +LocalDateTime lastUpdated
        +calculateOccupancyRate() Double
        +getAvailableSpots() Integer
    }

    class Vendor {
        +Long id
        +String companyName
        +String category
        +String city
        +BigDecimal basePrice
        +Boolean approved
    }

    class Event {
        +Long id
        +String title
        +LocalDate eventDate
        +String location
        +String description
    }

    class EventGuest {
        +Long id
        +String guestName
        +String guestEmail
        +String invitationToken
        +String rsvpStatus
        +Integer plusOnes
    }

    class PlannerTask {
        +Long id
        +String title
        +String category
        +String status
        +LocalDate deadlineDate
        +String eventTimeSlot
    }

    class Review {
        +Long id
        +Integer rating
        +Integer cleanlinessRating
        +Integer staffRating
        +Integer valueRating
        +String comment
        +Boolean approved
    }

    class Payment {
        +Long id
        +BigDecimal amount
        +String paymentMethod
        +String transactionReference
        +String status
        +String mockProvider
    }

    User "1" -- "*" Booking : creates
    Venue "1" -- "*" Booking : hosts
    User "1" -- "*" Venue : owns
    Booking "1" -- "*" BookingStatusHistory : logs
    Venue "1" -- "*" ParkingLot : maintains
    User "1" -- "0..1" Vendor : operates
    User "1" -- "*" Event : organizes
    Event "1" -- "*" EventGuest : invites
    Event "1" -- "*" PlannerTask : schedules
    Booking "1" -- "0..1" Review : generates
    Booking "1" -- "*" Payment : finances
```

---

### 4. Authentication Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as Client (Browser)
    participant AuthCtrl as AuthController
    participant AuthSvc as AuthService
    participant UserRepo as UserRepository
    participant PasswordEnc as BCryptPasswordEncoder
    participant JwtProv as JwtTokenProvider

    User->>AuthCtrl: POST /api/auth/login { email, password }
    AuthCtrl->>AuthSvc: login(request)
    AuthSvc->>UserRepo: findByEmail(email)
    UserRepo-->>AuthSvc: User Entity
    AuthSvc->>PasswordEnc: matches(rawPassword, encodedPassword)
    alt Password Matches
        PasswordEnc-->>AuthSvc: true
        AuthSvc->>JwtProv: generateToken(User)
        JwtProv-->>AuthSvc: JWT String (HMAC-SHA256)
        AuthSvc-->>AuthCtrl: AuthResponse { token, userProfile }
        AuthCtrl-->>User: HTTP 200 OK (JWT Token)
    else Invalid Password or User Not Found
        PasswordEnc-->>AuthSvc: false
        AuthSvc-->>AuthCtrl: throw BadCredentialsException
        AuthCtrl-->>User: HTTP 401 Unauthorized { message: "Invalid credentials" }
    end
```

---

### 5. Booking & Pessimistic Concurrency Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer Client
    actor Owner as Venue Owner
    participant BookingCtrl as BookingController
    participant BookingSvc as BookingService
    participant VenueRepo as VenueRepository
    participant BookingRepo as BookingRepository
    participant DB as Relational Database

    Customer->>BookingCtrl: POST /api/bookings { venueId, date, timeSlot, guests }
    BookingCtrl->>BookingSvc: createBooking(request, customer)
    BookingSvc->>VenueRepo: findById(venueId)
    VenueRepo-->>BookingSvc: Venue Entity
    BookingSvc->>BookingSvc: Validate Capacity & Date
    BookingSvc->>BookingRepo: save(Booking[status=PENDING])
    BookingRepo->>DB: INSERT into bookings
    BookingRepo-->>BookingSvc: Booking Saved (ID=100)
    BookingSvc-->>BookingCtrl: BookingResponse
    BookingCtrl-->>Customer: HTTP 201 Created (Booking Pending)

    Owner->>BookingCtrl: PUT /api/bookings/100/status { status: "CONFIRMED" }
    BookingCtrl->>BookingSvc: approveBooking(100, owner)
    
    rect rgb(240, 248, 255)
        note over BookingSvc,DB: Transactional Pessimistic Write Lock
        BookingSvc->>VenueRepo: findByIdWithLock(venueId)
        VenueRepo->>DB: SELECT ... FOR UPDATE (Lock Venue Row)
        DB-->>VenueRepo: Locked Venue
        BookingSvc->>BookingRepo: countOverlappingConfirmed(venueId, date, slot)
        BookingRepo->>DB: SELECT COUNT(*) WHERE status='CONFIRMED'
        DB-->>BookingRepo: 0 (No overlaps)
        BookingSvc->>BookingRepo: save(Booking[status=CONFIRMED])
        BookingRepo->>DB: UPDATE bookings SET status='CONFIRMED'
    end

    BookingSvc-->>BookingCtrl: Booking Confirmed
    BookingCtrl-->>Owner: HTTP 200 OK (Booking Confirmed)

    actor Customer2 as Concurrent Customer
    Customer2->>BookingCtrl: POST /api/bookings (Same Venue, Same Date, Same Slot)
    Customer2->>BookingCtrl: Request Confirmation
    BookingCtrl->>BookingSvc: approveBooking(101, owner)
    rect rgb(255, 230, 230)
        note over BookingSvc,DB: Double-Booking Conflict Interception
        BookingSvc->>VenueRepo: findByIdWithLock(venueId)
        BookingSvc->>BookingRepo: countOverlappingConfirmed(venueId, date, slot)
        DB-->>BookingRepo: 1 (Confirmed Booking Exists!)
        BookingSvc-->>BookingCtrl: throw ConflictException("Venue already booked")
        BookingCtrl-->>Customer2: HTTP 409 Conflict (Double-Booking Prevented)
    end
```

---

### 6. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o{ VENUES : owns
    USERS ||--o{ BOOKINGS : reserves
    USERS ||--o{ REVIEWS : authors
    USERS ||--o{ PAYMENTS : executes
    USERS ||--o{ EVENTS : organizes
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ AUDIT_LOGS : triggers

    VENUES ||--o{ BOOKINGS : hosts
    VENUES ||--o{ PARKING_LOTS : provides
    VENUES ||--o{ REVIEWS : receives

    BOOKINGS ||--o{ BOOKING_STATUS_HISTORY : transitions
    BOOKINGS ||--o| REVIEWS : enables
    BOOKINGS ||--o{ PAYMENTS : settles
    BOOKINGS ||--o| EVENTS : grounds

    PARKING_LOTS ||--o{ PARKING_HISTORY : records

    VENDORS ||--o{ VENDOR_SERVICES : offers
    VENDORS ||--o{ VENDOR_BOOKINGS : accepts
    USERS ||--o{ VENDOR_BOOKINGS : contracts

    EVENTS ||--o{ EVENT_GUESTS : invites
    EVENTS ||--o{ PLANNER_TASKS : structures

    USERS {
        bigint id PK
        varchar email UK
        varchar password_hash
        varchar full_name
        varchar role
        varchar phone
        timestamp created_at
    }

    VENUES {
        bigint id PK
        bigint owner_id FK
        varchar name
        varchar city
        varchar address
        varchar category
        int capacity
        numeric base_price_per_day
        numeric cleaning_fee
        numeric rating
        int review_count
        boolean approved
    }

    BOOKINGS {
        bigint id PK
        bigint venue_id FK
        bigint user_id FK
        varchar booking_reference UK
        date event_date
        varchar time_slot
        varchar event_type
        int guest_count
        numeric total_cost
        varchar status
        timestamp created_at
    }

    PARKING_LOTS {
        bigint id PK
        bigint venue_id FK
        varchar lot_name
        int total_capacity
        int occupied_spots
        varchar data_source
        timestamp last_updated
    }

    VENDORS {
        bigint id PK
        bigint user_id FK
        varchar company_name
        varchar category
        varchar city
        numeric base_price
        boolean approved
    }

    EVENTS {
        bigint id PK
        bigint organizer_id FK
        bigint booking_id FK
        varchar title
        date event_date
        varchar location
        text description
    }

    EVENT_GUESTS {
        bigint id PK
        bigint event_id FK
        varchar guest_name
        varchar guest_email
        varchar invitation_token UK
        varchar rsvp_status
        int plus_ones
    }

    PAYMENTS {
        bigint id PK
        bigint booking_id FK
        bigint user_id FK
        numeric amount
        varchar payment_method
        varchar transaction_reference UK
        varchar status
        varchar mock_provider
    }
```
