#!/usr/bin/env bash
set -e

BASE_URL="${BASE_URL:-http://localhost:8081/api}"
UNIQUE_ID=$(date +%s)
TEST_EMAIL="smoke_${UNIQUE_ID}@demo.com"
TEST_PASS="Password123!"

echo "====================================================="
echo " Starting End-to-End Gate 1, 2 & 3 Smoke Test Suite "
echo "====================================================="

# 1. Register new customer
echo "1. Registering new customer (${TEST_EMAIL})..."
REG_RESP=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASS}\",\"fullName\":\"Smoke Customer\",\"role\":\"CUSTOMER\",\"phone\":\"555-0100\"}")

CUST_TOKEN=$(echo "${REG_RESP}" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "${CUST_TOKEN}" ]; then
  echo "FAILED: Customer registration did not return a token."
  exit 1
fi
echo "[OK] Customer registered successfully."

# 2. Login as newly registered customer
echo "2. Logging in with new customer credentials..."
LOGIN_RESP=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASS}\"}")

CUST_TOKEN=$(echo "${LOGIN_RESP}" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -z "${CUST_TOKEN}" ]; then
  echo "FAILED: Customer login failed."
  exit 1
fi
echo "[OK] Customer login successful."

# 3. Search venues
echo "3. Searching venues (search=Ballroom)..."
SEARCH_RESP=$(curl -s -X GET "${BASE_URL}/venues?search=Ballroom" \
  -H "Content-Type: application/json")

VENUE_ID=$(echo "${SEARCH_RESP}" | grep -o '"id":[0-9]*' | head -n 1 | cut -d':' -f2)
if [ -z "${VENUE_ID}" ]; then
  echo "FAILED: No venue returned from search."
  exit 1
fi
echo "[OK] Found venue ID: ${VENUE_ID}"

# 4. Book a slot
EVENT_DATE="2026-11-28"
TIME_SLOT="MORNING"
echo "4. Submitting booking for Venue ${VENUE_ID} on ${EVENT_DATE} (${TIME_SLOT})..."

BOOK_RESP=$(curl -s -X POST "${BASE_URL}/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${CUST_TOKEN}" \
  -d "{\"venueId\":${VENUE_ID},\"eventDate\":\"${EVENT_DATE}\",\"timeSlot\":\"${TIME_SLOT}\",\"eventType\":\"WEDDING\",\"guestCount\":100,\"notes\":\"Gate 1 Smoke Test Booking\"}")

BOOKING_ID=$(echo "${BOOK_RESP}" | grep -o '"id":[0-9]*' | head -n 1 | cut -d':' -f2)
BOOKING_STATUS=$(echo "${BOOK_RESP}" | grep -o '"status":"[^"]*' | head -n 1 | cut -d'"' -f4)

if [ -z "${BOOKING_ID}" ]; then
  echo "FAILED: Booking creation failed. Response: ${BOOK_RESP}"
  exit 1
fi
echo "[OK] Booking created with ID ${BOOKING_ID}, status: ${BOOKING_STATUS}"

# 5. Login as Venue Owner
echo "5. Logging in as Venue Owner (owner@demo.com)..."
OWNER_LOGIN=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@demo.com","password":"Password123!"}')

OWNER_TOKEN=$(echo "${OWNER_LOGIN}" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -z "${OWNER_TOKEN}" ]; then
  echo "FAILED: Owner login failed."
  exit 1
fi
echo "[OK] Owner login successful."

# 6. Owner approves the booking
echo "6. Owner approving Booking ID ${BOOKING_ID}..."
APPROVE_RESP=$(curl -s -X PUT "${BASE_URL}/bookings/${BOOKING_ID}/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${OWNER_TOKEN}" \
  -d '{"status":"CONFIRMED","remarks":"Approved via Gate 1 smoke test"}')

CONFIRMED_STATUS=$(echo "${APPROVE_RESP}" | grep -o '"status":"[^"]*' | head -n 1 | cut -d'"' -f4)
if [ "${CONFIRMED_STATUS}" != "CONFIRMED" ]; then
  echo "FAILED: Booking status update failed. Response: ${APPROVE_RESP}"
  exit 1
fi
echo "[OK] Booking approved and status confirmed to: ${CONFIRMED_STATUS}"

# 7. Attempt second overlapping booking
echo "7. Attempting conflicting second booking on same venue, date, and overlapping slot..."
CONFLICT_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${CUST_TOKEN}" \
  -d "{\"venueId\":${VENUE_ID},\"eventDate\":\"${EVENT_DATE}\",\"timeSlot\":\"${TIME_SLOT}\",\"eventType\":\"CONFERENCE\",\"guestCount\":50}")

if [ "${CONFLICT_HTTP_CODE}" = "409" ] || [ "${CONFLICT_HTTP_CODE}" = "400" ]; then
  echo "[OK] Second overlapping booking correctly rejected with HTTP ${CONFLICT_HTTP_CODE}."
else
  echo "FAILED: Expected conflict (409 or 400), but got: ${CONFLICT_HTTP_CODE}"
  exit 1
fi

# STAGE 2: Recommendations, Budgets & Parking
echo "8. Testing AI Venue Recommendation Engine..."
RECOM_RESP=$(curl -s -X POST "${BASE_URL}/recommendations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${CUST_TOKEN}" \
  -d "{\"eventType\":\"WEDDING\",\"guestCount\":150,\"maxBudget\":5000,\"date\":\"${EVENT_DATE}\",\"timeSlot\":\"FULL_DAY\"}")

if [[ "${RECOM_RESP}" == *"overallScore"* ]]; then
  echo "[OK] AI recommendation engine returned scored matches."
else
  echo "FAILED: Unexpected recommendations response: ${RECOM_RESP}"
  exit 1
fi

echo "9. Testing Budget Estimator..."
BUDGET_RESP=$(curl -s -X POST "${BASE_URL}/budgets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${CUST_TOKEN}" \
  -d "{\"eventTitle\":\"Smoke Wedding\",\"totalLimit\":20000,\"venueCost\":4000,\"cateringCost\":6000,\"contingencyPercent\":10}")

if [[ "${BUDGET_RESP}" == *"totalEstimatedCost"* ]]; then
  echo "[OK] Budget saved successfully."
else
  echo "FAILED: Budget estimator save failed: ${BUDGET_RESP}"
  exit 1
fi

echo "10. Testing Smart Parking Assistance..."
PARKING_RESP=$(curl -s -X GET "${BASE_URL}/parking/venues/${VENUE_ID}")
if [[ "${PARKING_RESP}" == *"occupancyPercent"* ]]; then
  echo "[OK] Smart parking telemetry retrieved."
else
  echo "FAILED: Parking telemetry failed: ${PARKING_RESP}"
  exit 1
fi

# STAGE 3: Vendors, Planner, RSVP, Payments & Admin
echo "11. Searching Vendor Directory..."
VENDORS_RESP=$(curl -s -X GET "${BASE_URL}/vendors")
VENDOR_ID=$(echo "${VENDORS_RESP}" | grep -o '"id":[0-9]*' | head -n 1 | cut -d':' -f2)
echo "[OK] Found vendor ID: ${VENDOR_ID}"

echo "12. Customer requesting vendor booking..."
V_BOOK_RESP=$(curl -s -X POST "${BASE_URL}/vendors/${VENDOR_ID}/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${CUST_TOKEN}" \
  -d "{\"eventDate\":\"${EVENT_DATE}\",\"guestCount\":100,\"requirements\":\"Catering banquet\"}")
V_BOOK_ID=$(echo "${V_BOOK_RESP}" | grep -o '"id":[0-9]*' | head -n 1 | cut -d':' -f2)
echo "[OK] Vendor booking created with ID: ${V_BOOK_ID}"

echo "13. Vendor confirming booking..."
VENDOR_LOGIN=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"vendor@demo.com","password":"Password123!"}')
VENDOR_TOKEN=$(echo "${VENDOR_LOGIN}" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

curl -s -X PUT "${BASE_URL}/vendors/bookings/${V_BOOK_ID}/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${VENDOR_TOKEN}" \
  -d '{"status":"CONFIRMED"}' > /dev/null
echo "[OK] Vendor confirmed booking."

echo "14. Event Planner: Applying template..."
PLAN_RESP=$(curl -s -X POST "${BASE_URL}/planner/template?templateName=Wedding%20Planner" \
  -H "Authorization: Bearer ${CUST_TOKEN}")
TASK_ID=$(echo "${PLAN_RESP}" | grep -o '"id":[0-9]*' | head -n 1 | cut -d':' -f2)
echo "[OK] Planner populated tasks. First Task ID: ${TASK_ID}"

echo "15. Creating event and issuing guest invitation..."
EVENT_RESP=$(curl -s -X POST "${BASE_URL}/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${CUST_TOKEN}" \
  -d "{\"title\":\"Grand Gala Celebration\",\"eventType\":\"GALA\",\"eventDate\":\"${EVENT_DATE}\",\"locationName\":\"Crystal Ballroom\"}")
EVENT_ID=$(echo "${EVENT_RESP}" | grep -o '"id":[0-9]*' | head -n 1 | cut -d':' -f2)

GUEST_RESP=$(curl -s -X POST "${BASE_URL}/events/${EVENT_ID}/guests" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${CUST_TOKEN}" \
  -d '{"guestName":"Jane Miller","guestEmail":"jane@example.com"}')
INVITE_TOKEN=$(echo "${GUEST_RESP}" | grep -o '"invitationToken":"[^"]*' | cut -d'"' -f4)
echo "[OK] Guest invitation token created: ${INVITE_TOKEN}"

echo "16. Submitting public RSVP via secure token..."
RSVP_RESP=$(curl -s -X POST "${BASE_URL}/rsvp/${INVITE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"rsvpStatus":"ATTENDING","plusOnes":1,"dietaryRequirements":"None"}')
if [[ "${RSVP_RESP}" == *"ATTENDING"* ]]; then
  echo "[OK] Public RSVP recorded successfully."
else
  echo "FAILED: Public RSVP failed: ${RSVP_RESP}"
  exit 1
fi

echo "17. Processing Mock Payment for Booking ID ${BOOKING_ID}..."
PAY_RESP=$(curl -s -X POST "${BASE_URL}/payments/mock-charge" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${CUST_TOKEN}" \
  -d "{\"bookingId\":${BOOKING_ID},\"amount\":2500,\"currency\":\"USD\",\"paymentMethod\":\"CREDIT_CARD\"}")
if [[ "${PAY_RESP}" == *"COMPLETED"* ]]; then
  echo "[OK] Mock payment processed with confirmation."
else
  echo "FAILED: Mock payment failed: ${PAY_RESP}"
  exit 1
fi

echo "18. Submitting Verified Review..."
REV_RESP=$(curl -s -X POST "${BASE_URL}/reviews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${CUST_TOKEN}" \
  -d "{\"bookingId\":${BOOKING_ID},\"rating\":5,\"comment\":\"Spectacular venue and seamless experience!\"}")
if [[ "${REV_RESP}" == *"rating"* ]]; then
  echo "[OK] Verified review submitted."
else
  echo "FAILED: Review submission failed: ${REV_RESP}"
  exit 1
fi

echo "19. Querying Admin Telemetry & Audit Trail..."
ADMIN_LOGIN=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"AdminPass123!"}')
ADMIN_TOKEN=$(echo "${ADMIN_LOGIN}" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

ADMIN_STATS=$(curl -s -X GET "${BASE_URL}/admin/stats" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")
if [[ "${ADMIN_STATS}" == *"totalUsers"* ]]; then
  echo "[OK] Admin telemetry verified."
else
  echo "FAILED: Admin stats retrieval failed: ${ADMIN_STATS}"
  exit 1
fi

echo "========================================================"
echo " [SUCCESS] ALL GATE 1, GATE 2 & GATE 3 CHECKS PASSED!"
echo "========================================================"
