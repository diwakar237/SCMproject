package com.smartvenue.backend.service;

import com.smartvenue.backend.domain.Booking;
import com.smartvenue.backend.domain.BookingStatus;
import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.domain.UserRole;
import com.smartvenue.backend.domain.Vendor;
import com.smartvenue.backend.domain.Venue;
import com.smartvenue.backend.dto.AdminDashboardDto;
import com.smartvenue.backend.dto.VendorDto;
import com.smartvenue.backend.dto.VenueDto;
import com.smartvenue.backend.exception.Exceptions;
import com.smartvenue.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final VendorRepository vendorRepository;
    private final BookingRepository bookingRepository;
    private final AuditService auditService;

    public AdminDashboardService(UserRepository userRepository,
                                 VenueRepository venueRepository,
                                 VendorRepository vendorRepository,
                                 BookingRepository bookingRepository,
                                 AuditService auditService) {
        this.userRepository = userRepository;
        this.venueRepository = venueRepository;
        this.vendorRepository = vendorRepository;
        this.bookingRepository = bookingRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public AdminDashboardDto.DashboardStats getDashboardStats() {
        AdminDashboardDto.DashboardStats stats = new AdminDashboardDto.DashboardStats();

        List<User> allUsers = userRepository.findAll();
        stats.setTotalUsers(allUsers.size());

        Map<String, Long> roleMap = new HashMap<>();
        for (UserRole role : UserRole.values()) {
            roleMap.put(role.name(), allUsers.stream().filter(u -> u.getRole() == role).count());
        }
        stats.setUsersByRole(roleMap);

        List<Venue> allVenues = venueRepository.findAll();
        stats.setTotalVenues(allVenues.size());
        stats.setPendingVenueApprovals(allVenues.stream().filter(v -> !Boolean.TRUE.equals(v.getApproved())).count());

        List<Vendor> allVendors = vendorRepository.findAll();
        stats.setTotalVendors(allVendors.size());
        stats.setPendingVendorApprovals(allVendors.stream().filter(v -> !Boolean.TRUE.equals(v.getApproved())).count());

        List<Booking> allBookings = bookingRepository.findAll();
        stats.setTotalBookings(allBookings.size());

        List<Booking> confirmedBookings = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .collect(Collectors.toList());
        stats.setConfirmedBookings(confirmedBookings.size());

        BigDecimal totalRev = confirmedBookings.stream()
                .map(Booking::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalRevenue(totalRev);

        stats.setRecentAuditLogs(auditService.getRecentLogs());
        return stats;
    }

    @Transactional(readOnly = true)
    public List<AdminDashboardDto.UserSummaryResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(AdminDashboardDto.UserSummaryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminDashboardDto.UserSummaryResponse updateUserRole(Long userId, String roleName, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("User not found with ID: " + userId));

        try {
            UserRole newRole = UserRole.valueOf(roleName.toUpperCase());
            user.setRole(newRole);
            User saved = userRepository.save(user);

            auditService.record(
                    adminEmail,
                    "USER_ROLE_UPDATED",
                    "USER",
                    userId.toString(),
                    "Updated role of " + user.getEmail() + " to " + newRole.name()
            );

            return AdminDashboardDto.UserSummaryResponse.fromEntity(saved);
        } catch (IllegalArgumentException e) {
            throw new Exceptions.ValidationException("Invalid role name: " + roleName);
        }
    }

    @Transactional
    public VenueDto.VenueResponse approveVenue(Long venueId, boolean approved, String adminEmail) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Venue not found with ID: " + venueId));

        venue.setApproved(approved);
        Venue saved = venueRepository.save(venue);

        auditService.record(
                adminEmail,
                approved ? "VENUE_APPROVED" : "VENUE_REJECTED",
                "VENUE",
                venueId.toString(),
                (approved ? "Approved" : "Rejected") + " venue: " + venue.getName()
        );

        return VenueDto.VenueResponse.fromEntity(saved);
    }

    @Transactional
    public VendorDto.VendorResponse approveVendor(Long vendorId, boolean approved, String adminEmail) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Vendor not found with ID: " + vendorId));

        vendor.setApproved(approved);
        Vendor saved = vendorRepository.save(vendor);

        auditService.record(
                adminEmail,
                approved ? "VENDOR_APPROVED" : "VENDOR_REJECTED",
                "VENDOR",
                vendorId.toString(),
                (approved ? "Approved" : "Rejected") + " vendor: " + vendor.getCompanyName()
        );

        return VendorDto.VendorResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<VenueDto.VenueResponse> getPendingVenues() {
        return venueRepository.findAll().stream()
                .filter(v -> !Boolean.TRUE.equals(v.getApproved()))
                .map(VenueDto.VenueResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VendorDto.VendorResponse> getPendingVendors() {
        return vendorRepository.findByApprovedFalseOrderByCreatedAtAsc().stream()
                .map(VendorDto.VendorResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
