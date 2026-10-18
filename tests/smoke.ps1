$ErrorActionPreference = "Stop"

$baseUrl = if ($env:BASE_URL) { $env:BASE_URL } else { "http://localhost:8081/api" }
$uniqueId = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$testEmail = "smoke_$uniqueId@demo.com"
$testPass = "Password123!"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Starting End-to-End Gate 1 Smoke Test" -ForegroundColor Cyan
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
$eventDate = (Get-Date).AddDays(15).ToString("yyyy-MM-dd")
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

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " [SUCCESS] ALL GATE 1 SMOKE TESTS PASSED!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
