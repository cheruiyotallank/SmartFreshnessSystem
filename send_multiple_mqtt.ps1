# Send multiple MQTT sensor readings to simulate real sensor activity
$messages = @(
    '{"unitId":1,"deviceId":"ESP32-001","voc":85.0,"temperature":3.5,"humidity":88.0}',
    '{"unitId":1,"deviceId":"ESP32-001","voc":92.0,"temperature":3.8,"humidity":86.5}',
    '{"unitId":1,"deviceId":"ESP32-001","voc":105.0,"temperature":4.2,"humidity":85.0}',
    '{"unitId":1,"deviceId":"ESP32-002","voc":150.0,"temperature":5.0,"humidity":80.0}',
    '{"unitId":1,"deviceId":"ESP32-001","voc":120.0,"temperature":4.5,"humidity":84.0}'
)

Write-Host "=== Sending Multiple MQTT Sensor Readings ===" -ForegroundColor Cyan
Write-Host ""

$count = 1
foreach ($msg in $messages) {
    Write-Host "[$count/5] Sending: $msg" -ForegroundColor Yellow
    & "C:\Program Files\mosquitto\mosquitto_pub.exe" -h localhost -p 1883 -t "sensors/freshness/esp32" -m $msg
    Start-Sleep -Milliseconds 500
    $count++
}

Write-Host ""
Write-Host "=== ALL 5 SENSOR READINGS SENT! ===" -ForegroundColor Green
Write-Host "Check your dashboard at http://localhost:5173 to see the data!" -ForegroundColor Cyan
