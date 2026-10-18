package com.smartvenue.backend.repository;

import com.smartvenue.backend.domain.ParkingLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingLotRepository extends JpaRepository<ParkingLot, Long> {
    List<ParkingLot> findByVenueIdOrderByIdAsc(Long venueId);
}
