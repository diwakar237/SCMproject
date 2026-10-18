package com.smartvenue.backend.dto;

import com.smartvenue.backend.domain.Review;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class ReviewDto {

    public static class ReviewRequest {
        @NotNull(message = "Booking ID is required")
        private Long bookingId;

        @NotNull(message = "Rating is required (1-5)")
        @Min(1)
        @Max(5)
        private Integer rating;

        @NotBlank(message = "Review comment is required")
        private String comment;

        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
    }

    public static class ReviewResponse {
        private Long id;
        private Long bookingId;
        private Long userId;
        private String authorName;
        private Long venueId;
        private String venueName;
        private Long vendorId;
        private String vendorName;
        private Integer rating;
        private String comment;
        private Boolean isApproved;
        private LocalDateTime createdAt;

        public static ReviewResponse fromEntity(Review r) {
            ReviewResponse res = new ReviewResponse();
            res.id = r.getId();
            res.bookingId = r.getBooking().getId();
            res.userId = r.getUser().getId();
            res.authorName = r.getUser().getFullName();
            if (r.getVenue() != null) {
                res.venueId = r.getVenue().getId();
                res.venueName = r.getVenue().getName();
            }
            if (r.getVendor() != null) {
                res.vendorId = r.getVendor().getId();
                res.vendorName = r.getVendor().getCompanyName();
            }
            res.rating = r.getRating();
            res.comment = r.getComment();
            res.isApproved = r.getIsApproved();
            res.createdAt = r.getCreatedAt();
            return res;
        }

        public Long getId() { return id; }
        public Long getBookingId() { return bookingId; }
        public Long getUserId() { return userId; }
        public String getAuthorName() { return authorName; }
        public Long getVenueId() { return venueId; }
        public String getVenueName() { return venueName; }
        public Long getVendorId() { return vendorId; }
        public String getVendorName() { return vendorName; }
        public Integer getRating() { return rating; }
        public String getComment() { return comment; }
        public Boolean getIsApproved() { return isApproved; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }
}
