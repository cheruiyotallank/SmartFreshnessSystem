package com.smart_freshness_backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * SMS Service using TextBee.dev API
 */
@Service
@Slf4j
public class SmsService {

    @Value("${textbee.api-url}")
    private String apiUrl;

    @Value("${textbee.device-id}")
    private String deviceId;

    @Value("${textbee.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public SmsService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Send SMS to multiple recipients
     * 
     * @param recipients List of phone numbers
     * @param message    SMS content
     * @return true if sent successfully
     */
    public boolean sendSms(List<String> recipients, String message) {
        if (recipients == null || recipients.isEmpty()) {
            log.warn("No recipients provided for SMS");
            return false;
        }

        try {
            String url = apiUrl + "/" + deviceId + "/send-sms";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("recipients", recipients);
            body.put("message", message);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("SMS sent successfully to {} recipients", recipients.size());
                return true;
            } else {
                log.error("SMS sending failed with status: {}", response.getStatusCode());
                return false;
            }
        } catch (Exception e) {
            log.error("Failed to send SMS: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Send SMS to a single recipient
     */
    public boolean sendSms(String recipient, String message) {
        return sendSms(List.of(recipient), message);
    }
}
