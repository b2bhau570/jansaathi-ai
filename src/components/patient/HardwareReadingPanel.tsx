// JANSAATHI AI - Hardware Telemetry Integration Panel
// Real Web Serial integration for pulse oximeters and vital signs. Never fakes connected status.

import React, { useState, useEffect, useRef } from 'react';
import { HardwareGateway, DeviceConnectionStatus } from '../../services/hardware/HardwareGateway';
import { HardwareReading } from '../../types';
import { Activity, Usb, AlertCircle, CheckCircle2, RefreshCw, Plus } from 'lucide-react';

interface HardwareReadingPanelProps {
  onReadingsUpdated: (readings: HardwareReading[]) => void;
  initialReadings?: HardwareReading[];
}

export const HardwareReadingPanel: React.FC<HardwareReadingPanelProps> = ({
  onReadingsUpdated,
  initialReadings = [],
}) => {
  const [status, setStatus] = useState<DeviceConnectionStatus>('DISCONNECTED');
  const [deviceLabel, setDeviceLabel] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [readings, setReadings] = useState<HardwareReading[]>(initialReadings);

  // Manual entry fallback
  const [manualSpo2, setManualSpo2] = useState('');
  const [manualPr, setManualPr] = useState('');
  const [manualTemp, setManualTemp] = useState('');

  const gatewayRef = useRef<HardwareGateway | null>(null);

  useEffect(() => {
    gatewayRef.current = new HardwareGateway();
    return () => {
      gatewayRef.current?.disconnect();
    };
  }, []);

  const handleConnectSerial = async () => {
    if (!gatewayRef.current) return;
    setErrorMessage(null);

    await gatewayRef.current.connectSerial(
      (reading) => {
        setReadings((prev) => {
          // Replace or append newest reading for this metric
          const filtered = prev.filter((r) => r.reading_type !== reading.reading_type);
          const updated = [...filtered, reading];
          onReadingsUpdated(updated);
          return updated;
        });
      },
      (statusEvt) => {
        setStatus(statusEvt.status);
        if (statusEvt.deviceLabel) setDeviceLabel(statusEvt.deviceLabel);
        if (statusEvt.errorMessage) setErrorMessage(statusEvt.errorMessage);
      }
    );
  };

  const handleDisconnect = async () => {
    if (!gatewayRef.current) return;
    await gatewayRef.current.disconnect();
    setStatus('DISCONNECTED');
    setDeviceLabel(null);
  };

  const handleAddManualVital = (e: React.FormEvent) => {
    e.preventDefault();
    const newItems: HardwareReading[] = [];
    const now = new Date().toISOString();

    if (manualSpo2 && !isNaN(Number(manualSpo2))) {
      newItems.push({
        id: `vital-spo2-${Date.now()}`,
        reading_type: 'SPO2',
        numerical_value: Number(manualSpo2),
        unit: '%',
        is_stable: true,
        measured_at: now,
      });
    }
    if (manualPr && !isNaN(Number(manualPr))) {
      newItems.push({
        id: `vital-pr-${Date.now()}`,
        reading_type: 'PULSE_RATE',
        numerical_value: Number(manualPr),
        unit: 'bpm',
        is_stable: true,
        measured_at: now,
      });
    }
    if (manualTemp && !isNaN(Number(manualTemp))) {
      newItems.push({
        id: `vital-temp-${Date.now()}`,
        reading_type: 'BODY_TEMPERATURE',
        numerical_value: Number(manualTemp),
        unit: 'degC',
        is_stable: true,
        measured_at: now,
      });
    }

    if (newItems.length > 0) {
      setReadings((prev) => {
        const types = newItems.map((n) => n.reading_type);
        const filtered = prev.filter((r) => !types.includes(r.reading_type));
        const updated = [...filtered, ...newItems];
        onReadingsUpdated(updated);
        return updated;
      });
      setManualSpo2('');
      setManualPr('');
      setManualTemp('');
    }
  };

  const isWebSerialAvailable = gatewayRef.current?.isWebSerialSupported() ?? true;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded border border-slate-300 p-6 shadow-xs">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
        <div className="w-10 h-10 rounded bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5 text-emerald-800" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Medical Hardware Telemetry</h3>
          <p className="text-xs text-slate-600">
            Connect pulse oximeter or vitals telemetry via Web Serial (USB / UART TTL).
          </p>
        </div>
      </div>

      {/* Hardware Connection Status */}
      <div className="my-5 p-4 rounded border bg-slate-50 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-800">Connection Status:</span>
            {status === 'CONNECTED' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                Connected ({deviceLabel})
              </span>
            )}
            {status === 'DISCONNECTED' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700">
                Disconnected
              </span>
            )}
            {status === 'CONNECTING' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Connecting...
              </span>
            )}
            {status === 'UNAVAILABLE' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                Web Serial Unavailable
              </span>
            )}
            {status === 'ERROR' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">
                Error
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Compatible with ESP32 / Arduino pulse oximeters emitting standard serial streams.
          </div>
        </div>

        <div>
          {status === 'CONNECTED' ? (
            <button
              type="button"
              onClick={handleDisconnect}
              className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 rounded text-xs font-semibold transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              disabled={!isWebSerialAvailable || status === 'CONNECTING'}
              onClick={handleConnectSerial}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
            >
              <Usb className="w-3.5 h-3.5" />
              Connect USB Device
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-300 text-red-900 rounded text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Live Vitals Grid */}
      <div className="my-5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
          Recorded Vital Signs:
        </h4>

        {readings.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded text-center text-xs text-slate-500">
            No telemetry readings captured yet. Connect device or enter manually below.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {readings.map((reading) => (
              <div
                key={reading.id}
                className="p-3 bg-white rounded border border-slate-300 shadow-xs flex flex-col justify-between"
              >
                <div className="text-xs font-semibold text-slate-700">
                  {reading.reading_type === 'SPO2' && 'SpO2 Oxygen Saturation'}
                  {reading.reading_type === 'PULSE_RATE' && 'Pulse Rate (Heart Rate)'}
                  {reading.reading_type === 'BODY_TEMPERATURE' && 'Body Temperature'}
                  {reading.reading_type === 'BLOOD_PRESSURE' && 'Blood Pressure'}
                </div>
                <div className="my-2">
                  <span className="text-2xl font-bold text-slate-900">{reading.numerical_value}</span>
                  <span className="text-xs font-semibold text-slate-600 ml-1">{reading.unit}</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Captured: {new Date(reading.measured_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Vitals Entry Fallback */}
      <form onSubmit={handleAddManualVital} className="mt-6 pt-5 border-t border-slate-200">
        <h4 className="text-xs font-semibold text-slate-800 mb-2">
          Manual Vital Signs Entry (Health Worker Measurement):
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">SpO2 (%)</label>
            <input
              type="number"
              min="50"
              max="100"
              step="1"
              value={manualSpo2}
              onChange={(e) => setManualSpo2(e.target.value)}
              placeholder="e.g. 98"
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Pulse Rate (bpm)</label>
            <input
              type="number"
              min="30"
              max="240"
              step="1"
              value={manualPr}
              onChange={(e) => setManualPr(e.target.value)}
              placeholder="e.g. 74"
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Temperature (&deg;C)</label>
            <input
              type="number"
              min="30"
              max="45"
              step="0.1"
              value={manualTemp}
              onChange={(e) => setManualTemp(e.target.value)}
              placeholder="e.g. 37.0"
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-700"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={!manualSpo2 && !manualPr && !manualTemp}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold disabled:opacity-50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Manual Reading
        </button>
      </form>
    </div>
  );
};
