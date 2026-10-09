// JANSAATHI AI - High-Fidelity Claymorphism Report Upload & In-Browser OCR Panel
// Tactile dropzone, soft clay progress meter, and rounded lab findings table

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

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 15MB limit. Please upload a smaller scan.');
      return;
    }

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
    <div className="max-w-2xl mx-auto clay-card rounded-[36px] p-7 md:p-9">
      <div className="flex items-center space-x-4 pb-4 border-b border-purple-100">
        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white shadow-clayOrb shrink-0">
          <FileText className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-[#332F3A] font-heading">Diagnostic Report / Prescription OCR</h3>
          <p className="text-xs font-semibold text-[#635F69] mt-0.5">
            Upload laboratory reports, discharge slips, or prescriptions (JPG, PNG, PDF up to 15MB).
          </p>
        </div>
      </div>

      {/* Recessed Clay File Dropzone */}
      <div className="my-6">
        <label
          htmlFor="report-file-input"
          className="rounded-[28px] p-8 flex flex-col items-center justify-center cursor-pointer bg-[#EFEBF5] shadow-clayPressed hover:bg-white/80 transition-all duration-200 select-none group"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white shadow-clayOrb mb-3 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>
          <span className="text-base font-extrabold text-[#332F3A] font-heading text-center">
            {selectedFile ? selectedFile.name : 'Click to select report or drag and drop here'}
          </span>
          <span className="text-xs text-[#635F69] font-medium mt-1">
            {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Supported Formats: JPG, PNG, PDF (Max 15MB)'}
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
        <div role="alert" className="mb-4 p-4 rounded-[20px] bg-rose-500/15 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2 shadow-clayPill">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Image Preview & OCR Action */}
      {selectedFile && !ocrResult && !isProcessing && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/90 rounded-[24px] border border-white shadow-clayPill">
          <div className="flex items-center gap-3">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Uploaded report thumbnail"
                className="w-14 h-14 object-cover rounded-2xl border border-purple-200 shadow-xs"
              />
            )}
            <div>
              <div className="text-xs font-bold text-[#332F3A] font-heading">{selectedFile.name}</div>
              <div className="text-[11px] text-[#635F69]">Ready for in-browser OCR processing</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleStartOCR}
            className="clay-btn-primary text-xs px-6 py-2.5 h-11 rounded-[18px]"
          >
            Extract Text via OCR
          </button>
        </div>
      )}

      {/* Real In-browser Progress Bar */}
      {isProcessing && (
        <div className="my-6 p-5 rounded-[24px] bg-violet-500/10 border border-violet-300/60 shadow-clayPill">
          <div className="flex items-center justify-between text-xs font-bold text-[#7C3AED] mb-2 font-heading">
            <span>{progressStatus || 'Running OCR on document...'}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-[#EFEBF5] rounded-full h-3 overflow-hidden shadow-clayPressed p-0.5">
            <div
              className="bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-[11px] text-[#635F69] font-medium block mt-2">
            Processing locally inside browser Web Worker without transmitting file to external servers.
          </span>
        </div>
      )}

      {/* Structured Lab Findings Results */}
      {ocrResult && (
        <div className="mt-6 border-t border-purple-100 pt-5">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-black text-[#332F3A] font-heading">OCR Extraction Completed</span>
            </div>
            <div className="text-xs font-bold text-[#635F69]">
              Confidence:{' '}
              <span className={`font-black ${ocrResult.confidence >= 0.7 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {(ocrResult.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {ocrResult.uncertaintyNotes && (
            <div className="p-4 rounded-[20px] bg-amber-500/15 border border-amber-300 text-amber-950 text-xs mb-4 flex items-start gap-2 shadow-clayPill">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>{ocrResult.uncertaintyNotes}</span>
            </div>
          )}

          {/* Extracted Lab Findings Table */}
          {ocrResult.structuredFindings.length > 0 ? (
            <div className="overflow-x-auto rounded-[24px] border border-white bg-white/90 shadow-clayPill mb-4">
              <table className="min-w-full divide-y divide-purple-100 text-xs">
                <thead className="bg-[#FAF8FD] text-[#635F69]">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold font-heading">Test Name</th>
                    <th className="px-4 py-3 text-left font-bold font-heading">Observed Value</th>
                    <th className="px-4 py-3 text-left font-bold font-heading">Reference Range</th>
                    <th className="px-4 py-3 text-left font-bold font-heading">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50 bg-white">
                  {ocrResult.structuredFindings.map((finding, idx) => (
                    <tr key={idx} className={finding.is_abnormal ? 'bg-amber-50/50' : ''}>
                      <td className="px-4 py-3 font-bold text-[#332F3A] font-heading">{finding.test_name}</td>
                      <td className="px-4 py-3 font-black text-[#332F3A]">
                        {finding.observed_value} {finding.unit}
                      </td>
                      <td className="px-4 py-3 text-[#635F69] font-medium">{finding.reference_range}</td>
                      <td className="px-4 py-3">
                        {finding.is_abnormal ? (
                          <span className="clay-pill bg-amber-500/15 text-amber-900 text-[10px]">
                            Abnormal
                          </span>
                        ) : (
                          <span className="clay-pill bg-emerald-500/15 text-emerald-900 text-[10px]">
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
            <p className="text-xs text-[#635F69] italic mb-4 px-1">
              No standard lab parameters matched the report text. Raw text preserved for clinician review.
            </p>
          )}

          <div className="rounded-[24px] bg-[#EFEBF5] p-4 shadow-clayPressed text-xs text-[#332F3A]">
            <div className="flex items-center gap-1.5 font-bold text-[#332F3A] mb-1.5 font-heading">
              <Eye className="w-4 h-4 text-[#7C3AED]" />
              <span>Extracted Text Preview:</span>
            </div>
            <p className="line-clamp-3 text-[#635F69] font-mono text-[11px] whitespace-pre-wrap">
              {ocrResult.rawText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
