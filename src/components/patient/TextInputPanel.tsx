// JANSAATHI AI - High-Fidelity Claymorphism Patient Multilingual Text Input Panel
// Recessed clay writing panel with tactile quick-symptom pills

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { FileText, HelpCircle } from 'lucide-react';

interface TextInputPanelProps {
  value: string;
  onChange: (val: string) => void;
}

export const TextInputPanel: React.FC<TextInputPanelProps> = ({ value, onChange }) => {
  const { t, languageInfo } = useLanguage();

  const symptomSuggestions = [
    'Fever / Chills',
    'Chest tightness / Heaviness',
    'Cough with sputum',
    'Severe headache',
    'Breathing difficulty',
    'Abdominal pain',
    'Nausea / Vomiting',
    'Joint pain',
  ];

  const handleAppendChip = (chip: string) => {
    const updated = value ? `${value.trim()}, ${chip}` : chip;
    onChange(updated);
  };

  return (
    <div className="max-w-2xl mx-auto clay-card rounded-[36px] p-7 md:p-9">
      <div className="flex items-center justify-between pb-4 border-b border-purple-100">
        <div>
          <h3 className="text-2xl font-black text-[#332F3A] font-heading">{t.patientInput.textTab}</h3>
          <p className="text-xs font-semibold text-[#635F69] mt-0.5">
            Selected: <strong className="text-[#7C3AED]">{languageInfo.name} ({languageInfo.nativeName})</strong>. Type in any script.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white shadow-clayOrb">
          <FileText className="w-6 h-6" />
        </div>
      </div>

      <div className="my-5">
        <label htmlFor="patient-text-input" className="block text-xs font-bold text-[#332F3A] mb-2 font-heading">
          {t.patientInput.typePrompt}
        </label>
        <textarea
          id="patient-text-input"
          rows={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t.patientInput.typePlaceholder}
          className="clay-input rounded-[24px] p-5 leading-relaxed resize-none text-base"
        />
        <div className="text-xs font-semibold text-[#635F69] mt-2 flex items-center justify-between px-1">
          <span>Character count: {value.length}</span>
          <span className="flex items-center gap-1.5 text-[#7C3AED]">
            <HelpCircle className="w-3.5 h-3.5" />
            Include duration (e.g. 3 days) and severity
          </span>
        </div>
      </div>

      {/* Helpful Clinical Term Chips */}
      <div className="pt-4 border-t border-purple-100/70">
        <span className="text-xs font-black text-[#332F3A] uppercase tracking-wider block mb-3 font-heading">
          Quick Symptom Prompts:
        </span>
        <div className="flex flex-wrap gap-2">
          {symptomSuggestions.map((sugg) => (
            <button
              key={sugg}
              type="button"
              onClick={() => handleAppendChip(sugg)}
              className="clay-pill bg-white/90 hover:bg-violet-50 text-[#332F3A] border border-white active:scale-95 cursor-pointer font-bold transition-all text-xs py-2 px-3.5"
            >
              + {sugg}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
