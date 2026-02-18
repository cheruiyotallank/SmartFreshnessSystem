package com.smart_freshness_backend.repository;

import com.smart_freshness_backend.entity.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {

    /**
     * Find the latest reading for a specific unit.
     */
    Optional<SensorReading> findTopByUnitIdOrderByTimestampDesc(Long unitId);

    /**
     * Find the last 50 readings for a specific unit.
     */
    List<SensorReading> findTop50ByUnitIdOrderByTimestampDesc(Long unitId);

    /**
     * Find all readings for a specific unit ordered by timestamp.
     */
    List<SensorReading> findByUnitIdOrderByTimestampDesc(Long unitId);

    /**
     * Find readings for a unit within a time range.
     */
    List<SensorReading> findByUnitIdAndTimestampBetweenOrderByTimestampDesc(
            Long unitId, LocalDateTime start, LocalDateTime end);

    /**
     * Find readings for a device.
     */
    List<SensorReading> findByDeviceIdOrderByTimestampDesc(Long deviceId);

    /**
     * Count readings for a unit.
     */
    long countByUnitId(Long unitId);

    /**
     * Delete old readings (for cleanup).
     */
    void deleteByTimestampBefore(LocalDateTime timestamp);

    /**
     * Find readings after a specific timestamp.
     */
    List<SensorReading> findByTimestampAfter(LocalDateTime timestamp);

    /**
     * Get latest reading for each unit (for freshness distribution).
     */
    @Query("SELECT sr FROM SensorReading sr WHERE sr.timestamp = " +
            "(SELECT MAX(sr2.timestamp) FROM SensorReading sr2 WHERE sr2.unit.id = sr.unit.id)")
    List<SensorReading> findLatestReadingsPerUnit();
}
