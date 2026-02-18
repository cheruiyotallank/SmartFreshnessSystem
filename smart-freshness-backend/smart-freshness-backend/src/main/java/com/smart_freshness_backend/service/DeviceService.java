package com.smart_freshness_backend.service;

import com.smart_freshness_backend.entity.Device;
import com.smart_freshness_backend.exception.ResourceNotFoundException;
import com.smart_freshness_backend.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;

    /**
     * Get all devices.
     */
    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }

    /**
     * Get device by ID.
     */
    public Device getDeviceById(Long id) {
        return deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + id));
    }

    /**
     * Get device by device ID (e.g., "ESP32-001").
     */
    public Optional<Device> getDeviceByDeviceId(String deviceId) {
        return deviceRepository.findByDeviceId(deviceId);
    }

    /**
     * Create a new device.
     */
    @Transactional
    public Device createDevice(Device device) {
        if (deviceRepository.findByDeviceId(device.getDeviceId()).isPresent()) {
            throw new RuntimeException("Device with deviceId already exists: " + device.getDeviceId());
        }
        device.setLastSeen(LocalDateTime.now());
        return deviceRepository.save(device);
    }

    /**
     * Update device details.
     */
    @Transactional
    public Device updateDevice(Long id, Device updatedDevice) {
        Device device = getDeviceById(id);

        if (updatedDevice.getName() != null) {
            device.setName(updatedDevice.getName());
        }
        if (updatedDevice.getLocation() != null) {
            device.setLocation(updatedDevice.getLocation());
        }
        if (updatedDevice.getDeviceId() != null && !updatedDevice.getDeviceId().equals(device.getDeviceId())) {
            if (deviceRepository.findByDeviceId(updatedDevice.getDeviceId()).isPresent()) {
                throw new RuntimeException("Device with deviceId already exists: " + updatedDevice.getDeviceId());
            }
            device.setDeviceId(updatedDevice.getDeviceId());
        }

        return deviceRepository.save(device);
    }

    /**
     * Update device lastSeen timestamp.
     */
    @Transactional
    public void updateLastSeen(Long id) {
        Device device = getDeviceById(id);
        device.setLastSeen(LocalDateTime.now());
        deviceRepository.save(device);
    }

    /**
     * Delete device by ID.
     */
    @Transactional
    public void deleteDevice(Long id) {
        if (!deviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Device not found with id: " + id);
        }
        deviceRepository.deleteById(id);
    }

    /**
     * Register or get device (for ESP32 auto-registration).
     */
    @Transactional
    public Device registerOrGetDevice(String deviceId, String name, String location) {
        return deviceRepository.findByDeviceId(deviceId)
                .orElseGet(() -> deviceRepository.save(
                        Device.builder()
                                .deviceId(deviceId)
                                .name(name != null ? name : "ESP32-" + deviceId)
                                .location(location != null ? location : "Unknown")
                                .lastSeen(LocalDateTime.now())
                                .build()));
    }

    /**
     * Count total devices.
     */
    public long countDevices() {
        return deviceRepository.count();
    }

    /**
     * Count online devices.
     */
    public long countOnlineDevices() {
        return deviceRepository.findAll().stream()
                .filter(Device::isOnline)
                .count();
    }
}
