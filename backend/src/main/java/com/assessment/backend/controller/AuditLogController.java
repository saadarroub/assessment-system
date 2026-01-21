package com.assessment.backend.controller;

import com.assessment.backend.dto.AuditLogDTO;
import com.assessment.backend.entity.AuditLog;
import com.assessment.backend.entity.User;
import com.assessment.backend.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAuthority('auditlogs.view')")
    public ResponseEntity<List<AuditLogDTO>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> logs = auditLogService.getAllLogs(pageable);
        
        List<AuditLogDTO> dtos = logs.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

    private AuditLogDTO toDTO(AuditLog log) {
        User user = log.getUser();
        return new AuditLogDTO(
                log.getId(),
                log.getTimestamp(),
                user != null ? user.getName() : null,
                user != null ? user.getEmail() : null,
                log.getAction(),
                log.getTargetTable(),
                log.getTargetId(),
                log.getDetails()
        );
    }
}
