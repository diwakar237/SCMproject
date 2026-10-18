$ErrorActionPreference = "Stop"

$baseUrl = if ($env:BASE_URL) { $env:BASE_URL } else { "http://localhost:8081/api" }
$uniqueId = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$testEmail = "smoke_$uniqueId@demo.com"
$testPass = "Password123!"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Starting End-to-End Gate 1 & 2 Smoke Test" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

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
$eventDate = (Get-Date).AddDays(30 + ($uniqueId % 100)).ToString("yyyy-MM-dd")

$timeSlot = "MORNING"
Write-Host "4. Submitting booking for Venue $venueId on $eventDate ($timeSlot)..."
$bookBody = @{
    venueId = $venueId
    eventDate = $eventDate
    timeSlot = $timeSlot
    eventType = "WEDDING"
    guestCount = 100
    notes = "Gate 1 Smoke Test Booking"
} | ConvertTo-Json

$custHeaders = @{
    "Authorization" = "Bearer $custToken"
}

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
    remarks = "Approved via Gate 1 PowerShell Smoke Test"
} | ConvertTo-Json

$approveResp = Invoke-RestMethod -Uri "$baseUrl/bookings/$bookingId/status" -Method Put -Body $approveBody -Headers $ownerHeaders -ContentType "application/json"
if ($approveResp.status -ne "CONFIRMED") {
    Write-Error "FAILED: Status did not change to CONFIRMED."
}
Write-Host "[OK] Booking approved and status confirmed to: $($approveResp.status)" -ForegroundColor Green

# 7. Attempt second overlapping booking
Write-Host "7. Attempting conflicting second booking on same venue, date, and overlapping slot (FULL_DAY)..."
$conflictBody = @{
    venueId = $venueId
    eventDate = $eventDate
    timeSlot = "FULL_DAY"
    eventType = "CORPORATE"
    guestCount = 80
    notes = "Conflict Test Booking"
} | ConvertTo-Json

$conflictBlocked = $false
try {
    $conflictResp = Invoke-RestMethod -Uri "$baseUrl/bookings" -Method Post -Body $conflictBody -Headers $custHeaders -ContentType "application/json"
    Write-Error "FAILED: Server accepted an overlapping booking!"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "[OK] CONFLICT PREVENTED: Server correctly rejected overlapping booking with HTTP $statusCode." -ForegroundColor Green
    $conflictBlocked = $true
}

if (-not $conflictBlocked) {
    Write-Error "FAILED: Conflict was not blocked."
}

# =========================================================
# STAGE 2 VERIFICATION: RECOMMENDATIONS, BUDGET, & PARKING
# =========================================================
Write-Host "------------------------------------------" -ForegroundColor Yellow
Write-Host " 8. Testing AI Venue Recommendation Service..." -ForegroundColor Yellow
$recBody = @{
    eventType = "WEDDING"
    guestCount = 120
    maxBudget = 5000
    preferredFacilities = @("WIFI", "PARKING")
} | ConvertTo-Json

$recResp = Invoke-RestMethod -Uri "$baseUrl/recommendations" -Method Post -Body $recBody -ContentType "application/json"
if ($recResp.Count -eq 0) {
    Write-Error "FAILED: Recommendation service returned 0 venues."
}
$topVenue = $recResp[0]
Write-Host "[OK] Recommendations returned $($recResp.Count) candidates. Top match: '$($topVenue.venue.name)' with score: $($topVenue.scoreBreakdown.overallScore)/100" -ForegroundColor Green
Write-Host "     Plain explanation: $($topVenue.plainExplanation)" -ForegroundColor DarkGray

Write-Host " 9. Testing Event Budget Estimator..." -ForegroundColor Yellow
$budgetBody = @{
    eventTitle = "Smoke Test Gala Budget"
    totalLimit = 15000.00
    venueCost = 4500.00
    cateringCost = 3500.00
    decorationCost = 1500.00
    photographyCost = 1000.00
    entertainmentCost = 800.00
    otherCost = 500.00
    contingencyPercent = 10.0
} | ConvertTo-Json

$budgetResp = Invoke-RestMethod -Uri "$baseUrl/budgets" -Method Post -Body $budgetBody -Headers $custHeaders -ContentType "application/json"
$budgetId = $budgetResp.id
$actualTotal = [double]$budgetResp.totalEstimatedCost

$isOver = if ($null -ne $budgetResp.isOverBudget) { $budgetResp.isOverBudget } else { $budgetResp.overBudget }
if ([Math]::Abs($actualTotal - 12980.00) -gt 0.01 -or $isOver -ne $false) {
    Write-Error "FAILED: Budget math incorrect. Expected total: 12980.00, got: $actualTotal"
}



Write-Host "[OK] Budget saved with ID $budgetId. Subtotal: $($budgetResp.subtotal), Total Estimated: $($budgetResp.totalEstimatedCost), OverBudget: $($budgetResp.isOverBudget)" -ForegroundColor Green

# Query saved budgets
$myBudgets = Invoke-RestMethod -Uri "$baseUrl/budgets/my" -Method Get -Headers $custHeaders
if ($myBudgets.Count -eq 0) {
    Write-Error "FAILED: User budgets not retrieved."
}
Write-Host "[OK] Retrieved user budgets count: $($myBudgets.Count)" -ForegroundColor Green

Write-Host " 10. Testing Smart Parking Assistance..." -ForegroundColor Yellow
$parkingLots = Invoke-RestMethod -Uri "$baseUrl/parking/venues/$venueId" -Method Get
if ($parkingLots.Count -eq 0) {
    Write-Error "FAILED: No parking lots found for venue $venueId."
}
$lot = $parkingLots[0]
$lotId = $lot.id
Write-Host "[OK] Found parking lot '$($lot.lotName)': Capacity: $($lot.totalSpots), Occupied: $($lot.occupiedSpots), Available: $($lot.availableSpots), Rate: $($lot.occupancyPercent)%" -ForegroundColor Green

# Owner manual update
Write-Host " 11. Testing Owner Manual Parking Update..." -ForegroundColor Yellow
$manualBody = @{
    occupiedSpots = 55
} | ConvertTo-Json

$updatedLot = Invoke-RestMethod -Uri "$baseUrl/parking/lots/$lotId/manual" -Method Put -Body $manualBody -Headers $ownerHeaders -ContentType "application/json"
if ($updatedLot.occupiedSpots -ne 55 -or $updatedLot.dataSource -ne "MANUAL") {
    Write-Error "FAILED: Manual parking update failed."
}
Write-Host "[OK] Parking lot manually updated: Occupied: $($updatedLot.occupiedSpots), Available: $($updatedLot.availableSpots), Source: $($updatedLot.dataSource)" -ForegroundColor Green

# Future Occupancy Prediction
Write-Host " 12. Testing Future Event Parking Prediction..." -ForegroundColor Yellow
$predDateStr = (Get-Date).AddDays(10).ToString("yyyy-MM-dd")
$predResp = Invoke-RestMethod -Uri "$baseUrl/parking/lots/$lotId/prediction?date=$predDateStr&timeSlot=EVENING" -Method Get
if (-not $predResp.predictedOccupancyPercent -or -not $predResp.predictionBasis) {
    Write-Error "FAILED: Parking prediction did not return expected fields."
}
Write-Host "[OK] Prediction generated for $predDateStr (EVENING): Predicted Occupancy: $($predResp.predictedOccupancyPercent)%, Arrival Window: '$($predResp.suggestedArrivalWindow)'" -ForegroundColor Green
Write-Host "     Basis: $($predResp.predictionBasis)" -ForegroundColor DarkGray

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " [SUCCESS] ALL GATE 1 & GATE 2 TESTS PASSED!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
