package com.smartvenue.backend;

import com.smartvenue.backend.domain.*;
import com.smartvenue.backend.dto.PaymentDto;
import com.smartvenue.backend.exception.Exceptions;
import com.smartvenue.backend.repository.BookingRepository;
import com.smartvenue.backend.repository.PaymentRepository;
import com.smartvenue.backend.service.AuditService;
import com.smartvenue.backend.service.NotificationService;
import com.smartvenue.backend.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditService auditService;

    private PaymentService paymentService;

    private User customer;
    private User otherCustomer;
    private Booking booking;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(paymentRepository, bookingRepository, notificationService, auditService);

        customer = new User();
        customer.setId(1L);
        customer.setEmail("customer@demo.com");
        customer.setFullName("Demo Customer");
        customer.setRole(UserRole.CUSTOMER);

        otherCustomer = new User();
        otherCustomer.setId(2L);
        otherCustomer.setEmail("intruder@demo.com");
        otherCustomer.setRole(UserRole.CUSTOMER);

        Venue venue = new Venue();
        venue.setId(10L);
        venue.setName("Sunset Pavilion");

        booking = new Booking();
        booking.setId(100L);
        booking.setUser(customer);
        booking.setVenue(venue);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setTotalCost(BigDecimal.valueOf(2500.00));
        booking.setBookingReference("BK-TEST-1234");
    }

    @Test
    void processMockPayment_successfulExecution() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> {
            Payment p = i.getArgument(0);
            p.setId(1L);
            return p;
        });

        PaymentDto.PaymentRequest req = new PaymentDto.PaymentRequest();
        req.setBookingId(100L);
        req.setAmount(BigDecimal.valueOf(2500.00));
        req.setPaymentMethod("MOCK_CARD");

        PaymentDto.PaymentResponse res = paymentService.processMockPayment(req, customer);

        assertNotNull(res);
        assertEquals("COMPLETED", res.getStatus());
        assertTrue(res.getTransactionReference().startsWith("TXN-"));
        assertEquals("MOCK_PAY_GATEWAY", res.getMockProvider());
        verify(auditService, times(1)).record(eq("customer@demo.com"), eq("PAYMENT_SUCCESS"), eq("BOOKING"), eq("100"), anyString());
        verify(notificationService, times(1)).createNotification(eq(customer), contains("Payment Confirmed"), anyString());
    }

    @Test
    void processMockPayment_rejectsUnauthorizedUser() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        PaymentDto.PaymentRequest req = new PaymentDto.PaymentRequest();
        req.setBookingId(100L);
        req.setAmount(BigDecimal.valueOf(2500.00));
        req.setPaymentMethod("MOCK_CARD");

        assertThrows(Exceptions.ForbiddenException.class, () -> {
            paymentService.processMockPayment(req, otherCustomer);
        });
    }

    @Test
    void processMockPayment_rejectsCancelledBooking() {
        booking.setStatus(BookingStatus.CANCELLED);
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        PaymentDto.PaymentRequest req = new PaymentDto.PaymentRequest();
        req.setBookingId(100L);
        req.setAmount(BigDecimal.valueOf(2500.00));
        req.setPaymentMethod("MOCK_CARD");

        assertThrows(Exceptions.ValidationException.class, () -> {
            paymentService.processMockPayment(req, customer);
        });
    }
}
