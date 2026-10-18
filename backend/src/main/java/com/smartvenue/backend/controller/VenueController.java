package com.smartvenue.backend.controller;

import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.dto.VenueDto;
import com.smartvenue.backend.service.AuthService;
import com.smartvenue.backend.service.VenueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/venues")
@Tag(name = "Venues", description = "Venue discovery, search, filtering, and management")
public class VenueController {

    private final VenueService venueService;
    private final AuthService authService;

    public VenueController(VenueService venueService, AuthService authService) {
        this.venueService = venueService;
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "Search and filter venues with pagination and sorting")
    public ResponseEntity<Page<VenueDto.VenueResponse>> searchVenues(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String facility,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<VenueDto.VenueResponse> result = venueService.searchVenues(
                search, city, category, eventType, minCapacity, minPrice, maxPrice, facility, date, pageable
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get venue detailed information by ID")
    public ResponseEntity<VenueDto.VenueResponse> getVenueById(@PathVariable Long id) {
        return ResponseEntity.ok(venueService.getVenueById(id));
    }

    @GetMapping("/{id}/availability")
    @Operation(summary = "Check venue availability and booked time slots for a given date")
    public ResponseEntity<VenueDto.VenueAvailabilityResponse> checkAvailability(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(venueService.checkAvailability(id, date));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('VENUE_OWNER', 'ADMIN')")
    @Operation(summary = "Create a new venue listing (VENUE_OWNER or ADMIN)")
    public ResponseEntity<VenueDto.VenueResponse> createVenue(@Valid @RequestBody VenueDto.VenueCreateUpdateRequest request) {
        User owner = authService.getCurrentAuthenticatedUser();
        VenueDto.VenueResponse created = venueService.createVenue(request, owner);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENUE_OWNER', 'ADMIN')")
    @Operation(summary = "Update an existing venue listing (Owner or ADMIN)")
    public ResponseEntity<VenueDto.VenueResponse> updateVenue(
            @PathVariable Long id,
            @Valid @RequestBody VenueDto.VenueCreateUpdateRequest request
    ) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(venueService.updateVenue(id, request, user));
    }

    @GetMapping("/my-venues")
    @PreAuthorize("hasAnyRole('VENUE_OWNER', 'ADMIN')")
    @Operation(summary = "Get venues owned by current user")
    public ResponseEntity<Page<VenueDto.VenueResponse>> getMyVenues(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        User owner = authService.getCurrentAuthenticatedUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(venueService.getOwnerVenues(owner.getId(), pageable));
    }
}
