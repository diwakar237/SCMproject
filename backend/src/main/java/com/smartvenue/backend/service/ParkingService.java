package com.smartvenue.backend.service;

import com.smartvenue.backend.domain.*;
import com.smartvenue.backend.dto.ParkingDto;
import com.smartvenue.backend.exception.Exceptions;
import com.smartvenue.backend.repository.BookingRepository;
import com.smartvenue.backend.repository.ParkingHistoryRepository;
import com.smartvenue.backend.repository.ParkingLotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParkingService {

    private final ParkingLotRepository parkingLotRepository;
    private final ParkingHistoryRepository parkingHistoryRepository;
    private final BookingRepository bookingRepository;

    public ParkingService(ParkingLotRepository parkingLotRepository,
                          ParkingHistoryRepository parkingHistoryRepository,
                          BookingRepository bookingRepository) {
        this.parkingLotRepository = parkingLotRepository;
        this.parkingHistoryRepository = parkingHistoryRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public List<ParkingDto.ParkingLotResponse> getParkingLotsForVenue(Long venueId) {
        List<ParkingLot> lots = parkingLotRepository.findByVenueIdOrderByIdAsc(venueId);
        return lots.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ParkingDto.ParkingLotResponse getParkingLotById(Long lotId) {
        ParkingLot lot = parkingLotRepository.findById(lotId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Parking lot not found with ID: " + lotId));
        return mapToResponse(lot);
    }

    @Transactional
    public ParkingDto.ParkingLotResponse updateOccupiedSpotsManually(Long lotId, int occupiedSpots, User actor) {
        ParkingLot lot = parkingLotRepository.findById(lotId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Parking lot not found with ID: " + lotId));

        // Ownership or Admin check
        boolean isOwner = lot.getVenue().getOwner() != null && lot.getVenue().getOwner().getId().equals(actor.getId());
        if (!isOwner && actor.getRole() != UserRole.ADMIN) {
            throw new Exceptions.ForbiddenException("Only the venue owner or an admin can manually update parking occupancy.");
        }

        if (occupiedSpots > lot.getTotalSpots()) {
            throw new Exceptions.BadRequestException("Occupied spots (" + occupiedSpots + ") cannot exceed total lot capacity (" + lot.getTotalSpots() + ").");
        }

        lot.setOccupiedSpots(occupiedSpots);
        lot.setDataSource(ParkingDataSource.MANUAL);
        lot.setLastUpdatedAt(LocalDateTime.now());
        ParkingLot saved = parkingLotRepository.save(lot);

        // Record history snapshot
        ParkingHistory history = new ParkingHistory(saved, occupiedSpots, ParkingDataSource.MANUAL);
        parkingHistoryRepository.save(history);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public ParkingDto.ParkingPredictionResponse predictOccupancy(Long lotId, LocalDate date, String timeSlotStr) {
        ParkingLot lot = parkingLotRepository.findById(lotId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Parking lot not found with ID: " + lotId));

        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<ParkingHistory> history = parkingHistoryRepository.findTop20ByParkingLotIdOrderByRecordedAtDesc(lotId);

        // Historical baseline average
        double avgOccupied = history.isEmpty() 
                ? (double) lot.getOccupiedSpots()
                : history.stream().mapToInt(ParkingHistory::getOccupiedSpots).average().orElse(lot.getOccupiedSpots());

        // Event schedule weighting
        List<Booking> confirmedEvents = bookingRepository.findByVenueIdAndEventDateAndStatus(lot.getVenue().getId(), targetDate, BookingStatus.CONFIRMED);
        int eventCount = confirmedEvents.size();

        // Baseline + event modifier
        double eventMultiplier = 1.0 + (eventCount * 0.25);
        int predictedOccupied = (int) Math.round(avgOccupied * eventMultiplier);
        // Clamp to totalSpots
        predictedOccupied = Math.min(lot.getTotalSpots(), Math.max(0, predictedOccupied));

        int predictedAvailable = Math.max(0, lot.getTotalSpots() - predictedOccupied);
        double predictedPercent = lot.getTotalSpots() > 0 
                ? Math.round(((double) predictedOccupied / (double) lot.getTotalSpots() * 100.0) * 10.0) / 10.0
                : 0.0;

        String arrivalWindow = calculateArrivalWindow(predictedPercent);
        String basis = String.format("Prediction based on %d historical data points (baseline avg: %.1f spots) combined with %d confirmed scheduled event(s) on %s.",
                history.size(), avgOccupied, eventCount, targetDate);

        ParkingDto.ParkingPredictionResponse response = new ParkingDto.ParkingPredictionResponse();
        response.setLotId(lot.getId());
        response.setLotName(lot.getLotName());
        response.setTotalSpots(lot.getTotalSpots());
        response.setPredictedOccupiedSpots(predictedOccupied);
        response.setPredictedAvailableSpots(predictedAvailable);
        response.setPredictedOccupancyPercent(predictedPercent);
        response.setDataSource(ParkingDataSource.PREDICTED);
        response.setPredictionBasis(basis);
        response.setSuggestedArrivalWindow(arrivalWindow);

        return response;
    }

    public String calculateArrivalWindow(double occupancyPercent) {
        if (occupancyPercent >= 80.0) {
            return "Heavy Congestion Expected: Arrive 45-60 minutes before event start";
        } else if (occupancyPercent >= 50.0) {
            return "Moderate Demand: Arrive 30-45 minutes before event start";
        } else {
            return "Optimal Flow: Arrive 15-30 minutes before event start";
        }
    }

    private ParkingDto.ParkingLotResponse mapToResponse(ParkingLot lot) {
        double occupancyPercent = lot.getTotalSpots() > 0 
                ? ((double) lot.getOccupiedSpots() / (double) lot.getTotalSpots()) * 100.0
                : 0.0;
        String arrivalWindow = calculateArrivalWindow(occupancyPercent);

        List<ParkingDto.ParkingHistoryItem> historyItems = parkingHistoryRepository
                .findTop20ByParkingLotIdOrderByRecordedAtDesc(lot.getId())
                .stream()
                .map(ParkingDto.ParkingHistoryItem::fromEntity)
                .collect(Collectors.toList());

        return ParkingDto.ParkingLotResponse.fromEntity(lot, arrivalWindow, historyItems);
    }
}
