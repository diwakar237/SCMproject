package com.smartvenue.backend.controller;

import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.dto.VendorDto;
import com.smartvenue.backend.service.AuthService;
import com.smartvenue.backend.service.VendorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vendors")
@Tag(name = "Vendor Management", description = "Vendor profiles, service packages, and booking requests")
public class VendorController {

    private final VendorService vendorService;
    private final AuthService authService;

    public VendorController(VendorService vendorService, AuthService authService) {
        this.vendorService = vendorService;
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "Search approved vendors by category, city, or keyword")
    public ResponseEntity<Page<VendorDto.VendorResponse>> searchVendors(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 12) Pageable pageable) {
        return ResponseEntity.ok(vendorService.searchVendors(category, city, search, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vendor profile and services by ID")
    public ResponseEntity<VendorDto.VendorResponse> getVendorById(@PathVariable Long id) {
        return ResponseEntity.ok(vendorService.getVendorById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Register new vendor profile")
    public ResponseEntity<VendorDto.VendorResponse> createVendorProfile(@Valid @RequestBody VendorDto.VendorRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(vendorService.createVendorProfile(request, user));
    }

    @PostMapping("/{vendorId}/services")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Add service package to vendor profile")
    public ResponseEntity<VendorDto.VendorServiceResponse> addServiceToVendor(
            @PathVariable Long vendorId,
            @Valid @RequestBody VendorDto.VendorServiceRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(vendorService.addServiceToVendor(vendorId, request, user));
    }

    @PostMapping("/bookings")
    @Operation(summary = "Book vendor service (Customer)")
    public ResponseEntity<VendorDto.VendorBookingResponse> bookVendor(@Valid @RequestBody VendorDto.VendorBookingRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(vendorService.bookVendor(request, user));
    }

    @PostMapping("/{vendorId}/bookings")
    @Operation(summary = "Book vendor service with vendor ID in path")
    public ResponseEntity<VendorDto.VendorBookingResponse> bookVendorWithPath(
            @PathVariable Long vendorId,
            @RequestBody VendorDto.VendorBookingRequest request) {
        request.setVendorId(vendorId);
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(vendorService.bookVendor(request, user));
    }

    @GetMapping("/bookings/my")
    @Operation(summary = "Get authenticated customer's vendor bookings")
    public ResponseEntity<List<VendorDto.VendorBookingResponse>> getMyVendorBookings() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(vendorService.getCustomerVendorBookings(user.getId()));
    }

    @GetMapping("/{vendorId}/bookings")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Get all booking requests received by vendor")
    public ResponseEntity<List<VendorDto.VendorBookingResponse>> getVendorReceivedBookings(@PathVariable Long vendorId) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(vendorService.getVendorReceivedBookings(vendorId, user));
    }

    @PutMapping("/bookings/{bookingId}/status")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Vendor approve/reject/cancel booking request")
    public ResponseEntity<VendorDto.VendorBookingResponse> updateVendorBookingStatus(
            @PathVariable Long bookingId,
            @RequestBody Map<String, String> body) {
        User user = authService.getCurrentAuthenticatedUser();
        String status = body.getOrDefault("status", "CONFIRMED");
        return ResponseEntity.ok(vendorService.updateVendorBookingStatus(bookingId, status, user));
    }

    @GetMapping("/my-profiles")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Get vendor profiles owned by logged in user")
    public ResponseEntity<List<VendorDto.VendorResponse>> getMyVendorProfiles() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(vendorService.getMyVendorProfiles(user.getId()));
    }
}
