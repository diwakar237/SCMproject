package com.smartvenue.backend.dto;

import com.smartvenue.backend.domain.Venue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class VenueDto {

    public static class VenueResponse {
        private Long id;
        private Long ownerId;
        private String ownerName;
        private String name;
        private String city;
        private String address;
        private String description;
        private String category;
        private Integer capacity;
        private BigDecimal basePricePerDay;
        private BigDecimal cleaningFee;
        private BigDecimal rating;
        private Integer reviewCount;
        private String supportedEventTypes;
        private String facilities;
        private String imageUrls;
        private Boolean approved;

        public VenueResponse() {}

        public VenueResponse(Venue venue) {
            this.id = venue.getId();
            this.ownerId = venue.getOwner() != null ? venue.getOwner().getId() : null;
            this.ownerName = venue.getOwner() != null ? venue.getOwner().getFullName() : null;
            this.name = venue.getName();
            this.city = venue.getCity();
            this.address = venue.getAddress();
            this.description = venue.getDescription();
            this.category = venue.getCategory();
            this.capacity = venue.getCapacity();
            this.basePricePerDay = venue.getBasePricePerDay();
            this.cleaningFee = venue.getCleaningFee();
            this.rating = venue.getRating();
            this.reviewCount = venue.getReviewCount();
            this.supportedEventTypes = venue.getSupportedEventTypes();
            this.facilities = venue.getFacilities();
            this.imageUrls = venue.getImageUrls();
            this.approved = venue.getApproved();
        }

        public static VenueResponse fromEntity(Venue venue) {
            return new VenueResponse(venue);
        }

        public Long getId() { return id; }
        public Long getOwnerId() { return ownerId; }
        public String getOwnerName() { return ownerName; }
        public String getName() { return name; }
        public String getCity() { return city; }
        public String getAddress() { return address; }
        public String getDescription() { return description; }
        public String getCategory() { return category; }
        public Integer getCapacity() { return capacity; }
        public BigDecimal getBasePricePerDay() { return basePricePerDay; }
        public BigDecimal getCleaningFee() { return cleaningFee; }
        public BigDecimal getRating() { return rating; }
        public Integer getReviewCount() { return reviewCount; }
        public String getSupportedEventTypes() { return supportedEventTypes; }
        public String getFacilities() { return facilities; }
        public String getImageUrls() { return imageUrls; }
        public Boolean getApproved() { return approved; }
    }

    public static class VenueCreateUpdateRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "City is required")
        private String city;

        @NotBlank(message = "Address is required")
        private String address;

        private String description;

        @NotBlank(message = "Category is required")
        private String category;

        @NotNull(message = "Capacity is required")
        @Min(value = 1, message = "Capacity must be at least 1")
        private Integer capacity;

        @NotNull(message = "Base price is required")
        @Min(value = 0, message = "Base price cannot be negative")
        private BigDecimal basePricePerDay;

        private BigDecimal cleaningFee = BigDecimal.ZERO;

        @NotBlank(message = "Supported event types are required")
        private String supportedEventTypes;

        @NotBlank(message = "Facilities are required")
        private String facilities;

        @NotBlank(message = "At least one image URL is required")
        private String imageUrls;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public Integer getCapacity() { return capacity; }
        public void setCapacity(Integer capacity) { this.capacity = capacity; }
        public BigDecimal getBasePricePerDay() { return basePricePerDay; }
        public void setBasePricePerDay(BigDecimal basePricePerDay) { this.basePricePerDay = basePricePerDay; }
        public BigDecimal getCleaningFee() { return cleaningFee; }
        public void setCleaningFee(BigDecimal cleaningFee) { this.cleaningFee = cleaningFee; }
        public String getSupportedEventTypes() { return supportedEventTypes; }
        public void setSupportedEventTypes(String supportedEventTypes) { this.supportedEventTypes = supportedEventTypes; }
        public String getFacilities() { return facilities; }
        public void setFacilities(String facilities) { this.facilities = facilities; }
        public String getImageUrls() { return imageUrls; }
        public void setImageUrls(String imageUrls) { this.imageUrls = imageUrls; }
    }

    public static class VenueAvailabilityResponse {
        private Long venueId;
        private LocalDate date;
        private boolean available;
        private List<String> bookedSlots;

        public VenueAvailabilityResponse(Long venueId, LocalDate date, boolean available, List<String> bookedSlots) {
            this.venueId = venueId;
            this.date = date;
            this.available = available;
            this.bookedSlots = bookedSlots;
        }

        public Long getVenueId() { return venueId; }
        public LocalDate getDate() { return date; }
        public boolean isAvailable() { return available; }
        public List<String> getBookedSlots() { return bookedSlots; }
    }
}
