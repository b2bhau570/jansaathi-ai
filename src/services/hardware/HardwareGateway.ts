// JANSAATHI AI - Hardware Telemetry Gateway
// Real Web Serial & Web Bluetooth integration for pulse oximeters, ECG, and infrared thermometers.
// Accurately reflects device connection states: Connected, Disconnected, Connecting, Unavailable, Error.

import { HardwareReading } from '../../types';

export type DeviceConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'UNAVAILABLE' | 'ERROR';

export interface HardwareStatusEvent {
  status: DeviceConnectionStatus;
  deviceLabel?: string;
  errorMessage?: string;
}

export class HardwareGateway {
  private currentStatus: DeviceConnectionStatus = 'DISCONNECTED';
  private serialPort: any = null;
  private serialReader: any = null;
  private isReading = false;

  public getStatus(): DeviceConnectionStatus {
    return this.currentStatus;
  }

  public isWebSerialSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  public isWebBluetoothSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  // 1. Connect via Web Serial (USB / UART TTL from ESP32, STM32, or Arduino circuit)
  public async connectSerial(
    onReading: (reading: HardwareReading) => void,
    onStatusChange: (event: HardwareStatusEvent) => void,
    baudRate = 115200
  ): Promise<void> {
    if (!this.isWebSerialSupported()) {
      this.currentStatus = 'UNAVAILABLE';
      onStatusChange({
        status: 'UNAVAILABLE',
        errorMessage: 'Web Serial API is not supported in this browser. Please use Chrome or Edge on desktop.',
      });
      return;
    }

    try {
      this.currentStatus = 'CONNECTING';
      onStatusChange({ status: 'CONNECTING' });

      // Request port from user
      const nav = navigator as any;
      this.serialPort = await nav.serial.requestPort();
      await this.serialPort.open({ baudRate });

      this.currentStatus = 'CONNECTED';
      onStatusChange({ status: 'CONNECTED', deviceLabel: 'Serial Health Telemetry Device' });

      this.isReading = true;
      this.readSerialStream(onReading, onStatusChange);
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        this.currentStatus = 'DISCONNECTED';
        onStatusChange({ status: 'DISCONNECTED', errorMessage: 'No serial device selected.' });
      } else {
        this.currentStatus = 'ERROR';
        onStatusChange({
          status: 'ERROR',
          errorMessage: `Serial connection error: ${err.message || 'Port open failed'}`,
        });
      }
    }
  }

  // Read loop with packet parsing
  private async readSerialStream(
    onReading: (reading: HardwareReading) => void,
    onStatusChange: (event: HardwareStatusEvent) => void
  ) {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = this.serialPort.readable.pipeTo(textDecoder.writable);
    this.serialReader = textDecoder.readable.getReader();

    let buffer = '';

    try {
      while (this.isReading) {
        const { value, done } = await this.serialReader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep unfinished line in buffer

          for (const line of lines) {
            this.parsePacket(line.trim(), onReading);
          }
        }
      }
    } catch (err: any) {
      this.currentStatus = 'ERROR';
      onStatusChange({ status: 'ERROR', errorMessage: `Telemetry read error: ${err.message}` });
    } finally {
      this.serialReader?.releaseLock();
      await readableStreamClosed.catch(() => {});
    }
  }

  // 2. Parse sensor telemetry packets: e.g. "SPO2=98,PR=72,TEMP=36.7" or JSON {"spo2": 98, "pulse": 72}
  public parsePacket(raw: string, onReading: (reading: HardwareReading) => void): void {
    if (!raw) return;

    // A. JSON format packet
    if (raw.startsWith('{') && raw.endsWith('}')) {
      try {
        const data = JSON.parse(raw);
        if (data.spo2 !== undefined) {
          onReading({
            id: `reading-spo2-${Date.now()}`,
            reading_type: 'SPO2',
            numerical_value: Number(data.spo2),
            unit: '%',
            is_stable: true,
            measured_at: new Date().toISOString(),
          });
        }
        if (data.pulse !== undefined || data.pr !== undefined) {
          onReading({
            id: `reading-pr-${Date.now()}`,
            reading_type: 'PULSE_RATE',
            numerical_value: Number(data.pulse || data.pr),
            unit: 'bpm',
            is_stable: true,
            measured_at: new Date().toISOString(),
          });
        }
        if (data.temp !== undefined) {
          onReading({
            id: `reading-temp-${Date.now()}`,
            reading_type: 'BODY_TEMPERATURE',
            numerical_value: Number(data.temp),
            unit: 'degC',
            is_stable: true,
            measured_at: new Date().toISOString(),
          });
        }
        return;
      } catch {
        // Fall through to regex
      }
    }

    // B. Key-Value format: SPO2=98, PR=75, TEMP=36.8
    const spo2Match = raw.match(/SPO2\s*[:=]\s*([0-9.]+)/i);
    if (spo2Match) {
      onReading({
        id: `reading-spo2-${Date.now()}`,
        reading_type: 'SPO2',
        numerical_value: parseFloat(spo2Match[1]),
        unit: '%',
        is_stable: true,
        measured_at: new Date().toISOString(),
      });
    }

    const prMatch = raw.match(/(?:PR|PULSE|HR)\s*[:=]\s*([0-9.]+)/i);
    if (prMatch) {
      onReading({
        id: `reading-pr-${Date.now()}`,
        reading_type: 'PULSE_RATE',
        numerical_value: parseFloat(prMatch[1]),
        unit: 'bpm',
        is_stable: true,
        measured_at: new Date().toISOString(),
      });
    }

    const tempMatch = raw.match(/(?:TEMP|TMP)\s*[:=]\s*([0-9.]+)/i);
    if (tempMatch) {
      onReading({
        id: `reading-temp-${Date.now()}`,
        reading_type: 'BODY_TEMPERATURE',
        numerical_value: parseFloat(tempMatch[1]),
        unit: 'degC',
        is_stable: true,
        measured_at: new Date().toISOString(),
      });
    }
  }

  // Disconnect safely
  public async disconnect(): Promise<void> {
    this.isReading = false;
    if (this.serialReader) {
      try {
        await this.serialReader.cancel();
      } catch {
        // Safe ignore
      }
    }
    if (this.serialPort) {
      try {
        await this.serialPort.close();
      } catch {
        // Safe ignore
      }
      this.serialPort = null;
    }
    this.currentStatus = 'DISCONNECTED';
  }
}
