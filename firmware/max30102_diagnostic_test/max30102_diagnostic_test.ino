/*
 ==================================================================================================
   JANSAATHI AI - MAX30102 Pure Hardware Diagnostic & Serial Monitor Test
   Dedicated Standalone Test Sketch for Pulse Oximeter & Heart Rate Sensor
 ==================================================================================================

  PURPOSE:
  - Isolate and test MAX30102 / MAX30100 hardware independently of web apps or other sensors.
  - Test I2C communication on GPIO 21 (SDA) and GPIO 22 (SCL).
  - Automatically test swapped pins (GPIO 22 SDA / GPIO 21 SCL).
  - Force-illuminate the Red LED at maximum brightness.
  - Stream live raw Red & IR optical reflections directly to the Arduino Serial Monitor.

  WIRING CHECKLIST:
  ------------------------------------------------------------------------------------------------
  MAX30102 PIN       ESP32 PIN          CRITICAL NOTES
  ------------------------------------------------------------------------------------------------
  VIN (or VCC)   ->  5V (or VIN/VBUS)   *ESSENTIAL*: If your board is purple or green with an onboard
                                        regulator, connect to 5V! (Connecting to 3.3V causes voltage
                                        drop to ~2.8V, preventing the Red LED from lighting up).
  GND            ->  GND                Ground
  SDA            ->  GPIO 21 (D21)      I2C Data line
  SCL            ->  GPIO 22 (D22)      I2C Clock line
  INT            ->  NC (Not connected)
  ------------------------------------------------------------------------------------------------

  SERIAL MONITOR SETTINGS:
  - Baud rate: 115200 baud
 ==================================================================================================
*/

#include <Wire.h>
#include <MAX30105.h>

MAX30105 particleSensor;

int sdaPin = 21;
int sclPin = 22;
bool sensorDetected = false;
bool usingSparkFunDriver = false;
bool isMax30100 = false;
uint8_t partID = 0x00;

// Helper: Write single I2C register
void writeRegister(uint8_t addr, uint8_t reg, uint8_t val) {
  Wire.beginTransmission(addr);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

// Helper: Read single I2C register
uint8_t readRegister(uint8_t addr, uint8_t reg) {
  Wire.beginTransmission(addr);
  Wire.write(reg);
  Wire.endTransmission(false);
  Wire.requestFrom(addr, (uint8_t)1);
  return Wire.available() ? Wire.read() : 0x00;
}

// Helper: Probe address 0x57 on given pins
bool probeAddress(int sda, int scl) {
  pinMode(sda, INPUT_PULLUP);
  pinMode(scl, INPUT_PULLUP);
  Wire.begin(sda, scl, 100000); // 100kHz standard speed
  delay(50);
  Wire.beginTransmission(0x57);
  return (Wire.endTransmission() == 0);
}

// Helper: Full I2C bus scan
void scanBus() {
  Serial.println(F("\n[I2C BUS SCANNER] Scanning all 127 addresses..."));
  byte foundCount = 0;
  for (byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.print(F("  -> Found I2C device at address: 0x"));
      if (addr < 16) Serial.print("0");
      Serial.print(addr, HEX);
      if (addr == 0x57) Serial.print(F(" <-- (MAX30102 / MAX30100 detected!)"));
      Serial.println();
      foundCount++;
    }
  }
  if (foundCount == 0) {
    Serial.println(F("  -> ZERO I2C devices responded!"));
    Serial.println(F("     1. Check power: Try connecting VIN to ESP32 5V (or VIN pin)."));
    Serial.println(F("     2. Check GND wire."));
    Serial.println(F("     3. Check SDA is on pin 21, SCL is on pin 22."));
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println(F("=========================================================="));
  Serial.println(F("  JANSAATHI AI - MAX30102 DIAGNOSTIC HARDWARE MONITOR     "));
  Serial.println(F("=========================================================="));
  Serial.println(F("Step 1: Testing I2C connection to MAX30102 (Address 0x57)..."));

  // 1. Test standard pin configuration (SDA=21, SCL=22)
  if (probeAddress(21, 22)) {
    sdaPin = 21;
    sclPin = 22;
    sensorDetected = true;
    Serial.println(F("  [OK] Device ACKNOWLEDGED at 0x57 on SDA=GPIO 21, SCL=GPIO 22."));
  } else {
    // 2. Test swapped pin configuration (SDA=22, SCL=21)
    Serial.println(F("  [!] Address 0x57 did not respond on SDA=21, SCL=22."));
    Serial.println(F("  [?] Testing swapped pins (SDA=22, SCL=21)..."));
    if (probeAddress(22, 21)) {
      sdaPin = 22;
      sclPin = 21;
      sensorDetected = true;
      Serial.println(F("  [OK] SUCCESS! Sensor found on SWAPPED pins: SDA=GPIO 22, SCL=GPIO 21."));
    } else {
      // 3. Scan the whole bus to see if ANY address responds
      scanBus();
    }
  }

  if (!sensorDetected) {
    Serial.println(F("\n=========================================================="));
    Serial.println(F("  HARDWARE TROUBLESHOOTING CHECKLIST                      "));
    Serial.println(F("=========================================================="));
    Serial.println(F("1. POWER PIN VOLTAGE (VERY COMMON!):"));
    Serial.println(F("   - Most purple/green breakout boards have an onboard 3.3V LDO regulator."));
    Serial.println(F("   - If you connected VIN to ESP32 '3V3', the regulator drops it to ~2.8V (too low!)."));
    Serial.println(F("   -> MOVE the VIN wire to ESP32 '5V' (or 'VIN' / 'VBUS')."));
    Serial.println(F("2. PIN LOCATION:"));
    Serial.println(F("   - Confirm SDA is in GPIO 21 (labeled 'D21' or '21')."));
    Serial.println(F("   - Confirm SCL is in GPIO 22 (labeled 'D22' or '22')."));
    Serial.println(F("3. JUMPER WIRES:"));
    Serial.println(F("   - Loose Dupont cables in breadboards often lose contact. Try pressing firmly."));
    Serial.println(F("=========================================================="));
    Serial.println(F("Diagnostic loop will keep retrying every 2 seconds..."));
    return;
  }

  // Read Part ID Register
  partID = readRegister(0x57, 0xFF);
  Serial.print(F("Step 2: Read Hardware Part ID register (0xFF): 0x"));
  if (partID < 16) Serial.print("0");
  Serial.println(partID, HEX);

  if (partID == 0x11) {
    isMax30100 = true;
    Serial.println(F("        -> Identified chip: MAX30100"));
  } else if (partID == 0x15) {
    isMax30100 = false;
    Serial.println(F("        -> Identified chip: MAX30102 / MAX30105"));
  } else {
    isMax30100 = false;
    Serial.println(F("        -> Identified chip: MAX30102 Compatible Clone"));
  }

  // Step 3: Turn on the Red & IR LEDs
  Serial.println(F("Step 3: Turning ON Red & IR LEDs at MAXIMUM amplitude..."));

  if (!isMax30100 && particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {
    // SparkFun Library Mode
    particleSensor.setup(0x7F, 4, 2, 100, 411, 4096);
    particleSensor.setPulseAmplitudeRed(0xFF); // Maximum Red brightness
    particleSensor.setPulseAmplitudeIR(0xFF);  // Maximum IR power
    particleSensor.setPulseAmplitudeGreen(0);
    particleSensor.enableFIFORollover();
    usingSparkFunDriver = true;
    Serial.println(F("  [OK] SparkFun library initialized successfully."));
  } else {
    // Direct Register Mode (Guaranteed to power LEDs for all clones & MAX30100)
    if (isMax30100) {
      writeRegister(0x57, 0x06, 0x40); // Reset
      delay(50);
      writeRegister(0x57, 0x06, 0x03); // SpO2 mode (Red + IR)
      writeRegister(0x57, 0x07, 0x07); // 100Hz, 1600us
      writeRegister(0x57, 0x09, 0xFF); // MAX Red & IR current
      writeRegister(0x57, 0x02, 0x00); // Clear FIFO Write
      writeRegister(0x57, 0x03, 0x00); // Clear FIFO Overflow
      writeRegister(0x57, 0x04, 0x00); // Clear FIFO Read
    } else {
      writeRegister(0x57, 0x09, 0x40); // Reset
      delay(50);
      writeRegister(0x57, 0x08, 0x5F); // FIFO Config
      writeRegister(0x57, 0x09, 0x03); // SpO2 Mode (Red + IR enabled)
      writeRegister(0x57, 0x0A, 0x27); // 100Hz, 411us, 4096nA
      writeRegister(0x57, 0x0C, 0xFF); // LED1 (Red) = MAX (0xFF)
      writeRegister(0x57, 0x0D, 0xFF); // LED2 (IR)  = MAX (0xFF)
      writeRegister(0x57, 0x04, 0x00);
      writeRegister(0x57, 0x05, 0x00);
      writeRegister(0x57, 0x06, 0x00);
    }
    usingSparkFunDriver = false;
    Serial.println(F("  [OK] Direct Hardware I2C registers configured."));
  }

  Serial.println(F("\n>>> LOOK AT YOUR SENSOR: The RED LED should now be GLOWING BRIGHTLY! <<<"));
  Serial.println(F("Streaming live optical readings below. Place your finger gently over the light:"));
  Serial.println(F("-----------------------------------------------------------------------------"));
}

void checkAllPinCandidates() {
  const int pairs[][2] = {
    {21, 22}, {22, 21},
    {18, 19}, {19, 18},
    {16, 17}, {17, 16},
    {4, 5},   {5, 4},
    {25, 26}, {26, 25},
    {32, 33}, {33, 32},
    {23, 22}, {22, 23}
  };
  const int numPairs = sizeof(pairs) / sizeof(pairs[0]);

  for (int i = 0; i < numPairs; i++) {
    if (probeAddress(pairs[i][0], pairs[i][1])) {
      Serial.print(F("\n[!] Sensor detected on SDA=GPIO "));
      Serial.print(pairs[i][0]);
      Serial.print(F(", SCL=GPIO "));
      Serial.print(pairs[i][1]);
      Serial.println(F("! Rebooting into active streaming mode..."));
      delay(500);
      ESP.restart();
    }
  }
}

void loop() {
  // If sensor was not found during boot, periodically test all possible pins every 2 seconds
  if (!sensorDetected) {
    delay(2000);
    checkAllPinCandidates();
    Serial.print(F("."));
    return;
  }

  uint32_t irValue = 0;
  uint32_t redValue = 0;

  if (usingSparkFunDriver) {
    irValue = particleSensor.getIR();
    redValue = particleSensor.getRed();
  } else {
    // Read directly from FIFO
    Wire.beginTransmission(0x57);
    Wire.write(isMax30100 ? 0x05 : 0x07);
    Wire.endTransmission(false);

    if (isMax30100) {
      Wire.requestFrom((uint8_t)0x57, (uint8_t)4);
      if (Wire.available() >= 4) {
        irValue = ((uint32_t)Wire.read() << 8) | Wire.read();
        redValue = ((uint32_t)Wire.read() << 8) | Wire.read();
      }
    } else {
      Wire.requestFrom((uint8_t)0x57, (uint8_t)6);
      if (Wire.available() >= 6) {
        redValue = ((uint32_t)Wire.read() << 16) | ((uint32_t)Wire.read() << 8) | Wire.read();
        irValue  = ((uint32_t)Wire.read() << 16) | ((uint32_t)Wire.read() << 8) | Wire.read();
        redValue &= 0x03FFFF;
        irValue  &= 0x03FFFF;
      }
    }
  }

  // Print formatted output every 150ms
  Serial.print(F("IR: "));
  Serial.print(irValue);
  Serial.print(F("\t | RED: "));
  Serial.print(redValue);

  if (irValue > 10000) {
    Serial.print(F("\t [FINGER DETECTED] Pulse Signal: "));
    // Mini ASCII pulse signal bar
    int bar = (irValue / 3000) % 20;
    for (int b = 0; b < bar; b++) Serial.print(F("#"));
    Serial.println();
  } else {
    Serial.println(F("\t [NO FINGER] Place finger gently over the glowing red sensor"));
  }

  delay(150);
}
