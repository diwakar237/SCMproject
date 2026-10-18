package com.smartvenue.backend.service.recommendation;

import com.smartvenue.backend.dto.RecommendationDto;
import java.util.List;

public interface VenueRecommendationService {
    /**
     * Recommends venues evaluated against transparent weighted scoring criteria
     * and hard constraints (excluding undersized or unavailable venues).
     *
     * @param request user preferences including budget, location, capacity, event type, date, facilities
     * @return sorted list of ranked recommendation results with score breakdowns and plain explanations
     */
    List<RecommendationDto.RecommendationResult> getRecommendations(RecommendationDto.RecommendationRequest request);
}
