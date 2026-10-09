// JANSAATHI AI - High-Fidelity Claymorphism Language Selector
// Tactile clay language selection cards with zero sharp corners and honest capability indicators

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
    <div className="max-w-3xl mx-auto clay-card rounded-[36px] p-7 md:p-10">
      <div className="flex items-center space-x-4 pb-5 border-b border-purple-100">
        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white shadow-clayOrb shrink-0">
          <Globe className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#332F3A] font-heading">Select Communication Language</h2>
          <p className="text-xs font-semibold text-[#635F69] mt-0.5">Choose the language you are most comfortable speaking or typing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-7">
        {availableLanguages.map((lang: LanguageCapability) => {
          const isSelected = currentLanguage === lang.code;

          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              className={`text-left p-5 rounded-[24px] transition-all duration-200 flex flex-col justify-between cursor-pointer select-none ${
                isSelected
                  ? 'bg-gradient-to-br from-violet-50 to-purple-100/90 border-2 border-[#7C3AED] shadow-clayCard -translate-y-1'
                  : 'bg-white/80 border border-white hover:border-purple-200 shadow-clayPill hover:-translate-y-1 hover:bg-white'
              } active:scale-[0.92]`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-extrabold text-[#332F3A] text-base font-heading">{lang.name}</div>
                  <div className="text-xs text-[#635F69] font-bold">{lang.nativeName}</div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] flex items-center justify-center text-white shadow-clayOrb">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Capabilities Breakdown */}
              <div className="mt-4 pt-3 border-t border-purple-100/60 flex items-center gap-2.5 text-[11px] font-bold font-heading">
                <span className="inline-flex items-center gap-1 text-[#635F69]">
                  <FileText className="w-3.5 h-3.5 text-[#7C3AED]" />
                  Text
                </span>

                {lang.speechInput && lang.browserSpeechRecognitionCode ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                    <Mic className="w-3 h-3 text-emerald-600" />
                    Voice
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[#635F69]/70 bg-slate-200/50 px-2 py-0.5 rounded-full">
                    <MicOff className="w-3 h-3 text-[#635F69]" />
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
