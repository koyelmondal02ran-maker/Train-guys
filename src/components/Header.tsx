import React, { useEffect, useState } from 'react';
import {
  Activity,
  Train,
  Monitor,
  Smartphone,
  Terminal,
  RefreshCw,
  Zap,
  ShieldCheck,
  Plus,
  Trash2,
  RotateCcw,
  Satellite,
  Upload,
} from 'lucide-react';
import { RTISTelemetryStatus } from '../types';

interface HeaderProps {
  activeTab: 'control-room' | 'station-pids' | 'passenger-tracker' | 'api-workbench';
  setActiveTab: (tab: 'control-room' | 'station-pids' | 'passenger-tracker' | 'api-workbench') => void;
  trainCount: number;
  punctualityRate: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenAddTrain?: () => void;
  onClearAll?: () => void;
  onRestoreSample?: () => void;
  onOpenRealtimeModal?: () => void;
  onOpenUploadData?: () => void;
  rtisStatus?: RTISTelemetryStatus | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  trainCount,
  punctualityRate,
  onRefresh,
  isRefreshing,
  onOpenAddTrain,
  onClearAll,
  onRestoreSample,
  onOpenRealtimeModal,
  onOpenUploadData,
  rtisStatus,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50">
      {/* Top micro status bar */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block mr-1.5"></span>
            CENTRALIZED TRAFFIC CONTROL LIVE FEED (CRIS / COA INTEGRATED)
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:flex items-center text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400 mr-1" />
            KAVACH ATP / FOG-PASS SENSORS ACTIVE
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenRealtimeModal && (
            <button
              onClick={onOpenRealtimeModal}
              className="flex items-center space-x-1 text-emerald-300 hover:text-emerald-200 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-700/60 px-2 py-0.5 rounded text-xs transition-colors cursor-pointer"
              title="View ISRO-RTIS NavIC real-time stream status & 100% accuracy pipeline"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <Satellite className="w-3 h-3 text-emerald-400" />
              <span>RTIS Live ({rtisStatus?.pingLatencyMs || 22}ms)</span>
            </button>
          )}

          {onOpenUploadData && (
            <button
              onClick={onOpenUploadData}
              className="flex items-center space-x-1 text-amber-300 hover:text-amber-200 bg-amber-950/70 hover:bg-amber-900/80 border border-amber-700/60 px-2 py-0.5 rounded text-xs transition-colors cursor-pointer"
              title="Upload real train schedules & telemetry datasets"
            >
              <Upload className="w-3 h-3 text-amber-400" />
              <span>Upload Real Data</span>
            </button>
          )}

          {onOpenAddTrain && (
            <button
              onClick={onOpenAddTrain}
              className="flex items-center space-x-1 text-slate-950 font-semibold bg-amber-500 hover:bg-amber-400 px-2 py-0.5 rounded text-xs transition-colors cursor-pointer"
              title="Add a new train to radar"
            >
              <Plus className="w-3 h-3" />
              <span>Add Train</span>
            </button>
          )}

          {trainCount > 0 && onClearAll && (
            <button
              onClick={onClearAll}
              className="flex items-center space-x-1 text-red-300 hover:text-red-200 bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 px-2 py-0.5 rounded text-xs transition-colors cursor-pointer"
              title="Delete all preloaded trains (সব মুছুন)"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden sm:inline">Delete All</span>
            </button>
          )}

          {trainCount === 0 && onRestoreSample && (
            <button
              onClick={onRestoreSample}
              className="flex items-center space-x-1 text-sky-300 hover:text-sky-200 bg-sky-950/60 hover:bg-sky-900/80 border border-sky-800/60 px-2 py-0.5 rounded text-xs transition-colors cursor-pointer"
              title="Restore sample trains (নমুনা ডেটা)"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Restore Sample</span>
            </button>
          )}

          <span className="font-mono-telemetry text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
            IST {currentTime || '23:00:00'} (UTC+05:30)
          </span>
          <button
            onClick={onRefresh}
            title="Refresh real-time telemetry feeds"
            className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors bg-slate-800/80 hover:bg-slate-700 px-2 py-0.5 rounded text-xs cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Main header banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-700 to-amber-600 p-0.5 shadow-lg shadow-red-950/50 flex items-center justify-center flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <Train className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center">
                INDIAN RAILWAYS
                <span className="ml-2 text-xs uppercase px-2 py-0.5 bg-red-900/60 text-red-200 border border-red-700/60 rounded font-semibold tracking-wider">
                  DYNAMIC ETA ENGINE
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center space-x-2">
              <span>भारतीय रेल गतिमान आगमन पूर्वानुमान प्रणाली</span>
              <span className="text-slate-600">•</span>
              <span className="text-sky-400">Physics & ML Multi-Factor Model</span>
            </p>
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="mt-3 sm:mt-0 flex items-center space-x-3 overflow-x-auto pb-1 sm:pb-0">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 flex items-center space-x-2.5">
            <Activity className="w-4 h-4 text-sky-400" />
            <div>
              <div className="text-[10px] uppercase text-slate-400 leading-none">Coaching Rakes</div>
              <div className="text-sm font-bold font-mono-telemetry text-slate-100">{trainCount} Active</div>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 flex items-center space-x-2.5">
            <Zap className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase text-slate-400 leading-none">Punctuality (15m)</div>
              <div className="text-sm font-bold font-mono-telemetry text-emerald-300">{punctualityRate}%</div>
            </div>
          </div>

          <button
            onClick={onOpenRealtimeModal}
            className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-lg px-3 py-1.5 flex items-center space-x-2.5 transition-colors cursor-pointer text-left"
            title="Click to view ISRO-RTIS NavIC telemetry details & accuracy pipeline"
          >
            <Satellite className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase text-slate-400 leading-none">ISRO-RTIS NavIC</div>
              <div className="text-sm font-bold font-mono-telemetry text-emerald-400 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block"></span>
                <span>{rtisStatus?.satellitesLocked || 12} Sats • {rtisStatus?.pingLatencyMs || 22}ms</span>
              </div>
            </div>
          </button>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 flex items-center space-x-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
            <div>
              <div className="text-[10px] uppercase text-slate-400 leading-none">ML Accuracy Gain</div>
              <div className="text-sm font-bold font-mono-telemetry text-amber-300">+28.4 min Δ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="max-w-7xl mx-auto px-4 flex space-x-1 border-t border-slate-800/80 overflow-x-auto">
        <button
          onClick={() => setActiveTab('control-room')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'control-room'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Control Room Dashboard (CTC)</span>
        </button>

        <button
          onClick={() => setActiveTab('station-pids')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'station-pids'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Station Display Board (PIDS)</span>
        </button>

        <button
          onClick={() => setActiveTab('passenger-tracker')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'passenger-tracker'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Passenger Mobile Journey Tracker</span>
        </button>

        <button
          onClick={() => setActiveTab('api-workbench')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'api-workbench'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Dynamic ML & API Testbed</span>
        </button>
      </div>
    </header>
  );
};
