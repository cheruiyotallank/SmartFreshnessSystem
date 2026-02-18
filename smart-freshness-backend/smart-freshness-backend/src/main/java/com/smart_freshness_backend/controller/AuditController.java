package com.smart_freshness_backend.controller;

import com.smart_freshness_backend.entity.AuditLog;
import com.smart_freshness_backend.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {

    private final AuditService auditService;

    /**
     * Get recent audit logs (last 50)
     */
    @GetMapping
    public ResponseEntity<List<AuditLog>> getRecentLogs() {
        return ResponseEntity.ok(auditService.getRecentLogs());
    }

    /**
     * Get all audit logs
     */
    @GetMapping("/all")
    public ResponseEntity<List<AuditLog>> getAllLogs() {
        return ResponseEntity.ok(auditService.getAllLogs());
    }

    /**
     * Get logs for a specific entity
     */
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<AuditLog>> getLogsForEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        return ResponseEntity.ok(auditService.getLogsForEntity(entityType.toUpperCase(), entityId));
    }

    /**
     * Get logs by entity type
     */
    @GetMapping("/type/{entityType}")
    public ResponseEntity<List<AuditLog>> getLogsByType(@PathVariable String entityType) {
        return ResponseEntity.ok(auditService.getLogsByType(entityType.toUpperCase()));
    }

    /**
     * Get logs by user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLog>> getLogsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(auditService.getLogsByUser(userId));
    }

    /**
     * Get logs from last N hours
     */
    @GetMapping("/since/{hours}")
    public ResponseEntity<List<AuditLog>> getLogsSince(@PathVariable int hours) {
        return ResponseEntity.ok(auditService.getLogsSince(hours));
    }
}
