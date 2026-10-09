// JANSAATHI AI - High-Fidelity Claymorphism Voice Recording & Transcription Panel
// Tactile microphone orb, zero-gravity breathing visualizer, and recessed transcription box

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
      <div className="clay-card rounded-[32px] border-amber-300/80 bg-amber-500/10 p-7 text-center max-w-xl mx-auto my-4 shadow-clayPill">
        <AlertCircle className="w-10 h-10 text-amber-700 mx-auto mb-2" />
        <h3 className="font-black text-amber-950 text-base font-heading">Speech Input Unavailable</h3>
        <p className="text-xs text-amber-900 mt-1 mb-4 leading-relaxed font-medium">
          {speechNotice || `Voice recognition is not currently supported for ${languageInfo.name} in this browser environment.`}
        </p>
        <p className="text-xs text-[#332F3A] font-bold">
          Please switch to <strong>Type (Text)</strong> tab to enter symptoms.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto clay-card rounded-[36px] p-7 md:p-9">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-black text-[#332F3A] font-heading">Patient Voice Dictation</h3>
        <p className="text-xs font-semibold text-[#635F69] mt-1">
          Recording in: <strong className="text-[#7C3AED]">{languageInfo.name} ({languageInfo.nativeName})</strong>. Speak clearly into the microphone.
        </p>
      </div>

      {/* Mic Status Visualizer Orb */}
      <div className="flex flex-col items-center justify-center my-7">
        {status === 'IDLE' && (
          <button
            type="button"
            onClick={handleStartRecording}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-[#A78BFA] via-[#7C3AED] to-[#DB2777] text-white flex flex-col items-center justify-center shadow-clayOrb hover:-translate-y-1 active:scale-[0.90] cursor-pointer transition-all duration-200"
            aria-label="Start recording microphone"
          >
            <Mic className="w-9 h-9 mb-1 drop-shadow-sm" />
            <span className="text-[10px] font-black uppercase tracking-wider font-heading">Start</span>
          </button>
        )}

        {status === 'LISTENING' && (
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={handleStopRecording}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-white flex flex-col items-center justify-center shadow-clayOrb animate-pulse hover:-translate-y-1 active:scale-[0.90] cursor-pointer transition-all duration-200"
              aria-label="Stop recording microphone"
            >
              <Square className="w-8 h-8 mb-1" />
              <span className="text-[10px] font-black uppercase tracking-wider font-heading">Stop</span>
            </button>
            <div className="flex items-center gap-2 mt-4 text-xs font-bold text-rose-600 font-heading">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>Listening to speech in real time...</span>
            </div>
          </div>
        )}

        {status === 'PROCESSING' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white flex items-center justify-center shadow-clayOrb animate-spin">
              <Volume2 className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold text-[#635F69] mt-3 font-heading">Converting speech to text...</span>
          </div>
        )}

        {status === 'ERROR' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 shadow-clayPill">
              <AlertCircle className="w-9 h-9" />
            </div>
            <span className="text-xs font-bold text-rose-700 mt-2 font-heading">Recording Error</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div role="alert" className="mb-4 p-4 rounded-[20px] bg-rose-500/15 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2 shadow-clayPill">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Real Live Transcription Output */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <label htmlFor="voice-transcript" className="text-xs font-bold text-[#332F3A] flex items-center gap-1.5 font-heading">
            <Edit3 className="w-3.5 h-3.5 text-[#7C3AED]" />
            Transcribed Text (Patient can review and correct):
          </label>
          {transcript && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold text-[#635F69] hover:text-[#332F3A] flex items-center gap-1 cursor-pointer transition-colors"
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
          className="clay-input rounded-[24px] p-5 leading-relaxed resize-none"
        />

        {transcript && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleConfirmEdit}
              className="clay-btn-primary text-xs px-6 py-3 min-h-[44px] rounded-[18px]"
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
