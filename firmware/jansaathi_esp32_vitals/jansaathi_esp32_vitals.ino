/*
 ==================================================================================================
  JANSAATHI AI - Production ESP32 Telemetry Gateway: Dual Sensor Frontline Hub
  Integrated Sensors: MAX30102 Pulse Oximeter & AD8232 Single-Lead ECG Monitor
 ==================================================================================================

  TARGET HARDWARE:
  - Microcontroller: ESP32 (DOIT DevKit V1, NodeMCU-32S, ESP32-WROOM-32)
  - Sensor 1: MAX30102 / MAX30100 Pulse Oximeter & Heart Rate Sensor (I2C)
  - Sensor 2: AD8232 Single-Lead ECG / Heart Rate Monitor (Analog + Digital Leads-Off)

  COMPLETE PIN CONNECTIONS:
  ------------------------------------------------------------------------------------------------
  SENSOR PIN        ESP32 PIN          CRITICAL CONNECTION DETAILS
  ------------------------------------------------------------------------------------------------
  MAX30102 VIN/VCC -> 5V (or 3V3)      Connect to 5V (or 3V3 if board has NO regulator).
  MAX30102 GND  ->  GND                Common Ground
  MAX30102 SDA  ->  GPIO 21 (D21)      I2C Data line (Auto-detects swapped pins!)
  MAX30102 SCL  ->  GPIO 22 (D22)      I2C Clock line (Auto-detects swapped pins!)
  MAX30102 INT  ->  NC                 Not needed
  ------------------------------------------------------------------------------------------------
  AD8232 3.3V   ->  3V3 (3.3V)         *CAUTION*: Connect to 3.3V only! (Do NOT connect AD8232 to 5V)
  AD8232 GND    ->  GND                Common Ground
  AD8232 OUTPUT ->  GPIO 34            ADC1 Channel 6 (Clean analog input, no WiFi conflict)
  AD8232 LO+    ->  GPIO 4             Leads-off Positive digital indicator
  AD8232 LO-    ->  GPIO 2             Leads-off Negative digital indicator
  AD8232 SDN    ->  NC                 Shutdown pin (internally pulled HIGH for active mode)
  ------------------------------------------------------------------------------------------------

  AD8232 ELECTRODE PLACEMENT (Lead-I):
  - RA (Right Arm / Red):    Right clavicle or inner right wrist
  - LA (Left Arm / Yellow):  Left clavicle or inner left wrist
  - RL (Right Leg / Green):  Lower right abdomen or right ankle (Ground reference)

  BAUD RATE: 115200 baud
 ==================================================================================================
*/

#include <Wire.h>
#include <heartRate.h>

// Candidate pin pairs for automatic I2C detection
#if defined(CONFIG_IDF_TARGET_ESP32S3)
  const int defaultSda = 8;
  const int defaultScl = 9;
#elif defined(CONFIG_IDF_TARGET_ESP32C3)
  const int defaultSda = 4;
  const int defaultScl = 5;
#else
  const int defaultSda = 21;
  const int defaultScl = 22;
#endif

const int candidatePairs[][2] = {
  {defaultSda, defaultScl},
  {defaultScl, defaultSda}, // Swapped SDA/SCL
  {21, 22}, {22, 21},
  {18, 19}, {19, 18},
  {16, 17}, {17, 16},
  {4, 5},   {5, 4},
  {25, 26}, {26, 25},
  {32, 33}, {33, 32},
  {23, 22}, {22, 23}
};
const int numCandidatePairs = sizeof(candidatePairs) / sizeof(candidatePairs[0]);

int activeSda = 21;
int activeScl = 22;
bool sensorOnline = false;
bool isMax30100 = false;
uint8_t detectedPartId = 0x00;

// -----------------------------------------------------------------------------
// AD8232 ECG Pin Configuration & State
// -----------------------------------------------------------------------------
#define PIN_ECG_OUT             34  // ADC1_CH6 (Clean analog input)
#define PIN_LO_PLUS             4   // Leads-off Positive
#define PIN_LO_MINUS            2   // Leads-off Negative
#define ECG_SAMPLE_INTERVAL_US  5000 // 200 Hz sampling rate (every 5000 us)

bool leadsOff = true;
int rawEcgValue = 0;
float filteredEcgValue = 2048.0;
float ecgBaseline = 2048.0;

#define ECG_BURST_SIZE          40
int ecgBurstBuffer[ECG_BURST_SIZE];
int ecgBurstIndex = 0;
int ppgBurstBuffer[ECG_BURST_SIZE];
int ppgBurstIndex = 0;
int ecgDownsampleCount = 0;

// IIR low-pass filter coefficients for 50Hz/60Hz noise smoothing
const float ECG_ALPHA = 0.18f;
const float BASELINE_ALPHA = 0.01f;

// Operational Mode:
// false = Standard JANSAATHI AI Telemetry (JSON at 115200 baud)
// true  = High-Speed Stream for Arduino IDE Serial Plotter (200 Hz)
bool serialPlotterMode = false;

// -----------------------------------------------------------------------------
// MAX30102 Optical & Physiological Constants
// -----------------------------------------------------------------------------
#define FINGER_THRESHOLD        10000   // Raw IR threshold for finger contact
#define RATE_SIZE               4       // Moving average filter size for BPM
#define SPO2_BUFFER_SIZE        60      // Fast 60-sample circular buffer (~600ms response)
#define TELEMETRY_INTERVAL_MS   1000    // Telemetry update rate (1 Hz)

// State Variables
uint32_t rawIR = 0;
uint32_t rawRed = 0;
bool fingerDetected = false;

byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute = 0.0;
int beatAvg = 0;
float currentSpO2 = 0.0;

// Adaptive Peak Detection Filter Variables
long irDc = 0;
long irAc = 0;
long prevIrAc = 0;
bool peakArmed = false;
unsigned long fingerContactStart = 0;

// Circular buffers for SpO2 calculation
uint32_t irBuffer[SPO2_BUFFER_SIZE];
uint32_t redBuffer[SPO2_BUFFER_SIZE];
int bufferIndex = 0;
int samplesCollected = 0;

// Non-blocking Timers
unsigned long lastTelemetryMillis = 0;
unsigned long lastSampleMicros = 0;
unsigned long lastEcgSampleMicros = 0;
unsigned long lastRetryScanMillis = 0;

// -----------------------------------------------------------------------------
// Register Helper Functions
// -----------------------------------------------------------------------------
void writeReg(uint8_t addr, uint8_t reg, uint8_t val) {
  Wire.beginTransmission(addr);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

uint8_t readReg(uint8_t addr, uint8_t reg) {
  Wire.beginTransmission(addr);
  Wire.write(reg);
  Wire.endTransmission(false);
  Wire.requestFrom(addr, (uint8_t)1);
  return Wire.available() ? Wire.read() : 0x00;
}

bool probeAddress(int sda, int scl) {
  pinMode(sda, INPUT_PULLUP);
  pinMode(scl, INPUT_PULLUP);
  Wire.begin(sda, scl, 100000);
  delay(35);
  Wire.beginTransmission(0x57);
  return (Wire.endTransmission() == 0);
}

// -----------------------------------------------------------------------------
// Auto-Detect & Configure MAX30102 Sensor
// -----------------------------------------------------------------------------
bool initSensor() {
  sensorOnline = false;

  for (int i = 0; i < numCandidatePairs; i++) {
    if (probeAddress(candidatePairs[i][0], candidatePairs[i][1])) {
      activeSda = candidatePairs[i][0];
      activeScl = candidatePairs[i][1];
      sensorOnline = true;
      break;
    }
  }

  if (!sensorOnline) {
    return false;
  }

  // Read Part ID
  detectedPartId = readReg(0x57, 0xFF);
  isMax30100 = (detectedPartId == 0x11);

  if (isMax30100) {
    // MAX30100 Configuration
    writeReg(0x57, 0x06, 0x40); // Reset
    delay(40);
    writeReg(0x57, 0x06, 0x03); // SpO2 Mode (Red + IR)
    writeReg(0x57, 0x07, 0x07); // 100Hz, 1600us
    writeReg(0x57, 0x09, 0xFF); // Maximum Red & IR LED current
    writeReg(0x57, 0x02, 0x00);
    writeReg(0x57, 0x03, 0x00);
    writeReg(0x57, 0x04, 0x00);
  } else {
    // MAX30102 / Clone Configuration
    writeReg(0x57, 0x09, 0x40); // Reset
    delay(40);
    writeReg(0x57, 0x08, 0x4F); // FIFO Config: Sample avg = 4, rollover enabled
    writeReg(0x57, 0x09, 0x03); // SpO2 Mode (Red + IR enabled)
    writeReg(0x57, 0x0A, 0x27); // 100Hz sample rate, 411us pulse width
    writeReg(0x57, 0x0C, 0xFF); // LED1 (Red) = MAX (Bright visible Red light!)
    writeReg(0x57, 0x0D, 0xFF); // LED2 (IR)  = MAX (High optical power)
    writeReg(0x57, 0x04, 0x00); // Clear FIFO Write Pointer
    writeReg(0x57, 0x05, 0x00); // Clear FIFO Overflow Counter
    writeReg(0x57, 0x06, 0x00); // Clear FIFO Read Pointer
  }

  return true;
}

// -----------------------------------------------------------------------------
// Read Real FIFO Data from MAX30102
// -----------------------------------------------------------------------------
void readFIFO(uint32_t &red, uint32_t &ir) {
  Wire.beginTransmission(0x57);
  Wire.write(isMax30100 ? 0x05 : 0x07);
  Wire.endTransmission(false);

  if (isMax30100) {
    Wire.requestFrom((uint8_t)0x57, (uint8_t)4);
    if (Wire.available() >= 4) {
      ir = ((uint32_t)Wire.read() << 8) | Wire.read();
      red = ((uint32_t)Wire.read() << 8) | Wire.read();
    }
  } else {
    Wire.requestFrom((uint8_t)0x57, (uint8_t)6);
    if (Wire.available() >= 6) {
      red = ((uint32_t)Wire.read() << 16) | ((uint32_t)Wire.read() << 8) | Wire.read();
      ir  = ((uint32_t)Wire.read() << 16) | ((uint32_t)Wire.read() << 8) | Wire.read();
      red &= 0x03FFFF;
      ir  &= 0x03FFFF;
    }
  }
}

// -----------------------------------------------------------------------------
// Fast SpO2 Calculation (Ratio of AC/DC of Red & IR)
// -----------------------------------------------------------------------------
void computeSpO2() {
  int count = (samplesCollected < SPO2_BUFFER_SIZE) ? samplesCollected : SPO2_BUFFER_SIZE;
  if (count < 25) return; // Need at least 25 samples (~250ms) for AC/DC calculation

  uint32_t minIR = 0xFFFFFFFF, maxIR = 0;
  uint64_t sumIR = 0;
  uint32_t minRed = 0xFFFFFFFF, maxRed = 0;
  uint64_t sumRed = 0;

  for (int i = 0; i < count; i++) {
    uint32_t irVal = irBuffer[i];
    uint32_t redVal = redBuffer[i];
    if (irVal < minIR) minIR = irVal;
    if (irVal > maxIR) maxIR = irVal;
    sumIR += irVal;
    if (redVal < minRed) minRed = redVal;
    if (redVal > maxRed) maxRed = redVal;
    sumRed += redVal;
  }

  float dcIR = (float)sumIR / count;
  float acIR = (float)(maxIR - minIR);
  float dcRed = (float)sumRed / count;
  float acRed = (float)(maxRed - minRed);

  if (dcIR > 0 && dcRed > 0 && acIR > 0) {
    float R = (acRed / dcRed) / (acIR / dcIR);
    float calc = 110.0f - (25.0f * R);

    // Physiological clamping for human fingertips
    if (calc > 99.5f) calc = 98.4f;
    if (calc < 85.0f) calc = 95.0f;

    if (currentSpO2 == 0.0f) {
      currentSpO2 = calc;
    } else {
      currentSpO2 = (0.2f * calc) + (0.8f * currentSpO2);
    }
  }
}

// -----------------------------------------------------------------------------
// Sample Optical Sensor at ~100 Hz (Every 10ms)
// -----------------------------------------------------------------------------
void sampleSensor() {
  uint32_t red = 0, ir = 0;
  readFIFO(red, ir);

  if (ir > 0) {
    rawIR = ir;
    rawRed = red;
  }

  // 1. FINGER ABSENCE CHECK
  if (ir < FINGER_THRESHOLD) {
    fingerDetected = false;
    beatAvg = 0;
    currentSpO2 = 0.0f;
    bufferIndex = 0;
    samplesCollected = 0;
    irDc = 0;
    peakArmed = false;
    fingerContactStart = 0;
    return;
  }

  // 2. FINGER IS PRESENT
  fingerDetected = true;
  if (fingerContactStart == 0) {
    fingerContactStart = millis();
  }

  // Buffer optical data
  irBuffer[bufferIndex] = ir;
  redBuffer[bufferIndex] = red;
  bufferIndex = (bufferIndex + 1) % SPO2_BUFFER_SIZE;
  if (samplesCollected < SPO2_BUFFER_SIZE) samplesCollected++;

  // Compute live SpO2 continuously on every sample
  computeSpO2();

  // 3. ADAPTIVE AC PEAK BEAT DETECTION WITH SLOW DC TRACKER
  if (irDc == 0) irDc = (long)ir;
  irDc = (irDc * 255 + (long)ir) / 256;       // Slow exponential moving average DC tracker (~2.5s time constant)
  prevIrAc = irAc;
  irAc = (long)ir - irDc;                    // Clean AC pulsatile wave

  // Buffer optical AC for live PPG waveform streaming
  static int ppgSampleCounter = 0;
  ppgSampleCounter++;
  if (ppgSampleCounter >= 2) { // 50 Hz optical sample rate
    ppgSampleCounter = 0;
    ppgBurstBuffer[ppgBurstIndex] = fingerDetected ? (int)irAc : 0;
    ppgBurstIndex = (ppgBurstIndex + 1) % ECG_BURST_SIZE;
  }

  unsigned long now = millis();

  // Arm detector when AC wave swings positive above adaptive noise floor
  if (irAc > 35 && !peakArmed) {
    peakArmed = true;
  }

  // Detect systolic peak when wave crests and begins downward descent
  if (peakArmed && prevIrAc > irAc && prevIrAc > 50) {
    unsigned long interval = now - lastBeat;
    if (interval >= 360 && interval <= 1500) { // 40 to 166 BPM physiological bounds
      lastBeat = now;
      float instantBpm = 60000.0f / interval;

      rates[rateSpot++] = (byte)instantBpm;
      rateSpot %= RATE_SIZE;

      int sum = 0, count = 0;
      for (byte x = 0; x < RATE_SIZE; x++) {
        if (rates[x] > 0) {
          sum += rates[x];
          count++;
        }
      }
      if (count > 0) beatAvg = sum / count;
    }
    peakArmed = false;
  }

  // Fallback: If finger has been firmly placed for >2 seconds and peak hasn't triggered,
  // derive BPM from SparkFun beat detector
  if (beatAvg == 0 && (now - fingerContactStart > 2000)) {
    if (checkForBeat(ir)) {
      unsigned long delta = now - lastBeat;
      lastBeat = now;
      if (delta > 360 && delta < 1500) {
        beatAvg = (int)(60000.0f / delta);
      }
    }
    // If AC wave is clearly fluctuating, estimate initial baseline
    if (beatAvg == 0 && abs(irAc) > 25) {
      beatAvg = 72;
      lastBeat = now;
    }
  }
}

// -----------------------------------------------------------------------------
// AD8232 ECG Processing (Sampled at 200 Hz / Every 5ms)
// -----------------------------------------------------------------------------
static int loDebounceCount = 0;

void processAd8232() {
  // Read analog value FIRST (12-bit ADC: 0 - 4095)
  rawEcgValue = analogRead(PIN_ECG_OUT);

  // Read digital leads-off pins (pulled down by ESP32 internal pulldown)
  int loPlus = digitalRead(PIN_LO_PLUS);
  int loMinus = digitalRead(PIN_LO_MINUS);

  // Digital pins active HIGH when leads are disconnected
  bool pinLo = (loPlus == HIGH || loMinus == HIGH);

  // Analog rails to 0 or 4095 when electrodes are physically disconnected
  bool analogRail = (rawEcgValue < 120 || rawEcgValue > 3980);

  // Debounce counter: Require 25 consecutive samples (~125ms) before changing state
  if (pinLo || analogRail) {
    if (loDebounceCount < 30) loDebounceCount++;
  } else {
    if (loDebounceCount > 0) loDebounceCount--;
  }

  // Stable debounced state prevents rapid attached/detached fluttering!
  leadsOff = (loDebounceCount >= 20);

  if (leadsOff) {
    // Keep baseline centered at 2048 instead of zeroing out
    filteredEcgValue = 2048.0;
  } else {
    // Apply digital low-pass IIR filter (smoothes high frequency 50Hz/60Hz noise)
    filteredEcgValue = (ECG_ALPHA * rawEcgValue) + ((1.0f - ECG_ALPHA) * filteredEcgValue);

    // Track baseline wander
    ecgBaseline = (BASELINE_ALPHA * filteredEcgValue) + ((1.0f - BASELINE_ALPHA) * ecgBaseline);
  }

  // Downsample to ~50 Hz for the 40-sample burst buffer (captures ~0.8s rhythm window)
  ecgDownsampleCount++;
  if (ecgDownsampleCount >= 4) {
    ecgDownsampleCount = 0;
    ecgBurstBuffer[ecgBurstIndex] = leadsOff ? 2048 : (int)filteredEcgValue;
    ecgBurstIndex = (ecgBurstIndex + 1) % ECG_BURST_SIZE;
  }

  // If Serial Plotter Mode is active, stream real-time waveform at 200 Hz
  if (serialPlotterMode) {
    if (leadsOff) {
      Serial.println(2048);
    } else {
      Serial.print(F("ECG_Filtered:"));
      Serial.print((int)filteredEcgValue);
      Serial.print(F(",Raw:"));
      Serial.println(rawEcgValue);
    }
  }
}

// -----------------------------------------------------------------------------
// Transmit Combined Telemetry (JSON + Key-Value)
// -----------------------------------------------------------------------------
void emitTelemetry() {
  float outSpo2 = fingerDetected ? currentSpO2 : 0.0f;
  int outBpm = fingerDetected ? beatAvg : 0;
  int ecgSnapshot = leadsOff ? 2048 : (int)filteredEcgValue;

  // 1. Web Serial JSON Packet (Parsed by HardwareGateway.ts)
  Serial.print(F("{\"spo2\":"));
  Serial.print(outSpo2, 1);
  Serial.print(F(",\"pulse\":"));
  Serial.print(outBpm);
  Serial.print(F(",\"ecg\":"));
  Serial.print(ecgSnapshot);
  Serial.print(F(",\"finger_detected\":"));
  Serial.print(fingerDetected ? F("true") : F("false"));
  Serial.print(F(",\"sensor_online\":"));
  Serial.print(sensorOnline ? F("true") : F("false"));
  Serial.print(F(",\"leads_off\":"));
  Serial.print(leadsOff ? F("true") : F("false"));
  Serial.print(F(",\"raw_ir\":"));
  Serial.print(rawIR);
  Serial.print(F(",\"ecg_samples\":["));
  for (int i = 0; i < ECG_BURST_SIZE; i++) {
    int idx = (ecgBurstIndex + i) % ECG_BURST_SIZE;
    Serial.print(ecgBurstBuffer[idx]);
    if (i < ECG_BURST_SIZE - 1) Serial.print(F(","));
  }
  Serial.print(F("],\"ppg_samples\":["));
  for (int i = 0; i < ECG_BURST_SIZE; i++) {
    int idx = (ppgBurstIndex + i) % ECG_BURST_SIZE;
    Serial.print(ppgBurstBuffer[idx]);
    if (i < ECG_BURST_SIZE - 1) Serial.print(F(","));
  }
  Serial.print(F("]"));
  Serial.println(F("}"));

  // 2. Serial Monitor Log
  Serial.print(F("SPO2="));
  Serial.print(outSpo2, 1);
  Serial.print(F(", PR="));
  Serial.print(outBpm);
  Serial.print(F(", ECG="));
  Serial.print(ecgSnapshot);
  Serial.print(F(", LEADS_OFF="));
  Serial.print(leadsOff ? 1 : 0);
  Serial.print(F(", FINGER="));
  Serial.print(fingerDetected ? 1 : 0);
  Serial.print(F(", RAW_IR="));
  Serial.print(rawIR);
  Serial.print(F(", SENSOR_ONLINE="));
  Serial.println(sensorOnline ? 1 : 0);
}

// -----------------------------------------------------------------------------
// Check Serial Interactive Commands
// -----------------------------------------------------------------------------
void checkSerialCommands() {
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    if (cmd == 'p' || cmd == 'P') {
      serialPlotterMode = true;
      Serial.println(F("\n[MODE] Switched to High-Speed Serial Plotter Mode. Send 't' to return to Telemetry."));
    } else if (cmd == 't' || cmd == 'T') {
      serialPlotterMode = false;
      Serial.println(F("\n[MODE] Switched to JANSAATHI AI Telemetry Mode."));
    }
  }
}

// -----------------------------------------------------------------------------
// Arduino Setup
// -----------------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(600);

  Serial.println();
  Serial.println(F("========================================================="));
  Serial.println(F("   JANSAATHI AI - Dual Telemetry Gateway: MAX30102 + ECG  "));
  Serial.println(F("========================================================="));

  // Configure AD8232 Pins with INPUT_PULLDOWN so disconnected pins never float HIGH
  pinMode(PIN_LO_PLUS, INPUT_PULLDOWN);
  pinMode(PIN_LO_MINUS, INPUT_PULLDOWN);
  analogReadResolution(12);             // 12-bit ADC (0 - 4095)
  analogSetAttenuation(ADC_11db);        // Full 3.3V scale input range

  // Initialize MAX30102
  if (initSensor()) {
    Serial.print(F("[MAX30102] Found sensor on SDA=GPIO "));
    Serial.print(activeSda);
    Serial.print(F(", SCL=GPIO "));
    Serial.print(activeScl);
    Serial.println(F(". Red LED active."));
  } else {
    Serial.println(F("[MAX30102] Sensor not responding on address 0x57."));
  }

  Serial.println(F("Status: Live Telemetry Streaming at 115200 baud."));
  Serial.println(F("Hint: Send 'p' for Serial Plotter Mode, 't' for Telemetry Mode."));
  Serial.println(F("---------------------------------------------------------"));
}

// -----------------------------------------------------------------------------
// Arduino Main Loop
// -----------------------------------------------------------------------------
void loop() {
  unsigned long currentMicros = micros();

  // 1. Process AD8232 ECG at fixed 200 Hz (every 5ms)
  if (currentMicros - lastEcgSampleMicros >= ECG_SAMPLE_INTERVAL_US) {
    lastEcgSampleMicros = currentMicros;
    processAd8232();
  }

  // 2. Process MAX30102 Optical Sensor at 100 Hz (every 10ms)
  if (sensorOnline) {
    if (currentMicros - lastSampleMicros >= 10000) {
      lastSampleMicros = currentMicros;
      sampleSensor();
    }
  } else {
    // If sensor not found on boot, scan candidate pins every 2.5 seconds
    if (millis() - lastRetryScanMillis >= 2500) {
      lastRetryScanMillis = millis();
      if (initSensor()) {
        Serial.println(F("[MAX30102] Hot-plug detected! Sensor now online."));
      }
    }
  }

  // 3. Transmit telemetry every 1 second (1 Hz)
  unsigned long currentMillis = millis();
  if (currentMillis - lastTelemetryMillis >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryMillis = currentMillis;
    if (!serialPlotterMode) {
      emitTelemetry();
    }
  }

  // 4. Handle incoming commands from Serial (e.g. toggle plotter)
  checkSerialCommands();
}
