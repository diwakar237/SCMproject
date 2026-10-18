package com.smartvenue.backend.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_budgets")
public class EventBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "event_title", nullable = false, length = 150)
    private String eventTitle;

    @Column(name = "total_limit", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalLimit;

    @Column(name = "venue_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal venueCost = BigDecimal.ZERO;

    @Column(name = "catering_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal cateringCost = BigDecimal.ZERO;

    @Column(name = "decoration_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal decorationCost = BigDecimal.ZERO;

    @Column(name = "photography_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal photographyCost = BigDecimal.ZERO;

    @Column(name = "entertainment_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal entertainmentCost = BigDecimal.ZERO;

    @Column(name = "other_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal otherCost = BigDecimal.ZERO;

    @Column(name = "contingency_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal contingencyPercent = BigDecimal.valueOf(10.0);

    @Column(name = "contingency_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal contingencyAmount = BigDecimal.ZERO;

    @Column(name = "total_estimated_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalEstimatedCost = BigDecimal.ZERO;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency = "USD";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public EventBudget() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }

    public BigDecimal getTotalLimit() { return totalLimit; }
    public void setTotalLimit(BigDecimal totalLimit) { this.totalLimit = totalLimit; }

    public BigDecimal getVenueCost() { return venueCost; }
    public void setVenueCost(BigDecimal venueCost) { this.venueCost = venueCost; }

    public BigDecimal getCateringCost() { return cateringCost; }
    public void setCateringCost(BigDecimal cateringCost) { this.cateringCost = cateringCost; }

    public BigDecimal getDecorationCost() { return decorationCost; }
    public void setDecorationCost(BigDecimal decorationCost) { this.decorationCost = decorationCost; }

    public BigDecimal getPhotographyCost() { return photographyCost; }
    public void setPhotographyCost(BigDecimal photographyCost) { this.photographyCost = photographyCost; }

    public BigDecimal getEntertainmentCost() { return entertainmentCost; }
    public void setEntertainmentCost(BigDecimal entertainmentCost) { this.entertainmentCost = entertainmentCost; }

    public BigDecimal getOtherCost() { return otherCost; }
    public void setOtherCost(BigDecimal otherCost) { this.otherCost = otherCost; }

    public BigDecimal getContingencyPercent() { return contingencyPercent; }
    public void setContingencyPercent(BigDecimal contingencyPercent) { this.contingencyPercent = contingencyPercent; }

    public BigDecimal getContingencyAmount() { return contingencyAmount; }
    public void setContingencyAmount(BigDecimal contingencyAmount) { this.contingencyAmount = contingencyAmount; }

    public BigDecimal getTotalEstimatedCost() { return totalEstimatedCost; }
    public void setTotalEstimatedCost(BigDecimal totalEstimatedCost) { this.totalEstimatedCost = totalEstimatedCost; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
