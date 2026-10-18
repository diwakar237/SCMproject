package com.smartvenue.backend.repository;

import com.smartvenue.backend.domain.ParkingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingHistoryRepository extends JpaRepository<ParkingHistory, Long> {
    List<ParkingHistory> findTop20ByParkingLotIdOrderByRecordedAtDesc(Long parkingLotId);
}
