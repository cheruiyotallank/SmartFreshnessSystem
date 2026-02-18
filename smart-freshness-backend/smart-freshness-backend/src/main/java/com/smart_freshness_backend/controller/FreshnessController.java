package com.smart_freshness_backend.controller;

import com.smart_freshness_backend.dto.FreshnessOverviewDto;
import com.smart_freshness_backend.entity.SensorReading;
import com.smart_freshness_backend.service.FreshnessService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/freshness")
@RequiredArgsConstructor
public class FreshnessController {

    private final FreshnessService freshnessService;

    /**
     * Get freshness overview for a specific unit.
     */
    @GetMapping("/overview/{unitId}")
    public ResponseEntity<Map<String, Object>> getOverview(@PathVariable Long unitId) {
        try {
            FreshnessOverviewDto overview = freshnessService.getOverview(unitId);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", overview);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get recent sensor readings for a unit.
     */
    @GetMapping("/readings/{unitId}")
    public ResponseEntity<Map<String, Object>> getReadings(@PathVariable Long unitId) {
        try {
            List<SensorReading> readings = freshnessService.getRecentReadings(unitId, 50);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", readings);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get sensor readings for a unit within a date range.
     */
    @GetMapping("/readings/{unitId}/range")
    public ResponseEntity<Map<String, Object>> getReadingsByDateRange(
            @PathVariable Long unitId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        try {
            List<SensorReading> readings = freshnessService.getReadingsByDateRange(unitId, start, end);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", readings);
            response.put("count", readings.size());
            response.put("startDate", start);
            response.put("endDate", end);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get the latest reading for a unit.
     */
    @GetMapping("/latest/{unitId}")
    public ResponseEntity<SensorReading> getLatestReading(@PathVariable Long unitId) {
        return ResponseEntity.ok(freshnessService.getLatestReading(unitId));
    }

    /**
     * Manual endpoint to submit sensor data (for testing without MQTT).
     */
    @PostMapping("/data")
    public ResponseEntity<SensorReading> submitSensorData(
            @RequestParam Long unitId,
            @RequestParam String deviceId,
            @RequestParam Double voc,
            @RequestParam Double temperature,
            @RequestParam Double humidity) {

        SensorReading reading = freshnessService.processSensorData(
                unitId, deviceId, voc, temperature, humidity);
        return ResponseEntity.ok(reading);
    }

    /**
     * Submit sensor data via JSON body.
     */
    @PostMapping("/submit")
    public ResponseEntity<SensorReading> submitData(@RequestBody SensorDataRequest request) {
        SensorReading reading = freshnessService.processSensorData(
                request.getUnitId(),
                request.getDeviceId(),
                request.getVoc(),
                request.getTemperature(),
                request.getHumidity());
        return ResponseEntity.ok(reading);
    }

    /**
     * Inner class for sensor data request.
     */
    @lombok.Data
    public static class SensorDataRequest {
        private Long unitId;
        private String deviceId;
        private Double voc;
        private Double temperature;
        private Double humidity;
    }
}
