# JANSAATHI AI - Medical Hardware Telemetry Integration

## 1. Physical Hardware Overview
JANSAATHI AI interfaces with frontline medical telemetry devices (e.g. ESP32, STM32, or Arduino circuits) connected to:
- **MAX30100 / MAX30102 Pulse Oximeters**: SpO2 (%) and Pulse Rate (bpm)
- **MLX90614 Infrared Thermometers**: Body Temperature (°C)
- **Standard Serial / BLE Telemetry Streams**

## 2. Browser Integration Architecture

### Web Serial API (`navigator.serial`)
Enables direct browser communication with USB-to-UART bridge chips (CP2102, CH340, FTDI) commonly used in frontline clinical microcontrollers.
- **Baud Rate**: 115200 (configurable)
- **Format**: Supported as either JSON or ASCII key-value lines:
  - `{"spo2": 98, "pulse": 72, "temp": 36.8}`
  - `SPO2=98, PR=72, TEMP=36.8`

### Web Bluetooth API (`navigator.bluetooth`)
Supports Bluetooth Low Energy (BLE) peripheral devices broadcasting standard GATT Health Thermometer or Pulse Oximeter service profiles.

## 3. Honest Connection State Model
The UI never fakes a connected state:
- `CONNECTED`: Active serial port open and actively streaming data.
- `DISCONNECTED`: No device currently engaged.
- `CONNECTING`: Port handshake in progress.
- `UNAVAILABLE`: Browser lacks Web Serial/Bluetooth support (guides user to manual entry).
- `ERROR`: Physical transmission interruption or parity error.
