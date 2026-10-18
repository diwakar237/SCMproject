package com.smartvenue.backend.dto;

import com.smartvenue.backend.domain.Vendor;
import com.smartvenue.backend.domain.VendorBooking;
import com.smartvenue.backend.domain.VendorServiceEntity;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class VendorDto {

    public static class VendorRequest {
        @NotBlank(message = "Company name is required")
        private String companyName;

        @NotBlank(message = "Service category is required")
        private String serviceCategory; // CATERING, PHOTOGRAPHY, DECORATION, MUSIC, FLORIST, TRANSPORT

        private String description;

        @NotBlank(message = "City is required")
        private String city;

        @NotNull(message = "Base price is required")
        @DecimalMin(value = "0.0")
        private BigDecimal basePrice;

        @NotBlank(message = "Contact email is required")
        private String contactEmail;

        private String contactPhone;

        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }

        public String getServiceCategory() { return serviceCategory; }
        public void setServiceCategory(String serviceCategory) { this.serviceCategory = serviceCategory; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public BigDecimal getBasePrice() { return basePrice; }
        public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }

        public String getContactEmail() { return contactEmail; }
        public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

        public String getContactPhone() { return contactPhone; }
        public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    }

    public static class VendorServiceRequest {
        @NotBlank(message = "Service name is required")
        private String serviceName;

        private String description;

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0")
        private BigDecimal price;

        private String packageTier = "STANDARD";

        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }

        public String getPackageTier() { return packageTier; }
        public void setPackageTier(String packageTier) { this.packageTier = packageTier; }
    }

    public static class VendorBookingRequest {
        @NotNull(message = "Vendor ID is required")
        private Long vendorId;

        private Long serviceId;

        @NotNull(message = "Event date is required")
        private LocalDate eventDate;

        private String notes;

        public Long getVendorId() { return vendorId; }
        public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

        public Long getServiceId() { return serviceId; }
        public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

        public LocalDate getEventDate() { return eventDate; }
        public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class VendorServiceResponse {
        private Long id;
        private Long vendorId;
        private String serviceName;
        private String description;
        private BigDecimal price;
        private String packageTier;

        public static VendorServiceResponse fromEntity(VendorServiceEntity s) {
            VendorServiceResponse res = new VendorServiceResponse();
            res.id = s.getId();
            res.vendorId = s.getVendor().getId();
            res.serviceName = s.getServiceName();
            res.description = s.getDescription();
            res.price = s.getPrice();
            res.packageTier = s.getPackageTier();
            return res;
        }

        public Long getId() { return id; }
        public Long getVendorId() { return vendorId; }
        public String getServiceName() { return serviceName; }
        public String getDescription() { return description; }
        public BigDecimal getPrice() { return price; }
        public String getPackageTier() { return packageTier; }
    }

    public static class VendorResponse {
        private Long id;
        private Long userId;
        private String ownerName;
        private String companyName;
        private String serviceCategory;
        private String description;
        private String city;
        private BigDecimal basePrice;
        private String contactEmail;
        private String contactPhone;
        private BigDecimal rating;
        private Integer reviewCount;
        private Boolean approved;
        private LocalDateTime createdAt;
        private List<VendorServiceResponse> services;

        public static VendorResponse fromEntity(Vendor v) {
            VendorResponse res = new VendorResponse();
            res.id = v.getId();
            res.userId = v.getUser().getId();
            res.ownerName = v.getUser().getFullName();
            res.companyName = v.getCompanyName();
            res.serviceCategory = v.getServiceCategory();
            res.description = v.getDescription();
            res.city = v.getCity();
            res.basePrice = v.getBasePrice();
            res.contactEmail = v.getContactEmail();
            res.contactPhone = v.getContactPhone();
            res.rating = v.getRating();
            res.reviewCount = v.getReviewCount();
            res.approved = v.getApproved();
            res.createdAt = v.getCreatedAt();
            if (v.getServices() != null) {
                res.services = v.getServices().stream()
                        .map(VendorServiceResponse::fromEntity)
                        .collect(Collectors.toList());
            }
            return res;
        }

        public Long getId() { return id; }
        public Long getUserId() { return userId; }
        public String getOwnerName() { return ownerName; }
        public String getCompanyName() { return companyName; }
        public String getBusinessName() { return companyName; }
        public String getServiceCategory() { return serviceCategory; }
        public String getCategory() { return serviceCategory; }
        public String getDescription() { return description; }
        public String getCity() { return city; }
        public BigDecimal getBasePrice() { return basePrice; }
        public String getContactEmail() { return contactEmail; }
        public String getContactPhone() { return contactPhone; }
        public BigDecimal getRating() { return rating; }
        public Integer getReviewCount() { return reviewCount; }
        public Boolean getApproved() { return approved; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public List<VendorServiceResponse> getServices() { return services; }
    }

    public static class VendorBookingResponse {
        private Long id;
        private Long vendorId;
        private String vendorName;
        private String serviceCategory;
        private Long customerId;
        private String customerName;
        private Long serviceId;
        private String serviceName;
        private LocalDate eventDate;
        private String status;
        private BigDecimal totalPrice;
        private String notes;
        private LocalDateTime createdAt;

        public static VendorBookingResponse fromEntity(VendorBooking b) {
            VendorBookingResponse res = new VendorBookingResponse();
            res.id = b.getId();
            res.vendorId = b.getVendor().getId();
            res.vendorName = b.getVendor().getCompanyName();
            res.serviceCategory = b.getVendor().getServiceCategory();
            res.customerId = b.getCustomer().getId();
            res.customerName = b.getCustomer().getFullName();
            if (b.getService() != null) {
                res.serviceId = b.getService().getId();
                res.serviceName = b.getService().getServiceName();
            }
            res.eventDate = b.getEventDate();
            res.status = b.getStatus();
            res.totalPrice = b.getTotalPrice();
            res.notes = b.getNotes();
            res.createdAt = b.getCreatedAt();
            return res;
        }

        public Long getId() { return id; }
        public Long getVendorId() { return vendorId; }
        public String getVendorName() { return vendorName; }
        public String getServiceCategory() { return serviceCategory; }
        public Long getCustomerId() { return customerId; }
        public String getCustomerName() { return customerName; }
        public Long getServiceId() { return serviceId; }
        public String getServiceName() { return serviceName; }
        public LocalDate getEventDate() { return eventDate; }
        public String getStatus() { return status; }
        public BigDecimal getTotalPrice() { return totalPrice; }
        public String getNotes() { return notes; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }
}
