package com.smartvenue.backend.service;

import com.smartvenue.backend.domain.AuditLog;
import com.smartvenue.backend.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DefaultAuditService implements AuditService {

    private final AuditLogRepository auditLogRepository;

    public DefaultAuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional
    public void record(String actorEmail, String action, String resourceType, String resourceId, String details) {
        AuditLog log = new AuditLog(actorEmail, action, resourceType, resourceId, details);
        auditLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop20ByOrderByCreatedAtDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> getAllLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
