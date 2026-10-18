package com.smartvenue.backend.controller;

import com.smartvenue.backend.domain.AuditLog;
import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.dto.AdminDashboardDto;
import com.smartvenue.backend.dto.VendorDto;
import com.smartvenue.backend.dto.VenueDto;
import com.smartvenue.backend.service.AdminDashboardService;
import com.smartvenue.backend.service.AuditService;
import com.smartvenue.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Operations", description = "System metrics, user management, approval queues, and immutable audit logs")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;
    private final AuditService auditService;
    private final AuthService authService;

    public AdminDashboardController(AdminDashboardService adminDashboardService,
                                    AuditService auditService,
                                    AuthService authService) {
        this.adminDashboardService = adminDashboardService;
        this.auditService = auditService;
        this.authService = authService;
    }

    @GetMapping({"/stats", "/dashboard/stats"})
    @Operation(summary = "Get aggregated system metrics and statistics from DB queries")
    public ResponseEntity<AdminDashboardDto.DashboardStats> getDashboardStats() {
        return ResponseEntity.ok(adminDashboardService.getDashboardStats());
    }

    @GetMapping("/users")
    @Operation(summary = "List all registered users")
    public ResponseEntity<List<AdminDashboardDto.UserSummaryResponse>> getAllUsers() {
        return ResponseEntity.ok(adminDashboardService.getAllUsers());
    }

    @PutMapping("/users/{userId}/role")
    @Operation(summary = "Update user role (CUSTOMER, VENUE_OWNER, VENDOR, EVENT_ORGANIZER, ADMIN)")
    public ResponseEntity<AdminDashboardDto.UserSummaryResponse> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        User admin = authService.getCurrentAuthenticatedUser();
        String role = body.get("role");
        return ResponseEntity.ok(adminDashboardService.updateUserRole(userId, role, admin.getEmail()));
    }

    @GetMapping({"/venues/pending", "/queues/venues"})
    @Operation(summary = "Get venues waiting for admin approval")
    public ResponseEntity<List<VenueDto.VenueResponse>> getPendingVenues() {
        return ResponseEntity.ok(adminDashboardService.getPendingVenues());
    }

    @PutMapping("/venues/{venueId}/approve")
    @Operation(summary = "Approve or reject a venue listing")
    public ResponseEntity<VenueDto.VenueResponse> approveVenue(
            @PathVariable Long venueId,
            @RequestBody(required = false) Map<String, Boolean> body) {
        User admin = authService.getCurrentAuthenticatedUser();
        boolean approved = (body == null) || body.getOrDefault("approved", true);
        return ResponseEntity.ok(adminDashboardService.approveVenue(venueId, approved, admin.getEmail()));
    }

    @GetMapping({"/vendors/pending", "/queues/vendors"})
    @Operation(summary = "Get vendors waiting for admin approval")
    public ResponseEntity<List<VendorDto.VendorResponse>> getPendingVendors() {
        return ResponseEntity.ok(adminDashboardService.getPendingVendors());
    }

    @PutMapping("/vendors/{vendorId}/approve")
    @Operation(summary = "Approve or reject a vendor profile")
    public ResponseEntity<VendorDto.VendorResponse> approveVendor(
            @PathVariable Long vendorId,
            @RequestBody(required = false) Map<String, Boolean> body) {
        User admin = authService.getCurrentAuthenticatedUser();
        boolean approved = (body == null) || body.getOrDefault("approved", true);
        return ResponseEntity.ok(adminDashboardService.approveVendor(vendorId, approved, admin.getEmail()));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get paginated audit logs")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(auditService.getAllLogs(pageable));
    }
}
