package com.smartvenue.backend.service;

import com.smartvenue.backend.domain.*;
import com.smartvenue.backend.dto.ParkingDto;
import com.smartvenue.backend.exception.Exceptions;
import com.smartvenue.backend.repository.BookingRepository;
import com.smartvenue.backend.repository.ParkingHistoryRepository;
import com.smartvenue.backend.repository.ParkingLotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ParkingServiceTest {

    @Mock
    private ParkingLotRepository parkingLotRepository;

    @Mock
    private ParkingHistoryRepository parkingHistoryRepository;

    @Mock
    private BookingRepository bookingRepository;

    private ParkingService parkingService;
    private Venue testVenue;
    private User venueOwner;
    private ParkingLot testLot;

    @BeforeEach
    void setUp() {
        parkingService = new ParkingService(parkingLotRepository, parkingHistoryRepository, bookingRepository);

        venueOwner = new User();
        venueOwner.setId(5L);
        venueOwner.setFullName("Alice Owner");
        venueOwner.setRole(UserRole.VENUE_OWNER);

        testVenue = new Venue();
        testVenue.setId(1L);
        testVenue.setName("Grand Hall");
        testVenue.setOwner(venueOwner);

        testLot = new ParkingLot();
        testLot.setId(10L);
        testLot.setVenue(testVenue);
        testLot.setLotName("North Deck");
        testLot.setTotalSpots(100);
        testLot.setOccupiedSpots(75);
        testLot.setDataSource(ParkingDataSource.SENSOR);
        testLot.setLastUpdatedAt(LocalDateTime.now());
    }

    @Test
    void testParkingFormulas_OccupancyAndAvailableSpots() {
        when(parkingLotRepository.findById(10L)).thenReturn(Optional.of(testLot));
        when(parkingHistoryRepository.findTop20ByParkingLotIdOrderByRecordedAtDesc(10L))
                .thenReturn(Collections.emptyList());

        ParkingDto.ParkingLotResponse response = parkingService.getParkingLotById(10L);

        // Required Formula: available = total - occupied
        assertEquals(25, response.getAvailableSpots());

        // Required Formula: occupancy % = occupied / total * 100
        assertEquals(75.0, response.getOccupancyPercent(), 0.01);

        assertEquals(ParkingDataSource.SENSOR, response.getDataSource());
    }

    @Test
    void testSuggestedArrivalWindow_Thresholds() {
        assertEquals("Heavy Congestion Expected: Arrive 45-60 minutes before event start",
                parkingService.calculateArrivalWindow(85.0));

        assertEquals("Moderate Demand: Arrive 30-45 minutes before event start",
                parkingService.calculateArrivalWindow(60.0));

        assertEquals("Optimal Flow: Arrive 15-30 minutes before event start",
                parkingService.calculateArrivalWindow(35.0));
    }

    @Test
    void testBaselinePredictionWithEventsMultiplier() {
        when(parkingLotRepository.findById(10L)).thenReturn(Optional.of(testLot));

        ParkingHistory h1 = new ParkingHistory(testLot, 40, ParkingDataSource.SENSOR);
        ParkingHistory h2 = new ParkingHistory(testLot, 60, ParkingDataSource.SENSOR);
        when(parkingHistoryRepository.findTop20ByParkingLotIdOrderByRecordedAtDesc(10L))
                .thenReturn(Arrays.asList(h1, h2)); // avg = 50

        LocalDate date = LocalDate.of(2026, 12, 1);
        Booking event1 = new Booking();
        event1.setStatus(BookingStatus.CONFIRMED);
        Booking event2 = new Booking();
        event2.setStatus(BookingStatus.CONFIRMED);

        // 2 confirmed events -> 1.0 + (2 * 0.25) = 1.5 multiplier
        when(bookingRepository.findByVenueIdAndEventDateAndStatus(1L, date, BookingStatus.CONFIRMED))
                .thenReturn(Arrays.asList(event1, event2));

        ParkingDto.ParkingPredictionResponse prediction = parkingService.predictOccupancy(10L, date, "FULL_DAY");

        // Expected predicted occupied = 50 * 1.5 = 75
        assertEquals(75, prediction.getPredictedOccupiedSpots());
        assertEquals(25, prediction.getPredictedAvailableSpots());
        assertEquals(75.0, prediction.getPredictedOccupancyPercent(), 0.01);
        assertEquals(ParkingDataSource.PREDICTED, prediction.getDataSource());
        assertNotNull(prediction.getPredictionBasis());
    }

    @Test
    void testManualUpdate_OwnerAllowedAndOverflowPrevented() {
        when(parkingLotRepository.findById(10L)).thenReturn(Optional.of(testLot));
        when(parkingLotRepository.save(any(ParkingLot.class))).thenAnswer(i -> i.getArgument(0));

        // Valid update by owner
        ParkingDto.ParkingLotResponse res = parkingService.updateOccupiedSpotsManually(10L, 80, venueOwner);
        assertEquals(80, res.getOccupiedSpots());
        assertEquals(20, res.getAvailableSpots());
        assertEquals(ParkingDataSource.MANUAL, res.getDataSource());

        // Invalid update: exceeds total spots (100)
        assertThrows(Exceptions.BadRequestException.class, () -> {
            parkingService.updateOccupiedSpotsManually(10L, 120, venueOwner);
        });

        // Unauthorized user check
        User unauthorizedUser = new User();
        unauthorizedUser.setId(99L);
        unauthorizedUser.setRole(UserRole.CUSTOMER);

        assertThrows(Exceptions.ForbiddenException.class, () -> {
            parkingService.updateOccupiedSpotsManually(10L, 50, unauthorizedUser);
        });
    }
}
