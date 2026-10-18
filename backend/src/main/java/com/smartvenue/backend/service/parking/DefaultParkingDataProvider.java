package com.smartvenue.backend.service.parking;

import com.smartvenue.backend.domain.ParkingDataSource;
import com.smartvenue.backend.domain.ParkingLot;
import org.springframework.stereotype.Component;

@Component
public class DefaultParkingDataProvider implements ParkingDataProvider {

    @Override
    public int fetchOccupiedSpots(ParkingLot lot) {
        // Returns the current persisted reading from the lot
        return lot.getOccupiedSpots();
    }

    @Override
    public ParkingDataSource getSourceType() {
        return ParkingDataSource.SENSOR;
    }
}
