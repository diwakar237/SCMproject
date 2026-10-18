package com.smartvenue.backend.service;

import com.smartvenue.backend.domain.*;
import com.smartvenue.backend.dto.VenueDto;
import com.smartvenue.backend.exception.Exceptions;
import com.smartvenue.backend.repository.BookingRepository;
import com.smartvenue.backend.repository.VenueRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VenueService {

    private final VenueRepository venueRepository;
    private final BookingRepository bookingRepository;

    public VenueService(VenueRepository venueRepository, BookingRepository bookingRepository) {
        this.venueRepository = venueRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public Page<VenueDto.VenueResponse> searchVenues(
            String search,
            String city,
            String category,
            String eventType,
            Integer minCapacity,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String facility,
            LocalDate date,
            Pageable pageable) {

        Specification<Venue> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isTrue(root.get("approved")));

            if (search != null && !search.trim().isEmpty()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), term);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), term);
                Predicate cityMatch = cb.like(cb.lower(root.get("city")), term);
                predicates.add(cb.or(nameMatch, descMatch, cityMatch));
            }

            if (city != null && !city.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("city")), city.trim().toLowerCase()));
            }

            if (category != null && !category.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("category")), category.trim().toLowerCase()));
            }

            if (eventType != null && !eventType.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("supportedEventTypes")), "%" + eventType.trim().toLowerCase() + "%"));
            }

            if (minCapacity != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), minCapacity));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("basePricePerDay"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("basePricePerDay"), maxPrice));
            }

            if (facility != null && !facility.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("facilities")), "%" + facility.trim().toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Venue> venuesPage = venueRepository.findAll(spec, pageable);

        // If date filter is provided, optionally filter out venues that have a FULL_DAY confirmed booking
        if (date != null) {
            // Note: In Stage 1 availability endpoint checks specific venue slots.
        }

        return venuesPage.map(VenueDto.VenueResponse::new);
    }

    @Transactional(readOnly = true)
    public VenueDto.VenueResponse getVenueById(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Venue not found with id: " + id));
        return new VenueDto.VenueResponse(venue);
    }

    public Venue getVenueEntity(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Venue not found with id: " + id));
    }

    public VenueDto.VenueAvailabilityResponse checkAvailability(Long venueId, LocalDate date) {
        Venue venue = getVenueEntity(venueId);
        List<Booking> confirmedBookings = bookingRepository.findByVenueIdAndEventDateAndStatus(
                venue.getId(), date, BookingStatus.CONFIRMED);

        List<String> bookedSlots = confirmedBookings.stream()
                .map(b -> b.getTimeSlot().name())
                .collect(Collectors.toList());

        boolean hasFullDay = bookedSlots.contains(TimeSlot.FULL_DAY.name());
        boolean hasMorning = bookedSlots.contains(TimeSlot.MORNING.name());
        boolean hasEvening = bookedSlots.contains(TimeSlot.EVENING.name());

        boolean isAvailable = !hasFullDay && !(hasMorning && hasEvening);

        return new VenueDto.VenueAvailabilityResponse(venue.getId(), date, isAvailable, bookedSlots);
    }

    @Transactional
    public VenueDto.VenueResponse createVenue(VenueDto.VenueCreateUpdateRequest request, User owner) {
        Venue venue = new Venue();
        venue.setOwner(owner);
        venue.setName(request.getName());
        venue.setCity(request.getCity());
        venue.setAddress(request.getAddress());
        venue.setDescription(request.getDescription());
        venue.setCategory(request.getCategory());
        venue.setCapacity(request.getCapacity());
        venue.setBasePricePerDay(request.getBasePricePerDay());
        venue.setCleaningFee(request.getCleaningFee() != null ? request.getCleaningFee() : BigDecimal.ZERO);
        venue.setSupportedEventTypes(request.getSupportedEventTypes());
        venue.setFacilities(request.getFacilities());
        venue.setImageUrls(request.getImageUrls());
        venue.setApproved(true);

        Venue saved = venueRepository.save(venue);
        return new VenueDto.VenueResponse(saved);
    }

    @Transactional
    public VenueDto.VenueResponse updateVenue(Long id, VenueDto.VenueCreateUpdateRequest request, User user) {
        Venue venue = getVenueEntity(id);

        if (!venue.getOwner().getId().equals(user.getId()) && user.getRole() != UserRole.ADMIN) {
            throw new Exceptions.ForbiddenException("You do not own this venue");
        }

        venue.setName(request.getName());
        venue.setCity(request.getCity());
        venue.setAddress(request.getAddress());
        venue.setDescription(request.getDescription());
        venue.setCategory(request.getCategory());
        venue.setCapacity(request.getCapacity());
        venue.setBasePricePerDay(request.getBasePricePerDay());
        if (request.getCleaningFee() != null) {
            venue.setCleaningFee(request.getCleaningFee());
        }
        venue.setSupportedEventTypes(request.getSupportedEventTypes());
        venue.setFacilities(request.getFacilities());
        venue.setImageUrls(request.getImageUrls());

        Venue saved = venueRepository.save(venue);
        return new VenueDto.VenueResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<VenueDto.VenueResponse> getOwnerVenues(Long ownerId, Pageable pageable) {
        return venueRepository.findByOwnerId(ownerId, pageable).map(VenueDto.VenueResponse::new);
    }
}
