package com.smartvenue.backend.dto;

import com.smartvenue.backend.domain.Booking;
import com.smartvenue.backend.domain.BookingStatus;
import com.smartvenue.backend.domain.BookingStatusHistory;
import com.smartvenue.backend.domain.TimeSlot;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class BookingDto {

    public static class BookingCreateRequest {
        @NotNull(message = "Venue ID is required")
        private Long venueId;

        @NotNull(message = "Event date is required")
        @FutureOrPresent(message = "Event date must be today or in the future")
        private LocalDate eventDate;

        @NotNull(message = "Time slot is required")
        private TimeSlot timeSlot;

        @NotBlank(message = "Event type is required")
        private String eventType;

        @NotNull(message = "Guest count is required")
        @Min(value = 1, message = "Guest count must be at least 1")
        private Integer guestCount;

        private String notes;

        public Long getVenueId() { return venueId; }
        public void setVenueId(Long venueId) { this.venueId = venueId; }
        public LocalDate getEventDate() { return eventDate; }
        public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }
        public TimeSlot getTimeSlot() { return timeSlot; }
        public void setTimeSlot(TimeSlot timeSlot) { this.timeSlot = timeSlot; }
        public String getEventType() { return eventType; }
        public void setEventType(String eventType) { this.eventType = eventType; }
        public Integer getGuestCount() { return guestCount; }
        public void setGuestCount(Integer guestCount) { this.guestCount = guestCount; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class BookingStatusUpdateRequest {
        @NotNull(message = "Status is required")
        private BookingStatus status;

        private String remarks;

        public BookingStatus getStatus() { return status; }
        public void setStatus(BookingStatus status) { this.status = status; }
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }

    public static class BookingCancelRequest {
        @NotBlank(message = "Cancellation reason is required")
        private String reason;

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class StatusHistoryDto {
        private Long id;
        private BookingStatus fromStatus;
        private BookingStatus toStatus;
        private String changedByName;
        private String remarks;
        private LocalDateTime createdAt;

        public StatusHistoryDto(BookingStatusHistory history) {
            this.id = history.getId();
            this.fromStatus = history.getFromStatus();
            this.toStatus = history.getToStatus();
            this.changedByName = history.getChangedBy() != null ? history.getChangedBy().getFullName() : "System";
            this.remarks = history.getRemarks();
            this.createdAt = history.getCreatedAt();
        }

        public Long getId() { return id; }
        public BookingStatus getFromStatus() { return fromStatus; }
        public BookingStatus getToStatus() { return toStatus; }
        public String getChangedByName() { return changedByName; }
        public String getRemarks() { return remarks; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }

    public static class BookingResponse {
        private Long id;
        private String bookingReference;
        private Long venueId;
        private String venueName;
        private String venueCity;
        private Long customerId;
        private String customerName;
        private String customerEmail;
        private LocalDate eventDate;
        private TimeSlot timeSlot;
        private String eventType;
        private Integer guestCount;
        private BigDecimal baseCost;
        private BigDecimal serviceFee;
        private BigDecimal totalCost;
        private BookingStatus status;
        private String notes;
        private String cancellationReason;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<StatusHistoryDto> history;

        public BookingResponse() {}

        public BookingResponse(Booking booking, List<BookingStatusHistory> history) {
            this.id = booking.getId();
            this.bookingReference = booking.getBookingReference();
            this.venueId = booking.getVenue() != null ? booking.getVenue().getId() : null;
            this.venueName = booking.getVenue() != null ? booking.getVenue().getName() : null;
            this.venueCity = booking.getVenue() != null ? booking.getVenue().getCity() : null;
            this.customerId = booking.getCustomer() != null ? booking.getCustomer().getId() : null;
            this.customerName = booking.getCustomer() != null ? booking.getCustomer().getFullName() : null;
            this.customerEmail = booking.getCustomer() != null ? booking.getCustomer().getEmail() : null;
            this.eventDate = booking.getEventDate();
            this.timeSlot = booking.getTimeSlot();
            this.eventType = booking.getEventType();
            this.guestCount = booking.getGuestCount();
            this.baseCost = booking.getBaseCost();
            this.serviceFee = booking.getServiceFee();
            this.totalCost = booking.getTotalCost();
            this.status = booking.getStatus();
            this.notes = booking.getNotes();
            this.cancellationReason = booking.getCancellationReason();
            this.createdAt = booking.getCreatedAt();
            this.updatedAt = booking.getUpdatedAt();
            if (history != null) {
                this.history = history.stream().map(StatusHistoryDto::new).collect(Collectors.toList());
            }
        }

        public Long getId() { return id; }
        public String getBookingReference() { return bookingReference; }
        public Long getVenueId() { return venueId; }
        public String getVenueName() { return venueName; }
        public String getVenueCity() { return venueCity; }
        public Long getCustomerId() { return customerId; }
        public String getCustomerName() { return customerName; }
        public String getCustomerEmail() { return customerEmail; }
        public LocalDate getEventDate() { return eventDate; }
        public TimeSlot getTimeSlot() { return timeSlot; }
        public String getEventType() { return eventType; }
        public Integer getGuestCount() { return guestCount; }
        public BigDecimal getBaseCost() { return baseCost; }
        public BigDecimal getServiceFee() { return serviceFee; }
        public BigDecimal getTotalCost() { return totalCost; }
        public BookingStatus getStatus() { return status; }
        public String getNotes() { return notes; }
        public String getCancellationReason() { return cancellationReason; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public List<StatusHistoryDto> getHistory() { return history; }
    }
}
