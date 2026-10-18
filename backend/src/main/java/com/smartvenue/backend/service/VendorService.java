package com.smartvenue.backend.service;

import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.domain.UserRole;
import com.smartvenue.backend.domain.Vendor;
import com.smartvenue.backend.domain.VendorBooking;
import com.smartvenue.backend.domain.VendorServiceEntity;
import com.smartvenue.backend.dto.VendorDto;
import com.smartvenue.backend.exception.Exceptions;
import com.smartvenue.backend.repository.VendorBookingRepository;
import com.smartvenue.backend.repository.VendorRepository;
import com.smartvenue.backend.repository.VendorServiceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VendorService {

    private final VendorRepository vendorRepository;
    private final VendorServiceRepository vendorServiceRepository;
    private final VendorBookingRepository vendorBookingRepository;
    private final NotificationService notificationService;

    public VendorService(VendorRepository vendorRepository,
                         VendorServiceRepository vendorServiceRepository,
                         VendorBookingRepository vendorBookingRepository,
                         NotificationService notificationService) {
        this.vendorRepository = vendorRepository;
        this.vendorServiceRepository = vendorServiceRepository;
        this.vendorBookingRepository = vendorBookingRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public Page<VendorDto.VendorResponse> searchVendors(String category, String city, String search, Pageable pageable) {
        return vendorRepository.searchApprovedVendors(category, city, search, pageable)
                .map(VendorDto.VendorResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public VendorDto.VendorResponse getVendorById(Long id) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Vendor not found with ID: " + id));
        return VendorDto.VendorResponse.fromEntity(vendor);
    }

    @Transactional
    public VendorDto.VendorResponse createVendorProfile(VendorDto.VendorRequest request, User user) {
        Vendor vendor = new Vendor();
        vendor.setUser(user);
        vendor.setCompanyName(request.getCompanyName());
        vendor.setServiceCategory(request.getServiceCategory().toUpperCase());
        vendor.setDescription(request.getDescription());
        vendor.setCity(request.getCity());
        vendor.setBasePrice(request.getBasePrice());
        vendor.setContactEmail(request.getContactEmail());
        vendor.setContactPhone(request.getContactPhone());
        vendor.setApproved(true);

        Vendor saved = vendorRepository.save(vendor);
        return VendorDto.VendorResponse.fromEntity(saved);
    }

    @Transactional
    public VendorDto.VendorServiceResponse addServiceToVendor(Long vendorId, VendorDto.VendorServiceRequest request, User user) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Vendor not found with ID: " + vendorId));

        if (!vendor.getUser().getId().equals(user.getId()) && user.getRole() != UserRole.ADMIN) {
            throw new Exceptions.ForbiddenException("You do not have permission to manage services for this vendor.");
        }

        VendorServiceEntity service = new VendorServiceEntity();
        service.setVendor(vendor);
        service.setServiceName(request.getServiceName());
        service.setDescription(request.getDescription());
        service.setPrice(request.getPrice());
        service.setPackageTier(request.getPackageTier() != null ? request.getPackageTier().toUpperCase() : "STANDARD");

        VendorServiceEntity saved = vendorServiceRepository.save(service);
        return VendorDto.VendorServiceResponse.fromEntity(saved);
    }

    @Transactional
    public VendorDto.VendorBookingResponse bookVendor(VendorDto.VendorBookingRequest request, User customer) {
        Vendor vendor = vendorRepository.findById(request.getVendorId())
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Vendor not found with ID: " + request.getVendorId()));

        VendorServiceEntity service = null;
        BigDecimal price = vendor.getBasePrice();

        if (request.getServiceId() != null) {
            service = vendorServiceRepository.findById(request.getServiceId())
                    .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Service not found with ID: " + request.getServiceId()));
            price = service.getPrice();
        }

        VendorBooking booking = new VendorBooking();
        booking.setVendor(vendor);
        booking.setCustomer(customer);
        booking.setService(service);
        booking.setEventDate(request.getEventDate());
        booking.setStatus("PENDING");
        booking.setTotalPrice(price);
        booking.setNotes(request.getNotes());

        VendorBooking saved = vendorBookingRepository.save(booking);

        // Notify vendor user
        notificationService.createNotification(
                vendor.getUser(),
                "New Booking Request",
                "You received a new booking request from " + customer.getFullName() + " for date " + request.getEventDate()
        );

        return VendorDto.VendorBookingResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<VendorDto.VendorBookingResponse> getCustomerVendorBookings(Long customerId) {
        return vendorBookingRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(VendorDto.VendorBookingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VendorDto.VendorBookingResponse> getVendorReceivedBookings(Long vendorId, User user) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Vendor not found with ID: " + vendorId));

        if (!vendor.getUser().getId().equals(user.getId()) && user.getRole() != UserRole.ADMIN) {
            throw new Exceptions.ForbiddenException("You do not have permission to view bookings for this vendor.");
        }

        return vendorBookingRepository.findByVendorIdOrderByCreatedAtDesc(vendorId)
                .stream()
                .map(VendorDto.VendorBookingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public VendorDto.VendorBookingResponse updateVendorBookingStatus(Long bookingId, String newStatus, User user) {
        VendorBooking booking = vendorBookingRepository.findById(bookingId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Vendor booking not found with ID: " + bookingId));

        Vendor vendor = booking.getVendor();
        if (!vendor.getUser().getId().equals(user.getId()) && user.getRole() != UserRole.ADMIN) {
            throw new Exceptions.ForbiddenException("You do not have permission to update this vendor booking.");
        }

        String validStatus = newStatus.trim().toUpperCase();
        booking.setStatus(validStatus);
        VendorBooking saved = vendorBookingRepository.save(booking);

        // Notify customer
        notificationService.createNotification(
                booking.getCustomer(),
                "Vendor Booking " + validStatus,
                vendor.getCompanyName() + " updated your booking request status to " + validStatus
        );

        return VendorDto.VendorBookingResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<VendorDto.VendorResponse> getMyVendorProfiles(Long userId) {
        return vendorRepository.findByUserId(userId)
                .stream()
                .map(VendorDto.VendorResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
