package com.smartvenue.backend.service;

import com.smartvenue.backend.domain.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AuditService {

    void record(String actorEmail, String action, String resourceType, String resourceId, String details);

    List<AuditLog> getRecentLogs();

    Page<AuditLog> getAllLogs(Pageable pageable);
}
