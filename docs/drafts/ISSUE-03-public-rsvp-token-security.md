# [DRAFT ISSUE #3] Enable secure unauthenticated guest RSVP without exposing organizer private credentials

*Note: This is a local SCM draft artifact representing Issue #3. It is stored as documentation within the repository and does not claim to exist on GitHub.*

---

## Issue Overview
- **Type:** Security / Feature Request
- **Priority:** High
- **Labels:** `security`, `rsvp`, `guest-management`
- **Traceability:** FR-21, FR-22, CI-09

---

## Description
Requiring invited guests to register accounts in order to respond to invitations introduces high friction and low response rates. However, exposing public endpoints without authentication risks leaking private organizer contact details or allowing guests to tamper with other invitation records.

## Proposed Architectural Solution
1. When guests are added to an event, generate a cryptographically random UUID invitation token (`invitationToken`).
2. Expose public endpoints `/api/rsvp/{token}` (both GET and POST) permitted in `SecurityConfig.java`.
3. The GET endpoint returns a restricted `PublicInvitationResponse` containing only the event title, event date, venue location, guest name, and current RSVP status (no passwords, organizer emails, or other guest entries).
4. The POST endpoint allows updating attendance status (`ATTENDING`, `DECLINED`), plus-ones count, and dietary preferences restricted strictly to that token.
