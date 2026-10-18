package com.smartvenue.backend.service;

import com.smartvenue.backend.domain.*;
import com.smartvenue.backend.dto.RecommendationDto;
import com.smartvenue.backend.repository.BookingRepository;
import com.smartvenue.backend.repository.VenueRepository;
import com.smartvenue.backend.service.recommendation.RuleBasedVenueRecommendationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RecommendationServiceTest {

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private BookingRepository bookingRepository;

    private RuleBasedVenueRecommendationService recommendationService;

    private Venue venueSmall;
    private Venue venueLarge;

    @BeforeEach
    void setUp() {
        recommendationService = new RuleBasedVenueRecommendationService(venueRepository, bookingRepository);

        venueSmall = new Venue();
        venueSmall.setId(1L);
        venueSmall.setName("Cozy Loft");
        venueSmall.setCity("New York");
        venueSmall.setCapacity(50);
        venueSmall.setBasePricePerDay(BigDecimal.valueOf(800));
        venueSmall.setSupportedEventTypes("BIRTHDAY,CORPORATE");
        venueSmall.setFacilities("WIFI");
        venueSmall.setApproved(true);

        venueLarge = new Venue();
        venueLarge.setId(2L);
        venueLarge.setName("Grand Palace");
        venueLarge.setCity("New York");
        venueLarge.setCapacity(300);
        venueLarge.setBasePricePerDay(BigDecimal.valueOf(2500));
        venueLarge.setSupportedEventTypes("WEDDING,CORPORATE");
        venueLarge.setFacilities("WIFI,PARKING,AUDIO_VISUAL");
        venueLarge.setApproved(true);
    }

    @Test
    void testHardConstraint_UndersizedVenueExcluded() {
        when(venueRepository.findAll()).thenReturn(Arrays.asList(venueSmall, venueLarge));

        RecommendationDto.RecommendationRequest request = new RecommendationDto.RecommendationRequest();
        request.setGuestCount(150); // 150 > venueSmall.capacity (50)
        request.setTargetCity("New York");

        List<RecommendationDto.RecommendationResult> results = recommendationService.getRecommendations(request);

        assertEquals(1, results.size());
        assertEquals("Grand Palace", results.get(0).getVenue().getName());
    }

    @Test
    void testHardConstraint_UnavailableVenueExcluded() {
        when(venueRepository.findAll()).thenReturn(Arrays.asList(venueSmall, venueLarge));

        LocalDate eventDate = LocalDate.of(2026, 12, 10);
        Booking confirmedBooking = new Booking();
        confirmedBooking.setStatus(BookingStatus.CONFIRMED);
        confirmedBooking.setTimeSlot(TimeSlot.FULL_DAY);

        when(bookingRepository.findByVenueIdAndEventDateAndStatus(1L, eventDate, BookingStatus.CONFIRMED))
                .thenReturn(Collections.emptyList());
        when(bookingRepository.findByVenueIdAndEventDateAndStatus(2L, eventDate, BookingStatus.CONFIRMED))
                .thenReturn(Collections.singletonList(confirmedBooking));

        RecommendationDto.RecommendationRequest request = new RecommendationDto.RecommendationRequest();
        request.setGuestCount(40); // Both can accommodate 40
        request.setDate(eventDate);
        request.setTimeSlot("FULL_DAY");

        List<RecommendationDto.RecommendationResult> results = recommendationService.getRecommendations(request);

        // Venue 2 is confirmed/booked on this date, so it must be excluded
        assertEquals(1, results.size());
        assertEquals("Cozy Loft", results.get(0).getVenue().getName());
    }

    @Test
    void testScoringBreakdownAndPlainExplanation() {
        when(venueRepository.findAll()).thenReturn(Collections.singletonList(venueLarge));

        RecommendationDto.RecommendationRequest request = new RecommendationDto.RecommendationRequest();
        request.setGuestCount(200);
        request.setTargetCity("New York");
        request.setMaxBudget(BigDecimal.valueOf(3000));
        request.setEventType("WEDDING");
        request.setPreferredFacilities(Arrays.asList("WIFI", "PARKING"));

        List<RecommendationDto.RecommendationResult> results = recommendationService.getRecommendations(request);

        assertFalse(results.isEmpty());
        RecommendationDto.RecommendationResult topResult = results.get(0);
        RecommendationDto.ScoreBreakdown breakdown = topResult.getScoreBreakdown();

        assertTrue(breakdown.getOverallScore() > 80.0, "Overall score should be high for matching venue");
        assertEquals(100.0, breakdown.getLocationScore(), "Location match should be 100");
        assertEquals(100.0, breakdown.getEventTypeScore(), "Event type match should be 100");
        assertEquals(100.0, breakdown.getFacilitiesScore(), "All requested facilities match should be 100");

        assertNotNull(topResult.getPlainExplanation());
        assertTrue(topResult.getPlainExplanation().contains("Grand Palace"));
        assertTrue(topResult.getPlainExplanation().contains("New York"));
    }
}
