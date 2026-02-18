package com.smart_freshness_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MqttService implements MqttCallback {

    private final MqttClient mqttClient;
    private final FreshnessService freshnessService;
    private final ObjectMapper objectMapper;

    @Value("${mqtt.topic:sensors/freshness}")
    private String topic;

    @Value("${mqtt.qos:1}")
    private int qos;

    /**
     * Initialize MQTT subscription after service is constructed.
     */
    @PostConstruct
    public void init() {
        try {
            if (mqttClient.isConnected()) {
                mqttClient.setCallback(this);
                mqttClient.subscribe(topic + "/#", qos);
                log.info("Subscribed to MQTT topic: {}/#", topic);
            } else {
                log.warn("MQTT client not connected. Subscription will be attempted on reconnect.");
            }
        } catch (MqttException e) {
            log.error("Failed to subscribe to MQTT topic: {}", e.getMessage());
        }
    }

    /**
     * Cleanup MQTT connection on shutdown.
     */
    @PreDestroy
    public void cleanup() {
        try {
            if (mqttClient.isConnected()) {
                mqttClient.disconnect();
                log.info("Disconnected from MQTT broker");
            }
        } catch (MqttException e) {
            log.error("Error disconnecting from MQTT broker: {}", e.getMessage());
        }
    }

    @Override
    public void connectionLost(Throwable cause) {
        log.warn("MQTT connection lost: {}", cause.getMessage());
        // Auto-reconnect is handled by MqttConnectOptions
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) {
        try {
            String payload = new String(message.getPayload());
            log.debug("MQTT message received on topic {}: {}", topic, payload);

            // Parse JSON payload from ESP32
            // Expected format: {"unitId": 1, "deviceId": "ESP32-001", "voc": 120.5,
            // "temperature": 22.3, "humidity": 65.2}
            JsonNode json = objectMapper.readTree(payload);

            Long unitId = json.has("unitId") ? json.get("unitId").asLong() : 1L;
            String deviceId = json.has("deviceId") ? json.get("deviceId").asText() : "UNKNOWN";
            Double voc = json.has("voc") ? json.get("voc").asDouble() : 0.0;
            Double temperature = json.has("temperature") ? json.get("temperature").asDouble() : 0.0;
            Double humidity = json.has("humidity") ? json.get("humidity").asDouble() : 0.0;

            // Process the sensor data
            freshnessService.processSensorData(unitId, deviceId, voc, temperature, humidity);

            log.info("Processed MQTT sensor data: deviceId={}, unitId={}, voc={}, temp={}, humidity={}",
                    deviceId, unitId, voc, temperature, humidity);

        } catch (Exception e) {
            log.error("Failed to process MQTT message: {}", e.getMessage(), e);
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // Not used for subscribing
    }

    /**
     * Publish a message to the MQTT broker.
     */
    public void publish(String topic, String payload) {
        try {
            if (mqttClient.isConnected()) {
                MqttMessage message = new MqttMessage(payload.getBytes());
                message.setQos(qos);
                mqttClient.publish(topic, message);
                log.debug("Published MQTT message to {}: {}", topic, payload);
            } else {
                log.warn("MQTT client not connected. Message not published.");
            }
        } catch (MqttException e) {
            log.error("Failed to publish MQTT message: {}", e.getMessage());
        }
    }

    /**
     * Check if MQTT client is connected.
     */
    public boolean isConnected() {
        return mqttClient != null && mqttClient.isConnected();
    }
}
