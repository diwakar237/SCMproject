package com.smartvenue.backend.service.parking;

import com.smartvenue.backend.domain.ParkingDataSource;
import com.smartvenue.backend.domain.ParkingLot;

public interface ParkingDataProvider {
    /**
     * Retrieves the latest occupied count for the given parking lot.
     */
    int fetchOccupiedSpots(ParkingLot lot);

    /**
     * Reports the type of data source (e.g. SENSOR, MANUAL, SIMULATED_DEMO).
     */
    ParkingDataSource getSourceType();
}
