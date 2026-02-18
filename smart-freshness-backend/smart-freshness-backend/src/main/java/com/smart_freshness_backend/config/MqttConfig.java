package com.smart_freshness_backend.config;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class MqttConfig {

    @Value("${mqtt.broker:tcp://localhost:1883}")
    private String broker;

    @Value("${mqtt.client-id:smartfreshness-client}")
    private String clientId;

    @Value("${mqtt.username:}")
    private String username;

    @Value("${mqtt.password:}")
    private String password;

    @Value("${mqtt.connection-timeout:30}")
    private int connectionTimeout;

    @Value("${mqtt.keep-alive-interval:60}")
    private int keepAliveInterval;

    @Value("${mqtt.auto-reconnect:true}")
    private boolean autoReconnect;

    @Bean
    public MqttConnectOptions mqttConnectOptions() {
        MqttConnectOptions options = new MqttConnectOptions();
        options.setServerURIs(new String[] { broker });
        options.setConnectionTimeout(connectionTimeout);
        options.setKeepAliveInterval(keepAliveInterval);
        options.setAutomaticReconnect(autoReconnect);
        options.setCleanSession(true);

        if (username != null && !username.isEmpty()) {
            options.setUserName(username);
        }
        if (password != null && !password.isEmpty()) {
            options.setPassword(password.toCharArray());
        }

        return options;
    }

    @Bean
    public MqttClient mqttClient(MqttConnectOptions options) {
        try {
            MqttClient client = new MqttClient(broker, clientId, new MemoryPersistence());

            // Try to connect, but don't fail if MQTT broker is not available
            try {
                client.connect(options);
                log.info("Connected to MQTT broker: {}", broker);
            } catch (MqttException e) {
                log.warn("Could not connect to MQTT broker: {}. MQTT features will be disabled.",
                        e.getMessage());
            }

            return client;
        } catch (MqttException e) {
            log.error("Failed to create MQTT client: {}", e.getMessage());
            throw new RuntimeException("Failed to create MQTT client", e);
        }
    }
}
