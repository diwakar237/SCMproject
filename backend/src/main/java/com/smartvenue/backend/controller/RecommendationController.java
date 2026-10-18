package com.smartvenue.backend.controller;

import com.smartvenue.backend.dto.RecommendationDto;
import com.smartvenue.backend.service.recommendation.VenueRecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@Tag(name = "Recommendations", description = "Transparent weighted venue recommendation engine")
public class RecommendationController {

    private final VenueRecommendationService recommendationService;

    public RecommendationController(VenueRecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping
    @Operation(summary = "Get ranked venue recommendations based on budget, capacity, location, and constraints")
    public ResponseEntity<List<RecommendationDto.RecommendationResult>> getRecommendations(
            @Valid @RequestBody RecommendationDto.RecommendationRequest request) {
        List<RecommendationDto.RecommendationResult> results = recommendationService.getRecommendations(request);
        return ResponseEntity.ok(results);
    }
}
