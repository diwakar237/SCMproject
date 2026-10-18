package com.smartvenue.backend.repository;

import com.smartvenue.backend.domain.EventGuest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventGuestRepository extends JpaRepository<EventGuest, Long> {
    List<EventGuest> findByEventIdOrderByIdAsc(Long eventId);
    Optional<EventGuest> findByInvitationToken(String invitationToken);
    Optional<EventGuest> findByEventIdAndGuestEmail(Long eventId, String guestEmail);
}
