# ESP32 Smart Freshness Sensor Node - README

## Overview
This folder contains everything needed to set up your ESP32 sensor node for the Smart Freshness System.

## Files

| File | Description |
|------|-------------|
| `smart_freshness_esp32.ino` | Main Arduino code for ESP32 |
| `MOSQUITTO_SETUP.md` | Complete MQTT broker installation guide |
| `mosquitto.conf` | Ready-to-use Mosquitto configuration |

---

## Hardware Required

| Component | Purpose | Approximate Cost |
|-----------|---------|------------------|
| ESP32 DevKit V1 | Microcontroller | $5-10 |
| DHT22 | Temperature & Humidity | $3-5 |
| MQ135 | VOC/Gas Detection | $2-4 |
| Jumper Wires | Connections | $2 |
| Breadboard | Prototyping | $2 |

---

## Wiring Diagram

```
                    ESP32 DevKit
                   ┌─────────────┐
                   │             │
    DHT22 VCC ────►│ 3.3V        │
    DHT22 GND ────►│ GND         │
    DHT22 DATA────►│ GPIO 4      │
                   │             │
    MQ135 VCC ────►│ VIN (5V)    │
    MQ135 GND ────►│ GND         │
    MQ135 AO  ────►│ GPIO 34     │
                   │             │
                   └─────────────┘
```

---

## Quick Start

### Step 1: Install Arduino IDE
Download from: https://www.arduino.cc/en/software

### Step 2: Add ESP32 Board
1. Open Arduino IDE → File → Preferences
2. Add to "Additional Board URLs":
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Tools → Board → Boards Manager → Search "ESP32" → Install

### Step 3: Install Libraries
Tools → Manage Libraries → Install:
- `PubSubClient` by Nick O'Leary
- `DHT sensor library` by Adafruit
- `ArduinoJson` by Benoit Blanchon

### Step 4: Configure the Code
Edit `smart_freshness_esp32.ino`:

```cpp
// WiFi - Your network credentials
const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// MQTT - Your computer's IP (run 'ipconfig' to find)
const char* MQTT_BROKER = "192.168.1.100";

// Device - Must match database entries
const long UNIT_ID = 1;
const char* DEVICE_ID = "ESP32-001";
```

### Step 5: Upload Code
1. Connect ESP32 via USB
2. Select: Tools → Board → ESP32 Dev Module
3. Select: Tools → Port → (Your COM port)
4. Click Upload

### Step 6: Monitor
Tools → Serial Monitor → Set baud rate to 115200

---

## Before Connecting

Ensure these exist in your database:

1. **Create a Device:**
   - Go to Dashboard → Devices
   - Add device with ID matching `DEVICE_ID` in code

2. **Create a Unit:**
   - Go to Dashboard → Inventory
   - Add unit with ID matching `UNIT_ID` in code

---

## Troubleshooting

### "WiFi connection failed"
- Check SSID and password
- Ensure ESP32 is in WiFi range
- Try moving closer to router

### "MQTT connection failed"
- Verify Mosquitto is running
- Check firewall allows port 1883
- Confirm IP address is correct

### "Failed to read from DHT22"
- Check wiring connections
- Ensure using 3.3V (not 5V) for DHT22
- Try a different GPIO pin

### "No data in dashboard"
- Verify Unit ID and Device ID exist in database
- Check backend logs for MQTT messages
- Ensure backend is running

---

## Data Flow

```
┌─────────┐    MQTT     ┌───────────┐    HTTP    ┌──────────┐
│  ESP32  │ ──────────► │  Backend  │ ◄────────► │ Frontend │
│ Sensors │   JSON msg  │  (Java)   │   REST API │  (React) │
└─────────┘             └───────────┘            └──────────┘
     │                       │
     │                       ▼
     │               ┌───────────────┐
     └──────────────►│  MQTT Broker  │
                     │  (Mosquitto)  │
                     └───────────────┘
```

---

## JSON Payload Format

The ESP32 sends data in this format:

```json
{
    "unitId": 1,
    "deviceId": "ESP32-001",
    "temperature": 25.3,
    "humidity": 65.2,
    "voc": 150.5
}
```

The backend automatically:
- Calculates freshness score (0-100%)
- Computes dynamic price
- Triggers SMS alert if below threshold
- Updates real-time dashboard
