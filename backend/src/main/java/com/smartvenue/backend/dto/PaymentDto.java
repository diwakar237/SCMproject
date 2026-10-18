package com.smartvenue.backend.dto;

import com.smartvenue.backend.domain.Payment;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentDto {

    public static class PaymentRequest {
        @NotNull(message = "Booking ID is required")
        private Long bookingId;

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "1.00", message = "Amount must be at least 1.00")
        private BigDecimal amount;

        @NotBlank(message = "Payment method is required")
        private String paymentMethod; // MOCK_CARD, MOCK_PAYPAL, MOCK_BANK_TRANSFER

        private String currency;
        private String mockCardNumber; // Fictional test digits
        private String mockCardExpiry;
        private String mockCardCvv;

        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }

        public String getMockCardNumber() { return mockCardNumber; }
        public void setMockCardNumber(String mockCardNumber) { this.mockCardNumber = mockCardNumber; }

        public String getMockCardExpiry() { return mockCardExpiry; }
        public void setMockCardExpiry(String mockCardExpiry) { this.mockCardExpiry = mockCardExpiry; }

        public String getMockCardCvv() { return mockCardCvv; }
        public void setMockCardCvv(String mockCardCvv) { this.mockCardCvv = mockCardCvv; }
    }

    public static class PaymentResponse {
        private Long id;
        private Long bookingId;
        private String bookingReference;
        private Long userId;
        private String customerName;
        private BigDecimal amount;
        private String paymentMethod;
        private String transactionReference;
        private String status;
        private String mockProvider;
        private String receiptNotes;
        private LocalDateTime createdAt;

        public static PaymentResponse fromEntity(Payment p) {
            PaymentResponse res = new PaymentResponse();
            res.id = p.getId();
            res.bookingId = p.getBooking().getId();
            res.bookingReference = p.getBooking().getBookingReference();
            res.userId = p.getUser().getId();
            res.customerName = p.getUser().getFullName();
            res.amount = p.getAmount();
            res.paymentMethod = p.getPaymentMethod();
            res.transactionReference = p.getTransactionReference();
            res.status = p.getStatus();
            res.mockProvider = p.getMockProvider();
            res.receiptNotes = p.getReceiptNotes();
            res.createdAt = p.getCreatedAt();
            return res;
        }

        public Long getId() { return id; }
        public Long getBookingId() { return bookingId; }
        public String getBookingReference() { return bookingReference; }
        public Long getUserId() { return userId; }
        public String getCustomerName() { return customerName; }
        public BigDecimal getAmount() { return amount; }
        public String getPaymentMethod() { return paymentMethod; }
        public String getTransactionReference() { return transactionReference; }
        public String getStatus() { return status; }
        public String getMockProvider() { return mockProvider; }
        public String getPaymentProvider() { return mockProvider; }
        public String getReceiptNotes() { return receiptNotes; }
        public String getReceiptNumber() { return transactionReference; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }
}
