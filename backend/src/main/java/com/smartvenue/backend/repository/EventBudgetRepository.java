package com.smartvenue.backend.repository;

import com.smartvenue.backend.domain.EventBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventBudgetRepository extends JpaRepository<EventBudget, Long> {
    List<EventBudget> findByUserIdOrderByUpdatedAtDesc(Long userId);
}
