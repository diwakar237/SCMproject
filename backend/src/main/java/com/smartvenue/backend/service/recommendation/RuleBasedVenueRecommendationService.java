package com.smartvenue.backend.service.recommendation;

import com.smartvenue.backend.domain.Booking;
import com.smartvenue.backend.domain.BookingStatus;
import com.smartvenue.backend.domain.TimeSlot;
import com.smartvenue.backend.domain.Venue;
import com.smartvenue.backend.dto.RecommendationDto;
import com.smartvenue.backend.dto.VenueDto;
import com.smartvenue.backend.repository.BookingRepository;
import com.smartvenue.backend.repository.VenueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RuleBasedVenueRecommendationService implements VenueRecommendationService {

    private final VenueRepository venueRepository;
    private final BookingRepository bookingRepository;

    public RuleBasedVenueRecommendationService(VenueRepository venueRepository, BookingRepository bookingRepository) {
        this.venueRepository = venueRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecommendationDto.RecommendationResult> getRecommendations(RecommendationDto.RecommendationRequest request) {
        List<Venue> allVenues = venueRepository.findAll();
        List<RecommendationDto.RecommendationResult> results = new ArrayList<>();

        for (Venue venue : allVenues) {
            // HARD CONSTRAINT 1: Venue must be approved
            if (!venue.isApproved()) {
                continue;
            }

            // HARD CONSTRAINT 2: Capacity check - must accommodate requested guests
            if (request.getGuestCount() != null && venue.getCapacity() < request.getGuestCount()) {
                continue; // Excluded: undersized venue
            }

            // HARD CONSTRAINT 3: Availability check on target date & slot
            if (request.getDate() != null) {
                TimeSlot targetSlot = request.getTimeSlot() != null 
                        ? TimeSlot.valueOf(request.getTimeSlot().toUpperCase()) 
                        : TimeSlot.FULL_DAY;
                
                boolean isUnavailable = isSlotBooked(venue.getId(), request.getDate(), targetSlot);
                if (isUnavailable) {
                    continue; // Excluded: hard booked slot
                }
            }

            // Calculate transparent component scores (0 - 100)
            double budgetScore = computeBudgetScore(venue, request.getMaxBudget());
            double locationScore = computeLocationScore(venue, request.getTargetCity());
            double capacityScore = computeCapacityScore(venue, request.getGuestCount());
            double eventTypeScore = computeEventTypeScore(venue, request.getEventType());
            double facilitiesScore = computeFacilitiesScore(venue, request.getPreferredFacilities());
            double availabilityScore = request.getDate() != null ? 100.0 : 90.0;

            // Transparent weighting: Budget (25%), Location (20%), Capacity (20%), EventType (15%), Facilities (10%), Availability (10%)
            double overallScore = (budgetScore * 0.25)
                    + (locationScore * 0.20)
                    + (capacityScore * 0.20)
                    + (eventTypeScore * 0.15)
                    + (facilitiesScore * 0.10)
                    + (availabilityScore * 0.10);

            RecommendationDto.ScoreBreakdown breakdown = new RecommendationDto.ScoreBreakdown(
                    overallScore, budgetScore, locationScore, capacityScore, eventTypeScore, facilitiesScore, availabilityScore
            );

            List<String> highlights = generateHighlights(venue, request, breakdown);
            String plainExplanation = generateExplanation(venue, request, breakdown);

            results.add(new RecommendationDto.RecommendationResult(
                    VenueDto.VenueResponse.fromEntity(venue),
                    breakdown,
                    plainExplanation,
                    highlights
            ));
        }

        // Rank by overall score descending
        results.sort((a, b) -> Double.compare(b.getScoreBreakdown().getOverallScore(), a.getScoreBreakdown().getOverallScore()));
        return results;
    }

    private boolean isSlotBooked(Long venueId, java.time.LocalDate date, TimeSlot slot) {
        List<Booking> confirmedBookings = bookingRepository.findByVenueIdAndEventDateAndStatus(venueId, date, BookingStatus.CONFIRMED);
        for (Booking b : confirmedBookings) {
            if (b.getStatus() == BookingStatus.CONFIRMED) {
                if (b.getTimeSlot() == TimeSlot.FULL_DAY || slot == TimeSlot.FULL_DAY || b.getTimeSlot() == slot) {
                    return true;
                }
            }
        }
        return false;
    }

    private double computeBudgetScore(Venue venue, BigDecimal maxBudget) {
        if (maxBudget == null || maxBudget.compareTo(BigDecimal.ZERO) <= 0) {
            return 95.0; // Default good score if no budget limit specified
        }

        BigDecimal venuePrice = venue.getBasePricePerDay();
        if (venuePrice.compareTo(maxBudget) <= 0) {
            // Under budget: scores 80 - 100 based on value
            double ratio = venuePrice.divide(maxBudget, 4, RoundingMode.HALF_UP).doubleValue();
            return 100.0 - (ratio * 15.0);
        } else {
            // Over budget: penalize rapidly
            double overRatio = (venuePrice.subtract(maxBudget)).divide(maxBudget, 4, RoundingMode.HALF_UP).doubleValue();
            return Math.max(0.0, 100.0 - (overRatio * 200.0));
        }
    }

    private double computeLocationScore(Venue venue, String targetCity) {
        if (targetCity == null || targetCity.trim().isEmpty()) {
            return 90.0;
        }
        return venue.getCity().trim().equalsIgnoreCase(targetCity.trim()) ? 100.0 : 25.0;
    }

    private double computeCapacityScore(Venue venue, Integer guestCount) {
        if (guestCount == null || guestCount <= 0) {
            return 90.0;
        }
        double ratio = (double) guestCount / (double) venue.getCapacity();
        if (ratio >= 0.60 && ratio <= 0.90) {
            return 100.0; // Optimal capacity utilization
        } else if (ratio > 0.90 && ratio <= 1.0) {
            return 85.0; // Near max capacity
        } else {
            // Room is larger than needed
            return Math.max(30.0, 100.0 - ((0.60 - ratio) * 100.0));
        }
    }

    private double computeEventTypeScore(Venue venue, String eventType) {
        if (eventType == null || eventType.trim().isEmpty()) {
            return 90.0;
        }
        if (venue.getSupportedEventTypes() != null &&
                venue.getSupportedEventTypes().toUpperCase().contains(eventType.trim().toUpperCase())) {
            return 100.0;
        }
        return 20.0;
    }

    private double computeFacilitiesScore(Venue venue, List<String> preferredFacilities) {
        if (preferredFacilities == null || preferredFacilities.isEmpty()) {
            return 90.0;
        }
        String venueFac = venue.getFacilities() != null ? venue.getFacilities().toUpperCase() : "";
        int matched = 0;
        for (String pref : preferredFacilities) {
            if (venueFac.contains(pref.trim().toUpperCase())) {
                matched++;
            }
        }
        return ((double) matched / (double) preferredFacilities.size()) * 100.0;
    }

    private List<String> generateHighlights(Venue venue, RecommendationDto.RecommendationRequest request, RecommendationDto.ScoreBreakdown breakdown) {
        List<String> highlights = new ArrayList<>();
        if (breakdown.getLocationScore() >= 95.0 && request.getTargetCity() != null) {
            highlights.add("Direct location match in " + venue.getCity());
        }
        if (breakdown.getBudgetScore() >= 85.0) {
            highlights.add("Cost-effective within your budget limits");
        }
        if (breakdown.getCapacityScore() >= 95.0) {
            highlights.add("Optimal guest capacity fit (" + venue.getCapacity() + " max)");
        }
        if (breakdown.getEventTypeScore() >= 95.0 && request.getEventType() != null) {
            highlights.add("Specialized for " + request.getEventType() + " events");
        }
        if (breakdown.getFacilitiesScore() >= 80.0 && request.getPreferredFacilities() != null) {
            highlights.add("Matches preferred amenities and facilities");
        }
        return highlights;
    }

    private String generateExplanation(Venue venue, RecommendationDto.RecommendationRequest request, RecommendationDto.ScoreBreakdown breakdown) {
        StringBuilder sb = new StringBuilder();
        sb.append(venue.getName()).append(" is recommended with an overall suitability score of ")
                .append(breakdown.getOverallScore()).append("/100. ");

        if (breakdown.getCapacityScore() >= 85.0) {
            sb.append("It comfortably accommodates your ").append(request.getGuestCount()).append(" guests with optimal room utilization. ");
        }

        if (request.getTargetCity() != null && breakdown.getLocationScore() >= 90.0) {
            sb.append("Located directly in ").append(venue.getCity()).append(". ");
        }

        if (request.getMaxBudget() != null) {
            if (venue.getBasePricePerDay().compareTo(request.getMaxBudget()) <= 0) {
                sb.append("Priced at $").append(venue.getBasePricePerDay()).append("/day, well within your budget limit of $").append(request.getMaxBudget()).append(". ");
            } else {
                sb.append("Priced slightly above your target at $").append(venue.getBasePricePerDay()).append("/day. ");
            }
        }

        if (breakdown.getEventTypeScore() >= 90.0 && request.getEventType() != null) {
            sb.append("Fully rated for ").append(request.getEventType()).append(" celebrations. ");
        }

        return sb.toString().trim();
    }
}
