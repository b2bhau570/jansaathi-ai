// JANSAATHI AI - SpeechProvider Interface
// Pluggable architecture for browser Web Speech API or external server STT

export interface SpeechTranscriptEvent {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export interface SpeechStatusEvent {
  status: 'IDLE' | 'LISTENING' | 'PROCESSING' | 'TRANSCRIBED' | 'ERROR';
  errorDetails?: string;
}

export interface ISpeechProvider {
  name: string;
  isAvailable(): boolean;
  getSupportedLanguages(): string[];
  startRecording(
    languageCode: string,
    onTranscript: (event: SpeechTranscriptEvent) => void,
    onStatusChange: (event: SpeechStatusEvent) => void
  ): Promise<void>;
  stopRecording(): Promise<{ finalTranscript: string; audioBlob?: Blob }>;
  cancelRecording(): void;
}
