#!/usr/bin/env bash
set -e

BASE_URL="${BASE_URL:-http://localhost:8081/api}"
UNIQUE_ID=$(date +%s)
TEST_EMAIL="smoke_${UNIQUE_ID}@demo.com"
TEST_PASS="Password123!"

echo "=========================================="
echo " Starting End-to-End Gate 1 & 2 Smoke Test"
echo "=========================================="

# 1. Register new customer
echo "1. Registering new customer (${TEST_EMAIL})..."
REG_RESP=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASS}\",\"fullName\":\"Smoke Customer\",\"role\":\"CUSTOMER\",\"phone\":\"555-0100\"}")

echo "Response: ${REG_RESP}"
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
EVENT_DATE="2026-11-25"
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
echo "7. Attempting conflicting second booking on same venue, date, and overlapping slot (FULL_DAY)..."
CONFLICT_RESP=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${CUST_TOKEN}" \
  -d "{\"venueId\":${VENUE_ID},\"eventDate\":\"${EVENT_DATE}\",\"timeSlot\":\"FULL_DAY\",\"eventType\":\"CORPORATE\",\"guestCount\":80,\"notes\":\"Conflict Test Booking\"}")

HTTP_CODE=$(echo "${CONFLICT_RESP}" | grep -o 'HTTP_STATUS:[0-9]*' | cut -d':' -f2)
BODY=$(echo "${CONFLICT_RESP}" | sed 's/HTTP_STATUS:[0-9]*//g')

if [ "${HTTP_CODE}" == "400" ] || [ "${HTTP_CODE}" == "409" ]; then
  echo "[OK] CONFLICT PREVENTED: Server correctly rejected overlapping booking with HTTP ${HTTP_CODE}."
else
  echo "FAILED: Expected HTTP 400/409 conflict, got ${HTTP_CODE}. Response: ${BODY}"
  exit 1
fi

# =========================================================
# STAGE 2 VERIFICATION: RECOMMENDATIONS, BUDGET, & PARKING
# =========================================================
echo "------------------------------------------"
echo "8. Testing AI Recommendation Service..."
REC_RESP=$(curl -s -X POST "${BASE_URL}/recommendations" \
  -H "Content-Type: application/json" \
  -d '{"eventType":"WEDDING","guestCount":120,"maxBudget":5000,"preferredFacilities":["WIFI","PARKING"]}')

TOP_NAME=$(echo "${REC_RESP}" | grep -o '"name":"[^"]*' | head -n 1 | cut -d'"' -f4)
if [ -z "${TOP_NAME}" ]; then
  echo "FAILED: Recommendation service returned no valid venues."
  exit 1
fi
echo "[OK] Recommendation received. Top candidate: ${TOP_NAME}"

echo "9. Testing Budget Estimator..."
BUDGET_RESP=$(curl -s -X POST "${BASE_URL}/budgets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${CUST_TOKEN}" \
  -d '{"eventTitle":"Smoke Gala","totalLimit":15000.0,"venueCost":4500.0,"cateringCost":3500.0,"contingencyPercent":10.0}')

BUDGET_ID=$(echo "${BUDGET_RESP}" | grep -o '"id":[0-9]*' | head -n 1 | cut -d':' -f2)
if [ -z "${BUDGET_ID}" ]; then
  echo "FAILED: Budget creation failed. Response: ${BUDGET_RESP}"
  exit 1
fi
echo "[OK] Budget created with ID ${BUDGET_ID}"

echo "10. Testing Smart Parking Assistance..."
PARKING_RESP=$(curl -s -X GET "${BASE_URL}/parking/venues/${VENUE_ID}")
LOT_ID=$(echo "${PARKING_RESP}" | grep -o '"id":[0-9]*' | head -n 1 | cut -d':' -f2)
if [ -z "${LOT_ID}" ]; then
  echo "FAILED: No parking lot found for venue ${VENUE_ID}"
  exit 1
fi
echo "[OK] Found parking lot ID: ${LOT_ID}"

echo "11. Testing Owner Manual Parking Update..."
UPDATE_RESP=$(curl -s -X PUT "${BASE_URL}/parking/lots/${LOT_ID}/manual" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${OWNER_TOKEN}" \
  -d '{"occupiedSpots":55}')

UPDATED_SOURCE=$(echo "${UPDATE_RESP}" | grep -o '"dataSource":"[^"]*' | head -n 1 | cut -d'"' -f4)
if [ "${UPDATED_SOURCE}" != "MANUAL" ]; then
  echo "FAILED: Expected dataSource MANUAL, got: ${UPDATED_SOURCE}"
  exit 1
fi
echo "[OK] Parking lot occupancy successfully updated. DataSource: ${UPDATED_SOURCE}"

echo "12. Testing Future Event Parking Prediction..."
PRED_RESP=$(curl -s -X GET "${BASE_URL}/parking/lots/${LOT_ID}/prediction?date=2026-11-25&timeSlot=EVENING")
PRED_OCC=$(echo "${PRED_RESP}" | grep -o '"predictedOccupancyPercent":[0-9]*' | head -n 1 | cut -d':' -f2)
if [ -z "${PRED_OCC}" ]; then
  echo "FAILED: Prediction did not return predicted occupancy."
  exit 1
fi
echo "[OK] Future parking prediction successfully calculated: ${PRED_OCC}%"

echo "=========================================="
echo " [SUCCESS] ALL GATE 1 & GATE 2 TESTS PASSED!"
echo "=========================================="
