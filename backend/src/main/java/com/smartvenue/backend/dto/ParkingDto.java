package com.smartvenue.backend.dto;

import com.smartvenue.backend.domain.ParkingDataSource;
import com.smartvenue.backend.domain.ParkingHistory;
import com.smartvenue.backend.domain.ParkingLot;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public class ParkingDto {

    public static class ParkingLotResponse {
        private Long id;
        private Long venueId;
        private String lotName;
        private int totalSpots;
        private int occupiedSpots;
        private int availableSpots;
        private double occupancyPercent;
        private ParkingDataSource dataSource;
        private LocalDateTime lastUpdatedAt;
        private String suggestedArrivalWindow;
        private List<ParkingHistoryItem> recentHistory;

        public static ParkingLotResponse fromEntity(ParkingLot lot, String arrivalWindow, List<ParkingHistoryItem> history) {
            ParkingLotResponse res = new ParkingLotResponse();
            res.id = lot.getId();
            res.venueId = lot.getVenue() != null ? lot.getVenue().getId() : null;
            res.lotName = lot.getLotName();
            res.totalSpots = lot.getTotalSpots();
            res.occupiedSpots = lot.getOccupiedSpots();
            // Required formulas:
            res.availableSpots = Math.max(0, lot.getTotalSpots() - lot.getOccupiedSpots());
            res.occupancyPercent = lot.getTotalSpots() > 0 
                    ? Math.round(((double) lot.getOccupiedSpots() / (double) lot.getTotalSpots() * 100.0) * 10.0) / 10.0
                    : 0.0;
            res.dataSource = lot.getDataSource();
            res.lastUpdatedAt = lot.getLastUpdatedAt();
            res.suggestedArrivalWindow = arrivalWindow;
            res.recentHistory = history;
            return res;
        }

        public Long getId() { return id; }
        public Long getVenueId() { return venueId; }
        public String getLotName() { return lotName; }
        public int getTotalSpots() { return totalSpots; }
        public int getOccupiedSpots() { return occupiedSpots; }
        public int getAvailableSpots() { return availableSpots; }
        public double getOccupancyPercent() { return occupancyPercent; }
        public ParkingDataSource getDataSource() { return dataSource; }
        public LocalDateTime getLastUpdatedAt() { return lastUpdatedAt; }
        public String getSuggestedArrivalWindow() { return suggestedArrivalWindow; }
        public List<ParkingHistoryItem> getRecentHistory() { return recentHistory; }
    }

    public static class ParkingHistoryItem {
        private Long id;
        private int occupiedSpots;
        private ParkingDataSource dataSource;
        private LocalDateTime recordedAt;

        public static ParkingHistoryItem fromEntity(ParkingHistory h) {
            ParkingHistoryItem item = new ParkingHistoryItem();
            item.id = h.getId();
            item.occupiedSpots = h.getOccupiedSpots();
            item.dataSource = h.getDataSource();
            item.recordedAt = h.getRecordedAt();
            return item;
        }

        public Long getId() { return id; }
        public int getOccupiedSpots() { return occupiedSpots; }
        public ParkingDataSource getDataSource() { return dataSource; }
        public LocalDateTime getRecordedAt() { return recordedAt; }
    }

    public static class ParkingManualUpdateRequest {
        @NotNull(message = "Occupied spots count is required")
        @Min(value = 0, message = "Occupied spots cannot be negative")
        private Integer occupiedSpots;

        public ParkingManualUpdateRequest() {}
        public ParkingManualUpdateRequest(Integer occupiedSpots) {
            this.occupiedSpots = occupiedSpots;
        }

        public Integer getOccupiedSpots() { return occupiedSpots; }
        public void setOccupiedSpots(Integer occupiedSpots) { this.occupiedSpots = occupiedSpots; }
    }

    public static class ParkingPredictionResponse {
        private Long lotId;
        private String lotName;
        private int totalSpots;
        private int predictedOccupiedSpots;
        private int predictedAvailableSpots;
        private double predictedOccupancyPercent;
        private ParkingDataSource dataSource = ParkingDataSource.PREDICTED;
        private String predictionBasis;
        private String suggestedArrivalWindow;

        public ParkingPredictionResponse() {}

        public Long getLotId() { return lotId; }
        public void setLotId(Long lotId) { this.lotId = lotId; }

        public String getLotName() { return lotName; }
        public void setLotName(String lotName) { this.lotName = lotName; }

        public int getTotalSpots() { return totalSpots; }
        public void setTotalSpots(int totalSpots) { this.totalSpots = totalSpots; }

        public int getPredictedOccupiedSpots() { return predictedOccupiedSpots; }
        public void setPredictedOccupiedSpots(int predictedOccupiedSpots) { this.predictedOccupiedSpots = predictedOccupiedSpots; }

        public int getPredictedAvailableSpots() { return predictedAvailableSpots; }
        public void setPredictedAvailableSpots(int predictedAvailableSpots) { this.predictedAvailableSpots = predictedAvailableSpots; }

        public double getPredictedOccupancyPercent() { return predictedOccupancyPercent; }
        public void setPredictedOccupancyPercent(double predictedOccupancyPercent) { this.predictedOccupancyPercent = predictedOccupancyPercent; }

        public ParkingDataSource getDataSource() { return dataSource; }
        public void setDataSource(ParkingDataSource dataSource) { this.dataSource = dataSource; }

        public String getPredictionBasis() { return predictionBasis; }
        public void setPredictionBasis(String predictionBasis) { this.predictionBasis = predictionBasis; }

        public String getSuggestedArrivalWindow() { return suggestedArrivalWindow; }
        public void setSuggestedArrivalWindow(String suggestedArrivalWindow) { this.suggestedArrivalWindow = suggestedArrivalWindow; }
    }
}
