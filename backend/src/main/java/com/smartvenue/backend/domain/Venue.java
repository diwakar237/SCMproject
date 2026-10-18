package com.smartvenue.backend.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "venues")
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "base_price_per_day", nullable = false, precision = 12, scale = 2)
    private BigDecimal basePricePerDay;

    @Column(name = "cleaning_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal cleaningFee = BigDecimal.ZERO;

    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal rating = new BigDecimal("5.00");

    @Column(name = "review_count", nullable = false)
    private Integer reviewCount = 0;

    @Column(name = "supported_event_types", nullable = false, length = 500)
    private String supportedEventTypes;

    @Column(nullable = false, length = 1000)
    private String facilities;

    @Column(name = "image_urls", columnDefinition = "TEXT", nullable = false)
    private String imageUrls;

    @Column(nullable = false)
    private Boolean approved = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Venue() {}

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

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

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }

    public String getSupportedEventTypes() { return supportedEventTypes; }
    public void setSupportedEventTypes(String supportedEventTypes) { this.supportedEventTypes = supportedEventTypes; }

    public String getFacilities() { return facilities; }
    public void setFacilities(String facilities) { this.facilities = facilities; }

    public String getImageUrls() { return imageUrls; }
    public void setImageUrls(String imageUrls) { this.imageUrls = imageUrls; }

    public Boolean getApproved() { return approved; }
    public boolean isApproved() { return Boolean.TRUE.equals(approved); }
    public void setApproved(Boolean approved) { this.approved = approved; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
