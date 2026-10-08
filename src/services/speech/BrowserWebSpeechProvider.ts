// JANSAATHI AI - Browser Native Speech Recognition Provider
// Leverages browser Web Speech API & MediaRecorder without paid cloud infrastructure

import { ISpeechProvider, SpeechStatusEvent, SpeechTranscriptEvent } from './SpeechProvider';
import { LanguageRegistry } from './LanguageRegistry';

// Extend window for WebKit SpeechRecognition types
interface IWindowSpeechRecognition extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class BrowserWebSpeechProvider implements ISpeechProvider {
  public readonly name = 'Browser Web Speech API';
  private recognition: any = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private accumulatedTranscript = '';
  private isListeningActive = false;

  public isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as IWindowSpeechRecognition;
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  public getSupportedLanguages(): string[] {
    return LanguageRegistry.getLanguages()
      .filter((l) => l.speechInput && Boolean(l.browserSpeechRecognitionCode))
      .map((l) => l.code);
  }

  public async startRecording(
    languageCode: string,
    onTranscript: (event: SpeechTranscriptEvent) => void,
    onStatusChange: (event: SpeechStatusEvent) => void
  ): Promise<void> {
    const win = window as IWindowSpeechRecognition;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      onStatusChange({
        status: 'ERROR',
        errorDetails: 'Speech Recognition API is not supported in this browser. Please use Chrome or text input.',
      });
      throw new Error('Web Speech API not available');
    }

    const langConfig = LanguageRegistry.getByCode(languageCode);
    const recognitionLang = langConfig.browserSpeechRecognitionCode || 'en-IN';

    this.accumulatedTranscript = '';
    this.recordedChunks = [];
    this.isListeningActive = true;

    // 1. Optional MediaRecorder for raw audio capture if microphone permission allows
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            this.recordedChunks.push(e.data);
          }
        };
        this.mediaRecorder.start(250);
      }
    } catch {
      // If mic stream capture fails or is blocked, SpeechRecognition can still attempt to run
    }

    // 2. Initialize Speech Recognition instance
    this.recognition = new SpeechRecognitionClass();
    this.recognition.lang = recognitionLang;
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      onStatusChange({ status: 'LISTENING' });
    };

    this.recognition.onresult = (event: any) => {
      onStatusChange({ status: 'PROCESSING' });

      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence || 0.85;

        if (event.results[i].isFinal) {
          this.accumulatedTranscript += (this.accumulatedTranscript ? ' ' : '') + transcriptPart.trim();
          onTranscript({
            transcript: this.accumulatedTranscript,
            isFinal: true,
            confidence,
          });
        } else {
          interim += transcriptPart;
          onTranscript({
            transcript: (this.accumulatedTranscript + ' ' + interim).trim(),
            isFinal: false,
            confidence: 0.7,
          });
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      let message = 'Microphone or speech processing error occurred.';
      if (event.error === 'not-allowed') {
        message = 'Microphone permission denied. Please allow microphone access in your browser settings.';
      } else if (event.error === 'no-speech') {
        message = 'No speech detected. Please speak clearly into the microphone.';
      } else if (event.error === 'network') {
        message = 'Speech recognition network error. Please verify your internet connection or use text input.';
      } else if (event.error === 'language-not-supported') {
        message = `Speech recognition model for ${langConfig.name} is not installed in this browser. Please use text input.`;
      }

      onStatusChange({
        status: 'ERROR',
        errorDetails: message,
      });
      this.isListeningActive = false;
    };

    this.recognition.onend = () => {
      if (this.isListeningActive) {
        onStatusChange({ status: 'TRANSCRIBED' });
        this.isListeningActive = false;
      }
    };

    try {
      this.recognition.start();
    } catch (err: any) {
      onStatusChange({
        status: 'ERROR',
        errorDetails: err?.message || 'Unable to start speech recognition.',
      });
      this.isListeningActive = false;
    }
  }

  public async stopRecording(): Promise<{ finalTranscript: string; audioBlob?: Blob }> {
    this.isListeningActive = false;

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Safe ignore on already stopped
      }
      this.recognition = null;
    }

    let audioBlob: Blob | undefined;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
        if (this.recordedChunks.length > 0) {
          audioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        }
        this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      } catch {
        // Safe ignore
      }
      this.mediaRecorder = null;
    }

    return {
      finalTranscript: this.accumulatedTranscript.trim(),
      audioBlob,
    };
  }

  public cancelRecording(): void {
    this.isListeningActive = false;
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // Safe ignore
      }
      this.recognition = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
        this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      } catch {
        // Safe ignore
      }
      this.mediaRecorder = null;
    }
    this.recordedChunks = [];
    this.accumulatedTranscript = '';
  }
}
