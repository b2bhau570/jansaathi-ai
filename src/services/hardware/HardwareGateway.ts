// JANSAATHI AI - Hardware Telemetry Gateway
// Real Web Serial & Web Bluetooth integration for pulse oximeters, ECG, and infrared thermometers.
// Accurately reflects device connection states: Connected, Disconnected, Connecting, Unavailable, Error.

import { HardwareReading } from '../../types';

export type DeviceConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'UNAVAILABLE' | 'ERROR';

export interface TelemetryMeta {
  sensorOnline?: boolean;
  fingerDetected?: boolean;
  leadsOff?: boolean;
  rawIR?: number;
  partId?: number;
  activeSda?: number;
  activeScl?: number;
}

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
  private onTelemetryMetaCallback?: (meta: TelemetryMeta) => void;
  private leadsOffDebounceCount = 0;
  private debouncedLeadsOffState: boolean | undefined = undefined;

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
    onTelemetryMeta?: (meta: TelemetryMeta) => void,
    baudRate = 115200
  ): Promise<void> {
    this.onTelemetryMetaCallback = onTelemetryMeta;
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
        const rawMsg = err.message || '';
        let userFriendlyMsg = `Serial connection error: ${rawMsg}`;
        if (rawMsg.toLowerCase().includes('failed to open') || rawMsg.toLowerCase().includes('access denied')) {
          userFriendlyMsg = 'The COM port is currently busy. Please close the Arduino IDE Serial Monitor / Serial Plotter and click "Connect USB Device" again.';
        }
        onStatusChange({
          status: 'ERROR',
          errorMessage: userFriendlyMsg,
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
  public parsePacket(
    raw: string,
    onReading: (reading: HardwareReading) => void,
    onTelemetryMeta?: (meta: TelemetryMeta) => void
  ): void {
    if (!raw) return;
    const metaCallback = onTelemetryMeta || this.onTelemetryMetaCallback;

    // A. JSON format packet
    if (raw.startsWith('{') && raw.endsWith('}')) {
      try {
        const data = JSON.parse(raw);

        const leadsOffBool = data.leads_off !== undefined ? Boolean(data.leads_off) : undefined;

        if (metaCallback && (data.sensor_online !== undefined || data.finger_detected !== undefined || leadsOffBool !== undefined || data.raw_ir !== undefined)) {
          metaCallback({
            sensorOnline: data.sensor_online !== undefined ? Boolean(data.sensor_online) : undefined,
            fingerDetected: data.finger_detected !== undefined ? Boolean(data.finger_detected) : undefined,
            leadsOff: leadsOffBool,
            rawIR: data.raw_ir !== undefined ? Number(data.raw_ir) : undefined,
            partId: data.part_id !== undefined ? Number(data.part_id) : undefined,
            activeSda: data.active_sda !== undefined ? Number(data.active_sda) : undefined,
            activeScl: data.active_scl !== undefined ? Number(data.active_scl) : undefined,
          });
        }

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
        if (data.ecg !== undefined || data.ecg_samples !== undefined) {
          const ecgVal = data.ecg !== undefined
            ? Number(data.ecg)
            : Array.isArray(data.ecg_samples) && data.ecg_samples.length > 0
            ? Number(data.ecg_samples[data.ecg_samples.length - 1])
            : 2048;
          const rawSamples = Array.isArray(data.ecg_samples) ? data.ecg_samples.map(Number) : undefined;
          const rawPpg = Array.isArray(data.ppg_samples)
            ? data.ppg_samples.map(Number)
            : Array.isArray(data.ppg)
            ? data.ppg.map(Number)
            : undefined;

          onReading({
            id: `reading-ecg-${Date.now()}`,
            reading_type: 'ECG',
            numerical_value: ecgVal,
            unit: 'raw',
            is_stable: data.leads_off === undefined ? true : !Boolean(data.leads_off),
            measured_at: new Date().toISOString(),
            waveform_samples: rawSamples,
            ppg_samples: rawPpg,
          });
        }
        return;
      } catch {
        // Fall through to regex
      }
    }

    // B. Key-Value format: SPO2=98, PR=75, TEMP=36.8, ECG=2048, SENSOR_ONLINE=1, FINGER=1, LEADS_OFF=0
    const sensorOnlineMatch = raw.match(/SENSOR_ONLINE\s*[:=]\s*([01])/i);
    const fingerMatch = raw.match(/FINGER\s*[:=]\s*([01])/i);
    const leadsOffMatch = raw.match(/LEADS_OFF\s*[:=]\s*([01])/i);

    let debouncedLoKv = undefined;
    if (leadsOffMatch) {
      const rawLo = leadsOffMatch[1] === '1';
      if (rawLo) this.leadsOffDebounceCount = Math.min(4, this.leadsOffDebounceCount + 1);
      else this.leadsOffDebounceCount = Math.max(0, this.leadsOffDebounceCount - 1);
      if (this.leadsOffDebounceCount >= 2) this.debouncedLeadsOffState = true;
      else if (this.leadsOffDebounceCount === 0) this.debouncedLeadsOffState = false;
      debouncedLoKv = this.debouncedLeadsOffState;
    }

    if (metaCallback && (sensorOnlineMatch || fingerMatch || leadsOffMatch)) {
      metaCallback({
        sensorOnline: sensorOnlineMatch ? sensorOnlineMatch[1] === '1' : undefined,
        fingerDetected: fingerMatch ? fingerMatch[1] === '1' : undefined,
        leadsOff: debouncedLoKv,
      });
    }

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

    const ecgMatch = raw.match(/ECG\s*[:=]\s*([0-9.]+)/i);
    if (ecgMatch) {
      onReading({
        id: `reading-ecg-${Date.now()}`,
        reading_type: 'ECG',
        numerical_value: parseFloat(ecgMatch[1]),
        unit: 'raw',
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
