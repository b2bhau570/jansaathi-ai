# JANSAATHI AI - Medical Hardware Telemetry Integration

## 1. Physical Hardware Overview
JANSAATHI AI interfaces with frontline medical telemetry devices (e.g. ESP32, STM32, or Arduino circuits) connected to:
- **MAX30100 / MAX30102 Pulse Oximeters**: SpO2 (%) and Pulse Rate (bpm)
- **AD8232 Single-Lead ECG Monitor**: Electrocardiogram Lead-I waveform & Leads-Off detection
- **MLX90614 Infrared Thermometers**: Body Temperature (°C)
- **Standard Serial / BLE Telemetry Streams**

Production-ready firmware sketch is located at:
- Sketch: `firmware/jansaathi_esp32_vitals/jansaathi_esp32_vitals.ino`
- Documentation & Wiring: `firmware/README.md`

## 2. Sensor Pinout & ESP32 Configuration

| Sensor Pin | ESP32 Pin | Purpose |
| :--- | :--- | :--- |
| MAX30102 SDA | GPIO 21 | I2C Data line |
| MAX30102 SCL | GPIO 22 | I2C Clock line |
| MAX30102 VCC / GND | 3V3 / GND | 3.3V Power & Ground |
| AD8232 OUTPUT | GPIO 34 | ADC1 Channel 6 (Clean analog input) |
| AD8232 LO+ | GPIO 4 | Leads-Off Positive digital detect |
| AD8232 LO- | GPIO 2 | Leads-Off Negative digital detect |
| AD8232 3.3V / GND | 3V3 / GND | 3.3V Power & Ground |

## 3. Browser Integration Architecture

### Web Serial API (`navigator.serial`)
Enables direct browser communication with USB-to-UART bridge chips (CP2102, CH340, FTDI) commonly used in frontline clinical microcontrollers.
- **Baud Rate**: 115200 (configurable)
- **Format**: Supported as either JSON or ASCII key-value lines:
  - `{"spo2": 98.4, "pulse": 72, "ecg": 2048, "finger_detected": true, "leads_off": false}`
  - `SPO2=98.4, PR=72, ECG=2048, LEADS_OFF=0`

### Web Bluetooth API (`navigator.bluetooth`)
Supports Bluetooth Low Energy (BLE) peripheral devices broadcasting standard GATT Health Thermometer or Pulse Oximeter service profiles.

## 4. Honest Connection State Model
The UI never fakes a connected state:
- `CONNECTED`: Active serial port open and actively streaming data.
- `DISCONNECTED`: No device currently engaged.
- `CONNECTING`: Port handshake in progress.
- `UNAVAILABLE`: Browser lacks Web Serial/Bluetooth support (guides user to manual entry).
- `ERROR`: Physical transmission interruption or parity error.

