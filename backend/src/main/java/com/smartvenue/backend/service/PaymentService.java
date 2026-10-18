package com.smartvenue.backend.service;

import com.smartvenue.backend.domain.Booking;
import com.smartvenue.backend.domain.BookingStatus;
import com.smartvenue.backend.domain.Payment;
import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.dto.PaymentDto;
import com.smartvenue.backend.exception.Exceptions;
import com.smartvenue.backend.repository.BookingRepository;
import com.smartvenue.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public PaymentService(PaymentRepository paymentRepository,
                          BookingRepository bookingRepository,
                          NotificationService notificationService,
                          AuditService auditService) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional
    public PaymentDto.PaymentResponse processMockPayment(PaymentDto.PaymentRequest request, User user) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Booking not found with ID: " + request.getBookingId()));

        if (!booking.getUser().getId().equals(user.getId()) && user.getRole() != com.smartvenue.backend.domain.UserRole.ADMIN) {
            throw new Exceptions.ForbiddenException("You do not have permission to pay for this booking.");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.REJECTED) {
            throw new Exceptions.ValidationException("Cannot process payment for a " + booking.getStatus() + " booking.");
        }

        // Mock payment processing simulation
        String txnRef = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() + "-" + System.currentTimeMillis() % 10000;

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setUser(user);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod().toUpperCase());
        payment.setTransactionReference(txnRef);
        payment.setMockProvider("MOCK_PAY_GATEWAY");
        payment.setStatus("COMPLETED");
        payment.setReceiptNotes("MOCK TRANSACTION: Approved by Simulated Sandbox Gateway. Ref: " + txnRef);

        Payment saved = paymentRepository.save(payment);

        // Record Audit Trail
        auditService.record(
                user.getEmail(),
                "PAYMENT_SUCCESS",
                "BOOKING",
                booking.getId().toString(),
                "Processed mock payment of $" + request.getAmount() + " with reference: " + txnRef
        );

        // Notify customer
        notificationService.createNotification(
                user,
                "Payment Confirmed",
                "Your payment of $" + request.getAmount() + " for booking " + booking.getBookingReference() + " was successfully processed (Mock Ref: " + txnRef + ")."
        );

        return PaymentDto.PaymentResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<PaymentDto.PaymentResponse> getUserPayments(Long userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(PaymentDto.PaymentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentDto.PaymentResponse> getBookingPayments(Long bookingId, User user) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if (!booking.getUser().getId().equals(user.getId()) &&
                !booking.getVenue().getOwner().getId().equals(user.getId()) &&
                user.getRole() != com.smartvenue.backend.domain.UserRole.ADMIN) {
            throw new Exceptions.ForbiddenException("You are not authorized to view payments for this booking.");
        }

        return paymentRepository.findByBookingIdOrderByCreatedAtDesc(bookingId)
                .stream()
                .map(PaymentDto.PaymentResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
