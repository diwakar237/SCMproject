package com.smartvenue.backend.controller;

import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.dto.BookingDto;
import com.smartvenue.backend.service.AuthService;
import com.smartvenue.backend.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Bookings", description = "Venue booking lifecycle, conflict checking, approval, and receipts")
public class BookingController {

    private final BookingService bookingService;
    private final AuthService authService;

    public BookingController(BookingService bookingService, AuthService authService) {
        this.bookingService = bookingService;
        this.authService = authService;
    }

    @PostMapping
    @Operation(summary = "Submit a new venue booking request")
    public ResponseEntity<BookingDto.BookingResponse> createBooking(
            @Valid @RequestBody BookingDto.BookingCreateRequest request) {
        User customer = authService.getCurrentAuthenticatedUser();
        BookingDto.BookingResponse response = bookingService.createBooking(request, customer);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @Operation(summary = "Get current customer's bookings with status history")
    public ResponseEntity<Page<BookingDto.BookingResponse>> getMyBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        User customer = authService.getCurrentAuthenticatedUser();
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(bookingService.getCustomerBookings(customer.getId(), pageable));
    }

    @GetMapping("/owner")
    @PreAuthorize("hasAnyRole('VENUE_OWNER', 'ADMIN')")
    @Operation(summary = "Get bookings for venues owned by the current user")
    public ResponseEntity<Page<BookingDto.BookingResponse>> getOwnerBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        User owner = authService.getCurrentAuthenticatedUser();
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(bookingService.getOwnerBookings(owner.getId(), pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking details by ID (Customer, Owner, or Admin)")
    public ResponseEntity<BookingDto.BookingResponse> getBookingById(@PathVariable Long id) {
        User actor = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(bookingService.getBookingById(id, actor));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('VENUE_OWNER', 'ADMIN')")
    @Operation(summary = "Approve or reject booking request with concurrency protection")
    public ResponseEntity<BookingDto.BookingResponse> updateBookingStatus(
            @PathVariable Long id,
            @Valid @RequestBody BookingDto.BookingStatusUpdateRequest request
    ) {
        User actor = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, request, actor));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel booking with policy refund calculation")
    public ResponseEntity<BookingDto.BookingResponse> cancelBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingDto.BookingCancelRequest request
    ) {
        User actor = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(bookingService.cancelBooking(id, request, actor));
    }

    @GetMapping(value = "/{id}/receipt", produces = MediaType.TEXT_HTML_VALUE)
    @Operation(summary = "Generate printable HTML receipt for booking")
    public ResponseEntity<String> getReceipt(@PathVariable Long id) {
        String receiptHtml = bookingService.generateReceiptHtml(id);
        return ResponseEntity.ok(receiptHtml);
    }
}
