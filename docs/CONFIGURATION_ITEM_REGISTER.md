# Configuration Item (CI) Register
## Smart Event Venue Booking, Planning, and Management System with Parking Assistance

**Document Identifier:** SCM-DOC-CIR-08  
**Version:** 1.0.0  
**Status:** Approved / Baselined  
**Project:** Smart Event Venue Management System (SCM Course Project)  
**Baseline:** Operational Baseline (OBL - v1.0.0)  
**Date:** October 2026  

---

### Configuration Item Directory

| CI ID | Configuration Item Name | Repository Path | Version | Owner | Status | Approval | Baseline | Release | Description |
|:---|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **CI-01** | Backend Application Core | `backend/src/main/` | 1.0.0 | Backend Team | Baselined | Approved | FBL / PBL | v1.0.0 | Spring Boot REST API controllers, domain entities, repositories, and services. |
| **CI-02** | Security & Auth Subsystem | `backend/src/main/java/com/smartvenue/backend/config/` | 1.0.0 | Security Lead | Baselined | Approved | FBL | v1.0.0 | Spring Security filter chain, JWT token provider, BCrypt password hashing, and RBAC guards. |
| **CI-03** | Booking Concurrency Engine | `backend/src/main/java/com/smartvenue/backend/service/BookingService.java` | 1.0.0 | Core Dev | Baselined | Approved | FBL | v1.0.0 | Pessimistic locking mechanism preventing overlapping confirmed bookings. |
| **CI-04** | AI Recommendation Subsystem | `backend/src/main/java/com/smartvenue/backend/service/Recommendation*` | 1.0.0 | AI Lead | Baselined | Approved | ABL | v1.0.0 | Multi-criteria weighted scoring algorithm and natural language explanation generator. |
| **CI-05** | Budget Estimation Service | `backend/src/main/java/com/smartvenue/backend/service/Budget*` | 1.0.0 | Backend Dev | Baselined | Approved | ABL | v1.0.0 | Itemized cost estimation breakdown math and budget limit comparison. |
| **CI-06** | Smart Parking Telemetry Service | `backend/src/main/java/com/smartvenue/backend/service/Parking*` | 1.0.0 | IoT/Data Lead | Baselined | Approved | ABL | v1.0.0 | Real-time capacity formulas, telemetry source provenance, and future arrival prediction. |
| **CI-07** | Vendor Marketplace Subsystem | `backend/src/main/java/com/smartvenue/backend/service/Vendor*` | 1.0.0 | Backend Dev | Baselined | Approved | PBL | v1.0.0 | Vendor profiles, service catalog management, and order fulfillment workflows. |
| **CI-08** | Event Planner & Timeline | `backend/src/main/java/com/smartvenue/backend/service/Planner*` | 1.0.0 | Backend Dev | Baselined | Approved | PBL | v1.0.0 | Template-driven task checklists, milestone tracking, and day-of execution schedules. |
| **CI-09** | Event Guest & Public RSVP | `backend/src/main/java/com/smartvenue/backend/service/Event*` | 1.0.0 | Backend Dev | Baselined | Approved | PBL | v1.0.0 | Event management, secure token issuance, and public unauthenticated RSVP submission. |
| **CI-10** | Mock Payment Gateway | `backend/src/main/java/com/smartvenue/backend/service/Payment*` | 1.0.0 | Core Dev | Baselined | Approved | PBL | v1.0.0 | Simulated payment checkout, transaction reference generation, and audit trail dispatch. |
| **CI-11** | Customer Review Subsystem | `backend/src/main/java/com/smartvenue/backend/service/Review*` | 1.0.0 | Core Dev | Baselined | Approved | PBL | v1.0.0 | Verified booking review eligibility rules and multi-criteria rating persistence. |
| **CI-12** | Administration & Audit Engine | `backend/src/main/java/com/smartvenue/backend/service/Admin*` | 1.0.0 | SCM Lead | Baselined | Approved | PBL | v1.0.0 | Aggregated telemetry DB queries, moderation queues, and immutable security audit logs. |
| **CI-13** | Database Flyway Migrations | `database/migrations/`, `backend/src/main/resources/db/migration/` | 1.0.0 | DBA / SCM | Baselined | Approved | FBL / PBL | v1.0.0 | Flyway SQL migrations V1 through V4 for schema creation and demo seed datasets. |
| **CI-14** | Frontend Web Application | `frontend/src/` | 1.0.0 | Frontend Team | Baselined | Approved | FBL / PBL | v1.0.0 | React 18 TypeScript SPA pages, navigation, components, and responsive Tailwind styling. |
| **CI-15** | Automated Testing Suites | `backend/src/test/`, `frontend/src/test/` | 1.0.0 | QA Lead | Baselined | Approved | FBL / PBL | v1.0.0 | 42 backend JUnit/Mockito test cases and 28 frontend Vitest/RTL component test cases. |
| **CI-16** | End-to-End Smoke Test Suite | `tests/smoke.ps1`, `tests/smoke.sh` | 1.0.0 | QA Lead | Baselined | Approved | OBL | v1.0.0 | Automated 20-step smoke test scripts validating full system operation against live server. |
| **CI-17** | CI/CD Pipeline Automation | `.github/workflows/ci.yml` | 1.0.0 | DevOps Lead | Baselined | Approved | OBL | v1.0.0 | GitHub Actions workflow for backend compile/test and frontend build/lint/test. |
| **CI-18** | Configuration Management Docs | `docs/` | 1.0.0 | SCM Manager | Baselined | Approved | OBL | v1.0.0 | Comprehensive SCM documentation set (SRS, Architecture, Test Reports, Registers, Audits). |
| **CI-19** | Environment & Docker Config | `docker-compose.yml`, `.env.example` | 1.0.0 | DevOps Lead | Baselined | Approved | FBL / OBL | v1.0.0 | Multi-service orchestration configuration for PostgreSQL and web containers. |
| **CI-20** | Master System Readme | `README.md` | 1.0.0 | SCM Manager | Baselined | Approved | OBL | v1.0.0 | User and operator installation guide, demo credentials directory, and troubleshooting. |
