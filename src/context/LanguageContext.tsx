// JANSAATHI AI - Language Context
// Manages global interface language and provides typed dictionary lookups

import React, { createContext, useContext, useState } from 'react';
import { TRANSLATIONS, TranslationDictionary } from '../i18n/translations';
import { LanguageRegistry } from '../services/speech/LanguageRegistry';
import { LanguageCapability } from '../types';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (code: string) => void;
  t: TranslationDictionary;
  languageInfo: LanguageCapability;
  availableLanguages: LanguageCapability[];
  speechNotice: string | null;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');

  const setLanguage = (code: string) => {
    setCurrentLanguage(code);
  };

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS['en'];
  const languageInfo = LanguageRegistry.getByCode(currentLanguage);
  const availableLanguages = LanguageRegistry.getLanguages();
  const speechNotice = LanguageRegistry.getSpeechNotice(currentLanguage);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        languageInfo,
        availableLanguages,
        speechNotice,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
