/*
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║     SMART FRESHNESS SYSTEM - ESP32 SENSOR NODE                   ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Uses MQ135 (real) + Simulated temp/humidity (no DHT22)          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ╔══════════════════════════════════════════════════════════════════╗
// ║  🔧 CONFIGURATION - CHANGE THESE VALUES!                         ║
// ╚══════════════════════════════════════════════════════════════════╝

// 1️⃣ WiFi Settings
const char* WIFI_SSID     = "YOUR_WIFI_NAME";      // ← Your WiFi name
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";  // ← Your WiFi password

// 2️⃣ MQTT Broker (Your PC's IP - run 'ipconfig' to find)
const char* MQTT_BROKER = "10.20.2.213";  // ← Your PC's IP address
const int   MQTT_PORT   = 1883;

// 3️⃣ Device Settings (Must exist in database!)
const long  UNIT_ID   = 1;            // ← Unit ID from database
const char* DEVICE_ID = "ESP32-001";  // ← Device ID from database

// ╔══════════════════════════════════════════════════════════════════╗
// ║  SENSOR SETTINGS                                                 ║
// ╚══════════════════════════════════════════════════════════════════╝

// MQ135 Pin (you have this sensor)
#define MQ135_PIN  34     // MQ135 analog pin → GPIO 34

// Simulated temp/humidity (you don't have DHT22)
float BASE_TEMPERATURE = 25.0;  // Simulated temperature °C
float BASE_HUMIDITY    = 60.0;  // Simulated humidity %
bool ADD_VARIATION = true;      // Add random variation to simulate real sensor

// ══════════════════════════════════════════════════════════════════
//  ADVANCED SETTINGS
// ══════════════════════════════════════════════════════════════════

const char* MQTT_TOPIC     = "sensors/freshness/data";
const char* MQTT_CLIENT_ID = "ESP32-FRESHNESS-001";
const unsigned long SENSOR_INTERVAL = 30000;  // Send every 30 seconds

WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);
unsigned long lastSendTime = 0;

// ══════════════════════════════════════════════════════════════════
//  SETUP
// ══════════════════════════════════════════════════════════════════

void setup() {
    Serial.begin(115200);
    delay(1000);
    
    Serial.println();
    Serial.println("╔═══════════════════════════════════════════════════╗");
    Serial.println("║  SMART FRESHNESS - ESP32 Sensor Node              ║");
    Serial.println("║  MQ135: REAL | Temp/Humidity: SIMULATED           ║");
    Serial.println("╚═══════════════════════════════════════════════════╝");
    Serial.println();
    
    // Initialize MQ135 pin
    pinMode(MQ135_PIN, INPUT);
    Serial.println("✓ MQ135 sensor initialized on GPIO 34");
    Serial.println("⚠️ Temp/Humidity using simulated values (no DHT22)");
    
    // Initialize random seed
    randomSeed(analogRead(0));
    
    // Connect to WiFi
    connectWiFi();
    
    // Setup MQTT
    mqtt.setServer(MQTT_BROKER, MQTT_PORT);
    connectMQTT();
    
    Serial.println();
    Serial.println("✓ System ready! Sending data every 30 seconds...");
    Serial.println("──────────────────────────────────────────────────");
}

// ══════════════════════════════════════════════════════════════════
//  MAIN LOOP
// ══════════════════════════════════════════════════════════════════

void loop() {
    if (!mqtt.connected()) {
        connectMQTT();
    }
    mqtt.loop();
    
    if (millis() - lastSendTime >= SENSOR_INTERVAL) {
        lastSendTime = millis();
        readAndSendData();
    }
}

// ══════════════════════════════════════════════════════════════════
//  WIFI CONNECTION
// ══════════════════════════════════════════════════════════════════

void connectWiFi() {
    Serial.print("→ Connecting to WiFi: ");
    Serial.print(WIFI_SSID);
    
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println(" Connected!");
        Serial.print("✓ IP Address: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println(" FAILED!");
        Serial.println("✗ Check WiFi credentials. Restarting...");
        delay(3000);
        ESP.restart();
    }
}

// ══════════════════════════════════════════════════════════════════
//  MQTT CONNECTION
// ══════════════════════════════════════════════════════════════════

void connectMQTT() {
    while (!mqtt.connected()) {
        Serial.print("→ Connecting to MQTT: ");
        Serial.print(MQTT_BROKER);
        
        if (mqtt.connect(MQTT_CLIENT_ID)) {
            Serial.println(" Connected!");
        } else {
            Serial.print(" Failed! Code: ");
            Serial.println(mqtt.state());
            delay(5000);
        }
    }
}

// ══════════════════════════════════════════════════════════════════
//  READ SENSORS AND SEND DATA
// ══════════════════════════════════════════════════════════════════

void readAndSendData() {
    Serial.println();
    Serial.println("📊 Reading sensors...");
    
    // ═══════════════════════════════════════════════════════════════
    // READ REAL MQ135 SENSOR
    // ═══════════════════════════════════════════════════════════════
    int mq135Raw = analogRead(MQ135_PIN);
    float voc = mapToVOC(mq135Raw);
    
    Serial.print("   VOC (MQ135):   ");
    Serial.print(voc, 1);
    Serial.print(" ppm (raw: ");
    Serial.print(mq135Raw);
    Serial.println(") ← REAL SENSOR");
    
    // ═══════════════════════════════════════════════════════════════
    // SIMULATED TEMPERATURE & HUMIDITY (no DHT22)
    // ═══════════════════════════════════════════════════════════════
    float temperature = BASE_TEMPERATURE;
    float humidity = BASE_HUMIDITY;
    
    if (ADD_VARIATION) {
        temperature += random(-20, 21) / 10.0;  // ±2°C variation
        humidity += random(-50, 51) / 10.0;     // ±5% variation
        temperature = constrain(temperature, 0, 50);
        humidity = constrain(humidity, 20, 100);
    }
    
    Serial.print("   Temperature:   ");
    Serial.print(temperature, 1);
    Serial.println(" °C (simulated)");
    
    Serial.print("   Humidity:      ");
    Serial.print(humidity, 1);
    Serial.println(" % (simulated)");
    
    // ═══════════════════════════════════════════════════════════════
    // CREATE AND SEND JSON
    // ═══════════════════════════════════════════════════════════════
    StaticJsonDocument<200> doc;
    doc["unitId"] = UNIT_ID;
    doc["deviceId"] = DEVICE_ID;
    doc["temperature"] = round(temperature * 10) / 10.0;
    doc["humidity"] = round(humidity * 10) / 10.0;
    doc["voc"] = round(voc * 10) / 10.0;
    
    String jsonPayload;
    serializeJson(doc, jsonPayload);
    
    Serial.print("📤 Sending: ");
    Serial.println(jsonPayload);
    
    if (mqtt.publish(MQTT_TOPIC, jsonPayload.c_str())) {
        Serial.println("✓ Data sent successfully!");
    } else {
        Serial.println("✗ Failed to send!");
    }
    
    Serial.println("──────────────────────────────────────────────────");
}

// ══════════════════════════════════════════════════════════════════
//  VOC MAPPING FUNCTION
// ══════════════════════════════════════════════════════════════════

float mapToVOC(int rawValue) {
    // ESP32 ADC: 0-4095 (12-bit) → 0-1000 ppm
    float ppm = (float)rawValue / 4095.0 * 1000.0;
    return max(0.0f, ppm);
}
