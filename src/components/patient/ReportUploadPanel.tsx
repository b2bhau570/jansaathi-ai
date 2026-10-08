// JANSAATHI AI - Diagnostic Report Upload & Real In-Browser OCR Panel
// Client-side text & lab extraction via Tesseract.js with real progress and confidence indicators

import React, { useState } from 'react';
import { TesseractOCRService, OCRProcessingResult } from '../../services/ocr/TesseractOCRService';
import { ReportDocument } from '../../types';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, AlertCircle, Eye } from 'lucide-react';

interface ReportUploadPanelProps {
  onReportProcessed: (report: ReportDocument) => void;
}

export const ReportUploadPanel: React.FC<ReportUploadPanelProps> = ({ onReportProcessed }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [ocrResult, setOcrResult] = useState<OCRProcessingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 15MB limit. Please upload a smaller scan.');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported file format. Please upload JPG, PNG, or PDF.');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setOcrResult(null);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleStartOCR = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await TesseractOCRService.extractFromImage(
        selectedFile,
        (progress, statusText) => {
          setProgressPercent(progress);
          setProgressStatus(statusText);
        }
      );

      setOcrResult(result);

      const reportDoc: ReportDocument = {
        id: `rep-${Date.now()}`,
        case_id: '',
        file_name: selectedFile.name,
        file_type: selectedFile.type,
        file_size_bytes: selectedFile.size,
        storage_path: previewUrl || selectedFile.name,
        upload_status: 'OCR_COMPLETED',
        extracted_text: result.rawText,
        findings: result.structuredFindings,
        ocr_confidence: result.confidence,
        created_at: new Date().toISOString(),
      };

      onReportProcessed(reportDoc);
    } catch (err: any) {
      setErrorMessage(err.message || 'OCR extraction failed on this document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded border border-slate-300 p-6 shadow-xs">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
        <div className="w-10 h-10 rounded bg-cyan-100 border border-cyan-300 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-cyan-800" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Diagnostic Report / Prescription OCR</h3>
          <p className="text-xs text-slate-600">
            Upload laboratory reports, discharge slips, or prescriptions (JPG, PNG, PDF up to 15MB).
          </p>
        </div>
      </div>

      {/* File Dropzone */}
      <div className="my-5">
        <label
          htmlFor="report-file-input"
          className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 transition-colors"
        >
          <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
          <span className="text-sm font-semibold text-slate-800">
            {selectedFile ? selectedFile.name : 'Click to select report or drag and drop here'}
          </span>
          <span className="text-xs text-slate-500 mt-1">
            {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Formats: JPG, PNG, PDF (Max 15MB)'}
          </span>
          <input
            id="report-file-input"
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {errorMessage && (
        <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-300 text-red-900 rounded text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Image Preview & OCR Action */}
      {selectedFile && !ocrResult && !isProcessing && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-slate-100 rounded border border-slate-200">
          <div className="flex items-center gap-3">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Uploaded report thumbnail"
                className="w-14 h-14 object-cover rounded border border-slate-300"
              />
            )}
            <div>
              <div className="text-xs font-semibold text-slate-900">{selectedFile.name}</div>
              <div className="text-[11px] text-slate-500">Ready for in-browser OCR processing</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleStartOCR}
            className="px-5 py-2 bg-teal-800 hover:bg-teal-700 text-white rounded text-xs font-semibold transition-colors"
          >
            Extract Text via OCR
          </button>
        </div>
      )}

      {/* Real In-browser Progress Bar */}
      {isProcessing && (
        <div className="my-6 p-4 bg-teal-50 border border-teal-200 rounded">
          <div className="flex items-center justify-between text-xs font-semibold text-teal-900 mb-2">
            <span>{progressStatus || 'Running OCR on document...'}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-teal-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-teal-700 h-2 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-[11px] text-teal-700 block mt-2">
            Processing locally inside browser Web Worker without transmitting file to external servers.
          </span>
        </div>
      )}

      {/* Structured Lab Findings Results */}
      {ocrResult && (
        <div className="mt-6 border-t border-slate-200 pt-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">OCR Extraction Completed</span>
            </div>
            <div className="text-xs font-medium text-slate-700">
              Confidence:{' '}
              <span className={`font-semibold ${ocrResult.confidence >= 0.7 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {(ocrResult.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Uncertainty notice if low confidence */}
          {ocrResult.uncertaintyNotes && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded text-amber-950 text-xs mb-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>{ocrResult.uncertaintyNotes}</span>
            </div>
          )}

          {/* Extracted Lab Findings Table */}
          {ocrResult.structuredFindings.length > 0 ? (
            <div className="overflow-x-auto border border-slate-200 rounded mb-4">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Test Name</th>
                    <th className="px-3 py-2 text-left font-semibold">Observed Value</th>
                    <th className="px-3 py-2 text-left font-semibold">Reference Range</th>
                    <th className="px-3 py-2 text-left font-semibold">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {ocrResult.structuredFindings.map((finding, idx) => (
                    <tr key={idx} className={finding.is_abnormal ? 'bg-amber-50/60' : ''}>
                      <td className="px-3 py-2 font-medium text-slate-900">{finding.test_name}</td>
                      <td className="px-3 py-2 font-semibold text-slate-900">
                        {finding.observed_value} {finding.unit}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{finding.reference_range}</td>
                      <td className="px-3 py-2">
                        {finding.is_abnormal ? (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                            Abnormal
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
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
            <p className="text-xs text-slate-500 italic mb-4">
              No standard lab parameters matched the report text. Raw text preserved for clinician review.
            </p>
          )}

          <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs text-slate-700">
            <div className="flex items-center gap-1 font-semibold text-slate-800 mb-1">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Extracted Text Preview:</span>
            </div>
            <p className="line-clamp-3 text-slate-600 font-mono text-[11px] whitespace-pre-wrap">
              {ocrResult.rawText}
            </p>
          </div>

          <div className="mt-3 p-2 bg-slate-100 text-slate-600 rounded text-[11px]">
            <strong>Clinical Notice:</strong> Extracted from uploaded document. Clinical interpretation by a qualified physician is strictly required.
          </div>
        </div>
      )}
    </div>
  );
};
