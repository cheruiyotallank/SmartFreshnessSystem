package com.smart_freshness_backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smart_freshness_backend.entity.AuditLog;
import com.smart_freshness_backend.entity.User;
import com.smart_freshness_backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Service for recording audit logs
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public static final String ACTION_CREATE = "CREATE";
    public static final String ACTION_UPDATE = "UPDATE";
    public static final String ACTION_DELETE = "DELETE";

    public static final String ENTITY_PRODUCT = "PRODUCT";
    public static final String ENTITY_UNIT = "UNIT";
    public static final String ENTITY_ALERT_CONFIG = "ALERT_CONFIG";
    public static final String ENTITY_USER = "USER";
    public static final String ENTITY_DEVICE = "DEVICE";

    /**
     * Log an entity creation
     */
    @Transactional
    public AuditLog logCreate(String entityType, Long entityId, Object newEntity, String description) {
        return createLog(entityType, entityId, ACTION_CREATE, null, newEntity, description);
    }

    /**
     * Log an entity update
     */
    @Transactional
    public AuditLog logUpdate(String entityType, Long entityId, Object oldEntity, Object newEntity,
            String description) {
        return createLog(entityType, entityId, ACTION_UPDATE, oldEntity, newEntity, description);
    }

    /**
     * Log an entity deletion
     */
    @Transactional
    public AuditLog logDelete(String entityType, Long entityId, Object deletedEntity, String description) {
        return createLog(entityType, entityId, ACTION_DELETE, deletedEntity, null, description);
    }

    /**
     * Create and save an audit log entry
     */
    private AuditLog createLog(String entityType, Long entityId, String action,
            Object oldEntity, Object newEntity, String description) {
        try {
            // Get current user from security context
            String userName = "System";
            String userEmail = null;
            Long userId = null;

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof User) {
                User user = (User) auth.getPrincipal();
                userId = user.getId();
                userName = user.getName();
                userEmail = user.getEmail();
            } else if (auth != null && auth.getName() != null) {
                userEmail = auth.getName();
                userName = auth.getName();
            }

            String oldValue = oldEntity != null ? toJson(oldEntity) : null;
            String newValue = newEntity != null ? toJson(newEntity) : null;

            AuditLog auditLog = AuditLog.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .action(action)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .userId(userId)
                    .userName(userName)
                    .userEmail(userEmail)
                    .timestamp(LocalDateTime.now())
                    .description(description)
                    .build();

            AuditLog saved = auditLogRepository.save(auditLog);
            log.info("Audit log created: {} {} {} by {}", action, entityType, entityId, userName);
            return saved;
        } catch (Exception e) {
            log.error("Failed to create audit log: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Convert entity to JSON string for storage
     */
    private String toJson(Object entity) {
        try {
            if (entity instanceof Map) {
                return objectMapper.writeValueAsString(entity);
            }
            // Serialize key fields only to avoid circular references
            Map<String, Object> map = objectMapper.convertValue(entity, Map.class);
            // Remove potentially large or circular fields
            map.remove("readings");
            map.remove("units");
            map.remove("password");
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            log.warn("Failed to serialize entity: {}", e.getMessage());
            return entity.toString();
        }
    }

    /**
     * Get all audit logs (most recent first)
     */
    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    /**
     * Get recent logs (last 50)
     */
    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }

    /**
     * Get logs for a specific entity
     */
    public List<AuditLog> getLogsForEntity(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
    }

    /**
     * Get logs by entity type
     */
    public List<AuditLog> getLogsByType(String entityType) {
        return auditLogRepository.findByEntityTypeOrderByTimestampDesc(entityType);
    }

    /**
     * Get logs by user
     */
    public List<AuditLog> getLogsByUser(Long userId) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    /**
     * Get logs from last N hours
     */
    public List<AuditLog> getLogsSince(int hours) {
        return auditLogRepository.findByTimestampAfterOrderByTimestampDesc(
                LocalDateTime.now().minusHours(hours));
    }
}
