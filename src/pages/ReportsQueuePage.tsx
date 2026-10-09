// JANSAATHI AI - High-Fidelity Claymorphism Diagnostic Reports & OCR Audit Page (/reports)
// Comprehensive archive of diagnostic scans, OCR confidence metrics, and extracted discrete findings.

import React, { useEffect, useState } from 'react';
import { CaseService } from '../services/supabase/CaseService';
import { ReportDocument, TriageCase } from '../types';
import { ReportViewerModal } from '../components/clinical/ReportViewerModal';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { FileText, Eye } from 'lucide-react';

export const ReportsQueuePage: React.FC = () => {
  const [cases, setCases] = useState<TriageCase[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CaseService.getAllCases().then((all) => {
      setCases(all);
      setLoading(false);
    });
  }, []);

  const allReports: { report: ReportDocument; caseNumber: string }[] = [];
  cases.forEach((c) => {
    if (c.reports) {
      c.reports.forEach((r) => {
        allReports.push({ report: r, caseNumber: c.case_number });
      });
    }
  });

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <ClinicalDisclaimer />

        <div className="flex items-center gap-3.5 my-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white shadow-clayOrb shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#332F3A] tracking-tight font-heading">
              Diagnostic Documents & OCR Audit Repository
            </h1>
            <p className="text-xs font-semibold text-[#635F69] mt-0.5">
              In-browser Tesseract.js OCR extractions &bull; Immutable document audit &bull; Provenance tracking
            </p>
          </div>
        </div>

        {loading ? (
          <div className="clay-card rounded-[32px] p-12 text-center text-xs font-bold text-[#635F69] animate-clay-breathe">
            Querying reports repository...
          </div>
        ) : allReports.length === 0 ? (
          <div className="clay-card rounded-[36px] p-14 text-center">
            <FileText className="w-14 h-14 text-purple-300 mx-auto mb-3" />
            <h4 className="text-base font-black text-[#332F3A] font-heading">
              No diagnostic documents have been uploaded for review yet.
            </h4>
            <p className="text-xs text-[#635F69] font-medium mt-1 max-w-sm mx-auto">
              Reports uploaded by patients or health workers (blood tests, prescriptions, slips) will be indexed here with OCR extraction details.
            </p>
          </div>
        ) : (
          <div className="clay-card-static rounded-[36px] p-0 overflow-hidden shadow-clayCard bg-white/85">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-purple-100 text-xs">
                <thead className="bg-[#FAF8FD] text-[#635F69] font-black uppercase text-[11px] font-heading">
                  <tr>
                    <th className="px-5 py-3.5 text-left">Document Name</th>
                    <th className="px-5 py-3.5 text-left">Case Reference</th>
                    <th className="px-5 py-3.5 text-left">Type & Size</th>
                    <th className="px-5 py-3.5 text-left">OCR Confidence</th>
                    <th className="px-5 py-3.5 text-left">Extracted Findings</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50 bg-white/70">
                  {allReports.map(({ report, caseNumber }) => (
                    <tr key={report.id} className="hover:bg-violet-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-[#332F3A] font-heading">
                        {report.file_name}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[#7C3AED] font-black">
                        {caseNumber}
                      </td>
                      <td className="px-5 py-3.5 text-[#635F69] font-medium">
                        {report.file_type} &bull; {(report.file_size_bytes / 1024).toFixed(1)} KB
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`font-black font-heading ${
                            (report.ocr_confidence || 0) >= 0.7
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {report.ocr_confidence
                            ? `${(report.ocr_confidence * 100).toFixed(0)}%`
                            : 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#332F3A] font-medium">
                        {report.findings?.length || 0} discrete lab parameters
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedReport(report)}
                          className="clay-btn-primary text-xs px-3.5 py-1.5 min-h-[34px] rounded-xl"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View OCR</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport && (
          <ReportViewerModal
            report={selectedReport}
            isOpen={Boolean(selectedReport)}
            onClose={() => setSelectedReport(null)}
          />
        )}
      </div>
    </div>
  );
};
