package com.smart_freshness_backend.service;

import com.smart_freshness_backend.dto.FreshnessOverviewDto;
import com.smart_freshness_backend.entity.Device;
import com.smart_freshness_backend.entity.SensorReading;
import com.smart_freshness_backend.entity.Unit;
import com.smart_freshness_backend.exception.ResourceNotFoundException;
import com.smart_freshness_backend.repository.SensorReadingRepository;
import com.smart_freshness_backend.util.PricingUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class FreshnessService {

    private final SensorReadingRepository sensorReadingRepository;
    private final UnitService unitService;
    private final DeviceService deviceService;
    private final PricingUtil pricingUtil;
    private final SimpMessagingTemplate messagingTemplate;
    private final AlertService alertService;

    public FreshnessService(
            SensorReadingRepository sensorReadingRepository,
            UnitService unitService,
            DeviceService deviceService,
            PricingUtil pricingUtil,
            SimpMessagingTemplate messagingTemplate,
            @Lazy AlertService alertService) {
        this.sensorReadingRepository = sensorReadingRepository;
        this.unitService = unitService;
        this.deviceService = deviceService;
        this.pricingUtil = pricingUtil;
        this.messagingTemplate = messagingTemplate;
        this.alertService = alertService;
    }

    /**
     * Process incoming sensor data from ESP32.
     * Calculates freshness score, updates price, triggers alerts, and broadcasts
     * via WebSocket.
     */
    @Transactional
    public SensorReading processSensorData(Long unitId, String deviceId,
            Double voc, Double temperature, Double humidity) {
        // Get or register device and update lastSeen
        Device device = deviceService.getDeviceByDeviceId(deviceId)
                .orElseGet(() -> deviceService.registerOrGetDevice(deviceId, null, null));

        // Update device lastSeen timestamp
        deviceService.updateLastSeen(device.getId());

        // Get unit
        Unit unit = unitService.getUnitById(unitId);

        // Calculate freshness score
        int freshnessScore = pricingUtil.calculateFreshnessScore(voc, temperature, humidity);

        // Calculate dynamic price using effective base price (seasonal)
        double basePrice = unit.getProduct() != null ? unit.getProduct().getEffectiveBasePrice() : 0.0;
        double computedPrice = pricingUtil.calculateDynamicPrice(basePrice, freshnessScore);

        // Create sensor reading
        SensorReading reading = SensorReading.builder()
                .unit(unit)
                .device(device)
                .voc(voc)
                .temperature(temperature)
                .humidity(humidity)
                .freshnessScore(freshnessScore)
                .computedPrice(computedPrice)
                .timestamp(LocalDateTime.now())
                .build();

        reading = sensorReadingRepository.save(reading);

        // Update unit's current price
        unit.setCurrentPrice(computedPrice);
        unitService.updateUnit(unit.getId(), unit);

        // Check if alert should be triggered
        if (alertService.shouldTriggerAlert(unitId, freshnessScore)) {
            alertService.triggerAlert(unit, freshnessScore);
        }

        // Broadcast to WebSocket subscribers
        broadcastFreshnessUpdate(unitId, reading, unit);

        log.info("Processed sensor data: unitId={}, freshnessScore={}, price={}",
                unitId, freshnessScore, computedPrice);

        return reading;
    }

    /**
     * Get freshness overview for a unit.
     */
    public FreshnessOverviewDto getOverview(Long unitId) {
        Unit unit = unitService.getUnitById(unitId);

        SensorReading latestReading = sensorReadingRepository
                .findTopByUnitIdOrderByTimestampDesc(unitId)
                .orElse(null);

        String productName = unit.getProduct() != null ? unit.getProduct().getName() : "Unknown";

        FreshnessOverviewDto overview = new FreshnessOverviewDto();
        overview.setUnitId(unitId);
        overview.setUnitName(unit.getName());
        overview.setProductName(productName);
        overview.setInventoryCount(unit.getInventoryCount());
        overview.setCurrentPrice(unit.getCurrentPrice());

        if (latestReading != null) {
            overview.setLatestFreshnessScore(latestReading.getFreshnessScore());
            overview.setVoc(latestReading.getVoc());
            overview.setTemperature(latestReading.getTemperature());
            overview.setHumidity(latestReading.getHumidity());
            overview.setLatestReadingTimestamp(latestReading.getTimestamp());
            overview.setFreshnessStatus(pricingUtil.getFreshnessStatus(latestReading.getFreshnessScore()));
            overview.setDiscountPercentage(pricingUtil.getDiscountPercentage(latestReading.getFreshnessScore()));
        }

        return overview;
    }

    /**
     * Get recent sensor readings for a unit.
     */
    public List<SensorReading> getRecentReadings(Long unitId, int limit) {
        unitService.getUnitById(unitId);
        return sensorReadingRepository.findTop50ByUnitIdOrderByTimestampDesc(unitId);
    }

    /**
     * Get readings for a unit within a date range.
     */
    public List<SensorReading> getReadingsByDateRange(Long unitId, LocalDateTime start, LocalDateTime end) {
        unitService.getUnitById(unitId);
        return sensorReadingRepository.findByUnitIdAndTimestampBetweenOrderByTimestampDesc(unitId, start, end);
    }

    /**
     * Get all readings for a unit.
     */
    public List<SensorReading> getAllReadings(Long unitId) {
        return sensorReadingRepository.findByUnitIdOrderByTimestampDesc(unitId);
    }

    /**
     * Broadcast freshness update via WebSocket.
     */
    private void broadcastFreshnessUpdate(Long unitId, SensorReading reading, Unit unit) {
        try {
            FreshnessOverviewDto update = new FreshnessOverviewDto();
            update.setUnitId(unitId);
            update.setUnitName(unit.getName());
            update.setProductName(unit.getProduct() != null ? unit.getProduct().getName() : "Unknown");
            update.setLatestFreshnessScore(reading.getFreshnessScore());
            update.setCurrentPrice(reading.getComputedPrice());
            update.setInventoryCount(unit.getInventoryCount());
            update.setVoc(reading.getVoc());
            update.setTemperature(reading.getTemperature());
            update.setHumidity(reading.getHumidity());
            update.setLatestReadingTimestamp(reading.getTimestamp());
            update.setFreshnessStatus(pricingUtil.getFreshnessStatus(reading.getFreshnessScore()));
            update.setDiscountPercentage(pricingUtil.getDiscountPercentage(reading.getFreshnessScore()));

            messagingTemplate.convertAndSend("/topic/freshness/" + unitId, update);
            log.debug("Broadcast freshness update for unitId={}", unitId);
        } catch (Exception e) {
            log.error("Failed to broadcast freshness update: {}", e.getMessage());
        }
    }

    /**
     * Get the latest reading for a unit.
     */
    public SensorReading getLatestReading(Long unitId) {
        return sensorReadingRepository.findTopByUnitIdOrderByTimestampDesc(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("No readings found for unit: " + unitId));
    }
}
