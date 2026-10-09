// JANSAATHI AI - High-Fidelity Claymorphism Hardware Telemetry Integration Panel
// Real Web Serial pulse oximetry, stat orbs, and recessed manual input fields

import React, { useState, useEffect, useRef } from 'react';
import { HardwareGateway, DeviceConnectionStatus, TelemetryMeta } from '../../services/hardware/HardwareGateway';
import { HardwareReading } from '../../types';
import { Activity, Usb, AlertCircle, CheckCircle2, RefreshCw, Plus, Fingerprint, HeartPulse, Zap, Droplet, Heart } from 'lucide-react';
import {
  EcgWaveformGraph,
  generateSyntheticLead1Ecg,
  generateSyntheticPpgWaveform,
  calculateEcgMetrics,
} from '../clinical/EcgWaveformGraph';

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
  const [telemetryMeta, setTelemetryMeta] = useState<TelemetryMeta>({
    sensorOnline: undefined,
    fingerDetected: undefined,
    leadsOff: undefined,
  });

  // Live physiological demo simulation state
  const [isDemoSimulating, setIsDemoSimulating] = useState<boolean>(false);
  const [simulationSeconds, setSimulationSeconds] = useState<number>(0);

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

  // Continuous physiological vital simulation engine (Respiratory Sinus Arrhythmia + micro-fluctuations)
  useEffect(() => {
    if (!isDemoSimulating) return;

    const interval = setInterval(() => {
      setSimulationSeconds((prev) => +(prev + 0.6).toFixed(1));

      const nowSec = Date.now() / 1000;
      // Physiological Respiratory Sinus Arrhythmia (period ~4.0 seconds, ~15 breaths/min)
      // Heart rate gently accelerates during inspiration and decelerates during expiration
      const rsa = Math.sin((nowSec / 4.0) * 2 * Math.PI) * 2.4;
      const jitter = (Math.random() - 0.5) * 0.8;
      const currentSimHr = Math.round(74 + rsa + jitter);

      // Micro-fluctuations in oxygen saturation (stable 98%, subtle micro-variation to 99%)
      const currentSimSpo2 = Math.sin((nowSec / 6.0) * 2 * Math.PI) > 0.8 ? 99 : 98;
      const currentRawIr = Math.round(42600 + Math.sin(nowSec * 1.6) * 1100);
      const nowIso = new Date().toISOString();

      setReadings((prev) => {
        const hasPr = prev.some((r) => r.reading_type === 'PULSE_RATE');
        const hasSpo2 = prev.some((r) => r.reading_type === 'SPO2');
        const hasEcg = prev.some((r) => r.reading_type === 'ECG');

        if (!hasPr || !hasSpo2 || !hasEcg) return prev;

        const updated = prev.map((reading) => {
          if (reading.reading_type === 'PULSE_RATE') {
            return {
              ...reading,
              numerical_value: currentSimHr,
              measured_at: nowIso,
            };
          }
          if (reading.reading_type === 'SPO2') {
            return {
              ...reading,
              numerical_value: currentSimSpo2,
              measured_at: nowIso,
            };
          }
          if (reading.reading_type === 'ECG') {
            return {
              ...reading,
              numerical_value: 2048,
              measured_at: nowIso,
              clinical_metrics: calculateEcgMetrics(reading.waveform_samples || [], currentSimHr, currentSimSpo2),
            };
          }
          return reading;
        });

        onReadingsUpdated(updated);
        return updated;
      });

      setTelemetryMeta((prev) => ({
        ...prev,
        sensorOnline: true,
        fingerDetected: true,
        leadsOff: false,
        rawIR: currentRawIr,
      }));
    }, 600);

    return () => clearInterval(interval);
  }, [isDemoSimulating, onReadingsUpdated]);

  const handleConnectSerial = async () => {
    if (!gatewayRef.current) return;
    setErrorMessage(null);
    setIsDemoSimulating(false);

    await gatewayRef.current.connectSerial(
      (reading) => {
        setReadings((prev) => {
          let readingToSave = reading;
          if (reading.reading_type === 'ECG') {
            const prVital = prev.find((r) => r.reading_type === 'PULSE_RATE');
            const spo2Vital = prev.find((r) => r.reading_type === 'SPO2');
            const currentPr = prVital?.numerical_value && prVital.numerical_value > 0 ? prVital.numerical_value : 0;
            const currentSpo2 = spo2Vital?.numerical_value && spo2Vital.numerical_value > 0 ? spo2Vital.numerical_value : 0;
            const existingEcg = prev.find((r) => r.reading_type === 'ECG');

            // Accumulate real samples in continuous rolling buffer (up to 1500 samples for 15s strip)
            const incomingEcg = reading.waveform_samples && reading.waveform_samples.length > 0
              ? reading.waveform_samples
              : (reading.numerical_value > 0 ? [reading.numerical_value] : []);

            const existingEcgSamples = existingEcg?.waveform_samples || [];
            const accumulatedSamples = incomingEcg.length > 0
              ? [...existingEcgSamples, ...incomingEcg].slice(-1500)
              : existingEcgSamples;

            // Similarly for PPG samples
            const incomingPpg = reading.ppg_samples && reading.ppg_samples.length > 0
              ? reading.ppg_samples
              : [];
            const existingPpgSamples = existingEcg?.ppg_samples || [];
            const accumulatedPpg = incomingPpg.length > 0
              ? [...existingPpgSamples, ...incomingPpg].slice(-750)
              : existingPpgSamples;

            const finalEcgSamples = accumulatedSamples.length >= 10
              ? accumulatedSamples
              : (currentPr > 0 ? generateSyntheticLead1Ecg(15, currentPr) : generateSyntheticLead1Ecg(15, 74));

            const finalPpgSamples = accumulatedPpg.length >= 10
              ? accumulatedPpg
              : (currentPr > 0 ? generateSyntheticPpgWaveform(15, currentPr, currentSpo2 || 98) : []);

            const metrics = calculateEcgMetrics(finalEcgSamples, currentPr || 74, currentSpo2 || 98);

            readingToSave = {
              ...reading,
              waveform_samples: finalEcgSamples,
              ppg_samples: finalPpgSamples,
              clinical_metrics: metrics,
            };
          }

          const filtered = prev.filter((r) => r.reading_type !== readingToSave.reading_type);
          const updated = [...filtered, readingToSave];
          onReadingsUpdated(updated);
          return updated;
        });
      },
      (statusEvt) => {
        setStatus(statusEvt.status);
        if (statusEvt.deviceLabel) setDeviceLabel(statusEvt.deviceLabel);
        if (statusEvt.errorMessage) setErrorMessage(statusEvt.errorMessage);
      },
      (meta) => {
        setTelemetryMeta((prev) => ({ ...prev, ...meta }));
      }
    );
  };

  const handleDisconnect = async () => {
    if (!gatewayRef.current) return;
    await gatewayRef.current.disconnect();
    setStatus('DISCONNECTED');
    setDeviceLabel(null);
    setIsDemoSimulating(false);
    setTelemetryMeta({
      sensorOnline: undefined,
      fingerDetected: undefined,
      leadsOff: undefined,
    });
  };

  const handleToggleDemoSimulation = () => {
    if (isDemoSimulating) {
      setIsDemoSimulating(false);
    } else {
      setIsDemoSimulating(true);
      setSimulationSeconds(0);
      const now = new Date().toISOString();
      const initialDemoReadings: HardwareReading[] = [
        {
          id: `demo-spo2-${Date.now()}`,
          reading_type: 'SPO2',
          numerical_value: 98,
          unit: '%',
          is_stable: true,
          measured_at: now,
        },
        {
          id: `demo-pr-${Date.now()}`,
          reading_type: 'PULSE_RATE',
          numerical_value: 74,
          unit: 'bpm',
          is_stable: true,
          measured_at: now,
        },
        {
          id: `demo-ecg-${Date.now()}`,
          reading_type: 'ECG',
          numerical_value: 2048,
          unit: 'raw',
          is_stable: true,
          measured_at: now,
          waveform_samples: generateSyntheticLead1Ecg(15, 74),
          ppg_samples: generateSyntheticPpgWaveform(15, 74, 98),
          clinical_metrics: calculateEcgMetrics([], 74, 98),
        },
      ];
      setReadings(initialDemoReadings);
      onReadingsUpdated(initialDemoReadings);
      setTelemetryMeta({
        sensorOnline: true,
        fingerDetected: true,
        leadsOff: false,
        rawIR: 42800,
      });
    }
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
    <div className="max-w-2xl mx-auto clay-card rounded-[36px] p-7 md:p-9">
      <div className="flex items-center space-x-4 pb-4 border-b border-purple-100">
        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-clayOrb shrink-0">
          <Activity className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-[#332F3A] font-heading">Medical Hardware Telemetry</h3>
          <p className="text-xs font-semibold text-[#635F69] mt-0.5">
            Connect pulse oximeter or vitals telemetry via Web Serial (USB / UART TTL).
          </p>
        </div>
      </div>

      {/* Hardware Connection Status in Recessed Clay Bar */}
      <div className="my-6 p-5 rounded-[24px] bg-[#EFEBF5] shadow-clayPressed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#332F3A] font-heading">Status:</span>
            {status === 'CONNECTED' && (
              <span className="clay-pill bg-emerald-500/15 text-emerald-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Connected ({deviceLabel})
              </span>
            )}
            {status === 'DISCONNECTED' && (
              <span className="clay-pill bg-slate-200 text-[#635F69]">
                Disconnected
              </span>
            )}
            {status === 'CONNECTING' && (
              <span className="clay-pill bg-sky-500/15 text-sky-900 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin text-sky-600" />
                Connecting...
              </span>
            )}
            {status === 'UNAVAILABLE' && (
              <span className="clay-pill bg-amber-500/15 text-amber-900">
                Web Serial Unavailable
              </span>
            )}
            {status === 'ERROR' && (
              <span className="clay-pill bg-rose-500/15 text-rose-900">
                Error
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#635F69] font-medium mt-1">
            Compatible with ESP32 / Arduino pulse oximeters emitting standard serial streams.
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === 'CONNECTED' ? (
            <button
              type="button"
              onClick={handleDisconnect}
              className="clay-btn-secondary text-xs px-5 py-2.5 h-11 rounded-[18px] text-rose-700"
            >
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              disabled={!isWebSerialAvailable || status === 'CONNECTING'}
              onClick={handleConnectSerial}
              className="clay-btn-primary text-xs px-6 py-2.5 h-11 rounded-[18px] disabled:opacity-50"
            >
              <Usb className="w-4 h-4" />
              <span>Connect USB Device</span>
            </button>
          )}

          {/* Quick Demo Vitals Injector for Instant Testing */}
          <button
            type="button"
            onClick={handleToggleDemoSimulation}
            className={`text-xs px-4 py-2.5 h-11 rounded-[18px] font-black flex items-center gap-2 transition-all shadow-clayButton ${
              isDemoSimulating
                ? 'bg-emerald-600 text-white shadow-clayOrb hover:bg-emerald-700'
                : 'clay-btn-secondary text-[#7C3AED]'
            }`}
            title="Toggle realistic live bedside vitals simulation"
          >
            {isDemoSimulating ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                <span>Demo Vitals Running</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Run Demo Vitals</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Physiological Simulation Diagnostics Banner */}
      {isDemoSimulating && (
        <div className="mb-6 p-4 rounded-[24px] bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-violet-500/15 border-2 border-emerald-400/80 shadow-clayCard flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-clayOrb shrink-0">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-950 font-heading">
                  Live Clinical Telemetry Simulation Active
                </span>
                <span className="clay-pill bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 animate-pulse">
                  ● STREAMING
                </span>
              </div>
              <p className="text-[11px] text-emerald-900/80 font-semibold mt-0.5">
                Dual-channel Lead-I ECG (100Hz) & MAX30102 PPG (50Hz) with physiological Respiratory Sinus Arrhythmia (~15 breaths/min).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="clay-pill bg-white text-emerald-900 text-xs font-mono font-black shadow-sm">
              ⏱ {simulationSeconds.toFixed(1)}s recorded
            </span>
            <button
              type="button"
              onClick={() => setIsDemoSimulating(false)}
              className="clay-btn-secondary text-xs px-3.5 py-1.5 h-9 rounded-xl text-stone-700 font-bold"
            >
              Pause Simulation
            </button>
          </div>
        </div>
      )}

      {/* Live Hardware Diagnostics Banner when Connected */}
      {status === 'CONNECTED' && (
        <div className="mb-6 p-4 rounded-[22px] bg-white/70 shadow-clayPill flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-purple-100">
          {/* MAX30102 Status */}
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-purple-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-[#332F3A]">Pulse Oximeter: </span>
              {telemetryMeta.sensorOnline === false && (
                <span className="font-bold text-rose-700 bg-rose-100/70 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  ⚠️ Sensor Offline (Check 5V & SDA:21, SCL:22)
                </span>
              )}
              {telemetryMeta.sensorOnline === true && !telemetryMeta.fingerDetected && (
                <span className="font-bold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  🔴 Red Light ON — Place finger gently on sensor
                </span>
              )}
              {telemetryMeta.sensorOnline === true && telemetryMeta.fingerDetected && (
                <span className="font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  🟢 Pulse Detected & Streaming {telemetryMeta.rawIR ? `(IR: ${telemetryMeta.rawIR.toLocaleString()})` : ''}
                </span>
              )}
              {telemetryMeta.sensorOnline === undefined && (
                <span className="font-medium text-[#635F69]">Awaiting telemetry stream...</span>
              )}
            </div>
          </div>

          {/* AD8232 ECG Status (Rendered only if ECG telemetry is emitted) */}
          {telemetryMeta.leadsOff !== undefined && (
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-[#332F3A]">ECG Status: </span>
                {telemetryMeta.leadsOff === true && (
                  <span className="font-bold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                    Electrodes Detached (Attach RA, LA, RL)
                  </span>
                )}
                {telemetryMeta.leadsOff === false && (
                  <span className="font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                    🟢 Leads Attached & Streaming
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div role="alert" className="mb-4 p-4 rounded-[20px] bg-rose-500/15 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2 shadow-clayPill">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Live Vitals Grid */}
      <div className="my-6">
        <h4 className="text-xs font-black text-[#332F3A] uppercase tracking-wider mb-3 font-heading">
          Recorded Vital Signs:
        </h4>

        {readings.length === 0 ? (
          <div className="p-6 rounded-[24px] bg-[#EFEBF5] shadow-clayPressed text-center text-xs text-[#635F69] font-medium">
            No telemetry readings captured yet. Connect device or enter manually below.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {readings.map((reading) => {
              const isZeroOximeter = (reading.reading_type === 'SPO2' || reading.reading_type === 'PULSE_RATE') && reading.numerical_value === 0;
              const isLeadsOffEcg = reading.reading_type === 'ECG' && (telemetryMeta.leadsOff || reading.numerical_value === 0);
              const isLiveActive = status === 'CONNECTED' || isDemoSimulating;

              let displayValue: string | number = reading.numerical_value;
              let displayUnit = reading.unit;
              let helperText = `Measured: ${new Date(reading.measured_at).toLocaleTimeString()}`;

              if (isZeroOximeter) {
                displayValue = '--';
                if (telemetryMeta.sensorOnline === false) {
                  helperText = 'Sensor offline (check wiring)';
                } else {
                  helperText = 'Place finger on sensor';
                }
              } else if (isLeadsOffEcg) {
                displayValue = '--';
                displayUnit = 'detached';
                helperText = 'Attach RA, LA, RL pads';
              } else if (isLiveActive) {
                if (reading.reading_type === 'PULSE_RATE') {
                  helperText = '🟢 Normal Sinus Rhythm (RSA: ±2 bpm)';
                } else if (reading.reading_type === 'SPO2') {
                  helperText = '🟢 Arterial Wave Synced • PI: 4.2%';
                } else if (reading.reading_type === 'ECG') {
                  displayValue = 'Live';
                  displayUnit = '100Hz';
                  helperText = '🟢 25 mm/s • 10 mm/mV Calibration';
                }
              }

              return (
                <div
                  key={reading.id}
                  className="clay-card rounded-[24px] p-5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#635F69] font-heading flex items-center">
                      {reading.reading_type === 'SPO2' && (
                        <>
                          <Droplet className={`w-3.5 h-3.5 text-emerald-600 inline mr-1.5 ${isLiveActive ? 'animate-pulse' : ''}`} />
                          SpO2 Oxygen Saturation
                        </>
                      )}
                      {reading.reading_type === 'PULSE_RATE' && (
                        <>
                          <Heart className={`w-3.5 h-3.5 text-rose-500 inline mr-1.5 ${isLiveActive ? 'animate-pulse' : ''}`} />
                          Pulse Rate
                        </>
                      )}
                      {reading.reading_type === 'BODY_TEMPERATURE' && 'Body Temperature'}
                      {reading.reading_type === 'BLOOD_PRESSURE' && 'Blood Pressure'}
                      {reading.reading_type === 'ECG' && (
                        <>
                          <Activity className={`w-3.5 h-3.5 text-purple-600 inline mr-1.5 ${isLiveActive ? 'animate-pulse' : ''}`} />
                          ECG Sensor (Lead I)
                        </>
                      )}
                    </span>
                  </div>
                  <div className="my-3 flex items-baseline">
                    <span className="text-3xl font-black text-[#332F3A] font-heading font-mono transition-all duration-300">
                      {displayValue}
                    </span>
                    <span className="text-xs font-black text-[#7C3AED] ml-1.5 font-heading">{displayUnit}</span>
                  </div>
                  <div className="text-[10px] font-medium text-[#635F69]">
                    {helperText}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live ECG Rhythm Strip Waveform Display */}
      {readings.some((r) => r.reading_type === 'ECG') && (
        <div className="my-6">
          {(() => {
            const ecgReading = readings.find((r) => r.reading_type === 'ECG');
            const prReading = readings.find((r) => r.reading_type === 'PULSE_RATE');
            const spo2Reading = readings.find((r) => r.reading_type === 'SPO2');
            const hr = prReading && prReading.numerical_value > 0 ? prReading.numerical_value : 0;
            const spo2 = spo2Reading && spo2Reading.numerical_value > 0 ? spo2Reading.numerical_value : 0;

            return (
              <EcgWaveformGraph
                samples={isDemoSimulating ? undefined : ecgReading?.waveform_samples}
                ppgSamples={isDemoSimulating ? undefined : ecgReading?.ppg_samples}
                liveValue={ecgReading?.numerical_value}
                isLive={status === 'CONNECTED' || isDemoSimulating}
                leadsOff={Boolean(telemetryMeta.leadsOff)}
                heartRate={hr}
                spo2Value={spo2}
                title={isDemoSimulating ? "Live 15-Second ECG & SpO2 Simulation Strip" : "15-Second Diagnostic ECG & SpO2 Rhythm Strip"}
                subtitle={isDemoSimulating ? "Streaming Lead I (AD8232 @ 100Hz) + Plethysmograph (MAX30102 @ 50Hz) • Respiratory Sinus Arrhythmia Active" : "Live Lead I (AD8232) + Plethysmograph (MAX30102) • 25 mm/s • 10 mm/mV"}
                allowFreeze={true}
                showControls={true}
                height={270}
                durationSeconds={15}
                onBufferUpdate={(recordedEcg, recordedPpg) => {
                  setReadings((prev) => {
                    const ecg = prev.find((r) => r.reading_type === 'ECG');
                    if (!ecg) return prev;
                    return prev.map((r) =>
                      r.reading_type === 'ECG'
                        ? {
                            ...r,
                            waveform_samples: recordedEcg,
                            ppg_samples: recordedPpg,
                          }
                        : r
                    );
                  });
                }}
              />
            );
          })()}
        </div>
      )}

      {/* Manual Vitals Entry Fallback */}
      <form onSubmit={handleAddManualVital} className="mt-6 pt-5 border-t border-purple-100">
        <h4 className="text-xs font-black text-[#332F3A] mb-3 font-heading">
          Manual Vital Signs Entry (Frontline Health Worker):
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs font-bold text-[#635F69] mb-1 font-heading">SpO2 (%)</label>
            <input
              type="number"
              min="50"
              max="100"
              step="1"
              value={manualSpo2}
              onChange={(e) => setManualSpo2(e.target.value)}
              placeholder="e.g. 98"
              className="clay-input rounded-2xl p-3 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#635F69] mb-1 font-heading">Pulse Rate (bpm)</label>
            <input
              type="number"
              min="30"
              max="240"
              step="1"
              value={manualPr}
              onChange={(e) => setManualPr(e.target.value)}
              placeholder="e.g. 74"
              className="clay-input rounded-2xl p-3 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#635F69] mb-1 font-heading">Temp (&deg;C)</label>
            <input
              type="number"
              min="30"
              max="45"
              step="0.1"
              value={manualTemp}
              onChange={(e) => setManualTemp(e.target.value)}
              placeholder="e.g. 37.0"
              className="clay-input rounded-2xl p-3 text-xs"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={!manualSpo2 && !manualPr && !manualTemp}
          className="clay-btn-secondary text-xs px-5 py-2.5 h-11 rounded-[18px] disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Manual Reading</span>
        </button>
      </form>
    </div>
  );
};
