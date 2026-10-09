# JANSAATHI AI - ESP32 Vitals Telemetry Firmware Guide

This directory contains the production-grade Arduino/ESP32 firmware for interfacing:
1. **MAX30102 Pulse Oximeter & Heart Rate Sensor Module** (I2C)
2. **AD8232 Single-Lead ECG Heart Rate Monitor Module Kit** (Analog ADC + Digital Leads-Off)

The firmware reads continuous biometric signals, performs digital filtering and signal conditioning, and streams real-time JSON and ASCII telemetry over USB Serial (115200 baud) directly to the **JANSAATHI AI** Web Serial Gateway.

---

## 1. Hardware Pinout & Wiring Connections

### A. ESP32 Pin Mapping Table

| Sensor Pin | ESP32 Pin | Function / Notes |
| :--- | :--- | :--- |
| **MAX30102 VCC** | **3V3** | 3.3V Power rail (Do NOT use 5V) |
| **MAX30102 GND** | **GND** | Common Ground |
| **MAX30102 SDA** | **GPIO 21** | ESP32 Hardware I2C Data line |
| **MAX30102 SCL** | **GPIO 22** | ESP32 Hardware I2C Clock line |
| **MAX30102 INT** | *Not Connected* | Polled via FIFO buffer |
| | | |
| **AD8232 3.3V** | **3V3** | 3.3V Power rail |
| **AD8232 GND** | **GND** | Common Ground |
| **AD8232 OUTPUT** | **GPIO 34** | ADC1 Channel 6 (Clean analog input, zero WiFi interference) |
| **AD8232 LO+** | **GPIO 4** | Leads-Off Positive digital detection |
| **AD8232 LO-** | **GPIO 2** | Leads-Off Negative digital detection |
| **AD8232 SDN** | *Not Connected* | Shutdown pin (internally pulled HIGH for active mode) |

---

## 2. AD8232 ECG Electrode Placement (Lead I Configuration)

The AD8232 module kit includes a 3-lead sensor cable with snap electrodes:

| Lead Color | Standard Code | Anatomical Placement | Function |
| :--- | :--- | :--- | :--- |
| **Red** | **RA** (Right Arm) | Right clavicle (below right collarbone) OR inner right wrist | Negative input |
| **Yellow** | **LA** (Left Arm) | Left clavicle (below left collarbone) OR inner left wrist | Positive input |
| **Green** | **RL** (Right Leg) | Lower right abdomen OR right ankle | Reference Ground (RLD) |

### Best Practice for Clean ECG Traces:
- Clean the skin with an alcohol wipe to remove oils and dead skin before attaching disposable Ag/AgCl gel electrodes.
- Relax muscles during recording to minimize EMG (electromyographic) muscle tremor noise.

---

## 3. Software Setup in Arduino IDE

### Step 1: Install ESP32 Board Support
1. Open **Arduino IDE** (v1.8.x or v2.x).
2. Go to **File -> Preferences**.
3. In **Additional Boards Manager URLs**, paste:
   ```text
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Open **Tools -> Board -> Boards Manager...**, search for `esp32` by **Espressif Systems**, and click **Install**.

### Step 2: Install SparkFun MAX3010x Library
1. Open **Tools -> Manage Libraries...** (or Ctrl+Shift+I).
2. In the search bar, type `SparkFun MAX3010x`.
3. Locate **SparkFun MAX3010x Pulse and Proximity Sensor Library** by SparkFun Electronics and click **Install**.

### Step 3: Open the Sketch & Configure Board
1. Open the sketch file:
   `firmware/jansaathi_esp32_vitals/jansaathi_esp32_vitals.ino`
2. Select your board under **Tools -> Board -> esp32**:
   - Choose **DOIT ESP32 DEVKIT V1** or **ESP32 Dev Module**.
3. Select the correct COM port under **Tools -> Port**.
4. Set Upload Speed to `115200` or `921600`.
5. Click **Upload** (Right Arrow button).
   *(If the upload console says "Connecting...", press and hold the `BOOT` button on your ESP32 board until the flashing percentage begins).*

---

## 4. Telemetry Stream Formats

The ESP32 firmware transmits at **115200 baud** in two formats every 1000ms:

### 1. JSON Format (Parsed by JANSAATHI AI Frontend)
```json
{"spo2":98.4,"pulse":74,"ecg":2048,"finger_detected":true,"leads_off":false}
```

### 2. Standard ASCII Key-Value Format
```text
SPO2=98.4, PR=74, ECG=2048, LEADS_OFF=0
```

### Interactive Serial Modes:
- Type `p` in the Serial Monitor to switch to **High-Speed Serial Plotter Mode** (streams the ECG waveform for viewing in Arduino IDE Serial Plotter `Ctrl+Shift+L`).
- Type `t` in the Serial Monitor to switch back to **JANSAATHI AI Telemetry Mode**.

---

## 5. Connecting with JANSAATHI AI

1. Plug the ESP32 into your computer via micro-USB or USB-C.
2. Open **JANSAATHI AI** in Google Chrome or Microsoft Edge at `http://localhost:5173/`.
3. Navigate to **Patient Intake -> Step 2 (Physical Vitals)** or open the **Hardware Telemetry** card.
4. Click **Connect USB Device**.
5. Select the ESP32 COM port (e.g., `Silicon Labs CP210x` or `USB-SERIAL CH340`) in the browser permission popup.
6. The status will immediately turn green: **Connected (Serial Health Telemetry Device)**.
7. Vitals will stream and populate into the patient's triage intake record in real time!

---

## 6. Troubleshooting & Diagnostics

### MAX30102 "Not detected on I2C bus (0x57)"
- **Check Connections**: Ensure SDA is connected to GPIO 21 and SCL is connected to GPIO 22.
- **Pull-up Resistors**: Generic breakout boards sometimes lack 4.7kΩ pull-up resistors to 3.3V on SDA and SCL. Adding two 4.7kΩ resistors from 3.3V to SDA and SCL will stabilize marginal boards.
- **Board Voltage**: Ensure VCC is powered from 3.3V, not 5V.

### AD8232 "Leads Off Alert"
- If the serial output reports `leads_off: true` or `LEADS_OFF=1`, the electrode pads are detached from the patient's skin or a lead wire is loose.
- Re-check electrode placement on RA (Right Arm), LA (Left Arm), and RL (Right Leg).
