import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Database,
  Train,
  Download,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { TrainJourney } from '../types';
import { REAL_INDIAN_RAILWAY_TRAINS } from '../realRailwayData';

interface UploadDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => Promise<void>;
}

export const UploadDataModal: React.FC<UploadDataModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [activeMode, setActiveMode] = useState<'real-preset' | 'file-upload' | 'json-paste'>('real-preset');
  const [jsonText, setJsonText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [replaceAll, setReplaceAll] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Load authentic IR / CRIS 6 Premier Train Dataset
  const handleLoadRealPreset = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/trains/load-real', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({
          type: 'success',
          text: `Success: Loaded ${data.count || 6} real authentic Indian Railways train journeys into the radar.`,
        });
        await onUploadSuccess();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        throw new Error(data.error || 'Failed to load real dataset');
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message || 'Error loading authentic data' });
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Parse and upload arbitrary JSON array or single train
  const handleUploadData = async (dataToUpload: any) => {
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      let trainsArray: TrainJourney[] = [];

      if (Array.isArray(dataToUpload)) {
        trainsArray = dataToUpload;
      } else if (dataToUpload.trains && Array.isArray(dataToUpload.trains)) {
        trainsArray = dataToUpload.trains;
      } else if (dataToUpload.trainNumber && dataToUpload.trainName) {
        trainsArray = [dataToUpload];
      } else {
        throw new Error('Data must be an array of TrainJourney objects or contain a "trains" array.');
      }

      const res = await fetch('/api/trains/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trains: trainsArray, replaceAll }),
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || 'Bulk upload failed');
      }

      setStatusMessage({
        type: 'success',
        text: `Successfully uploaded ${trainsArray.length} real train records. Total active: ${resJson.count}`,
      });
      await onUploadSuccess();
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to process uploaded data' });
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. File reader handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFileContent(file);
  };

  const readFileContent = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        handleUploadData(parsed);
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'Invalid JSON file format. Please upload valid JSON.' });
      }
    };
    reader.onerror = () => {
      setStatusMessage({ type: 'error', text: 'Error reading file from disk.' });
    };
    reader.readAsText(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readFileContent(file);
    }
  };

  const handleDownloadSampleTemplate = () => {
    const jsonStr = JSON.stringify(REAL_INDIAN_RAILWAY_TRAINS.slice(0, 2), null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'indian_railways_real_data_sample.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Upload Real Railway Telemetry & Schedules
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Real Data Ingestion
                </span>
              </div>
              <p className="text-xs text-slate-400">
                অফিসিয়াল ট্রেনের শিডিউল, জিপিএস ও আরটিআইএস ডেটা আপলোড করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border flex items-center space-x-2 text-xs ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300'
                  : 'bg-red-950/80 border-red-700/60 text-red-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Mode Selector Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveMode('real-preset')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeMode === 'real-preset'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Official IR 6-Corridor Data</span>
            </button>
            <button
              onClick={() => setActiveMode('file-upload')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeMode === 'file-upload'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>File Upload (.JSON)</span>
            </button>
            <button
              onClick={() => setActiveMode('json-paste')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeMode === 'json-paste'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste JSON / Records</span>
            </button>
          </div>

          {/* Replace All Checkbox */}
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={replaceAll}
              onChange={(e) => setReplaceAll(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500"
            />
            <span>Replace current radar roster with uploaded data (পূর্বের ডেটা প্রতিস্থাপন করুন)</span>
          </label>

          {/* Mode 1: Authentic Real Indian Railways Presets */}
          {activeMode === 'real-preset' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-sm font-semibold text-amber-400">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Verified Indian Railways Live Routes (IR / CRIS Schedule Dataset)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click below to immediately load authentic ground records covering key trunk lines across Northern, Eastern, Western, and Southern Railway zones with true station distances, actual speed restrictions, and GPS coordinates:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start space-x-2">
                    <Train className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-100">#12302 Howrah Rajdhani Express</div>
                      <div className="text-slate-400 text-[11px]">NDLS → HWH (1,450 km Grand Chord)</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start space-x-2">
                    <Train className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-100">#22436 Vande Bharat Express</div>
                      <div className="text-slate-400 text-[11px]">NDLS → BSB (759 km High-Speed)</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start space-x-2">
                    <Train className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-100">#12952 Mumbai Rajdhani Express</div>
                      <div className="text-slate-400 text-[11px]">NDLS → MMCT (1,384 km Western Trunk)</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start space-x-2">
                    <Train className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-100">#12004 Lucknow Swarna Shatabdi</div>
                      <div className="text-slate-400 text-[11px]">NDLS → LJN (512 km Intercity Express)</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start space-x-2">
                    <Train className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-100">#12802 Purushottam Express</div>
                      <div className="text-slate-400 text-[11px]">NDLS → PURI (1,865 km Superfast)</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start space-x-2">
                    <Train className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-100">#12626 Kerala Express</div>
                      <div className="text-slate-400 text-[11px]">NDLS → TVC (3,026 km Long Haul)</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleDownloadSampleTemplate}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center space-x-1 underline cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON Schema Template</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadRealPreset}
                    disabled={isProcessing}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center space-x-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                    <span>{isProcessing ? 'Ingesting Real Data...' : 'Upload & Activate Real Dataset'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Drag & Drop File Upload */}
          {activeMode === 'file-upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-amber-400 bg-amber-500/10'
                    : 'border-slate-700 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-950/60'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-white mb-1">
                  Drag and drop your railway .json file here
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  বা ক্লিক করে কম্পিউটার থেকে ফাইল নির্বাচন করুন (Click to browse files)
                </p>
                <span className="text-[11px] px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Supports TrainJourney JSON format
                </span>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleDownloadSampleTemplate}
                  className="text-xs text-sky-400 hover:text-sky-300 flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample JSON Template</span>
                </button>
              </div>
            </div>
          )}

          {/* Mode 3: Raw JSON Text Area */}
          {activeMode === 'json-paste' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">
                  Paste JSON Records (Train Journey Object or Array)
                </label>
                <textarea
                  rows={8}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder={`[\n  {\n    "trainNumber": "12301",\n    "trainName": "Howrah Rajdhani",\n    "type": "RAJDHANI",\n    "zone": "ER",\n    "origin": { "code": "HWH", "name": "Howrah" },\n    "destination": { "code": "NDLS", "name": "New Delhi" },\n    "stations": [...]\n  }\n]`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono-telemetry"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleDownloadSampleTemplate}
                  className="text-xs text-sky-400 hover:text-sky-300 flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Format Reference</span>
                </button>

                <button
                  type="button"
                  disabled={!jsonText.trim() || isProcessing}
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(jsonText);
                      handleUploadData(parsed);
                    } catch (e) {
                      setStatusMessage({ type: 'error', text: 'Invalid JSON format in text field.' });
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors disabled:opacity-40 cursor-pointer shadow-md"
                >
                  {isProcessing ? 'Processing JSON...' : 'Upload Pasted JSON'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <div className="text-slate-400 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>CRIS / NTES Standard Format Compatible</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Close (বন্ধ করুন)
          </button>
        </div>
      </div>
    </div>
  );
};
