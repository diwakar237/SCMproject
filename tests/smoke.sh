#!/usr/bin/env bash
set -e

BASE_URL="${BASE_URL:-http://localhost:8081/api}"
UNIQUE_ID=$(date +%s)
TEST_EMAIL="smoke_${UNIQUE_ID}@demo.com"
TEST_PASS="Password123!"

echo "=========================================="
echo " Starting End-to-End Gate 1 Smoke Test"
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
echo "✓ Customer registered successfully."

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
echo "✓ Customer login successful."

# 3. Search venues
echo "3. Searching venues (search=Ballroom)..."
SEARCH_RESP=$(curl -s -X GET "${BASE_URL}/venues?search=Ballroom" \
  -H "Content-Type: application/json")

VENUE_ID=$(echo "${SEARCH_RESP}" | grep -o '"id":[0-9]*' | head -n 1 | cut -d':' -f2)
if [ -z "${VENUE_ID}" ]; then
  echo "FAILED: No venue returned from search."
  exit 1
fi
echo "✓ Found venue ID: ${VENUE_ID}"

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
echo "✓ Booking created with ID ${BOOKING_ID}, status: ${BOOKING_STATUS}"

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
echo "✓ Owner login successful."

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
echo "✓ Booking approved and status confirmed to: ${CONFIRMED_STATUS}"

# 7. Attempt second overlapping booking
echo "7. Attempting conflicting second booking on same venue, date, and overlapping slot (FULL_DAY)..."
CONFLICT_RESP=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${CUST_TOKEN}" \
  -d "{\"venueId\":${VENUE_ID},\"eventDate\":\"${EVENT_DATE}\",\"timeSlot\":\"FULL_DAY\",\"eventType\":\"CORPORATE\",\"guestCount\":80,\"notes\":\"Conflict Test Booking\"}")

HTTP_CODE=$(echo "${CONFLICT_RESP}" | grep -o 'HTTP_STATUS:[0-9]*' | cut -d':' -f2)
BODY=$(echo "${CONFLICT_RESP}" | sed 's/HTTP_STATUS:[0-9]*//g')

if [ "${HTTP_CODE}" == "400" ] || [ "${HTTP_CODE}" == "409" ]; then
  echo "✓ CONFLICT PREVENTED: Server correctly rejected overlapping booking with HTTP ${HTTP_CODE}."
  echo "Error response payload: ${BODY}"
else
  echo "FAILED: Expected HTTP 400/409 conflict, got ${HTTP_CODE}. Response: ${BODY}"
  exit 1
fi

echo "=========================================="
echo " 🎉 ALL GATE 1 SMOKE TESTS PASSED! 🎉"
echo "=========================================="
