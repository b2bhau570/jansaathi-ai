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

  it('ignores corrupted or empty telemetry lines gracefully', () => {
    const received: HardwareReading[] = [];
    gateway.parsePacket('CORRUPT_NOISE_@@#$!%', (r) => received.push(r));
    expect(received.length).toBe(0);
  });
});
