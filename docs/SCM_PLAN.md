# Software Configuration Management (SCM) Plan
## Smart Event Venue Booking, Planning, and Management System with Parking Assistance

**Document Identifier:** SCM-DOC-PLAN-07  
**Version:** 1.0.0  
**Status:** Approved / Baselined  
**Project:** Smart Event Venue Management System (SCM Course Project)  
**Date:** October 2026  

---

### 1. Introduction & Objectives

#### 1.1 Purpose
This Software Configuration Management (SCM) Plan defines the lifecycle practices, baseline policies, change management workflows, repository branching strategies, and audit procedures governing the Smart Event Venue Management System.

#### 1.2 Scope
This plan encompasses all artifacts across the software lifecycle:
- Source code (Backend Spring Boot, Frontend React/TypeScript).
- Database migration scripts (Flyway V1 through V4).
- Container configuration files (`docker-compose.yml`, Dockerfiles).
- Automated test suites and smoke test scripts.
- CI/CD workflow automation definitions (`.github/workflows/ci.yml`).
- SCM governance documentation, audit registers, and release baselines.

---

### 2. SCM Organization & Responsibilities

| Role | Responsibilities | Assigned Agent / Entity |
|:---|:---|:---|
| **SCM Manager** | Oversees baseline integrity, approves formal releases, enforces change control policies. | Lead Developer / SCM Lead |
| **Configuration Control Board (CCB)** | Evaluates change requests (CRs), assesses risk, authorizes baseline merges. | Course Review Committee / SCM Team |
| **Developer / Author** | Implements features on isolated feature branches, writes unit tests, drafts commit logs. | Development Team |
| **Quality & Audit Specialist** | Conducts Functional and Physical Configuration Audits (FCA/PCA), verifies CI traceability. | QA / Audit Specialist |

---

### 3. Configuration Identification & Baselines

#### 3.1 Configuration Items (CIs) Taxonomy
Every deliverable is assigned a unique Configuration Item identifier:
- `CI-01`: Backend Core Application (`backend/src/main`)
- `CI-02`: Frontend Web Client (`frontend/src`)
- `CI-03`: Database Migrations & Schemas (`database/migrations`, `backend/src/main/resources/db/migration`)
- `CI-04`: Test Automation Suite (`tests/`, `backend/src/test`, `frontend/src/test`)
- `CI-05`: Containerization Assets (`docker-compose.yml`, `.env.example`)
- `CI-06`: CI/CD Workflows (`.github/workflows/ci.yml`)
- `CI-07`: SCM Governance Documentation (`docs/`)

#### 3.2 Formal Project Baselines
1. **Functional Baseline (FBL):** Established at completion of Stage 1 (Core Slice - Auth, Venues, Pessimistic Concurrency Booking).
2. **Allocated Baseline (ABL):** Established at completion of Stage 2 (AI Recommender, Budget Estimator, Smart Parking Assistance).
3. **Product Baseline (PBL):** Established at completion of Stage 3 (Marketplace, Event Planner, RSVP, Reviews, Payments, Governance).
4. **Operational Baseline (OBL / Release v1.0.0):** Established at completion of Stage 4 (Full documentation, CI pipeline, FCA/PCA audits).

---

### 4. Git Branching Strategy & Workflow

The repository adopts a strict Gitflow-adapted branching strategy designed for rigorous traceability and peer review:

```
(main) -----------------------------------------------------[v1.0.0 Tag]
          \                                                /
(develop)  \------[Stage 1]--------[Stage 2]--------[Stage 3]------[Stage 4]
              \        /   \        /   \        /   \        /
(features)     \------/     \------/     \------/     \------/
             feature/s1    feature/s2   feature/s3   feature/s4
```

#### 4.1 Branch Topology
- **`main`:** Production-grade, released code. Every commit on `main` represents a verified release baseline and is tagged with a semantic version (e.g., `v1.0.0`). Direct commits to `main` are strictly prohibited.
- **`develop`:** Primary integration branch. Aggregates completed, tested, and approved feature branches.
- **Feature Branches:**
  - `feature/stage-1-core`: Core vertical slice (Auth, Venues, Concurrency-locked Bookings).
  - `feature/stage-2-ai-budget-parking`: AI recommendations, budget planner, smart parking telemetry.
  - `feature/stage-3-modules`: Vendor marketplace, planner checklist, tokenized RSVP, payments, admin console.
  - `feature/stage-4-scm-ci`: SCM documentation, GitHub Actions CI workflows, issue/PR templates, and audits.

#### 4.2 Commit Message Standard (Conventional Commits)
All commit messages must adhere to the Conventional Commits specification:
```
<type>(<scope>): <short description in present tense>

[optional body explaining rationale and technical design]

[optional footer with reference to Issue / CR / Defect ID]
```
Allowed types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`.

---

### 5. Change Control Process

```
[Change Proposed] ---> [Create Change Request (CR)] ---> [CCB Review & Impact Analysis]
                                                                   |
          +--------------------------------------------------------+
          |                                                        |
     [Rejected]                                                [Approved]
          |                                                        |
    [Log in CRR]                                    [Create Feature Branch]
                                                                   |
                                                    [Implement & Run Tests]
                                                                   |
                                                    [Pull Request & CI Build]
                                                                   |
                                                    [Merge to develop / main]
```

1. **Request Submission:** Any proposed enhancement or non-trivial alteration is logged in the `CHANGE_REQUEST_REGISTER.md`.
2. **Evaluation:** The CCB evaluates feasibility, technical risk, architectural impact, and test requirements.
3. **Implementation:** Upon approval, developers implement changes within a designated branch.
4. **Verification:** Changes must pass all unit tests, integration tests, static code analysis, and smoke suites before merging.

---

### 6. Configuration Audits (FCA & PCA)

- **Functional Configuration Audit (FCA):** Validates that every functional requirement defined in the SRS has been implemented and successfully verified through passing test cases. Recorded in `docs/FCA_CHECKLIST.md`.
- **Physical Configuration Audit (PCA):** Validates that all physical artifacts, configuration files, build scripts, schemas, and documentation are correctly structured, version-controlled, and compliant with project standards. Recorded in `docs/PCA_CHECKLIST.md`.

---

### 7. Release Management & Versioning

The project adheres to **Semantic Versioning 2.0.0** (`MAJOR.MINOR.PATCH`):
- `v1.0.0`: Initial production-ready release meeting all SCM requirements with complete vertical slices, zero mocked database data, and passed audit checklists.
- Releases are tagged locally using Git (`git tag -a v1.0.0 -m "Release v1.0.0"`). Local tags are never pushed to remote remotes per course safety constraints.
