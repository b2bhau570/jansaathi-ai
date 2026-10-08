// JANSAATHI AI - Report Viewer & Extraction Verification Modal
// Displays original medical scan side-by-side with OCR findings and confidence metrics.

import React from 'react';
import { ReportDocument } from '../../types';
import { FileText, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReportViewerModalProps {
  report: ReportDocument;
  isOpen: boolean;
  onClose: () => void;
  onMarkVerified?: (reportId: string) => void;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({
  report,
  isOpen,
  onClose,
  onMarkVerified,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-viewer-title"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded border border-slate-300 shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-teal-800" />
            <div>
              <h2 id="report-viewer-title" className="text-base font-bold text-slate-900">
                Diagnostic Report Audit: {report.file_name}
              </h2>
              <div className="text-xs text-slate-500">
                Size: {(report.file_size_bytes / 1024).toFixed(1)} KB &bull; Type: {report.file_type} &bull; OCR Status: {report.upload_status}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-800 rounded"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side-by-Side Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Source Document */}
          <div className="border border-slate-200 rounded p-4 bg-slate-50 flex flex-col">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Original Uploaded Document:
            </h3>
            <div className="flex-1 min-h-[300px] flex items-center justify-center bg-white border border-slate-200 rounded overflow-hidden p-2">
              {report.storage_path && report.file_type.startsWith('image/') ? (
                <img
                  src={report.storage_path}
                  alt="Original Diagnostic Scan"
                  className="max-h-[500px] object-contain w-full"
                />
              ) : (
                <div className="text-center p-8 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                  <p className="text-xs font-semibold">{report.file_name}</p>
                  <p className="text-[11px] mt-1 text-slate-400">PDF Document attachment</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Extracted Findings & OCR Text */}
          <div className="flex flex-col space-y-4">
            {/* Confidence Banner */}
            <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">OCR Engine Confidence:</span>
              <span className="font-mono font-bold text-slate-900">
                {report.ocr_confidence ? `${(report.ocr_confidence * 100).toFixed(0)}%` : 'N/A'}
              </span>
            </div>

            {/* Extracted Lab Findings Table */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Structured Parameters:
              </h3>
              {report.findings && report.findings.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="px-2.5 py-1.5 text-left font-semibold">Test</th>
                        <th className="px-2.5 py-1.5 text-left font-semibold">Value</th>
                        <th className="px-2.5 py-1.5 text-left font-semibold">Range</th>
                        <th className="px-2.5 py-1.5 text-left font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {report.findings.map((f, i) => (
                        <tr key={i} className={f.is_abnormal ? 'bg-amber-50/50' : ''}>
                          <td className="px-2.5 py-1.5 font-medium">{f.test_name}</td>
                          <td className="px-2.5 py-1.5 font-bold">
                            {f.observed_value} {f.unit}
                          </td>
                          <td className="px-2.5 py-1.5 text-slate-600">{f.reference_range}</td>
                          <td className="px-2.5 py-1.5">
                            {f.is_abnormal ? (
                              <span className="text-[10px] px-1 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">
                                Abnormal
                              </span>
                            ) : (
                              <span className="text-[10px] px-1 py-0.5 bg-slate-100 text-slate-700 rounded">
                                Normal
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded border border-slate-200">
                  No standard discrete lab values isolated. Full text captured below.
                </div>
              )}
            </div>

            {/* Raw Text */}
            <div className="flex-1 flex flex-col">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Raw Extracted OCR Text:
              </h3>
              <textarea
                readOnly
                rows={8}
                value={report.extracted_text || 'No text extracted'}
                className="w-full p-2.5 border border-slate-300 rounded font-mono text-[11px] text-slate-800 bg-slate-50 leading-relaxed resize-none flex-1"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Original source document is immutably preserved.</span>
          </div>

          <div className="flex items-center gap-2">
            {onMarkVerified && (
              <button
                type="button"
                onClick={() => onMarkVerified(report.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Report Verified</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
