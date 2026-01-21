package com.assessment.backend.service;

import com.assessment.backend.entity.AuditLog;
import com.assessment.backend.entity.User;
import com.assessment.backend.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    /**
     * Log an audit event with automatic user detection from SecurityContext
     */
    public void log(String action, String targetTable, UUID targetId, HttpServletRequest request) {
        User user = getCurrentUser();
        log(user, action, targetTable, targetId, null, request);
    }

    /**
     * Log an audit event with details and automatic user detection
     */
    public void log(String action, String targetTable, UUID targetId, String details, HttpServletRequest request) {
        User user = getCurrentUser();
        log(user, action, targetTable, targetId, details, request);
    }

    /**
     * Log an audit event with explicit user (for login where user isn't in context yet)
     */
    public void log(User user, String action, String targetTable, UUID targetId, HttpServletRequest request) {
        log(user, action, targetTable, targetId, null, request);
    }

    /**
     * Log an audit event with explicit user and details
     */
    public void log(User user, String action, String targetTable, UUID targetId, String details, HttpServletRequest request) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(user);
        auditLog.setAction(action);
        auditLog.setTargetTable(targetTable);
        auditLog.setTargetId(targetId);
        auditLog.setDetails(details);
        auditLog.setIpAddress(getClientIp(request));
        auditLog.setUserAgent(request != null ? request.getHeader("User-Agent") : null);
        
        auditLogRepository.save(auditLog);
    }

    public Page<AuditLog> getAllLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable);
    }

    public Page<AuditLog> getLogsByUser(UUID userId, Pageable pageable) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
    }

    public Page<AuditLog> getLogsByAction(String action, Pageable pageable) {
        return auditLogRepository.findByActionOrderByTimestampDesc(action, pageable);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            return (User) auth.getPrincipal();
        }
        return null;
    }

    private String getClientIp(HttpServletRequest request) {
        if (request == null) return null;
        
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
