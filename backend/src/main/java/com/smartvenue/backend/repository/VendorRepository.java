package com.smartvenue.backend.repository;

import com.smartvenue.backend.domain.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    List<Vendor> findByUserId(Long userId);
    Optional<Vendor> findByUserIdAndId(Long userId, Long id);

    @Query("SELECT v FROM Vendor v WHERE v.approved = true " +
           "AND (:category IS NULL OR LOWER(v.serviceCategory) = LOWER(:category)) " +
           "AND (:city IS NULL OR LOWER(v.city) LIKE LOWER(CONCAT('%', :city, '%'))) " +
           "AND (:search IS NULL OR LOWER(v.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(v.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Vendor> searchApprovedVendors(
            @Param("category") String category,
            @Param("city") String city,
            @Param("search") String search,
            Pageable pageable
    );

    List<Vendor> findByApprovedFalseOrderByCreatedAtAsc();
}
