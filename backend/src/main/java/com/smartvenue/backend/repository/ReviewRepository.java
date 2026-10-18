package com.smartvenue.backend.repository;

import com.smartvenue.backend.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByBookingId(Long bookingId);
    List<Review> findByVenueIdAndIsApprovedTrueOrderByCreatedAtDesc(Long venueId);
    List<Review> findByVendorIdAndIsApprovedTrueOrderByCreatedAtDesc(Long vendorId);
    List<Review> findByIsApprovedFalseOrderByCreatedAtAsc();
}
