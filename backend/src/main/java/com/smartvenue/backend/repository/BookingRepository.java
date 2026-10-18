package com.smartvenue.backend.repository;

import com.smartvenue.backend.domain.Booking;
import com.smartvenue.backend.domain.BookingStatus;
import com.smartvenue.backend.domain.TimeSlot;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String bookingReference);

    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    Page<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId, Pageable pageable);

    List<Booking> findByVenueOwnerIdOrderByCreatedAtDesc(Long ownerId);
    Page<Booking> findByVenueOwnerIdOrderByCreatedAtDesc(Long ownerId, Pageable pageable);

    List<Booking> findByVenueIdAndEventDateAndStatus(Long venueId, LocalDate eventDate, BookingStatus status);

    List<Booking> findByVenueIdAndEventDateBetweenAndStatus(Long venueId, LocalDate startDate, LocalDate endDate, BookingStatus status);

    // Pessimistic Write Lock query for preventing race conditions and concurrency conflicts
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Booking b WHERE b.venue.id = :venueId AND b.eventDate = :eventDate AND b.status = 'CONFIRMED' AND (b.timeSlot = :timeSlot OR b.timeSlot = 'FULL_DAY' OR :timeSlot = 'FULL_DAY')")
    List<Booking> findConfirmedOverlapsWithLock(
            @Param("venueId") Long venueId,
            @Param("eventDate") LocalDate eventDate,
            @Param("timeSlot") TimeSlot timeSlot
    );

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.venue.id = :venueId AND b.eventDate = :eventDate AND b.status = 'CONFIRMED' AND (b.timeSlot = :timeSlot OR b.timeSlot = 'FULL_DAY' OR :timeSlot = 'FULL_DAY')")
    long countConfirmedOverlaps(
            @Param("venueId") Long venueId,
            @Param("eventDate") LocalDate eventDate,
            @Param("timeSlot") TimeSlot timeSlot
    );
}
