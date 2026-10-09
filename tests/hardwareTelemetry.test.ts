// JANSAATHI AI - Hardware Telemetry Parsing Tests
// Tests packet decoding for serial / BLE medical telemetry

import { describe, it, expect } from 'vitest';
import { HardwareGateway } from '../src/services/hardware/HardwareGateway';
import { HardwareReading } from '../src/types';

describe('HardwareGateway Telemetry Parsing', () => {
  const gateway = new HardwareGateway();

  it('parses JSON format sensor packets', () => {
    const received: HardwareReading[] = [];
    gateway.parsePacket('{"spo2": 97, "pulse": 72, "temp": 36.8}', (r) => received.push(r));

    expect(received.length).toBe(3);
    const spo2 = received.find((r) => r.reading_type === 'SPO2');
    const pr = received.find((r) => r.reading_type === 'PULSE_RATE');
    const temp = received.find((r) => r.reading_type === 'BODY_TEMPERATURE');

    expect(spo2?.numerical_value).toBe(97);
    expect(spo2?.unit).toBe('%');
    expect(pr?.numerical_value).toBe(72);
    expect(pr?.unit).toBe('bpm');
    expect(temp?.numerical_value).toBe(36.8);
    expect(temp?.unit).toBe('degC');
  });

  it('parses Key-Value ASCII serial telemetry packets', () => {
    const received: HardwareReading[] = [];
    gateway.parsePacket('SPO2=94, PR=88, TEMP=37.2', (r) => received.push(r));

    expect(received.length).toBe(3);
    const spo2 = received.find((r) => r.reading_type === 'SPO2');
    expect(spo2?.numerical_value).toBe(94);
  });

  it('parses combined MAX30102 and AD8232 ECG JSON packets', () => {
    const received: HardwareReading[] = [];
    gateway.parsePacket('{"spo2": 98.4, "pulse": 76, "ecg": 2048, "leads_off": false}', (r) => received.push(r));

    expect(received.length).toBe(3);
    const ecg = received.find((r) => r.reading_type === 'ECG');
    expect(ecg).toBeDefined();
    expect(ecg?.numerical_value).toBe(2048);
    expect(ecg?.is_stable).toBe(true);

    const leadsOffReceived: HardwareReading[] = [];
    gateway.parsePacket('{"spo2": 0, "pulse": 0, "ecg": 4095, "leads_off": true}', (r) => leadsOffReceived.push(r));
    const leadsOffEcg = leadsOffReceived.find((r) => r.reading_type === 'ECG');
    expect(leadsOffEcg?.is_stable).toBe(false);
  });

  it('parses ECG Key-Value telemetry lines', () => {
    const received: HardwareReading[] = [];
    gateway.parsePacket('SPO2=98.0, PR=74, ECG=1980', (r) => received.push(r));

    expect(received.length).toBe(3);
    const ecg = received.find((r) => r.reading_type === 'ECG');
    expect(ecg?.numerical_value).toBe(1980);
  });

  it('parses ECG waveform sample burst arrays', () => {
    const received: HardwareReading[] = [];
    const sampleBurst = [2048, 2090, 2180, 2350, 1980, 2048];
    gateway.parsePacket(
      JSON.stringify({
        spo2: 98.2,
        pulse: 74,
        ecg: 2048,
        leads_off: false,
        ecg_samples: sampleBurst,
      }),
      (r) => received.push(r)
    );

    const ecg = received.find((r) => r.reading_type === 'ECG');
    expect(ecg).toBeDefined();
    expect(ecg?.waveform_samples).toEqual(sampleBurst);
    expect(ecg?.numerical_value).toBe(2048);
  });

  it('ignores corrupted or empty telemetry lines gracefully', () => {
    const received: HardwareReading[] = [];
    gateway.parsePacket('CORRUPT_NOISE_@@#$!%', (r) => received.push(r));
    expect(received.length).toBe(0);
  });
});
