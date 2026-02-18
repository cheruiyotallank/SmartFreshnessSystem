# Mosquitto MQTT Broker Setup Guide
## For Smart Freshness System

This guide helps you install and configure Mosquitto MQTT broker on Windows.

---

## 1. Download Mosquitto

1. Go to: https://mosquitto.org/download/
2. Download the **Windows installer** (64-bit recommended)
3. Run the installer and follow the prompts
4. **Check** the option to install as a Windows Service

Default installation path: `C:\Program Files\mosquitto`

---

## 2. Configure Mosquitto

### Create/Edit Configuration File

Open `C:\Program Files\mosquitto\mosquitto.conf` and add:

```conf
# Basic Configuration for Smart Freshness System

# Listen on all network interfaces
listener 1883 0.0.0.0

# Allow anonymous connections (for development)
allow_anonymous true

# Persistence
persistence true
persistence_location C:/ProgramData/mosquitto/

# Logging
log_dest file C:/ProgramData/mosquitto/mosquitto.log
log_type all

# Connection settings
max_connections -1
```

### For Production (with authentication):

```conf
# Production Configuration with Authentication

listener 1883 0.0.0.0

# Disable anonymous access
allow_anonymous false

# Password file
password_file C:/Program Files/mosquitto/pwfile.txt

# ACL file (optional, for topic-level permissions)
# acl_file C:/Program Files/mosquitto/aclfile.txt

persistence true
persistence_location C:/ProgramData/mosquitto/

log_dest file C:/ProgramData/mosquitto/mosquitto.log
log_type warning
log_type error
```

---

## 3. Create Password File (Optional - for Production)

Open Command Prompt as Administrator:

```cmd
cd "C:\Program Files\mosquitto"
mosquitto_passwd -c pwfile.txt smartfreshness
```

Enter password when prompted. Then update `application.properties`:

```properties
mqtt.username=smartfreshness
mqtt.password=your_password_here
```

---

## 4. Windows Firewall

Allow Mosquitto through Windows Firewall:

1. Open **Windows Defender Firewall**
2. Click **Advanced settings**
3. Click **Inbound Rules** → **New Rule**
4. Select **Port** → Next
5. Select **TCP**, enter **1883** → Next
6. Select **Allow the connection** → Next
7. Check all profiles → Next
8. Name: "Mosquitto MQTT" → Finish

Or via PowerShell (Run as Admin):
```powershell
New-NetFirewallRule -DisplayName "Mosquitto MQTT" -Direction Inbound -Protocol TCP -LocalPort 1883 -Action Allow
```

---

## 5. Start/Stop Mosquitto Service

### Using Services Manager:
1. Press `Win + R`, type `services.msc`
2. Find "Mosquitto Broker"
3. Right-click → Start/Stop/Restart

### Using Command Prompt (as Admin):

```cmd
# Start
net start mosquitto

# Stop
net stop mosquitto

# Restart
net stop mosquitto && net start mosquitto
```

### Run Manually (for testing):

```cmd
cd "C:\Program Files\mosquitto"
mosquitto -v -c mosquitto.conf
```

---

## 6. Test the Connection

### Install MQTT Client Tools:

Download MQTT Explorer: https://mqtt-explorer.com/

Or use mosquitto CLI tools:

```cmd
# Terminal 1 - Subscribe to all topics
mosquitto_sub -h localhost -t "sensors/freshness/#" -v

# Terminal 2 - Publish test message
mosquitto_pub -h localhost -t "sensors/freshness/data" -m "{\"unitId\":1,\"deviceId\":\"TEST-001\",\"voc\":150,\"temperature\":25,\"humidity\":60}"
```

---

## 7. Verify Backend Connection

### Check your `application.properties`:

```properties
mqtt.broker=tcp://localhost:1883
mqtt.client-id=smartfreshness-client
mqtt.username=
mqtt.password=
mqtt.topic=sensors/freshness
mqtt.qos=1
```

### Check backend logs for:

```
Subscribed to MQTT topic: sensors/freshness/#
```

---

## 8. Find Your Computer's IP Address

For ESP32 to connect, you need your computer's local IP:

```cmd
ipconfig
```

Look for **IPv4 Address** under your WiFi/Ethernet adapter (e.g., `192.168.1.100`)

Update ESP32 code with this IP:
```cpp
const char* MQTT_BROKER = "192.168.1.100";
```

---

## 9. Troubleshooting

### Mosquitto won't start:
- Check if port 1883 is in use: `netstat -an | findstr 1883`
- Check logs: `C:\ProgramData\mosquitto\mosquitto.log`

### ESP32 can't connect:
- Make sure ESP32 is on same WiFi network
- Check firewall rules
- Verify IP address is correct

### Backend not receiving messages:
- Check MQTT broker is running
- Verify topic names match exactly
- Check backend logs for connection errors

---

## Quick Reference

| Item | Value |
|------|-------|
| Port | 1883 |
| Topic Pattern | sensors/freshness/# |
| Config File | C:\Program Files\mosquitto\mosquitto.conf |
| Log File | C:\ProgramData\mosquitto\mosquitto.log |
| Service Name | Mosquitto Broker |
