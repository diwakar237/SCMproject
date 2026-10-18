package com.smartvenue.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.smartvenue.backend.domain.EventBudget;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;


public class BudgetDto {

    public static class BudgetRequest {
        @NotBlank(message = "Event title is required")
        private String eventTitle;

        @NotNull(message = "Total budget limit is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Total limit must be non-negative")
        private BigDecimal totalLimit;

        private BigDecimal venueCost = BigDecimal.ZERO;
        private BigDecimal cateringCost = BigDecimal.ZERO;
        private BigDecimal decorationCost = BigDecimal.ZERO;
        private BigDecimal photographyCost = BigDecimal.ZERO;
        private BigDecimal entertainmentCost = BigDecimal.ZERO;
        private BigDecimal otherCost = BigDecimal.ZERO;
        private BigDecimal contingencyPercent = BigDecimal.valueOf(10.0);
        private String currency = "USD";

        public BudgetRequest() {}

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

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
    }

    public static class BudgetResponse {
        private Long id;
        private Long userId;
        private String userName;
        private String eventTitle;
        private BigDecimal totalLimit;
        private BigDecimal venueCost;
        private BigDecimal cateringCost;
        private BigDecimal decorationCost;
        private BigDecimal photographyCost;
        private BigDecimal entertainmentCost;
        private BigDecimal otherCost;
        private BigDecimal subtotal;
        private BigDecimal contingencyPercent;
        private BigDecimal contingencyAmount;
        private BigDecimal totalEstimatedCost;
        private BigDecimal variance; // totalLimit - totalEstimatedCost (positive = under budget, negative = over budget)
        @JsonProperty("isOverBudget")
        private boolean isOverBudget;
        private String currency;

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static BudgetResponse fromEntity(EventBudget b) {
            BudgetResponse res = new BudgetResponse();
            res.id = b.getId();
            res.userId = b.getUser() != null ? b.getUser().getId() : null;
            res.userName = b.getUser() != null ? b.getUser().getFullName() : null;
            res.eventTitle = b.getEventTitle();
            res.totalLimit = b.getTotalLimit();
            res.venueCost = b.getVenueCost();
            res.cateringCost = b.getCateringCost();
            res.decorationCost = b.getDecorationCost();
            res.photographyCost = b.getPhotographyCost();
            res.entertainmentCost = b.getEntertainmentCost();
            res.otherCost = b.getOtherCost();
            res.subtotal = b.getVenueCost().add(b.getCateringCost())
                    .add(b.getDecorationCost())
                    .add(b.getPhotographyCost())
                    .add(b.getEntertainmentCost())
                    .add(b.getOtherCost()).setScale(2, java.math.RoundingMode.HALF_UP);
            res.contingencyPercent = b.getContingencyPercent();
            res.contingencyAmount = b.getContingencyAmount();
            res.totalEstimatedCost = b.getTotalEstimatedCost();
            res.variance = b.getTotalLimit().subtract(b.getTotalEstimatedCost());
            res.isOverBudget = res.variance.compareTo(BigDecimal.ZERO) < 0;
            res.currency = b.getCurrency();
            res.createdAt = b.getCreatedAt();
            res.updatedAt = b.getUpdatedAt();
            return res;
        }

        public Long getId() { return id; }
        public Long getUserId() { return userId; }
        public String getUserName() { return userName; }
        public String getEventTitle() { return eventTitle; }
        public BigDecimal getTotalLimit() { return totalLimit; }
        public BigDecimal getVenueCost() { return venueCost; }
        public BigDecimal getCateringCost() { return cateringCost; }
        public BigDecimal getDecorationCost() { return decorationCost; }
        public BigDecimal getPhotographyCost() { return photographyCost; }
        public BigDecimal getEntertainmentCost() { return entertainmentCost; }
        public BigDecimal getOtherCost() { return otherCost; }
        public BigDecimal getSubtotal() { return subtotal; }
        public BigDecimal getContingencyPercent() { return contingencyPercent; }
        public BigDecimal getContingencyAmount() { return contingencyAmount; }
        public BigDecimal getTotalEstimatedCost() { return totalEstimatedCost; }
        public BigDecimal getVariance() { return variance; }
        @JsonProperty("isOverBudget")
        public boolean isOverBudget() { return isOverBudget; }
        public boolean getIsOverBudget() { return isOverBudget; }
        public String getCurrency() { return currency; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
    }
}
