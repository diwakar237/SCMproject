package com.smartvenue.backend.repository;

import com.smartvenue.backend.domain.PlannerTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlannerTaskRepository extends JpaRepository<PlannerTask, Long> {
    List<PlannerTask> findByUserIdOrderByDeadlineDateAsc(Long userId);
    List<PlannerTask> findByEventIdOrderByDeadlineDateAsc(Long eventId);
}
