package com.smartvenue.backend.controller;

import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.dto.ParkingDto;
import com.smartvenue.backend.service.AuthService;
import com.smartvenue.backend.service.ParkingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/parking")
@Tag(name = "Parking Assistance", description = "Real-time occupancy, sensor data sources, historical predictions, and arrival window guidance")
public class ParkingController {

    private final ParkingService parkingService;
    private final AuthService authService;

    public ParkingController(ParkingService parkingService, AuthService authService) {
        this.parkingService = parkingService;
        this.authService = authService;
    }

    @GetMapping("/venues/{venueId}")
    @Operation(summary = "Get all parking lots and live occupancy for a venue")
    public ResponseEntity<List<ParkingDto.ParkingLotResponse>> getParkingLotsForVenue(@PathVariable Long venueId) {
        return ResponseEntity.ok(parkingService.getParkingLotsForVenue(venueId));
    }

    @GetMapping("/lots/{lotId}")
    @Operation(summary = "Get specific parking lot occupancy and recent history")
    public ResponseEntity<ParkingDto.ParkingLotResponse> getParkingLotById(@PathVariable Long lotId) {
        return ResponseEntity.ok(parkingService.getParkingLotById(lotId));
    }

    @PutMapping("/lots/{lotId}/manual")
    @PreAuthorize("hasAnyRole('VENUE_OWNER', 'ADMIN')")
    @Operation(summary = "Manually update parking lot occupied spots (Owner or Admin)")
    public ResponseEntity<ParkingDto.ParkingLotResponse> updateOccupiedSpotsManually(
            @PathVariable Long lotId,
            @Valid @RequestBody ParkingDto.ParkingManualUpdateRequest request) {
        User actor = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(parkingService.updateOccupiedSpotsManually(lotId, request.getOccupiedSpots(), actor));
    }

    @GetMapping("/lots/{lotId}/prediction")
    @Operation(summary = "Generate parking occupancy prediction based on history and scheduled events")
    public ResponseEntity<ParkingDto.ParkingPredictionResponse> predictOccupancy(
            @PathVariable Long lotId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String timeSlot) {
        return ResponseEntity.ok(parkingService.predictOccupancy(lotId, date, timeSlot));
    }
}
