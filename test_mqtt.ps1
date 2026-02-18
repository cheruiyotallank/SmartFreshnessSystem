# Test MQTT message sending
$message = '{"unitId":1,"deviceId":"TEST-SENSOR-001","voc":175.5,"temperature":21.0,"humidity":68.5}'

Write-Host "Sending MQTT test message to sensors/freshness/test-sensor..."
Write-Host "Message: $message"
Write-Host ""

& "C:\Program Files\mosquitto\mosquitto_pub.exe" -h localhost -p 1883 -t "sensors/freshness/test-sensor" -m $message

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS! MQTT message sent successfully!" -ForegroundColor Green
    Write-Host "Check your backend terminal for log output like:"
    Write-Host "  'Processed MQTT sensor data: deviceId=TEST-SENSOR-001...'" -ForegroundColor Yellow
} else {
    Write-Host "FAILED to send MQTT message. Error code: $LASTEXITCODE" -ForegroundColor Red
}
