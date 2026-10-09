// JANSAATHI AI - High-Fidelity Claymorphism Patient Interactive AI Follow-up Step
// Asks clinical clarifying questions before final submission based on missing gaps.
// Supports Voice Audio (TTS) output, Text typing, and Voice Speech-to-Text input in Hindi, English, and Odia.

import React, { useState, useEffect, useRef } from 'react';
import { ClinicalFollowUpQuestion } from '../../services/ai/FollowUpQuestionEngine';
import { BrowserWebSpeechProvider } from '../../services/speech/BrowserWebSpeechProvider';
import { LanguageRegistry } from '../../services/speech/LanguageRegistry';
import {
  Volume2,
  VolumeX,
  Mic,
  Square,
  Sparkles,
  ArrowRight,
  SkipForward,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface PatientFollowUpStepProps {
  questions: ClinicalFollowUpQuestion[];
  language: string;
  onComplete: (answers: { question: string; answer: string }[]) => void;
  onSkip: () => void;
}

export const PatientFollowUpStep: React.FC<PatientFollowUpStepProps> = ({
  questions,
  language,
  onComplete,
  onSkip,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [speakingQuestionId, setSpeakingQuestionId] = useState<string | null>(null);
  const [recordingQuestionId, setRecordingQuestionId] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const speechProviderRef = useRef<BrowserWebSpeechProvider | null>(null);

  useEffect(() => {
    speechProviderRef.current = new BrowserWebSpeechProvider();
    return () => {
      speechProviderRef.current?.cancelRecording();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-to-Speech (TTS) for asking the question in voice
  const handleSpeakQuestion = (q: ClinicalFollowUpQuestion) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (speakingQuestionId === q.id) {
      window.speechSynthesis.cancel();
      setSpeakingQuestionId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(q.question);

    const langMap: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      or: 'hi-IN',
      bn: 'bn-IN',
      te: 'te-IN',
    };
    utterance.lang = langMap[language] || 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => {
      setSpeakingQuestionId(null);
    };
    utterance.onerror = () => {
      setSpeakingQuestionId(null);
    };

    setSpeakingQuestionId(q.id);
    window.speechSynthesis.speak(utterance);
  };

  // Speech-to-Text (STT) for patient answering via Voice
  const handleStartVoiceReply = async (qId: string) => {
    if (!speechProviderRef.current) return;
    setRecordingError(null);

    // Stop TTS if speaking
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingQuestionId(null);
    }

    try {
      setRecordingQuestionId(qId);
      await speechProviderRef.current.startRecording(
        language,
        (evt) => {
          setAnswers((prev) => ({
            ...prev,
            [qId]: evt.transcript,
          }));
        },
        (statusEvt) => {
          if (statusEvt.status === 'ERROR') {
            setRecordingError(statusEvt.errorDetails || 'Voice recognition error.');
            setRecordingQuestionId(null);
          }
        }
      );
    } catch (err: any) {
      setRecordingError(err.message || 'Unable to access microphone.');
      setRecordingQuestionId(null);
    }
  };

  const handleStopVoiceReply = async () => {
    if (!speechProviderRef.current) return;
    try {
      const result = await speechProviderRef.current.stopRecording();
      if (recordingQuestionId && result.finalTranscript) {
        setAnswers((prev) => ({
          ...prev,
          [recordingQuestionId]: result.finalTranscript,
        }));
      }
    } catch (err: any) {
      setRecordingError('Failed to complete voice recording.');
    } finally {
      setRecordingQuestionId(null);
    }
  };

  const handleSelectQuickOption = (qId: string, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: option,
    }));
  };

  const handleTextChange = (qId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: text,
    }));
  };

  const handleProceed = () => {
    const answeredList: { question: string; answer: string }[] = [];
    questions.forEach((q) => {
      const ans = answers[q.id]?.trim();
      if (ans) {
        answeredList.push({ question: q.question, answer: ans });
      }
    });

    onComplete(answeredList);
  };

  const answeredCount = Object.values(answers).filter((a) => a && a.trim().length > 0).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="clay-card rounded-[36px] p-7 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-clayOrb">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#332F3A] font-heading">
                {language === 'hi'
                  ? 'अतिरिक्त जानकारी (Follow-up Questions)'
                  : language === 'or'
                  ? 'ଅତିରିକ୍ତ ପ୍ରଶ୍ନ (Follow-up Questions)'
                  : 'AI Triage Follow-Up Clarification'}
              </h2>
              <p className="text-xs font-semibold text-[#635F69] mt-1 font-medium">
                {language === 'hi'
                  ? 'डॉक्टर के बेहतर अवलोकन के लिए कृपया इन महत्वपूर्ण सवालों के उत्तर बोलकर या लिखकर दें।'
                  : language === 'or'
                  ? 'ଡାକ୍ତରଙ୍କ ସଠିକ୍ ପରୀକ୍ଷା ପାଇଁ ଦୟାକରି ଏହି ପ୍ରଶ୍ନଗୁଡ଼ିକର ଉତ୍ତର ଦିଅନ୍ତୁ।'
                  : 'The AI noted clinical gaps in your statement. Answering these helps the doctor better understand your case.'}
              </p>
            </div>
          </div>

          <span className="clay-pill bg-purple-500/15 text-[#7C3AED] text-xs font-black shrink-0 font-heading">
            {answeredCount} of {questions.length} Answered
          </span>
        </div>

        {recordingError && (
          <div role="alert" className="mt-4 p-4 rounded-[20px] bg-rose-500/15 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2 shadow-clayPill">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{recordingError}</span>
          </div>
        )}
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {questions.map((q, index) => {
          const isRecordingThis = recordingQuestionId === q.id;
          const isSpeakingThis = speakingQuestionId === q.id;
          const currentAnswer = answers[q.id] || '';

          return (
            <div
              key={q.id}
              className={`clay-card rounded-[32px] p-6 sm:p-7 transition-all ${
                currentAnswer ? 'border-2 border-purple-300 bg-white/90' : 'bg-white/80'
              }`}
            >
              {/* Question Header & Audio Speaker */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-clayOrb font-heading">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-black text-[#332F3A] leading-snug font-heading">{q.question}</h3>
                    <span className="text-[10px] uppercase font-black text-[#7C3AED] tracking-wider font-heading">
                      {q.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Voice Speaker (TTS) Button */}
                <button
                  type="button"
                  onClick={() => handleSpeakQuestion(q)}
                  title="Listen to question in voice"
                  className={`clay-pill px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer select-none ${
                    isSpeakingThis
                      ? 'bg-amber-500/20 text-amber-900 animate-pulse border border-amber-300'
                      : 'bg-white text-[#332F3A] hover:bg-violet-50'
                  }`}
                >
                  {isSpeakingThis ? <VolumeX className="w-4 h-4 text-amber-700" /> : <Volume2 className="w-4 h-4 text-[#7C3AED]" />}
                  <span className="hidden sm:inline font-heading">{isSpeakingThis ? 'Stop Voice' : 'Listen'}</span>
                </button>
              </div>

              {/* Quick Answer Options Pills */}
              {q.quickOptions && q.quickOptions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {q.quickOptions.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectQuickOption(q.id, opt)}
                      className={`clay-pill px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer select-none ${
                        currentAnswer === opt
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-clayButton'
                          : 'bg-white/90 text-[#332F3A] hover:bg-violet-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Answer Input Area: Recessed Text or Voice */}
              <div className="relative">
                <input
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => handleTextChange(q.id, e.target.value)}
                  placeholder={q.placeholder || 'Type or speak your answer...'}
                  className="clay-input rounded-[22px] pl-4 pr-28 py-3 text-sm"
                />

                {/* Voice Input Button (STT) */}
                <div className="absolute right-2 top-2 flex items-center gap-1.5">
                  {isRecordingThis ? (
                    <button
                      type="button"
                      onClick={handleStopVoiceReply}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold flex items-center gap-1 animate-pulse cursor-pointer shadow-xs"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartVoiceReply(q.id)}
                      title="Speak answer using microphone"
                      className="clay-pill bg-white text-[#7C3AED] hover:bg-violet-50 text-xs px-3 py-1 font-bold cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5 text-[#7C3AED]" />
                      <span className="hidden sm:inline">Speak</span>
                    </button>
                  )}
                </div>
              </div>

              {isRecordingThis && (
                <div className="mt-2 text-xs text-rose-600 font-bold flex items-center gap-1.5 animate-pulse font-heading">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>Listening... Speak your answer in {language.toUpperCase()} now.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Footer Buttons */}
      <div className="clay-card-static rounded-[28px] p-5 bg-white/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onSkip}
          className="clay-btn-secondary w-full sm:w-auto text-xs px-6 py-3.5 h-13"
        >
          <SkipForward className="w-4 h-4 text-[#635F69]" />
          <span>Skip & Proceed to Summary</span>
        </button>

        <button
          type="button"
          onClick={handleProceed}
          className="clay-btn-primary w-full sm:w-auto text-xs px-8 py-3.5 h-13"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save Answers & Review Triage Summary</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
