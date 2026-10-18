package com.smartvenue.backend.repository;

import com.smartvenue.backend.domain.Venue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long>, JpaSpecificationExecutor<Venue> {
    List<Venue> findByOwnerId(Long ownerId);
    Page<Venue> findByOwnerId(Long ownerId, Pageable pageable);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT v FROM Venue v WHERE v.id = :id")
    java.util.Optional<Venue> findByIdWithPessimisticLock(@org.springframework.data.repository.query.Param("id") Long id);
}
