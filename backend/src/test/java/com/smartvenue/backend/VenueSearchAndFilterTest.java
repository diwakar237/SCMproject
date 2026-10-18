package com.smartvenue.backend;

import com.smartvenue.backend.dto.VenueDto;
import com.smartvenue.backend.service.VenueService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev-h2")
public class VenueSearchAndFilterTest {

    @Autowired
    private VenueService venueService;

    @Test
    void testSearchByNameAndCity() {
        Page<VenueDto.VenueResponse> page = venueService.searchVenues(
                "Sapphire", null, null, null, null, null, null, null, null, PageRequest.of(0, 10));

        assertFalse(page.isEmpty());
        assertTrue(page.getContent().get(0).getName().contains("Sapphire"));

        Page<VenueDto.VenueResponse> cityPage = venueService.searchVenues(
                null, "Chicago", null, null, null, null, null, null, null, PageRequest.of(0, 10));
        assertFalse(cityPage.isEmpty());
        assertEquals("Chicago", cityPage.getContent().get(0).getCity());
    }

    @Test
    void testFilterByBudgetRange() {
        BigDecimal min = new BigDecimal("3000.00");
        BigDecimal max = new BigDecimal("4000.00");

        Page<VenueDto.VenueResponse> page = venueService.searchVenues(
                null, null, null, null, null, min, max, null, null, PageRequest.of(0, 20));

        assertFalse(page.isEmpty());
        for (VenueDto.VenueResponse venue : page.getContent()) {
            assertTrue(venue.getBasePricePerDay().compareTo(min) >= 0);
            assertTrue(venue.getBasePricePerDay().compareTo(max) <= 0);
        }
    }

    @Test
    void testFilterByCapacity() {
        int minCapacity = 400;
        Page<VenueDto.VenueResponse> page = venueService.searchVenues(
                null, null, null, null, minCapacity, null, null, null, null, PageRequest.of(0, 20));

        assertFalse(page.isEmpty());
        for (VenueDto.VenueResponse venue : page.getContent()) {
            assertTrue(venue.getCapacity() >= minCapacity);
        }
    }

    @Test
    void testSortByPriceAscending() {
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.ASC, "basePricePerDay"));
        Page<VenueDto.VenueResponse> page = venueService.searchVenues(
                null, null, null, null, null, null, null, null, null, pageRequest);

        assertFalse(page.isEmpty());
        BigDecimal prev = BigDecimal.ZERO;
        for (VenueDto.VenueResponse venue : page.getContent()) {
            assertTrue(venue.getBasePricePerDay().compareTo(prev) >= 0);
            prev = venue.getBasePricePerDay();
        }
    }

    @Test
    void testAvailabilityEndpoint() {
        // Venue 1 has a CONFIRMED booking on 2026-11-20 (from seed data)
        VenueDto.VenueAvailabilityResponse availability = venueService.checkAvailability(
                1L, LocalDate.of(2026, 11, 20));

        assertFalse(availability.isAvailable());
        assertTrue(availability.getBookedSlots().contains("FULL_DAY"));

        // Another date should be available
        VenueDto.VenueAvailabilityResponse freeDate = venueService.checkAvailability(
                1L, LocalDate.of(2026, 12, 25));
        assertTrue(freeDate.isAvailable());
        assertTrue(freeDate.getBookedSlots().isEmpty());
    }
}
