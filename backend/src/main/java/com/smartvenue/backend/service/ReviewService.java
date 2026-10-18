package com.smartvenue.backend.service;

import com.smartvenue.backend.domain.Booking;
import com.smartvenue.backend.domain.BookingStatus;
import com.smartvenue.backend.domain.Review;
import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.domain.Venue;
import com.smartvenue.backend.dto.ReviewDto;
import com.smartvenue.backend.exception.Exceptions;
import com.smartvenue.backend.repository.BookingRepository;
import com.smartvenue.backend.repository.ReviewRepository;
import com.smartvenue.backend.repository.VenueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final VenueRepository venueRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         BookingRepository bookingRepository,
                         VenueRepository venueRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.venueRepository = venueRepository;
    }

    @Transactional
    public ReviewDto.ReviewResponse createReview(ReviewDto.ReviewRequest request, User user) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Booking not found with ID: " + request.getBookingId()));

        // Verification 1: Must be the customer who booked
        if (!booking.getUser().getId().equals(user.getId()) && user.getRole() != com.smartvenue.backend.domain.UserRole.ADMIN) {
            throw new Exceptions.ForbiddenException("You can only review bookings made under your account.");
        }

        // Verification 2: Must be confirmed / completed
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new Exceptions.ValidationException("Reviews can only be submitted for completed or confirmed bookings.");
        }

        // Verification 3: One review per booking
        if (reviewRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new Exceptions.ConflictException("A review has already been submitted for this booking.");
        }

        Venue venue = booking.getVenue();

        Review review = new Review();
        review.setBooking(booking);
        review.setUser(user);
        review.setVenue(venue);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setIsApproved(true);

        Review saved = reviewRepository.save(review);

        // Recalculate Venue Average Rating
        if (venue != null) {
            List<Review> venueReviews = reviewRepository.findByVenueIdAndIsApprovedTrueOrderByCreatedAtDesc(venue.getId());
            double avg = venueReviews.stream().mapToInt(Review::getRating).average().orElse(5.0);
            venue.setRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
            venue.setReviewCount(venueReviews.size());
            venueRepository.save(venue);
        }

        return ReviewDto.ReviewResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<ReviewDto.ReviewResponse> getVenueReviews(Long venueId) {
        return reviewRepository.findByVenueIdAndIsApprovedTrueOrderByCreatedAtDesc(venueId)
                .stream()
                .map(ReviewDto.ReviewResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewDto.ReviewResponse> getPendingReviews() {
        return reviewRepository.findByIsApprovedFalseOrderByCreatedAtAsc()
                .stream()
                .map(ReviewDto.ReviewResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDto.ReviewResponse moderateReview(Long reviewId, boolean isApproved) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Review not found with ID: " + reviewId));
        review.setIsApproved(isApproved);
        Review saved = reviewRepository.save(review);
        return ReviewDto.ReviewResponse.fromEntity(saved);
    }
}
