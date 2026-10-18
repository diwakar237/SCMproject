package com.smartvenue.backend.repository;

import com.smartvenue.backend.domain.VendorServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorServiceRepository extends JpaRepository<VendorServiceEntity, Long> {
    List<VendorServiceEntity> findByVendorId(Long vendorId);
}
