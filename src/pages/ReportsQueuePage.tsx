// JANSAATHI AI - Diagnostic Reports & OCR Audit Page (/reports)
// Comprehensive archive of diagnostic scans, OCR confidence metrics, and extracted discrete findings.

import React, { useEffect, useState } from 'react';
import { CaseService } from '../services/supabase/CaseService';
import { ReportDocument, TriageCase } from '../types';
import { ReportViewerModal } from '../components/clinical/ReportViewerModal';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { FileText, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';

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
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ClinicalDisclaimer />

        <div className="my-6">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-800" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Diagnostic Documents & OCR Audit Repository
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            In-browser Tesseract.js OCR extractions &bull; Immutable document audit &bull; Provenance tracking
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white rounded border border-slate-300">
            Querying reports repository...
          </div>
        ) : allReports.length === 0 ? (
          <div className="bg-white rounded border border-slate-300 p-12 text-center shadow-xs">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-800">
              No diagnostic documents have been uploaded for review yet.
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Reports uploaded by patients or health workers (blood tests, prescriptions, slips) will be indexed here with OCR extraction details.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded border border-slate-300 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3 text-left">Document Name</th>
                    <th className="px-4 py-3 text-left">Case Reference</th>
                    <th className="px-4 py-3 text-left">Type & Size</th>
                    <th className="px-4 py-3 text-left">OCR Confidence</th>
                    <th className="px-4 py-3 text-left">Extracted Findings</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {allReports.map(({ report, caseNumber }) => (
                    <tr key={report.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {report.file_name}
                      </td>
                      <td className="px-4 py-3 font-mono text-teal-800 font-medium">
                        {caseNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {report.file_type} &bull; {(report.file_size_bytes / 1024).toFixed(1)} KB
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold ${
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
                      <td className="px-4 py-3 text-slate-600">
                        {report.findings ? `${report.findings.length} discrete parameters` : 'Raw text only'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedReport(report)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-teal-800 hover:bg-teal-700 text-white rounded text-xs font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Audit</span>
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
