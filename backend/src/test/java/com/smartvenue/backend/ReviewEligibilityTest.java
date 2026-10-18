package com.smartvenue.backend;

import com.smartvenue.backend.domain.*;
import com.smartvenue.backend.dto.ReviewDto;
import com.smartvenue.backend.exception.Exceptions;
import com.smartvenue.backend.repository.BookingRepository;
import com.smartvenue.backend.repository.ReviewRepository;
import com.smartvenue.backend.repository.VenueRepository;
import com.smartvenue.backend.service.ReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReviewEligibilityTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private VenueRepository venueRepository;

    private ReviewService reviewService;

    private User customer;
    private User otherCustomer;
    private Venue venue;
    private Booking confirmedBooking;
    private Booking pendingBooking;

    @BeforeEach
    void setUp() {
        reviewService = new ReviewService(reviewRepository, bookingRepository, venueRepository);

        customer = new User();
        customer.setId(1L);
        customer.setEmail("customer@demo.com");
        customer.setRole(UserRole.CUSTOMER);

        otherCustomer = new User();
        otherCustomer.setId(2L);
        otherCustomer.setEmail("other@demo.com");
        otherCustomer.setRole(UserRole.CUSTOMER);

        venue = new Venue();
        venue.setId(10L);
        venue.setName("Crystal Grand Hall");
        venue.setRating(BigDecimal.valueOf(5.0));
        venue.setReviewCount(0);

        confirmedBooking = new Booking();
        confirmedBooking.setId(100L);
        confirmedBooking.setUser(customer);
        confirmedBooking.setVenue(venue);
        confirmedBooking.setStatus(BookingStatus.CONFIRMED);
        confirmedBooking.setEventDate(LocalDate.now().minusDays(5));

        pendingBooking = new Booking();
        pendingBooking.setId(200L);
        pendingBooking.setUser(customer);
        pendingBooking.setVenue(venue);
        pendingBooking.setStatus(BookingStatus.PENDING);
    }

    @Test
    void createReview_rejectsUnconfirmedBooking() {
        when(bookingRepository.findById(200L)).thenReturn(Optional.of(pendingBooking));

        ReviewDto.ReviewRequest req = new ReviewDto.ReviewRequest();
        req.setBookingId(200L);
        req.setRating(5);
        req.setComment("Great venue!");

        assertThrows(Exceptions.ValidationException.class, () -> {
            reviewService.createReview(req, customer);
        });
    }

    @Test
    void createReview_rejectsUnauthorizedUser() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(confirmedBooking));

        ReviewDto.ReviewRequest req = new ReviewDto.ReviewRequest();
        req.setBookingId(100L);
        req.setRating(5);
        req.setComment("Superb!");

        assertThrows(Exceptions.ForbiddenException.class, () -> {
            reviewService.createReview(req, otherCustomer);
        });
    }

    @Test
    void createReview_rejectsDuplicateReviewOnSameBooking() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(confirmedBooking));
        when(reviewRepository.findByBookingId(100L)).thenReturn(Optional.of(new Review()));

        ReviewDto.ReviewRequest req = new ReviewDto.ReviewRequest();
        req.setBookingId(100L);
        req.setRating(5);
        req.setComment("Another review!");

        assertThrows(Exceptions.ConflictException.class, () -> {
            reviewService.createReview(req, customer);
        });
    }

    @Test
    void createReview_acceptsConfirmedBookingAndRecalculatesRating() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(confirmedBooking));
        when(reviewRepository.findByBookingId(100L)).thenReturn(Optional.empty());
        when(reviewRepository.save(any(Review.class))).thenAnswer(i -> {
            Review r = i.getArgument(0);
            r.setId(1L);
            return r;
        });

        Review savedReview = new Review();
        savedReview.setRating(4);
        when(reviewRepository.findByVenueIdAndIsApprovedTrueOrderByCreatedAtDesc(10L))
                .thenReturn(Collections.singletonList(savedReview));

        ReviewDto.ReviewRequest req = new ReviewDto.ReviewRequest();
        req.setBookingId(100L);
        req.setRating(4);
        req.setComment("Wonderful architecture and helpful staff.");

        var res = reviewService.createReview(req, customer);
        assertNotNull(res);
        assertEquals(4, res.getRating());
        assertEquals("Wonderful architecture and helpful staff.", res.getComment());
        verify(venueRepository, times(1)).save(venue);
        assertEquals(1, venue.getReviewCount());
        assertEquals(BigDecimal.valueOf(4.00).setScale(2), venue.getRating());
    }
}
