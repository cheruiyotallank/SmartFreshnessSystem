package com.smart_freshness_backend.service;

import com.smart_freshness_backend.entity.Alert;
import com.smart_freshness_backend.entity.SensorReading;
import com.smart_freshness_backend.repository.AlertRepository;
import com.smart_freshness_backend.repository.SensorReadingRepository;
import com.smart_freshness_backend.repository.ProductRepository;
import com.smart_freshness_backend.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for dashboard analytics and metrics
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final SensorReadingRepository sensorReadingRepository;
    private final AlertRepository alertRepository;
    private final ProductRepository productRepository;
    private final UnitRepository unitRepository;

    /**
     * Get summary statistics for dashboard
     */
    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();

        summary.put("totalProducts", productRepository.count());
        summary.put("totalUnits", unitRepository.count());
        summary.put("totalAlerts", alertRepository.count());
        summary.put("alertsToday", getAlertCountToday());
        summary.put("avgFreshness", getAverageFreshness());
        summary.put("lowFreshnessUnits", getLowFreshnessUnitCount());

        return summary;
    }

    /**
     * Get freshness trend over time
     */
    public List<Map<String, Object>> getFreshnessTrend(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<SensorReading> readings = sensorReadingRepository.findByTimestampAfter(startDate);

        // Group by date
        Map<LocalDate, List<SensorReading>> byDate = readings.stream()
                .collect(Collectors.groupingBy(r -> r.getTimestamp().toLocalDate()));

        List<Map<String, Object>> trend = new ArrayList<>();
        for (int i = days; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            List<SensorReading> dayReadings = byDate.getOrDefault(date, Collections.emptyList());

            Map<String, Object> point = new HashMap<>();
            point.put("date", date.toString());
            point.put("avgFreshness", dayReadings.isEmpty() ? 0
                    : dayReadings.stream().mapToInt(SensorReading::getFreshnessScore).average().orElse(0));
            point.put("readingCount", dayReadings.size());
            trend.add(point);
        }

        return trend;
    }

    /**
     * Get alert frequency over time
     */
    public List<Map<String, Object>> getAlertFrequency(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Alert> alerts = alertRepository.findByCreatedAtAfterOrderByCreatedAtDesc(startDate);

        // Group by date
        Map<LocalDate, Long> alertsByDate = alerts.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getCreatedAt().toLocalDate(),
                        Collectors.counting()));

        List<Map<String, Object>> frequency = new ArrayList<>();
        for (int i = days; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            Map<String, Object> point = new HashMap<>();
            point.put("date", date.toString());
            point.put("alertCount", alertsByDate.getOrDefault(date, 0L));
            frequency.add(point);
        }

        return frequency;
    }

    /**
     * Get freshness distribution (buckets: 0-20, 21-40, 41-60, 61-80, 81-100)
     */
    public Map<String, Long> getFreshnessDistribution() {
        List<SensorReading> recentReadings = getLatestReadingsPerUnit();

        Map<String, Long> distribution = new LinkedHashMap<>();
        distribution.put("critical", recentReadings.stream().filter(r -> r.getFreshnessScore() <= 20).count());
        distribution.put("poor",
                recentReadings.stream().filter(r -> r.getFreshnessScore() > 20 && r.getFreshnessScore() <= 40).count());
        distribution.put("moderate",
                recentReadings.stream().filter(r -> r.getFreshnessScore() > 40 && r.getFreshnessScore() <= 60).count());
        distribution.put("good",
                recentReadings.stream().filter(r -> r.getFreshnessScore() > 60 && r.getFreshnessScore() <= 80).count());
        distribution.put("excellent", recentReadings.stream().filter(r -> r.getFreshnessScore() > 80).count());

        return distribution;
    }

    /**
     * Get waste metrics (units with freshness below threshold)
     */
    public Map<String, Object> getWasteMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        List<SensorReading> recentReadings = getLatestReadingsPerUnit();
        long lowFreshnessCount = recentReadings.stream()
                .filter(r -> r.getFreshnessScore() < 60)
                .count();

        long totalUnits = unitRepository.count();
        double wasteRisk = totalUnits > 0 ? (double) lowFreshnessCount / totalUnits * 100 : 0;

        metrics.put("lowFreshnessUnits", lowFreshnessCount);
        metrics.put("totalUnits", totalUnits);
        metrics.put("wasteRiskPercentage", Math.round(wasteRisk * 10) / 10.0);

        // Estimate potential savings (assuming $10 average value per unit saved)
        metrics.put("potentialSavings", lowFreshnessCount * 10);

        return metrics;
    }

    /**
     * Get sensor metrics summary
     */
    public Map<String, Object> getSensorMetrics() {
        List<SensorReading> recentReadings = sensorReadingRepository.findByTimestampAfter(
                LocalDateTime.now().minusHours(24));

        Map<String, Object> metrics = new HashMap<>();

        if (recentReadings.isEmpty()) {
            metrics.put("avgTemperature", 0);
            metrics.put("avgHumidity", 0);
            metrics.put("avgVoc", 0);
            metrics.put("readingsCount", 0);
        } else {
            metrics.put("avgTemperature", recentReadings.stream()
                    .mapToDouble(SensorReading::getTemperature).average().orElse(0));
            metrics.put("avgHumidity", recentReadings.stream()
                    .mapToDouble(SensorReading::getHumidity).average().orElse(0));
            metrics.put("avgVoc", recentReadings.stream()
                    .mapToDouble(SensorReading::getVoc).average().orElse(0));
            metrics.put("readingsCount", recentReadings.size());
        }

        return metrics;
    }

    // Helper methods

    private long getAlertCountToday() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        return alertRepository.findByCreatedAtAfterOrderByCreatedAtDesc(startOfDay).size();
    }

    private double getAverageFreshness() {
        List<SensorReading> latestReadings = getLatestReadingsPerUnit();
        if (latestReadings.isEmpty())
            return 0;
        return latestReadings.stream()
                .mapToInt(SensorReading::getFreshnessScore)
                .average()
                .orElse(0);
    }

    private long getLowFreshnessUnitCount() {
        List<SensorReading> latestReadings = getLatestReadingsPerUnit();
        return latestReadings.stream()
                .filter(r -> r.getFreshnessScore() < 60)
                .count();
    }

    private List<SensorReading> getLatestReadingsPerUnit() {
        // Get latest reading for each unit
        return sensorReadingRepository.findLatestReadingsPerUnit();
    }
}
