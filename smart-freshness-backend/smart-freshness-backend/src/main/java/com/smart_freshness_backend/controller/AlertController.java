package com.smart_freshness_backend.controller;

import com.smart_freshness_backend.entity.Alert;
import com.smart_freshness_backend.entity.AlertConfig;
import com.smart_freshness_backend.service.AlertService;
import com.smart_freshness_backend.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;
    private final AuditService auditService;

    /**
     * Get all alerts (admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Alert>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    /**
     * Get recent alerts (last 24 hours)
     */
    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Alert>> getRecentAlerts() {
        return ResponseEntity.ok(alertService.getRecentAlerts());
    }

    /**
     * Get alerts for a specific unit
     */
    @GetMapping("/unit/{unitId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Alert>> getAlertsForUnit(@PathVariable Long unitId) {
        return ResponseEntity.ok(alertService.getAlertsForUnit(unitId));
    }

    /**
     * Get alert configuration
     */
    @GetMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAlertConfig() {
        AlertConfig config = alertService.getConfig();
        Map<String, Object> response = new HashMap<>();
        response.put("freshnessThreshold", config.getFreshnessThreshold());
        response.put("cooldownMinutes", config.getCooldownMinutes());
        return ResponseEntity.ok(response);
    }

    /**
     * Update alert configuration (admin only)
     */
    @PutMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateAlertConfig(@RequestBody Map<String, Integer> request) {
        // Get old config for audit
        AlertConfig oldConfig = alertService.getConfig();
        Map<String, Object> oldValues = new HashMap<>();
        oldValues.put("freshnessThreshold", oldConfig.getFreshnessThreshold());
        oldValues.put("cooldownMinutes", oldConfig.getCooldownMinutes());

        Integer freshnessThreshold = request.get("freshnessThreshold");
        Integer cooldownMinutes = request.get("cooldownMinutes");

        AlertConfig updated = alertService.updateConfig(freshnessThreshold, cooldownMinutes);

        // Audit log
        Map<String, Object> newValues = new HashMap<>();
        newValues.put("freshnessThreshold", updated.getFreshnessThreshold());
        newValues.put("cooldownMinutes", updated.getCooldownMinutes());

        auditService.logUpdate(
                AuditService.ENTITY_ALERT_CONFIG,
                updated.getId(),
                oldValues,
                newValues,
                String.format("Alert config updated: threshold %d->%d, cooldown %d->%d",
                        oldConfig.getFreshnessThreshold(), updated.getFreshnessThreshold(),
                        oldConfig.getCooldownMinutes(), updated.getCooldownMinutes()));

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Alert configuration updated successfully");
        response.put("freshnessThreshold", updated.getFreshnessThreshold());
        response.put("cooldownMinutes", updated.getCooldownMinutes());
        return ResponseEntity.ok(response);
    }
}
