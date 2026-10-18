# Smart Event Venue Booking, Planning, and Management System with Parking Assistance

A full-stack, enterprise-grade web application built for the **Software Configuration Management (SCM)** course project. The system manages the full event lifecycle: parametric venue discovery, booking reservations with database-enforced pessimistic write concurrency locks preventing double-booking, transparent AI venue recommendations, itemized budget planning, smart parking capacity telemetry with predictive arrival modeling, vendor services, template-driven task checklists, guest management with secure tokenized public RSVP, sandbox mock payments, verified customer reviews, and administrative governance.

---

## 1. System Architecture

- **Presentation Layer (Frontend):** React 18, TypeScript, Tailwind CSS, Vite, Lucide React (`http://localhost:5173`)
- **Application Layer (Backend):** Spring Boot 3.3.5, Java 21/24, Spring Security 6 (Stateless JWT), Spring Data JPA, Hibernate, Maven (`http://localhost:8081` or `:8080`)
- **Persistence Layer (Database):** PostgreSQL 16 (production) with automatic fallback to H2 In-Memory Database (`dev-h2` profile), managed via Flyway migrations (V1 through V4). Zero mocked data in production builds.

---

## 2. Prerequisites

Verify installed tools on your local machine:
- **Java:** OpenJDK 21 or 24 (`java -version`)
- **Maven:** Apache Maven 3.8+ (`mvn -v`)
- **Node.js:** Node.js v18.x or v20.x (`node -v`)
- **npm:** npm v9+ or v10+ (`npm -v`)
- **Docker & Docker Compose:** Optional for running PostgreSQL container (`docker -v`, `docker compose version`)

---

## 3. Environment Setup

Copy `.env.example` to create your local `.env` configuration:
```bash
cp .env.example .env
```
The application comes preconfigured out-of-the-box with sensible defaults:
- **Default Profile:** `dev-h2` (runs in-memory, requiring zero external database installations).
- **Production Profile:** `docker compose up -d db` starts PostgreSQL on port `5432`.

---

## 4. Database Setup & Migrations

Database tables and schema versions are managed automatically by **Flyway**:
- `V1__create_initial_schema.sql`: Core tables (`users`, `venues`, `bookings`, `booking_status_history`).
- `V2__seed_demo_data.sql`: Fictional demo dataset (5 role accounts, 12 distinct venues).
- `V3__add_stage2_tables.sql`: Stage 2 tables (`parking_lots`, `parking_history`, `budget_estimates`).
- `V4__add_stage3_tables.sql`: Stage 3 tables (`vendors`, `vendor_services`, `vendor_bookings`, `events`, `event_guests`, `planner_tasks`, `reviews`, `payments`, `notifications`, `audit_logs`).

### Option A: Automatic Fallback Mode (H2 In-Memory - Zero Setup)
The backend defaults to the `dev-h2` profile. Simply start the backend, and Flyway will automatically execute migrations and seed data in-memory. H2 Web Console is available at `http://localhost:8081/h2-console` (JDBC URL: `jdbc:h2:mem:eventdb`, User: `sa`, Password: *empty*).

### Option B: Docker PostgreSQL Mode
```bash
# Start PostgreSQL container
docker compose up -d db

# Verify PostgreSQL is running
docker compose ps
```

---

## 5. Running the Application

### 5.1 Start Backend (Spring Boot)
Open a terminal in the `backend/` directory:
```bash
cd backend
mvn spring-boot:run
```
- API Base URL: `http://localhost:8081/api`
- Interactive Swagger UI: `http://localhost:8081/swagger-ui/index.html`
- OpenAPI Specification: `http://localhost:8081/v3/api-docs`

### 5.2 Start Frontend (React + Vite)
Open a second terminal in the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
- Web Application URL: `http://localhost:5173`

---

## 6. Demo User Accounts

The database includes 5 pre-seeded demo user accounts covering each role:

| Role | Email Address | Password | Permissions & Primary Capabilities |
|:---|:---|:---|:---|
| **CUSTOMER** | `customer@demo.com` | `Password123!` | Search & book venues, AI recommendations, budget estimator, hire vendors, manage events & guest RSVPs, mock checkout, submit reviews. |
| **VENUE OWNER** | `owner@demo.com` | `Password123!` | List venues, approve/reject incoming booking requests, update real-time parking lot occupancy. |
| **VENDOR** | `vendor@demo.com` | `Password123!` | Manage catering/decor services catalog, accept or reject incoming service booking orders. |
| **EVENT ORGANIZER** | `organizer@demo.com` | `Password123!` | Apply template checklists (Wedding, Gala, Conference), update timelines, track guest RSVPs. |
| **ADMIN** | `admin@demo.com` | `AdminPass123!` | View real DB telemetry & stats, govern venue & vendor approval queues, update user roles, inspect audit logs. |

---

## 7. Automated Testing & Quality Gates

### 7.1 Backend Tests (JUnit 5 & Mockito)
```bash
cd backend
mvn test
```
*Executes 42 unit and integration test cases covering auth, RBAC, search filters, availability validation, concurrent pessimistic write locking, AI recommendation scoring, budget math, parking algorithms, reviews, and payments.*

### 7.2 Frontend Static Analysis & Tests
```bash
cd frontend

# Static Code Analysis (0 warnings allowed)
npm run lint

# Component Unit Tests (Vitest + React Testing Library)
npm test

# Production Build Verification
npm run build
```
*Executes 28 test cases across 12 test suites verifying auth validation, role navigation guards, search filters, booking calculations, and UI components.*

### 7.3 End-to-End System Smoke Suite
With the backend server running, execute the automated 20-step smoke suite:
```powershell
# PowerShell (Windows)
.\tests\smoke.ps1

# Or Bash (Linux / macOS / Git Bash)
./tests/smoke.sh
```
*The smoke suite tests: customer registration, login, venue search, booking creation, owner approval, concurrent double-booking rejection with HTTP 409, AI recommendations, budget persistence, parking telemetry, parking future prediction, vendor catalog search, vendor booking request, vendor order confirmation, planner template generation, event creation, guest invitation, tokenized public RSVP, sandbox mock payment, verified review submission, and administrator telemetry verification.*

---

## 8. SCM Documentation Directory (`/docs`)

All formal Software Configuration Management deliverables are maintained in `/docs`:
- [`SRS.md`](docs/SRS.md): System Requirements Specification (FR-01 to FR-29, NFR-01 to NFR-08).
- [`SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md): Architectural design, concurrency model, component interfaces.
- [`ARCHITECTURE.md`](docs/ARCHITECTURE.md): System diagrams in Mermaid (Architecture, Use Case, Class, Sequences, ER).
- [`TEST_PLAN.md`](docs/TEST_PLAN.md): Master test strategy, test matrix, and quality criteria.
- [`TEST_REPORT.md`](docs/TEST_REPORT.md): Real test execution results (42 backend, 28 frontend, 20 smoke steps).
- [`USER_MANUAL.md`](docs/USER_MANUAL.md): Comprehensive operator manual with step-by-step role guides.
- [`SCM_PLAN.md`](docs/SCM_PLAN.md): Configuration management plan, branching policy, versioning.
- [`CONFIGURATION_ITEM_REGISTER.md`](docs/CONFIGURATION_ITEM_REGISTER.md): CI directory (CI-01 to CI-20).
- [`CONFIGURATION_STATUS_REPORT.md`](docs/CONFIGURATION_STATUS_REPORT.md): Baseline status accounting and metrics.
- [`CHANGE_REQUEST_REGISTER.md`](docs/CHANGE_REQUEST_REGISTER.md): Change requests log (CR-01 to CR-05).
- [`DEFECT_REGISTER.md`](docs/DEFECT_REGISTER.md): Real root-cause defect tracking log (DEF-01 to DEF-06).
- [`REQUIREMENT_TRACEABILITY.md`](docs/REQUIREMENT_TRACEABILITY.md): Requirements Traceability Matrix (RTM).
- [`FCA_CHECKLIST.md`](docs/FCA_CHECKLIST.md): Functional Configuration Audit Checklist.
- [`PCA_CHECKLIST.md`](docs/PCA_CHECKLIST.md): Physical Configuration Audit Checklist.
- [`RELEASE_NOTES.md`](docs/RELEASE_NOTES.md): Version 1.0.0 release notes with semantic versioning.

---

## 9. Troubleshooting Guide

1. **Port 8080/8081 Conflict:**
   - If port `8080` is occupied by another process, the application automatically runs on port `8081` via `application-dev-h2.yml`. The frontend API client automatically defaults to `http://localhost:8081/api` (or override via `VITE_API_BASE_URL` in `frontend/.env`).
2. **Flyway Migration Checksum Mismatch:**
   - If switching between local database engines, clean the H2 in-memory database by restarting the Spring Boot backend. For PostgreSQL, run `docker compose down -v` to reset the database volume.
3. **CORS Errors:**
   - Verify that your frontend is running on `http://localhost:5173` which is explicitly whitelisted in `SecurityConfig.java`.
