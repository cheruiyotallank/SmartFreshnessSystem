package com.smart_freshness_backend.controller;

import com.smart_freshness_backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * Get dashboard summary statistics
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {
        return ResponseEntity.ok(analyticsService.getDashboardSummary());
    }

    /**
     * Get freshness trend over specified days
     */
    @GetMapping("/freshness-trend")
    public ResponseEntity<List<Map<String, Object>>> getFreshnessTrend(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(analyticsService.getFreshnessTrend(days));
    }

    /**
     * Get alert frequency over specified days
     */
    @GetMapping("/alert-frequency")
    public ResponseEntity<List<Map<String, Object>>> getAlertFrequency(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(analyticsService.getAlertFrequency(days));
    }

    /**
     * Get freshness distribution
     */
    @GetMapping("/freshness-distribution")
    public ResponseEntity<Map<String, Long>> getFreshnessDistribution() {
        return ResponseEntity.ok(analyticsService.getFreshnessDistribution());
    }

    /**
     * Get waste metrics
     */
    @GetMapping("/waste-metrics")
    public ResponseEntity<Map<String, Object>> getWasteMetrics() {
        return ResponseEntity.ok(analyticsService.getWasteMetrics());
    }

    /**
     * Get sensor metrics
     */
    @GetMapping("/sensor-metrics")
    public ResponseEntity<Map<String, Object>> getSensorMetrics() {
        return ResponseEntity.ok(analyticsService.getSensorMetrics());
    }
}
