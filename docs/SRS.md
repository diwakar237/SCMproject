# Software Requirements Specification (SRS)
## Smart Event Venue Booking, Planning, and Management System with Parking Assistance

**Document Identifier:** SCM-DOC-SRS-01  
**Version:** 1.0.0  
**Status:** Approved / Baselined  
**Project:** Smart Event Venue Management System (SCM Course Project)  
**Date:** October 2026  

---

### 1. Introduction

#### 1.1 Purpose
This document specifies the software requirements for the **Smart Event Venue Booking, Planning, and Management System with Parking Assistance**. It defines the functional, non-functional, interface, and behavioral characteristics of the system for development, verification, configuration management, and audit verification.

#### 1.2 Scope
The system is an enterprise-grade full-stack web application designed to streamline event lifecycle management. It connects Customers, Venue Owners, Vendors, Event Organizers, and System Administrators. Core capabilities include:
- Multi-role authentication and authorization with JWT.
- Venue discovery, parametric search, filtering, and comparison.
- Booking reservations with database-enforced pessimistic write concurrency locks preventing double-booking.
- Transparent AI venue recommendation engine with explainable scoring.
- Comprehensive event budgeting and cost estimation.
- Real-time and predictive smart parking capacity management.
- Vendor service directory, booking, and fulfillment workflow.
- Interactive event checklist, milestones, and day-of execution schedules.
- Event guest invitations and tokenized public RSVP tracking.
- Verified customer reviews for completed reservations.
- Sandbox mock payment processing with immutable transaction auditing.
- Administrative telemetry, audit logs, and approval governance queues.

#### 1.3 Definitions, Acronyms, and Abbreviations
- **JWT:** JSON Web Token
- **RBAC:** Role-Based Access Control
- **SCM:** Software Configuration Management
- **SRS:** Software Requirements Specification
- **CI:** Configuration Item
- **RSVP:** Répondez s'il vous plaît (Invitation confirmation)
- **DB:** Database (PostgreSQL / H2)
- **RTM:** Requirements Traceability Matrix

---

### 2. Overall Description

#### 2.1 Product Perspective
The system is architected as a decoupled client-server web application:
- **Frontend:** Single Page Application (SPA) built using React 18, TypeScript, Tailwind CSS, Lucide icons, and Vite.
- **Backend:** Modular REST API built with Java 21/24, Spring Boot 3.3.5, Spring Security 6, Spring Data JPA, and Flyway database migrations.
- **Persistence Layer:** PostgreSQL 16 (production/docker) with Fallback H2 In-Memory Database (`dev-h2` profile).

#### 2.2 User Roles & Personas
1. **CUSTOMER (`ROLE_CUSTOMER`):** Discovers venues, books slots, uses AI recommender and budget estimator, contracts vendors, manages personal events and RSVPs, processes mock payments, and submits reviews.
2. **VENUE_OWNER (`ROLE_VENUE_OWNER`):** Lists and edits venue properties, manages pricing and facilities, reviews and approves/rejects incoming booking requests, and updates real-time parking lot occupancy.
3. **VENDOR (`ROLE_VENDOR`):** Publishes catering, decor, photography, and entertainment service listings, accepts or declines service booking orders, and manages pricing catalogs.
4. **EVENT_ORGANIZER (`ROLE_EVENT_ORGANIZER`):** Coordinates multi-vendor events, organizes template-based task checklists and timelines, tracks guest lists, and monitors attendance.
5. **ADMIN (`ROLE_ADMIN`):** Platform auditor and operator; governs venue and vendor approval queues, inspects system telemetry, alters user role assignments, and monitors immutable audit logs.

#### 2.3 Operating Environment
- Operating System: Cross-platform (Windows 10/11, Linux, macOS).
- Java Runtime: OpenJDK 21 or higher.
- Node.js Runtime: Node.js 18.x or 20.x, npm 9+.
- Database: PostgreSQL 16+ or H2 Database Engine 2.2+.
- Modern Web Browsers: Chrome 110+, Firefox 110+, Edge 110+, Safari 16+.

---

### 3. Functional Requirements

#### Module 1: Authentication & Access Control
- **FR-01 (Self-Service Registration):** The system shall allow users to register for accounts with roles `CUSTOMER`, `VENUE_OWNER`, `VENDOR`, or `EVENT_ORGANIZER`. Self-registration for `ADMIN` shall be strictly forbidden.
- **FR-02 (Authentication & Token Issuance):** The system shall authenticate registered users using email and BCrypt-hashed passwords, issuing cryptographically signed JWT tokens with expiry timestamps.
- **FR-03 (Role-Based Authorization):** The system shall enforce role-based access control (RBAC) on all protected REST endpoints and return consistent HTTP 401 Unauthorized or 403 Forbidden JSON payloads.

#### Module 2: Venue Discovery & Comparison
- **FR-04 (Parametric Search & Filtering):** The system shall allow users to search venues by name, city, supported event type, date availability, budget range, guest capacity, and facility tags.
- **FR-05 (Sorting & Pagination):** The system shall support sorting by daily price, rating, and capacity, returning paginated datasets synced with URL query parameters.
- **FR-06 (Multi-Venue Comparison):** The system shall allow users to select and compare up to three venues side-by-side across pricing, capacity, and amenities.

#### Module 3: Booking & Concurrency Control
- **FR-07 (Booking Submission):** The system shall allow authenticated customers to request venue bookings by selecting date, time slot (`MORNING`, `AFTERNOON`, `EVENING`, `FULL_DAY`), event type, and guest count.
- **FR-08 (Capacity & Availability Validation):** The system shall validate on the server side that guest count does not exceed venue capacity and the slot is available.
- **FR-09 (Concurrency & Double-Booking Protection):** The system shall execute booking confirmation within a transaction enforcing pessimistic write locks (`LockModeType.PESSIMISTIC_WRITE`) to prevent overlapping confirmed bookings for identical date and time slots.
- **FR-10 (Owner Decision Workflow):** The system shall enable venue owners to approve or reject pending reservation requests, updating status history records.
- **FR-11 (Cancellation Rules):** The system shall permit customer cancellation according to business policy and trigger status history logging.
- **FR-12 (Receipt Generation):** The system shall generate printable HTML/PDF-ready booking receipts detailing itemized pricing, reference IDs, and tax breakdowns.

#### Module 4: AI Recommendations & Budgeting
- **FR-13 (Explainable Recommendation Engine):** The system shall evaluate venues against user preferences (budget, location, capacity, event type, facilities) using a transparent weighted multi-criteria algorithm, returning score breakdowns and plain-language natural language explanations.
- **FR-14 (Event Budget Estimator):** The system shall provide an editable budget breakdown across Venue, Catering, Decoration, Photography, Entertainment, Contingency, and Miscellaneous categories with budget ceiling comparison and persistence.

#### Module 5: Smart Parking Assistance
- **FR-15 (Telemetry & Capacity Tracking):** The system shall track total capacity, occupied spots, and percentage occupancy (`(occupied / total) * 100`) per parking deck with telemetry provenance badges (`SENSOR`, `MANUAL`, `SIMULATED_DEMO`, `PREDICTED`).
- **FR-16 (Predictive Arrival Modeling):** The system shall calculate future parking congestion using historical day/hour baselines and scheduled venue events, suggesting optimal arrival windows.

#### Module 6: Vendor Marketplace
- **FR-17 (Vendor Service Catalogs):** The system shall enable vendors to publish specialized service items with pricing structures (`PER_EVENT`, `PER_PERSON`, `PER_HOUR`).
- **FR-18 (Vendor Booking Requests):** The system shall allow customers to contract vendor services with status transitions (`PENDING`, `CONFIRMED`, `REJECTED`, `CANCELLED`).

#### Module 7: Event Planner & Timelines
- **FR-19 (Template Checklists):** The system shall generate structured checklists based on event templates (e.g., Wedding, Corporate Conference, Gala, Birthday).
- **FR-20 (Task Execution Management):** The system shall support task lifecycle updates (`TODO`, `IN_PROGRESS`, `COMPLETED`), deadline dates, and day-of execution timelines.

#### Module 8: Guest Management & Public RSVP
- **FR-21 (Event & Guest Registry):** The system shall manage event guest lists, invitations, and plus-one allowances.
- **FR-22 (Secure Tokenized RSVP):** The system shall issue unique UUID tokens allowing guests to RSVP publicly without requiring user authentication or leaking private organizer data.

#### Module 9: Verified Reviews & Ratings
- **FR-23 (Verified Review Eligibility):** The system shall restrict review creation strictly to customers with confirmed/completed bookings (enforcing a maximum of one review per booking).
- **FR-24 (Multi-Factor Scoring):** The system shall record overall rating alongside sub-scores for cleanliness, staff responsiveness, and cost value.

#### Module 10: Mock Payment Gateway
- **FR-25 (Simulated Payment Processing):** The system shall provide a sandbox payment gateway featuring an unmistakable "MOCK PAYMENT, no real money" banner, validating simulated payment methods and generating unique transaction references.
- **FR-26 (Audit & Notification Hooks):** The system shall append an immutable audit log record and dispatch user notifications upon successful payment completion.

#### Module 11: Administration & Governance
- **FR-27 (Platform Telemetry):** The system shall calculate real platform statistics (total users, venues, bookings, revenue) via database queries.
- **FR-28 (Approval Queues):** The system shall maintain pending queues for venue listings and vendor registrations requiring administrator approval.
- **FR-29 (User Role Governance):** The system shall allow administrators to modify user access roles dynamically.

---

### 4. Non-Functional Requirements (NFR)

- **NFR-01 (Performance & Latency):** REST API endpoints shall respond in less than 300ms under standard operational conditions. Complex search queries shall complete in less than 500ms.
- **NFR-02 (Data Integrity & Concurrency):** Double-booking prevention shall guarantee zero booking collisions at the database level under concurrent multi-threaded requests.
- **NFR-03 (Security & Password Storage):** User passwords shall be salted and hashed using BCrypt (strength 10+). Tokens shall use HMAC-SHA256 signing with secret expiration.
- **NFR-04 (Usability & Responsiveness):** The user interface shall provide responsive layouts tested at 360px (mobile), 768px (tablet), and 1280px+ (desktop).
- **NFR-05 (Accessibility - WCAG 2.1 AA):** Forms shall include explicit labels, ARIA landmarks, focus-trapped modal dialogs, and high-contrast color palettes.
- **NFR-06 (Portability & Fallback):** The system shall run either on Dockerized PostgreSQL or in standalone developer mode using H2 In-Memory database with Flyway schema parity.
- **NFR-07 (Reliability & Fault Tolerance):** API error responses shall follow RFC-7807 problem details format with field-level validation messages.
- **NFR-08 (Maintainability & Test Coverage):** Unit and integration test suites shall cover core business logic, achieving >85% path coverage across authorization, booking concurrency, recommendation mathematics, and payment workflows.
