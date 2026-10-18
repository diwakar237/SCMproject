package com.smartvenue.backend.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "parking_lots")
public class ParkingLot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    @Column(name = "lot_name", nullable = false, length = 100)
    private String lotName;

    @Column(name = "total_spots", nullable = false)
    private int totalSpots;

    @Column(name = "occupied_spots", nullable = false)
    private int occupiedSpots = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "data_source", nullable = false, length = 30)
    private ParkingDataSource dataSource = ParkingDataSource.MANUAL;

    @Column(name = "last_updated_at", nullable = false)
    private LocalDateTime lastUpdatedAt = LocalDateTime.now();

    public ParkingLot() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Venue getVenue() { return venue; }
    public void setVenue(Venue venue) { this.venue = venue; }

    public String getLotName() { return lotName; }
    public void setLotName(String lotName) { this.lotName = lotName; }

    public int getTotalSpots() { return totalSpots; }
    public void setTotalSpots(int totalSpots) { this.totalSpots = totalSpots; }

    public int getOccupiedSpots() { return occupiedSpots; }
    public void setOccupiedSpots(int occupiedSpots) { this.occupiedSpots = occupiedSpots; }

    public ParkingDataSource getDataSource() { return dataSource; }
    public void setDataSource(ParkingDataSource dataSource) { this.dataSource = dataSource; }

    public LocalDateTime getLastUpdatedAt() { return lastUpdatedAt; }
    public void setLastUpdatedAt(LocalDateTime lastUpdatedAt) { this.lastUpdatedAt = lastUpdatedAt; }
}
