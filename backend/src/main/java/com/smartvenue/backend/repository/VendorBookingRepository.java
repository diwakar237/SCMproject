package com.smartvenue.backend.repository;

import com.smartvenue.backend.domain.VendorBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorBookingRepository extends JpaRepository<VendorBooking, Long> {
    List<VendorBooking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<VendorBooking> findByVendorIdOrderByCreatedAtDesc(Long vendorId);
}
