package com.smartvenue.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class RecommendationDto {

    public static class RecommendationRequest {
        private String eventType;
        private String targetCity;

        @NotNull(message = "Guest count is required")
        @Min(value = 1, message = "Guest count must be at least 1")
        private Integer guestCount;

        private BigDecimal maxBudget;
        private LocalDate date;
        private String timeSlot; // FULL_DAY, MORNING, EVENING
        private List<String> preferredFacilities;

        public RecommendationRequest() {}

        public RecommendationRequest(String eventType, String targetCity, Integer guestCount,
                                     BigDecimal maxBudget, LocalDate date, String timeSlot, List<String> preferredFacilities) {
            this.eventType = eventType;
            this.targetCity = targetCity;
            this.guestCount = guestCount;
            this.maxBudget = maxBudget;
            this.date = date;
            this.timeSlot = timeSlot;
            this.preferredFacilities = preferredFacilities;
        }

        public String getEventType() { return eventType; }
        public void setEventType(String eventType) { this.eventType = eventType; }

        public String getTargetCity() { return targetCity; }
        public void setTargetCity(String targetCity) { this.targetCity = targetCity; }

        public Integer getGuestCount() { return guestCount; }
        public void setGuestCount(Integer guestCount) { this.guestCount = guestCount; }

        public BigDecimal getMaxBudget() { return maxBudget; }
        public void setMaxBudget(BigDecimal maxBudget) { this.maxBudget = maxBudget; }

        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }

        public String getTimeSlot() { return timeSlot; }
        public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

        public List<String> getPreferredFacilities() { return preferredFacilities; }
        public void setPreferredFacilities(List<String> preferredFacilities) { this.preferredFacilities = preferredFacilities; }
    }

    public static class ScoreBreakdown {
        private double overallScore; // 0 - 100
        private double budgetScore; // 0 - 100
        private double locationScore; // 0 - 100
        private double capacityScore; // 0 - 100
        private double eventTypeScore; // 0 - 100
        private double facilitiesScore; // 0 - 100
        private double availabilityScore; // 0 - 100

        public ScoreBreakdown() {}

        public ScoreBreakdown(double overallScore, double budgetScore, double locationScore,
                              double capacityScore, double eventTypeScore, double facilitiesScore,
                              double availabilityScore) {
            this.overallScore = Math.round(overallScore * 10.0) / 10.0;
            this.budgetScore = Math.round(budgetScore * 10.0) / 10.0;
            this.locationScore = Math.round(locationScore * 10.0) / 10.0;
            this.capacityScore = Math.round(capacityScore * 10.0) / 10.0;
            this.eventTypeScore = Math.round(eventTypeScore * 10.0) / 10.0;
            this.facilitiesScore = Math.round(facilitiesScore * 10.0) / 10.0;
            this.availabilityScore = Math.round(availabilityScore * 10.0) / 10.0;
        }

        public double getOverallScore() { return overallScore; }
        public void setOverallScore(double overallScore) { this.overallScore = overallScore; }

        public double getBudgetScore() { return budgetScore; }
        public void setBudgetScore(double budgetScore) { this.budgetScore = budgetScore; }

        public double getLocationScore() { return locationScore; }
        public void setLocationScore(double locationScore) { this.locationScore = locationScore; }

        public double getCapacityScore() { return capacityScore; }
        public void setCapacityScore(double capacityScore) { this.capacityScore = capacityScore; }

        public double getEventTypeScore() { return eventTypeScore; }
        public void setEventTypeScore(double eventTypeScore) { this.eventTypeScore = eventTypeScore; }

        public double getFacilitiesScore() { return facilitiesScore; }
        public void setFacilitiesScore(double facilitiesScore) { this.facilitiesScore = facilitiesScore; }

        public double getAvailabilityScore() { return availabilityScore; }
        public void setAvailabilityScore(double availabilityScore) { this.availabilityScore = availabilityScore; }
    }

    public static class RecommendationResult {
        private VenueDto.VenueResponse venue;
        private ScoreBreakdown scoreBreakdown;
        private String plainExplanation;
        private List<String> matchingHighlights;

        public RecommendationResult() {}

        public RecommendationResult(VenueDto.VenueResponse venue, ScoreBreakdown scoreBreakdown,
                                    String plainExplanation, List<String> matchingHighlights) {
            this.venue = venue;
            this.scoreBreakdown = scoreBreakdown;
            this.plainExplanation = plainExplanation;
            this.matchingHighlights = matchingHighlights;
        }

        public VenueDto.VenueResponse getVenue() { return venue; }
        public void setVenue(VenueDto.VenueResponse venue) { this.venue = venue; }

        public ScoreBreakdown getScoreBreakdown() { return scoreBreakdown; }
        public void setScoreBreakdown(ScoreBreakdown scoreBreakdown) { this.scoreBreakdown = scoreBreakdown; }

        public String getPlainExplanation() { return plainExplanation; }
        public void setPlainExplanation(String plainExplanation) { this.plainExplanation = plainExplanation; }

        public List<String> getMatchingHighlights() { return matchingHighlights; }
        public void setMatchingHighlights(List<String> matchingHighlights) { this.matchingHighlights = matchingHighlights; }
    }
}
