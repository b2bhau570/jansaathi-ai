// JANSAATHI AI - Language Capability Registry
// Ground truth registry for Indian languages. Honest capability representation without false claims.

import { LanguageCapability } from '../../types';

export const SUPPORTED_LANGUAGES: LanguageCapability[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English (India)',
    textInput: true,
    speechInput: true,
    speechOutput: true,
    translation: true,
    uiSupported: true,
    browserSpeechRecognitionCode: 'en-IN',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    textInput: true,
    speechInput: true, // Supported in Chrome / Chromium on desktop/Android
    speechOutput: true,
    translation: true,
    uiSupported: true,
    browserSpeechRecognitionCode: 'hi-IN',
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    textInput: true,
    speechInput: false, // Honest: Standard browser Web Speech API does NOT reliably support Odia speech recognition
    speechOutput: false,
    translation: true,
    uiSupported: true,
    browserSpeechRecognitionCode: undefined,
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    textInput: true,
    speechInput: true,
    speechOutput: true,
    translation: true,
    uiSupported: true,
    browserSpeechRecognitionCode: 'bn-IN',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    textInput: true,
    speechInput: true,
    speechOutput: true,
    translation: true,
    uiSupported: true,
    browserSpeechRecognitionCode: 'te-IN',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    textInput: true,
    speechInput: true,
    speechOutput: true,
    translation: true,
    uiSupported: true,
    browserSpeechRecognitionCode: 'ta-IN',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    textInput: true,
    speechInput: true,
    speechOutput: true,
    translation: true,
    uiSupported: true,
    browserSpeechRecognitionCode: 'kn-IN',
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    textInput: true,
    speechInput: true,
    speechOutput: true,
    translation: true,
    uiSupported: true,
    browserSpeechRecognitionCode: 'ml-IN',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    textInput: true,
    speechInput: true,
    speechOutput: true,
    translation: true,
    uiSupported: true,
    browserSpeechRecognitionCode: 'mr-IN',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    textInput: true,
    speechInput: true,
    speechOutput: true,
    translation: true,
    uiSupported: true,
    browserSpeechRecognitionCode: 'gu-IN',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    textInput: true,
    speechInput: false, // Web Speech API lacks dependable pa-IN voice model across browsers
    speechOutput: false,
    translation: true,
    uiSupported: true,
    browserSpeechRecognitionCode: 'pa-Guru-IN',
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    textInput: true,
    speechInput: false, // Web Speech API lacks native as-IN recognition in mainstream browsers
    speechOutput: false,
    translation: true,
    uiSupported: true,
    browserSpeechRecognitionCode: undefined,
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    textInput: true,
    speechInput: true,
    speechOutput: true,
    translation: true,
    uiSupported: true,
    browserSpeechRecognitionCode: 'ur-IN',
  },
];

export class LanguageRegistry {
  public static getLanguages(): LanguageCapability[] {
    return SUPPORTED_LANGUAGES;
  }

  public static getByCode(code: string): LanguageCapability {
    const found = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
    return found || SUPPORTED_LANGUAGES[0];
  }

  public static isSpeechSupported(code: string): boolean {
    const lang = this.getByCode(code);
    if (!lang.speechInput) return false;

    // Check browser runtime capability
    const hasSpeechRecognition =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    return Boolean(hasSpeechRecognition && lang.browserSpeechRecognitionCode);
  }

  public static getSpeechNotice(code: string): string | null {
    const lang = this.getByCode(code);
    if (!lang.speechInput || !lang.browserSpeechRecognitionCode) {
      return `Voice input is currently unavailable for ${lang.name} (${lang.nativeName}). You can continue using text input.`;
    }

    if (
      typeof window !== 'undefined' &&
      !('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    ) {
      return `Your browser does not support native speech recognition. Please use Google Chrome or switch to text input.`;
    }

    return null;
  }
}
