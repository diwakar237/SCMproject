package com.smartvenue.backend.controller;

import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.dto.PaymentDto;
import com.smartvenue.backend.service.AuthService;
import com.smartvenue.backend.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payment Gateway", description = "Mock payment gateway with transaction tracking and audit records")
public class PaymentController {

    private final PaymentService paymentService;
    private final AuthService authService;

    public PaymentController(PaymentService paymentService, AuthService authService) {
        this.paymentService = paymentService;
        this.authService = authService;
    }

    @PostMapping({"/process", "/mock-charge"})
    @Operation(summary = "Process simulated mock payment for booking")
    public ResponseEntity<PaymentDto.PaymentResponse> processPayment(@Valid @RequestBody PaymentDto.PaymentRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(paymentService.processMockPayment(request, user));
    }

    @GetMapping("/my")
    @Operation(summary = "Get payment history for current user")
    public ResponseEntity<List<PaymentDto.PaymentResponse>> getMyPayments() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(paymentService.getUserPayments(user.getId()));
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get payments for specific booking")
    public ResponseEntity<List<PaymentDto.PaymentResponse>> getBookingPayments(@PathVariable Long bookingId) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(paymentService.getBookingPayments(bookingId, user));
    }
}
