// JANSAATHI AI - Real Voice Recording & Transcription Panel
// Uses browser-native Web Speech API with honest capability detection and manual editing

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { BrowserWebSpeechProvider } from '../../services/speech/BrowserWebSpeechProvider';
import { LanguageRegistry } from '../../services/speech/LanguageRegistry';
import { Mic, Square, AlertCircle, RotateCcw, Check, Volume2, Edit3 } from 'lucide-react';

interface VoiceRecorderPanelProps {
  onTranscriptReady: (transcript: string) => void;
  initialTranscript?: string;
}

export const VoiceRecorderPanel: React.FC<VoiceRecorderPanelProps> = ({
  onTranscriptReady,
  initialTranscript = '',
}) => {
  const { currentLanguage, languageInfo } = useLanguage();
  const [status, setStatus] = useState<'IDLE' | 'LISTENING' | 'PROCESSING' | 'TRANSCRIBED' | 'ERROR'>('IDLE');
  const [transcript, setTranscript] = useState(initialTranscript);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const speechProviderRef = useRef<BrowserWebSpeechProvider | null>(null);

  // Check language capability
  const isSpeechSupported = LanguageRegistry.isSpeechSupported(currentLanguage);
  const speechNotice = LanguageRegistry.getSpeechNotice(currentLanguage);

  useEffect(() => {
    speechProviderRef.current = new BrowserWebSpeechProvider();
    return () => {
      speechProviderRef.current?.cancelRecording();
    };
  }, []);

  const handleStartRecording = async () => {
    if (!speechProviderRef.current) return;
    setErrorMessage(null);

    try {
      await speechProviderRef.current.startRecording(
        currentLanguage,
        (evt) => {
          setTranscript(evt.transcript);
        },
        (statusEvt) => {
          setStatus(statusEvt.status);
          if (statusEvt.status === 'ERROR') {
            setErrorMessage(statusEvt.errorDetails || 'Speech recognition encountered an issue.');
          }
        }
      );
    } catch (err: any) {
      setStatus('ERROR');
      setErrorMessage(err.message || 'Unable to access microphone or start speech service.');
    }
  };

  const handleStopRecording = async () => {
    if (!speechProviderRef.current) return;
    const result = await speechProviderRef.current.stopRecording();
    setStatus('TRANSCRIBED');
    if (result.finalTranscript) {
      setTranscript(result.finalTranscript);
      onTranscriptReady(result.finalTranscript);
    }
  };

  const handleReset = () => {
    speechProviderRef.current?.cancelRecording();
    setStatus('IDLE');
    setTranscript('');
    setErrorMessage(null);
  };

  const handleConfirmEdit = () => {
    onTranscriptReady(transcript);
  };

  if (!isSpeechSupported || speechNotice) {
    return (
      <div className="bg-amber-50 border border-amber-300 rounded p-6 text-center max-w-xl mx-auto my-4">
        <AlertCircle className="w-8 h-8 text-amber-700 mx-auto mb-2" />
        <h3 className="font-bold text-amber-950 text-sm">Speech Input Unavailable</h3>
        <p className="text-xs text-amber-900 mt-1 mb-4 leading-relaxed">
          {speechNotice || `Voice recognition is not currently supported for ${languageInfo.name} in this browser environment.`}
        </p>
        <p className="text-xs text-slate-700 font-medium">
          Please switch to <strong>Text Input</strong> to enter symptoms.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded border border-slate-300 p-6 shadow-xs">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-slate-900">Patient Voice Dictation</h3>
        <p className="text-xs text-slate-600 mt-1">
          Recording in: <strong>{languageInfo.name} ({languageInfo.nativeName})</strong>. Speak clearly into the microphone.
        </p>
      </div>

      {/* Mic Status Visualizer */}
      <div className="flex flex-col items-center justify-center my-6">
        {status === 'IDLE' && (
          <button
            type="button"
            onClick={handleStartRecording}
            className="w-20 h-20 rounded-full bg-teal-800 hover:bg-teal-700 text-white flex flex-col items-center justify-center shadow-md transition-transform hover:scale-105"
            aria-label="Start recording microphone"
          >
            <Mic className="w-8 h-8 mb-1" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Start</span>
          </button>
        )}

        {status === 'LISTENING' && (
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={handleStopRecording}
              className="w-20 h-20 rounded-full bg-red-700 hover:bg-red-800 text-white flex flex-col items-center justify-center shadow-lg animate-pulse"
              aria-label="Stop recording microphone"
            >
              <Square className="w-7 h-7 mb-1" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Stop</span>
            </button>
            <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-red-700">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              <span>Listening to speech in real time...</span>
            </div>
          </div>
        )}

        {status === 'PROCESSING' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-slate-400 flex items-center justify-center animate-spin">
              <Volume2 className="w-7 h-7 text-slate-700" />
            </div>
            <span className="text-xs font-medium text-slate-700 mt-3">Converting speech to text...</span>
          </div>
        )}

        {status === 'ERROR' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-100 border border-red-300 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-700" />
            </div>
            <span className="text-xs font-semibold text-red-700 mt-2">Recording Error</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-300 text-red-900 rounded text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Real Live Transcription Output */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="voice-transcript" className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            Transcribed Text (Patient can review and correct):
          </label>
          {transcript && (
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        <textarea
          id="voice-transcript"
          rows={5}
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            onTranscriptReady(e.target.value);
          }}
          placeholder="Transcription will appear here as you speak. You can edit or type corrections directly..."
          className="w-full p-3 border border-slate-300 rounded text-sm text-slate-900 leading-relaxed focus:ring-1 focus:ring-teal-700 focus:outline-hidden bg-slate-50"
        />

        {transcript && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleConfirmEdit}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-800 hover:bg-teal-700 text-white rounded text-xs font-semibold"
            >
              <Check className="w-3.5 h-3.5" />
              Save Dictation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
