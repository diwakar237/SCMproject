package com.smartvenue.backend.service;

import com.smartvenue.backend.domain.*;
import com.smartvenue.backend.dto.BookingDto;
import com.smartvenue.backend.exception.Exceptions;
import com.smartvenue.backend.repository.BookingRepository;
import com.smartvenue.backend.repository.BookingStatusHistoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingStatusHistoryRepository historyRepository;
    private final VenueService venueService;
    private final com.smartvenue.backend.repository.VenueRepository venueRepository;

    @Value("${app.booking.cancellation.full-refund-days-prior:7}")
    private int fullRefundDaysPrior;

    @Value("${app.booking.cancellation.partial-refund-days-prior:3}")
    private int partialRefundDaysPrior;

    @Value("${app.booking.cancellation.partial-refund-percent:50}")
    private int partialRefundPercent;

    public BookingService(
            BookingRepository bookingRepository,
            BookingStatusHistoryRepository historyRepository,
            VenueService venueService,
            com.smartvenue.backend.repository.VenueRepository venueRepository) {
        this.bookingRepository = bookingRepository;
        this.historyRepository = historyRepository;
        this.venueService = venueService;
        this.venueRepository = venueRepository;
    }

    @Transactional
    public BookingDto.BookingResponse createBooking(BookingDto.BookingCreateRequest request, User customer) {
        Venue venue = venueService.getVenueEntity(request.getVenueId());

        // Validate capacity
        if (request.getGuestCount() > venue.getCapacity()) {
            throw new Exceptions.BadRequestException(
                    "Requested guest count (" + request.getGuestCount() + ") exceeds venue maximum capacity (" + venue.getCapacity() + ")");
        }

        // Validate event date
        if (request.getEventDate().isBefore(LocalDate.now())) {
            throw new Exceptions.BadRequestException("Event date cannot be in the past.");
        }

        // Check if there is already a confirmed booking for this venue, date, and slot
        long existingConfirmed = bookingRepository.countConfirmedOverlaps(
                venue.getId(), request.getEventDate(), request.getTimeSlot());
        if (existingConfirmed > 0) {
            throw new Exceptions.ConflictException(
                    "Venue is already booked and confirmed for this date and time slot.");
        }

        // Calculate Cost
        BigDecimal baseCost = venue.getBasePricePerDay();
        // Adjust for slot: MORNING or EVENING is 60% of daily rate, FULL_DAY is 100%
        if (request.getTimeSlot() == TimeSlot.MORNING || request.getTimeSlot() == TimeSlot.EVENING) {
            baseCost = baseCost.multiply(new BigDecimal("0.60")).setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal serviceFee = baseCost.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP); // 10% service fee
        BigDecimal cleaningFee = venue.getCleaningFee() != null ? venue.getCleaningFee() : BigDecimal.ZERO;
        BigDecimal totalCost = baseCost.add(serviceFee).add(cleaningFee);

        Booking booking = new Booking();
        booking.setBookingReference("BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        booking.setVenue(venue);
        booking.setCustomer(customer);
        booking.setEventDate(request.getEventDate());
        booking.setTimeSlot(request.getTimeSlot());
        booking.setEventType(request.getEventType());
        booking.setGuestCount(request.getGuestCount());
        booking.setBaseCost(baseCost);
        booking.setServiceFee(serviceFee);
        booking.setTotalCost(totalCost);
        booking.setStatus(BookingStatus.PENDING);
        booking.setNotes(request.getNotes());

        Booking savedBooking = bookingRepository.save(booking);

        BookingStatusHistory history = new BookingStatusHistory(
                savedBooking, null, BookingStatus.PENDING, customer, "Booking request submitted by customer");
        historyRepository.save(history);

        List<BookingStatusHistory> historyList = historyRepository.findByBookingIdOrderByCreatedAtAsc(savedBooking.getId());
        return new BookingDto.BookingResponse(savedBooking, historyList);
    }

    /**
     * Approves or rejects a booking with DB-level pessimistic locking & strict transaction isolation.
     * Prevents overlapping confirmed bookings even under heavy concurrent load.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public BookingDto.BookingResponse updateBookingStatus(
            Long bookingId, BookingDto.BookingStatusUpdateRequest request, User actor) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Booking not found with id: " + bookingId));

        // Ownership / Authorization check
        boolean isOwner = booking.getVenue().getOwner().getId().equals(actor.getId());
        boolean isAdmin = actor.getRole() == UserRole.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new Exceptions.ForbiddenException("Only the venue owner or an admin can approve/reject booking requests.");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new Exceptions.BadRequestException("Cannot change status of a cancelled booking.");
        }

        BookingStatus oldStatus = booking.getStatus();
        BookingStatus newStatus = request.getStatus();

        if (newStatus == BookingStatus.CONFIRMED) {
            // Lock the Venue to serialize concurrent confirmations for this venue
            venueRepository.findByIdWithPessimisticLock(booking.getVenue().getId());

            // DB-level pessimistic write lock protection
            List<Booking> overlaps = bookingRepository.findConfirmedOverlapsWithLock(
                    booking.getVenue().getId(), booking.getEventDate(), booking.getTimeSlot());

            // Filter out self if already confirmed
            boolean hasOtherConfirmedOverlap = overlaps.stream()
                    .anyMatch(b -> !b.getId().equals(booking.getId()));

            if (hasOtherConfirmedOverlap) {
                throw new Exceptions.ConflictException(
                        "Conflict: An overlapping booking is already confirmed for this venue on " +
                                booking.getEventDate() + " (" + booking.getTimeSlot() + ").");
            }
        }

        booking.setStatus(newStatus);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking updated = bookingRepository.save(booking);

        String remark = request.getRemarks() != null && !request.getRemarks().trim().isEmpty()
                ? request.getRemarks().trim()
                : "Status updated to " + newStatus + " by " + actor.getFullName();

        BookingStatusHistory history = new BookingStatusHistory(
                updated, oldStatus, newStatus, actor, remark);
        historyRepository.save(history);

        List<BookingStatusHistory> historyList = historyRepository.findByBookingIdOrderByCreatedAtAsc(updated.getId());
        return new BookingDto.BookingResponse(updated, historyList);
    }

    @Transactional
    public BookingDto.BookingResponse cancelBooking(Long bookingId, BookingDto.BookingCancelRequest request, User actor) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Booking not found with id: " + bookingId));

        boolean isCustomer = booking.getCustomer().getId().equals(actor.getId());
        boolean isOwner = booking.getVenue().getOwner().getId().equals(actor.getId());
        boolean isAdmin = actor.getRole() == UserRole.ADMIN;

        if (!isCustomer && !isOwner && !isAdmin) {
            throw new Exceptions.ForbiddenException("You do not have permission to cancel this booking.");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new Exceptions.BadRequestException("Booking is already cancelled.");
        }

        // Calculate refund policy based on days remaining
        long daysPrior = ChronoUnit.DAYS.between(LocalDate.now(), booking.getEventDate());
        String refundPolicyNote;
        if (daysPrior >= fullRefundDaysPrior) {
            refundPolicyNote = "Full refund eligible (cancelled " + daysPrior + " days prior to event, policy: >=" + fullRefundDaysPrior + " days).";
        } else if (daysPrior >= partialRefundDaysPrior) {
            refundPolicyNote = "Partial refund eligible (" + partialRefundPercent + "% refund, cancelled " + daysPrior + " days prior).";
        } else {
            refundPolicyNote = "No refund eligible (cancelled less than " + partialRefundDaysPrior + " days prior to event).";
        }

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(request.getReason() + " | Policy Assessment: " + refundPolicyNote);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);

        BookingStatusHistory history = new BookingStatusHistory(
                saved, oldStatus, BookingStatus.CANCELLED, actor,
                "Cancelled: " + request.getReason() + " (" + refundPolicyNote + ")");
        historyRepository.save(history);

        List<BookingStatusHistory> historyList = historyRepository.findByBookingIdOrderByCreatedAtAsc(saved.getId());
        return new BookingDto.BookingResponse(saved, historyList);
    }

    @Transactional(readOnly = true)
    public Page<BookingDto.BookingResponse> getCustomerBookings(Long customerId, Pageable pageable) {
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, pageable)
                .map(b -> new BookingDto.BookingResponse(b, historyRepository.findByBookingIdOrderByCreatedAtAsc(b.getId())));
    }

    @Transactional(readOnly = true)
    public Page<BookingDto.BookingResponse> getOwnerBookings(Long ownerId, Pageable pageable) {
        return bookingRepository.findByVenueOwnerIdOrderByCreatedAtDesc(ownerId, pageable)
                .map(b -> new BookingDto.BookingResponse(b, historyRepository.findByBookingIdOrderByCreatedAtAsc(b.getId())));
    }

    @Transactional(readOnly = true)
    public BookingDto.BookingResponse getBookingById(Long id, User actor) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Booking not found with id: " + id));

        boolean isCustomer = booking.getCustomer().getId().equals(actor.getId());
        boolean isOwner = booking.getVenue().getOwner().getId().equals(actor.getId());
        boolean isAdmin = actor.getRole() == UserRole.ADMIN;

        if (!isCustomer && !isOwner && !isAdmin) {
            throw new Exceptions.ForbiddenException("Access denied for booking id: " + id);
        }

        List<BookingStatusHistory> history = historyRepository.findByBookingIdOrderByCreatedAtAsc(booking.getId());
        return new BookingDto.BookingResponse(booking, history);
    }

    @Transactional(readOnly = true)
    public String generateReceiptHtml(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Booking not found with id: " + bookingId));

        return "<!DOCTYPE html>" +
                "<html><head><meta charset='UTF-8'><title>Booking Receipt - " + booking.getBookingReference() + "</title>" +
                "<style>" +
                "body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #1f2937; background: #f9fafb; }" +
                ".receipt-card { max-width: 650px; margin: 0 auto; background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }" +
                ".header { display: flex; justify-content: space-between; border-bottom: 2px solid #22c55e; padding-bottom: 16px; margin-bottom: 24px; }" +
                ".brand { font-size: 22px; font-weight: bold; color: #15803d; }" +
                ".badge { padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: bold; display: inline-block; }" +
                ".badge-CONFIRMED { background: #dcfce7; color: #15803d; }" +
                ".badge-PENDING { background: #fef9c3; color: #854d0e; }" +
                ".badge-CANCELLED { background: #fee2e2; color: #b91c1c; }" +
                ".badge-REJECTED { background: #f3f4f6; color: #4b5563; }" +
                ".row { display: flex; justify-content: space-between; margin-bottom: 8px; }" +
                ".total-row { border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 16px; font-size: 18px; font-weight: bold; }" +
                ".print-btn { background: #16a34a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-top: 24px; width: 100%; font-size: 15px; font-weight: bold; }" +
                "@media print { .print-btn { display: none; } body { background: white; margin: 0; } .receipt-card { border: none; box-shadow: none; width: 100%; } }" +
                "</style></head><body>" +
                "<div class='receipt-card'>" +
                "<div class='header'><div><div class='brand'>SmartVenue Booking Receipt</div><p style='color:#6b7280;margin:4px 0;'>Ref: " + booking.getBookingReference() + "</p></div>" +
                "<div><span class='badge badge-" + booking.getStatus().name() + "'>" + booking.getStatus().name() + "</span></div></div>" +
                "<div style='margin-bottom:20px;'>" +
                "<h3 style='margin:0 0 6px 0;'>" + booking.getVenue().getName() + "</h3>" +
                "<p style='margin:0;color:#6b7280;font-size:14px;'>" + booking.getVenue().getAddress() + ", " + booking.getVenue().getCity() + "</p></div>" +
                "<div style='background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:20px;font-size:14px;'>" +
                "<div class='row'><span>Customer:</span><b>" + booking.getCustomer().getFullName() + "</b></div>" +
                "<div class='row'><span>Customer Email:</span><span>" + booking.getCustomer().getEmail() + "</span></div>" +
                "<div class='row'><span>Event Date:</span><b>" + booking.getEventDate() + "</b></div>" +
                "<div class='row'><span>Time Slot:</span><span>" + booking.getTimeSlot() + "</span></div>" +
                "<div class='row'><span>Event Type:</span><span>" + booking.getEventType() + "</span></div>" +
                "<div class='row'><span>Guest Count:</span><span>" + booking.getGuestCount() + "</span></div></div>" +
                "<div style='font-size:15px;'>" +
                "<div class='row'><span>Venue Base Cost (" + booking.getTimeSlot() + "):</span><span>$" + booking.getBaseCost() + "</span></div>" +
                "<div class='row'><span>Platform Service Fee (10%):</span><span>$" + booking.getServiceFee() + "</span></div>" +
                "<div class='row'><span>Cleaning & Prep Fee:</span><span>$" + booking.getVenue().getCleaningFee() + "</span></div>" +
                "<div class='row total-row'><span>Total Paid / Payable:</span><span style='color:#15803d;'>$" + booking.getTotalCost() + "</span></div></div>" +
                "<button class='print-btn' onclick='window.print()'>Print Receipt</button>" +
                "<p style='text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;'>Smart Event Venue Booking & Management System</p>" +
                "</div></body></html>";
    }
}
