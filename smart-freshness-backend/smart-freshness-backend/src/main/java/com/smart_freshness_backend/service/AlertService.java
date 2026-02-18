package com.smart_freshness_backend.service;

import com.smart_freshness_backend.entity.Alert;
import com.smart_freshness_backend.entity.AlertConfig;
import com.smart_freshness_backend.entity.Unit;
import com.smart_freshness_backend.entity.User;
import com.smart_freshness_backend.repository.AlertConfigRepository;
import com.smart_freshness_backend.repository.AlertRepository;
import com.smart_freshness_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing freshness alerts
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final AlertConfigRepository alertConfigRepository;
    private final SmsService smsService;

    /**
     * Get current alert configuration from database
     */
    public AlertConfig getConfig() {
        return alertConfigRepository.getGlobalConfig();
    }

    /**
     * Update alert configuration
     */
    @Transactional
    public AlertConfig updateConfig(Integer freshnessThreshold, Integer cooldownMinutes) {
        AlertConfig config = alertConfigRepository.getGlobalConfig();
        if (freshnessThreshold != null) {
            config.setFreshnessThreshold(freshnessThreshold);
        }
        if (cooldownMinutes != null) {
            config.setCooldownMinutes(cooldownMinutes);
        }
        log.info("Updated alert config: threshold={}%, cooldown={}min",
                config.getFreshnessThreshold(), config.getCooldownMinutes());
        return alertConfigRepository.save(config);
    }

    /**
     * Check if an alert should be triggered for a unit with the given freshness
     * score
     */
    public boolean shouldTriggerAlert(Long unitId, int freshnessScore) {
        AlertConfig config = getConfig();

        // Check if freshness is below threshold
        if (freshnessScore >= config.getFreshnessThreshold()) {
            return false;
        }

        // Check cooldown - don't spam alerts
        return alertRepository.findTopByUnitIdOrderByCreatedAtDesc(unitId)
                .map(lastAlert -> lastAlert.getCreatedAt()
                        .isBefore(LocalDateTime.now().minusMinutes(config.getCooldownMinutes())))
                .orElse(true); // No previous alert, so trigger
    }

    /**
     * Trigger an alert for low freshness
     */
    @Transactional
    public Alert triggerAlert(Unit unit, int freshnessScore) {
        AlertConfig config = getConfig();

        // Get admin phone numbers
        List<String> adminPhones = getAdminPhoneNumbers();

        if (adminPhones.isEmpty()) {
            log.warn("No admin phone numbers configured for alerts");
            return null;
        }

        String productName = unit.getProduct() != null ? unit.getProduct().getName() : "Unknown";
        String message = String.format(
                "⚠️ FRESHNESS ALERT!\n" +
                        "Unit: %s\n" +
                        "Product: %s\n" +
                        "Freshness: %d%% (Below %d%% threshold)\n" +
                        "Action required!",
                unit.getName(), productName, freshnessScore, config.getFreshnessThreshold());

        // Create alert record
        Alert alert = Alert.builder()
                .unit(unit)
                .freshnessScore(freshnessScore)
                .message(message)
                .recipients(String.join(",", adminPhones))
                .sent(false)
                .createdAt(LocalDateTime.now())
                .build();

        // Try to send SMS
        try {
            boolean sent = smsService.sendSms(adminPhones, message);
            alert.setSent(sent);
            if (sent) {
                alert.setSentAt(LocalDateTime.now());
                log.info("Alert SMS sent for unit {} with freshness {}%", unit.getId(), freshnessScore);
            } else {
                alert.setErrorMessage("SMS sending returned false");
            }
        } catch (Exception e) {
            alert.setErrorMessage(e.getMessage());
            log.error("Failed to send alert SMS: {}", e.getMessage());
        }

        return alertRepository.save(alert);
    }

    /**
     * Get phone numbers of all admins
     */
    private List<String> getAdminPhoneNumbers() {
        return userRepository.findAll().stream()
                .filter(user -> "ROLE_ADMIN".equals(user.getRoles()))
                .filter(user -> user.getPhoneNumber() != null && !user.getPhoneNumber().isBlank())
                .map(User::getPhoneNumber)
                .collect(Collectors.toList());
    }

    /**
     * Get all alerts (most recent first)
     */
    public List<Alert> getAllAlerts() {
        return alertRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Get recent alerts (last 24 hours)
     */
    public List<Alert> getRecentAlerts() {
        return alertRepository.findByCreatedAtAfterOrderByCreatedAtDesc(
                LocalDateTime.now().minusHours(24));
    }

    /**
     * Get alerts for a specific unit
     */
    public List<Alert> getAlertsForUnit(Long unitId) {
        return alertRepository.findByUnitIdOrderByCreatedAtDesc(unitId);
    }

    /**
     * Get the freshness threshold setting
     */
    public int getFreshnessThreshold() {
        return getConfig().getFreshnessThreshold();
    }

    /**
     * Get the cooldown minutes setting
     */
    public int getCooldownMinutes() {
        return getConfig().getCooldownMinutes();
    }
}
