// JANSAATHI AI - Patient Multilingual Text Input Panel
// Accessible text input with structured prompts for symptoms, onset, and prior medications

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
    <div className="max-w-2xl mx-auto bg-white rounded border border-slate-300 p-6 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{t.patientInput.textTab}</h3>
          <p className="text-xs text-slate-600">
            Selected: <strong>{languageInfo.name} ({languageInfo.nativeName})</strong>. Type in any script.
          </p>
        </div>
        <FileText className="w-5 h-5 text-slate-500" />
      </div>

      <div className="my-4">
        <label htmlFor="patient-text-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
          {t.patientInput.typePrompt}
        </label>
        <textarea
          id="patient-text-input"
          rows={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t.patientInput.typePlaceholder}
          className="w-full p-3.5 border border-slate-300 rounded text-sm text-slate-900 leading-relaxed focus:ring-1 focus:ring-teal-700 focus:outline-hidden"
        />
        <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
          <span>Character count: {value.length}</span>
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-slate-400" />
            Include duration (e.g., 3 days) and severity
          </span>
        </div>
      </div>

      {/* Helpful Clinical Term Chips */}
      <div className="pt-3 border-t border-slate-100">
        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-2">
          Quick Symptom Prompts:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {symptomSuggestions.map((sugg) => (
            <button
              key={sugg}
              type="button"
              onClick={() => handleAppendChip(sugg)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded border border-slate-200 transition-colors"
            >
              + {sugg}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
