package com.smartvenue.backend;

import com.smartvenue.backend.domain.*;
import com.smartvenue.backend.dto.BookingDto;
import com.smartvenue.backend.exception.Exceptions;
import com.smartvenue.backend.repository.BookingRepository;
import com.smartvenue.backend.repository.UserRepository;
import com.smartvenue.backend.service.BookingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev-h2")
public class BookingServiceAndConflictTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testBookingCreationAndCostCalculation() {
        User customer = userRepository.findById(1L).orElseThrow();

        BookingDto.BookingCreateRequest req = new BookingDto.BookingCreateRequest();
        req.setVenueId(2L); // Emerald Horizon: basePricePerDay = 3800, cleaningFee = 300, capacity = 350
        req.setEventDate(LocalDate.now().plusDays(45));
        req.setTimeSlot(TimeSlot.FULL_DAY);
        req.setEventType("WEDDING");
        req.setGuestCount(200);
        req.setNotes("Test booking notes");

        BookingDto.BookingResponse res = bookingService.createBooking(req, customer);

        assertNotNull(res.getId());
        assertTrue(res.getBookingReference().startsWith("BK-"));
        assertEquals(BookingStatus.PENDING, res.getStatus());
        // baseCost = 3800.00, serviceFee = 380.00 (10%), cleaning = 300.00, total = 4480.00
        assertEquals(new BigDecimal("3800.00"), res.getBaseCost());
        assertEquals(new BigDecimal("380.00"), res.getServiceFee());
        assertEquals(new BigDecimal("4480.00"), res.getTotalCost());
    }

    @Test
    void testCapacityOverflowValidationThrowsBadRequest() {
        User customer = userRepository.findById(1L).orElseThrow();

        BookingDto.BookingCreateRequest req = new BookingDto.BookingCreateRequest();
        req.setVenueId(2L); // Capacity = 350
        req.setEventDate(LocalDate.now().plusDays(50));
        req.setTimeSlot(TimeSlot.FULL_DAY);
        req.setEventType("CONFERENCE");
        req.setGuestCount(600); // Exceeds 350!

        assertThrows(Exceptions.BadRequestException.class, () -> {
            bookingService.createBooking(req, customer);
        });
    }

    @Test
    void testOwnerApproveStatusTransition() {
        User customer = userRepository.findById(1L).orElseThrow();
        User owner = userRepository.findById(2L).orElseThrow();

        BookingDto.BookingCreateRequest req = new BookingDto.BookingCreateRequest();
        req.setVenueId(4L);
        req.setEventDate(LocalDate.now().plusDays(60));
        req.setTimeSlot(TimeSlot.MORNING);
        req.setEventType("BANQUET");
        req.setGuestCount(150);

        BookingDto.BookingResponse pending = bookingService.createBooking(req, customer);
        assertEquals(BookingStatus.PENDING, pending.getStatus());

        BookingDto.BookingStatusUpdateRequest approveReq = new BookingDto.BookingStatusUpdateRequest();
        approveReq.setStatus(BookingStatus.CONFIRMED);
        approveReq.setRemarks("Approved by Bob VenueOwner");

        BookingDto.BookingResponse confirmed = bookingService.updateBookingStatus(
                pending.getId(), approveReq, owner);

        assertEquals(BookingStatus.CONFIRMED, confirmed.getStatus());
        assertFalse(confirmed.getHistory().isEmpty());
    }

    @Test
    void testPreventOverlappingConfirmedBookings() {
        User customer = userRepository.findById(1L).orElseThrow();
        User owner = userRepository.findById(2L).orElseThrow();
        LocalDate targetDate = LocalDate.now().plusDays(70);

        // 1. Create first booking request
        BookingDto.BookingCreateRequest req1 = new BookingDto.BookingCreateRequest();
        req1.setVenueId(5L);
        req1.setEventDate(targetDate);
        req1.setTimeSlot(TimeSlot.FULL_DAY);
        req1.setEventType("WEDDING");
        req1.setGuestCount(100);
        BookingDto.BookingResponse b1 = bookingService.createBooking(req1, customer);

        // 2. Owner confirms first booking
        BookingDto.BookingStatusUpdateRequest approveReq = new BookingDto.BookingStatusUpdateRequest();
        approveReq.setStatus(BookingStatus.CONFIRMED);
        bookingService.updateBookingStatus(b1.getId(), approveReq, owner);

        // 3. Second customer attempts to create overlapping booking on same date
        BookingDto.BookingCreateRequest req2 = new BookingDto.BookingCreateRequest();
        req2.setVenueId(5L);
        req2.setEventDate(targetDate);
        req2.setTimeSlot(TimeSlot.FULL_DAY);
        req2.setEventType("CONCERT");
        req2.setGuestCount(120);

        // Should be rejected at request time with ConflictException
        assertThrows(Exceptions.ConflictException.class, () -> {
            bookingService.createBooking(req2, customer);
        });
    }

    @Test
    void testConcurrentOverlappingApprovalConflictProtection() throws InterruptedException {
        User customer = userRepository.findById(1L).orElseThrow();
        User owner = userRepository.findById(2L).orElseThrow();
        LocalDate targetDate = LocalDate.now().plusDays(85);

        // Create two pending bookings for different customers/slots that conflict (e.g. MORNING vs FULL_DAY)
        BookingDto.BookingCreateRequest req1 = new BookingDto.BookingCreateRequest();
        req1.setVenueId(6L);
        req1.setEventDate(targetDate);
        req1.setTimeSlot(TimeSlot.MORNING);
        req1.setEventType("SEMINAR");
        req1.setGuestCount(50);
        BookingDto.BookingResponse b1 = bookingService.createBooking(req1, customer);

        BookingDto.BookingCreateRequest req2 = new BookingDto.BookingCreateRequest();
        req2.setVenueId(6L);
        req2.setEventDate(targetDate);
        req2.setTimeSlot(TimeSlot.FULL_DAY);
        req2.setEventType("EXPO");
        req2.setGuestCount(100);
        BookingDto.BookingResponse b2 = bookingService.createBooking(req2, customer);

        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);

        // Thread 1 attempts to confirm b1
        executor.submit(() -> {
            try {
                startLatch.await();
                BookingDto.BookingStatusUpdateRequest r = new BookingDto.BookingStatusUpdateRequest();
                r.setStatus(BookingStatus.CONFIRMED);
                bookingService.updateBookingStatus(b1.getId(), r, owner);
                successCount.incrementAndGet();
            } catch (Exceptions.ConflictException e) {
                conflictCount.incrementAndGet();
            } catch (Exception e) {
                // Other unexpected exception
            } finally {
                doneLatch.countDown();
            }
        });

        // Thread 2 attempts to confirm b2
        executor.submit(() -> {
            try {
                startLatch.await();
                BookingDto.BookingStatusUpdateRequest r = new BookingDto.BookingStatusUpdateRequest();
                r.setStatus(BookingStatus.CONFIRMED);
                bookingService.updateBookingStatus(b2.getId(), r, owner);
                successCount.incrementAndGet();
            } catch (Exceptions.ConflictException e) {
                conflictCount.incrementAndGet();
            } catch (Exception e) {
                // Other unexpected exception
            } finally {
                doneLatch.countDown();
            }
        });

        // Fire both simultaneously
        startLatch.countDown();
        boolean completed = doneLatch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(completed, "Concurrent threads should complete");
        // Exactly one should succeed, and one should be caught by conflict protection
        assertEquals(1, successCount.get(), "Exactly one booking confirmation must succeed");
        assertEquals(1, conflictCount.get(), "The competing booking must be rejected with ConflictException");
    }

    @Test
    void testCancellationPolicyAndHistory() {
        User customer = userRepository.findById(1L).orElseThrow();

        BookingDto.BookingCreateRequest req = new BookingDto.BookingCreateRequest();
        req.setVenueId(7L);
        req.setEventDate(LocalDate.now().plusDays(30)); // 30 days prior (>7 days = full refund)
        req.setTimeSlot(TimeSlot.EVENING);
        req.setEventType("BIRTHDAY");
        req.setGuestCount(40);
        BookingDto.BookingResponse booking = bookingService.createBooking(req, customer);

        BookingDto.BookingCancelRequest cancelReq = new BookingDto.BookingCancelRequest();
        cancelReq.setReason("Change of plans");

        BookingDto.BookingResponse cancelled = bookingService.cancelBooking(
                booking.getId(), cancelReq, customer);

        assertEquals(BookingStatus.CANCELLED, cancelled.getStatus());
        assertTrue(cancelled.getCancellationReason().contains("Full refund eligible"));
    }
}
