package com.smartvenue.backend.controller;

import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.dto.ReviewDto;
import com.smartvenue.backend.service.AuthService;
import com.smartvenue.backend.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@Tag(name = "Reviews & Ratings", description = "Submit and view verified customer reviews for completed bookings")
public class ReviewController {

    private final ReviewService reviewService;
    private final AuthService authService;

    public ReviewController(ReviewService reviewService, AuthService authService) {
        this.reviewService = reviewService;
        this.authService = authService;
    }

    @PostMapping
    @Operation(summary = "Submit verified review for a completed booking")
    public ResponseEntity<ReviewDto.ReviewResponse> createReview(@Valid @RequestBody ReviewDto.ReviewRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(reviewService.createReview(request, user));
    }

    @GetMapping("/venues/{venueId}")
    @Operation(summary = "Get all approved reviews for a venue")
    public ResponseEntity<List<ReviewDto.ReviewResponse>> getVenueReviews(@PathVariable Long venueId) {
        return ResponseEntity.ok(reviewService.getVenueReviews(venueId));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin moderation queue for unapproved reviews")
    public ResponseEntity<List<ReviewDto.ReviewResponse>> getPendingReviews() {
        return ResponseEntity.ok(reviewService.getPendingReviews());
    }

    @PutMapping("/{id}/moderate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin approve or reject review")
    public ResponseEntity<ReviewDto.ReviewResponse> moderateReview(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        boolean approved = body.getOrDefault("approved", true);
        return ResponseEntity.ok(reviewService.moderateReview(id, approved));
    }
}
