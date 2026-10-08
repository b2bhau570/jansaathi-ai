// JANSAATHI AI - Patient Language Selector
// Displays capability registry for all 13 Indian languages without false claims

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageCapability } from '../../types';
import { Globe, Mic, MicOff, FileText, Check } from 'lucide-react';

interface LanguageSelectorModalProps {
  onLanguageSelected: (code: string) => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({ onLanguageSelected }) => {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();

  const handleSelect = (code: string) => {
    setLanguage(code);
    onLanguageSelected(code);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded border border-slate-300 p-6 shadow-xs">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
        <div className="w-10 h-10 rounded bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0">
          <Globe className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Select Communication Language</h2>
          <p className="text-xs text-slate-600">Choose the language you are most comfortable speaking or typing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-6">
        {availableLanguages.map((lang: LanguageCapability) => {
          const isSelected = currentLanguage === lang.code;

          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              className={`text-left p-3.5 rounded border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-teal-700 bg-teal-50/70 ring-1 ring-teal-700'
                  : 'border-slate-200 hover:border-slate-400 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{lang.name}</div>
                  <div className="text-xs text-slate-600 font-medium">{lang.nativeName}</div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />}
              </div>

              {/* Capabilities Breakdown */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2 text-[10px]">
                <span className="inline-flex items-center gap-1 text-slate-600">
                  <FileText className="w-3 h-3 text-slate-500" />
                  Text
                </span>

                {lang.speechInput && lang.browserSpeechRecognitionCode ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <Mic className="w-3 h-3 text-emerald-600" />
                    Voice
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <MicOff className="w-3 h-3 text-slate-400" />
                    Text only
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
