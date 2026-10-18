$ErrorActionPreference = "Stop"

$baseUrl = if ($env:BASE_URL) { $env:BASE_URL } else { "http://localhost:8081/api" }
$uniqueId = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$testEmail = "smoke_$uniqueId@demo.com"
$testPass = "Password123!"

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host " Starting End-to-End Gate 1, 2 & 3 Smoke Test Suite " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# ---------------------------------------------------------
# STAGE 1: Core Vertical Slice
# ---------------------------------------------------------
Write-Host "--- STAGE 1: CORE VERTICAL SLICE ---" -ForegroundColor Yellow

# 1. Register new customer
Write-Host "1. Registering new customer ($testEmail)..."
$regBody = @{
    email = $testEmail
    password = $testPass
    fullName = "Smoke Customer"
    role = "CUSTOMER"
    phone = "555-0100"
} | ConvertTo-Json

$regResp = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $regBody -ContentType "application/json"
$custToken = $regResp.token
if (-not $custToken) {
    Write-Error "FAILED: Registration did not return a JWT token."
}
Write-Host "[OK] Customer registered successfully. Token obtained." -ForegroundColor Green

# 2. Login as newly registered customer
Write-Host "2. Logging in with new customer credentials..."
$loginBody = @{
    email = $testEmail
    password = $testPass
} | ConvertTo-Json

$loginResp = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$custToken = $loginResp.token
$custHeaders = @{
    "Authorization" = "Bearer $custToken"
}
Write-Host "[OK] Customer login successful." -ForegroundColor Green

# 3. Search venues
Write-Host "3. Searching venues (search=Ballroom)..."
$searchResp = Invoke-RestMethod -Uri "$baseUrl/venues?search=Ballroom" -Method Get
$venue = $searchResp.content[0]
if (-not $venue) {
    Write-Error "FAILED: No venue returned from search."
}
$venueId = $venue.id
Write-Host "[OK] Found venue ID $venueId ($($venue.name), $($venue.city))" -ForegroundColor Green

# 4. Book a slot
$eventDate = (Get-Date).AddDays(40 + ($uniqueId % 100)).ToString("yyyy-MM-dd")
$timeSlot = "MORNING"
Write-Host "4. Submitting booking for Venue $venueId on $eventDate ($timeSlot)..."
$bookBody = @{
    venueId = $venueId
    eventDate = $eventDate
    timeSlot = $timeSlot
    eventType = "WEDDING"
    guestCount = 100
    notes = "Gate 1-3 Smoke Test Booking"
} | ConvertTo-Json

$bookResp = Invoke-RestMethod -Uri "$baseUrl/bookings" -Method Post -Body $bookBody -Headers $custHeaders -ContentType "application/json"
$bookingId = $bookResp.id
$bookingStatus = $bookResp.status
Write-Host "[OK] Booking created with ID $bookingId, status: $bookingStatus, ref: $($bookResp.bookingReference)" -ForegroundColor Green

# 5. Login as Venue Owner
Write-Host "5. Logging in as Venue Owner (owner@demo.com)..."
$ownerLoginBody = @{
    email = "owner@demo.com"
    password = "Password123!"
} | ConvertTo-Json

$ownerLoginResp = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $ownerLoginBody -ContentType "application/json"
$ownerToken = $ownerLoginResp.token
$ownerHeaders = @{
    "Authorization" = "Bearer $ownerToken"
}
Write-Host "[OK] Owner login successful." -ForegroundColor Green

# 6. Owner approves the booking
Write-Host "6. Owner approving Booking ID $bookingId..."
$approveBody = @{
    status = "CONFIRMED"
    remarks = "Approved via Gate 1-3 PowerShell Smoke Test"
} | ConvertTo-Json

$approveResp = Invoke-RestMethod -Uri "$baseUrl/bookings/$bookingId/status" -Method Put -Body $approveBody -Headers $ownerHeaders -ContentType "application/json"
if ($approveResp.status -ne "CONFIRMED") {
    Write-Error "FAILED: Status did not change to CONFIRMED."
}
Write-Host "[OK] Booking approved and status confirmed to: $($approveResp.status)" -ForegroundColor Green

# 7. Attempt second overlapping booking
Write-Host "7. Verifying double-booking rejection on $eventDate ($timeSlot)..."
$user2Email = "user2_$uniqueId@demo.com"
$reg2Body = @{
    email = $user2Email
    password = $testPass
    fullName = "User Two"
    role = "CUSTOMER"
} | ConvertTo-Json

$reg2Resp = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $reg2Body -ContentType "application/json"
$user2Token = $reg2Resp.token
$user2Headers = @{
    "Authorization" = "Bearer $user2Token"
}

$secondBookingAttempt = @{
    venueId = $venueId
    eventDate = $eventDate
    timeSlot = $timeSlot
    eventType = "CORPORATE"
    guestCount = 80
} | ConvertTo-Json

$conflictCaught = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/bookings" -Method Post -Body $secondBookingAttempt -Headers $user2Headers -ContentType "application/json"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 409 -or $statusCode -eq 400) {
        $conflictCaught = $true
        Write-Host "[OK] Second overlapping booking correctly rejected with HTTP $statusCode (Conflict / Double-booking prevention lock)." -ForegroundColor Green
    } else {
        Write-Error "FAILED: Unexpected error code on overlapping booking: $statusCode"
    }
}

if (-not $conflictCaught) {
    Write-Error "FAILED: Double booking was allowed! Both bookings were accepted for the same slot."
}

# ---------------------------------------------------------
# STAGE 2: AI Recommendations, Budgets & Smart Parking
# ---------------------------------------------------------
Write-Host "`n--- STAGE 2: AI RECOMMENDER, BUDGETS & PARKING ---" -ForegroundColor Yellow

# 8. AI Recommendations
Write-Host "8. Testing AI Venue Recommendation Engine..."
$recomBody = @{
    eventType = "WEDDING"
    guestCount = 150
    maxBudget = 5000
    date = $eventDate
    timeSlot = "FULL_DAY"
    preferredFacilities = @("PARKING", "WIFI")
} | ConvertTo-Json

$recomResp = Invoke-RestMethod -Uri "$baseUrl/recommendations" -Method Post -Body $recomBody -Headers $custHeaders -ContentType "application/json"
if ($recomResp.Count -eq 0) {
    Write-Error "FAILED: Recommendation engine returned 0 results."
}
$topVenue = $recomResp[0]
Write-Host "[OK] Top Recommended Venue: '$($topVenue.venue.name)' (Score: $($topVenue.scoreBreakdown.overallScore)/100)" -ForegroundColor Green
Write-Host "     Explanation: $($topVenue.plainExplanation)" -ForegroundColor DarkGray

# 9. Budget Estimator
Write-Host "9. Testing Event Budget Estimator..."
$budgetBody = @{
    eventTitle = "Smoke Test Wedding & Reception"
    totalLimit = 25000
    venueCost = 4500
    cateringCost = 8500
    decorationCost = 3000
    photographyCost = 2500
    entertainmentCost = 2000
    otherCost = 1000
    contingencyPercent = 10
    currency = "USD"
} | ConvertTo-Json

$savedBudget = Invoke-RestMethod -Uri "$baseUrl/budgets" -Method Post -Body $budgetBody -Headers $custHeaders -ContentType "application/json"
Write-Host "[OK] Budget saved. Subtotal: $($savedBudget.subtotal), Total: $($savedBudget.totalEstimatedCost), Limit: $($savedBudget.totalLimit)" -ForegroundColor Green

# 10. Smart Parking Assistance
Write-Host "10. Testing Smart Parking Assistance..."
$parkingLots = Invoke-RestMethod -Uri "$baseUrl/parking/venues/$venueId" -Method Get
$lot = $parkingLots[0]
$lotId = $lot.id
Write-Host "[OK] Parking lot '$($lot.lotName)': Capacity: $($lot.totalSpots), Occupied: $($lot.occupiedSpots), Rate: $($lot.occupancyPercent)%" -ForegroundColor Green

# 11. Parking Prediction
Write-Host "11. Testing Future Event Parking Prediction..."
$predDateStr = (Get-Date).AddDays(10).ToString("yyyy-MM-dd")
$predResp = Invoke-RestMethod -Uri "$baseUrl/parking/lots/$lotId/prediction?date=$predDateStr&timeSlot=EVENING" -Method Get
Write-Host "[OK] Predicted Occupancy: $($predResp.predictedOccupancyPercent)%, Arrival Window: '$($predResp.suggestedArrivalWindow)'" -ForegroundColor Green

# ---------------------------------------------------------
# STAGE 3: Remaining Modules
# ---------------------------------------------------------
Write-Host "`n--- STAGE 3: VENDORS, PLANNER, RSVP, PAYMENTS & ADMIN ---" -ForegroundColor Yellow

# 12. Vendor Directory & Booking
Write-Host "12. Searching Vendor Directory..."
$vendorResp = Invoke-RestMethod -Uri "$baseUrl/vendors" -Method Get
$vendorList = if ($vendorResp.content) { $vendorResp.content } else { $vendorResp }
if ($vendorList.Count -eq 0) {
    Write-Error "FAILED: No vendors found in directory."
}
$firstVendor = $vendorList[0]
$vendorId = $firstVendor.id
$vendorName = if ($firstVendor.companyName) { $firstVendor.companyName } else { $firstVendor.businessName }
$vendorCat = if ($firstVendor.serviceCategory) { $firstVendor.serviceCategory } else { $firstVendor.category }
Write-Host "[OK] Found vendor: $vendorName ($vendorCat, $($firstVendor.city))" -ForegroundColor Green

Write-Host "13. Customer booking vendor service..."
$vendorBookBody = @{
    vendorId = $vendorId
    serviceId = if ($firstVendor.services -and $firstVendor.services.Count -gt 0) { $firstVendor.services[0].id } else { $null }
    eventDate = $eventDate
    notes = "Formal dinner buffet with vegan selections"
} | ConvertTo-Json

$vendorBookResp = Invoke-RestMethod -Uri "$baseUrl/vendors/bookings" -Method Post -Body $vendorBookBody -Headers $custHeaders -ContentType "application/json"
$vBookingId = $vendorBookResp.id
Write-Host "[OK] Vendor booking created (ID: $vBookingId, Status: $($vendorBookResp.status))" -ForegroundColor Green

# 14. Vendor Login & Order Confirmation
Write-Host "14. Logging in as Vendor (vendor@demo.com)..."
$vendorLoginBody = @{
    email = "vendor@demo.com"
    password = "Password123!"
} | ConvertTo-Json

$vendorLoginResp = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $vendorLoginBody -ContentType "application/json"
$vendorToken = $vendorLoginResp.token
$vendorHeaders = @{
    "Authorization" = "Bearer $vendorToken"
}

$vendorStatusBody = @{
    status = "CONFIRMED"
} | ConvertTo-Json
$confirmedVBooking = Invoke-RestMethod -Uri "$baseUrl/vendors/bookings/$vBookingId/status" -Method Put -Body $vendorStatusBody -Headers $vendorHeaders -ContentType "application/json"
Write-Host "[OK] Vendor accepted booking ID $vBookingId. Status: $($confirmedVBooking.status)" -ForegroundColor Green

# 15. Event Planner: Bootstrap Template & Tasks
Write-Host "15. Testing Event Planner Template & Tasks..."
$templateTasks = Invoke-RestMethod -Uri "$baseUrl/planner/template?templateName=Wedding%20Planner" -Method Post -Headers $custHeaders
if ($templateTasks.Count -eq 0) {
    Write-Error "FAILED: Planner template did not generate tasks."
}
$firstTask = $templateTasks[0]
Write-Host "[OK] Generated $($templateTasks.Count) planner tasks from template. First task: '$($firstTask.title)'" -ForegroundColor Green

$taskUpdateBody = @{
    title = $firstTask.title
    description = $firstTask.description
    category = $firstTask.category
    status = "COMPLETED"
    deadlineDate = $firstTask.deadlineDate
    eventTimeSlot = $firstTask.eventTimeSlot
    displayOrder = $firstTask.displayOrder
} | ConvertTo-Json

$updatedTask = Invoke-RestMethod -Uri "$baseUrl/planner/tasks/$($firstTask.id)" -Method Put -Body $taskUpdateBody -Headers $custHeaders -ContentType "application/json"
Write-Host "[OK] Task status cycled to: $($updatedTask.status)" -ForegroundColor Green

# 16. Events, Invitations & Public RSVP
Write-Host "16. Testing Events, Guest Invitations & Public RSVP..."
$eventCreateBody = @{
    title = "Smoke Test Anniversary Gala"
    eventType = "GALA"
    eventDate = $eventDate
    startTime = "18:00"
    locationName = "Crystal Grand Ballroom"
    locationAddress = "100 Grand Boulevard, New York"
    dressCode = "Black Tie"
} | ConvertTo-Json

$createdEvent = Invoke-RestMethod -Uri "$baseUrl/events" -Method Post -Body $eventCreateBody -Headers $custHeaders -ContentType "application/json"
$eventId = $createdEvent.id
Write-Host "[OK] Event created: '$($createdEvent.title)' (ID: $eventId)" -ForegroundColor Green

$guestBody = @{
    guestName = "Sarah Connor"
    guestEmail = "sarah.connor@example.com"
} | ConvertTo-Json

$invitedGuest = Invoke-RestMethod -Uri "$baseUrl/events/$eventId/guests" -Method Post -Body $guestBody -Headers $custHeaders -ContentType "application/json"
$inviteToken = $invitedGuest.invitationToken
Write-Host "[OK] Guest invited. Secure invitation token: $inviteToken" -ForegroundColor Green

# Public RSVP submission (no auth header needed)
Write-Host "    Submitting public RSVP for token: $inviteToken..."
$publicInvitation = Invoke-RestMethod -Uri "$baseUrl/rsvp/$inviteToken" -Method Get
Write-Host "    Public invitation view verified: '$($publicInvitation.eventTitle)' for '$($publicInvitation.guestName)'" -ForegroundColor DarkGray

$rsvpSubmitBody = @{
    rsvpStatus = "ATTENDING"
    plusOnes = 1
    dietaryRequirements = "Gluten-free"
    notes = "Looking forward to celebrating!"
} | ConvertTo-Json

$rsvpResp = Invoke-RestMethod -Uri "$baseUrl/rsvp/$inviteToken" -Method Post -Body $rsvpSubmitBody -ContentType "application/json"
if ($rsvpResp.rsvpStatus -ne "ATTENDING") {
    Write-Error "FAILED: Public RSVP status was not set to ATTENDING."
}
Write-Host "[OK] Public RSVP submitted successfully: Status=$($rsvpResp.rsvpStatus), PlusOnes=$($rsvpResp.plusOnes)" -ForegroundColor Green

# 17. Mock Payment Gateway
Write-Host "17. Testing Mock Payment Gateway for Confirmed Booking..."
$mockPaymentBody = @{
    bookingId = $bookingId
    amount = $approveResp.totalCost
    currency = "USD"
    paymentMethod = "CREDIT_CARD"
} | ConvertTo-Json

$paymentResult = Invoke-RestMethod -Uri "$baseUrl/payments/mock-charge" -Method Post -Body $mockPaymentBody -Headers $custHeaders -ContentType "application/json"
if ($paymentResult.status -ne "COMPLETED" -or -not $paymentResult.transactionReference) {
    Write-Error "FAILED: Mock payment did not complete properly."
}
Write-Host "[OK] Mock payment processed: TxRef=$($paymentResult.transactionReference), Receipt=$($paymentResult.receiptNumber), Provider=$($paymentResult.paymentProvider)" -ForegroundColor Green

# 18. Verified Review Submission
Write-Host "18. Testing Verified Review Submission for Booking ID $bookingId..."
$reviewBody = @{
    bookingId = $bookingId
    rating = 5
    cleanlinessRating = 5
    staffRating = 5
    valueRating = 5
    comment = "Exceptional acoustics, pristine ballroom, and seamless parking coordination!"
} | ConvertTo-Json

$reviewResp = Invoke-RestMethod -Uri "$baseUrl/reviews" -Method Post -Body $reviewBody -Headers $custHeaders -ContentType "application/json"
Write-Host "[OK] Review submitted successfully (ID: $($reviewResp.id), Rating: $($reviewResp.rating) stars)" -ForegroundColor Green

# 19. Admin Console & Platform Governance
Write-Host "19. Logging in as Administrator (admin@demo.com)..."
$adminLoginBody = @{
    email = "admin@demo.com"
    password = "AdminPass123!"
} | ConvertTo-Json

$adminLoginResp = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $adminLoginBody -ContentType "application/json"
$adminToken = $adminLoginResp.token
$adminHeaders = @{
    "Authorization" = "Bearer $adminToken"
}
Write-Host "[OK] Admin login successful." -ForegroundColor Green

Write-Host "20. Querying Admin Real Telemetry & Stats..."
$adminStats = Invoke-RestMethod -Uri "$baseUrl/admin/stats" -Method Get -Headers $adminHeaders
Write-Host "[OK] Platform Telemetry: Total Users=$($adminStats.totalUsers), Venues=$($adminStats.totalVenues), Bookings=$($adminStats.totalBookings), Volume=`$$($adminStats.totalConfirmedRevenue)" -ForegroundColor Green
Write-Host "     Recent Audit Logs Recorded: $($adminStats.recentAuditLogs.Count)" -ForegroundColor DarkGray

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host " [SUCCESS] ALL GATE 1, GATE 2 & GATE 3 CHECKS PASSED!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
