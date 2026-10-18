package com.smartvenue.backend.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "parking_history")
public class ParkingHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parking_lot_id", nullable = false)
    private ParkingLot parkingLot;

    @Column(name = "occupied_spots", nullable = false)
    private int occupiedSpots;

    @Enumerated(EnumType.STRING)
    @Column(name = "data_source", nullable = false, length = 30)
    private ParkingDataSource dataSource = ParkingDataSource.MANUAL;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt = LocalDateTime.now();

    public ParkingHistory() {}

    public ParkingHistory(ParkingLot parkingLot, int occupiedSpots, ParkingDataSource dataSource) {
        this.parkingLot = parkingLot;
        this.occupiedSpots = occupiedSpots;
        this.dataSource = dataSource;
        this.recordedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ParkingLot getParkingLot() { return parkingLot; }
    public void setParkingLot(ParkingLot parkingLot) { this.parkingLot = parkingLot; }

    public int getOccupiedSpots() { return occupiedSpots; }
    public void setOccupiedSpots(int occupiedSpots) { this.occupiedSpots = occupiedSpots; }

    public ParkingDataSource getDataSource() { return dataSource; }
    public void setDataSource(ParkingDataSource dataSource) { this.dataSource = dataSource; }

    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }
}
