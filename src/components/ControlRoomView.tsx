import React, { useState } from 'react';
import {
  TrainJourney,
  SpeedRestriction,
  DisruptionSimulationPayload,
  AIInsightsResponse,
} from '../types';
import {
  Train,
  AlertTriangle,
  Radio,
  Gauge,
  Clock,
  ShieldCheck,
  CloudFog,
  Sun,
  CloudRain,
  Compass,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Volume2,
  Trash2,
  Plus,
  Satellite,
  Upload,
} from 'lucide-react';
import { RTISTelemetryStatus } from '../types';

interface ControlRoomViewProps {
  trains: TrainJourney[];
  selectedTrain: TrainJourney | null;
  onSelectTrain: (train: TrainJourney) => void;
  onSimulateDisruption: (payload: DisruptionSimulationPayload) => Promise<void>;
  isSimulating: boolean;
  onDeleteTrain?: (trainNumber: string) => Promise<void>;
  onClearAllTrains?: () => Promise<void>;
  onRestoreSampleTrains?: () => Promise<void>;
  onOpenAddTrain?: () => void;
  onOpenRealtimeModal?: () => void;
  onOpenUploadData?: () => void;
  rtisStatus?: RTISTelemetryStatus | null;
}

export const ControlRoomView: React.FC<ControlRoomViewProps> = ({
  trains,
  selectedTrain,
  onSelectTrain,
  onSimulateDisruption,
  isSimulating,
  onDeleteTrain,
  onClearAllTrains,
  onRestoreSampleTrains,
  onOpenAddTrain,
  onOpenRealtimeModal,
  onOpenUploadData,
  rtisStatus,
}) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsightsResponse | null>(null);
  const [activeTabSub, setActiveTabSub] = useState<'stations' | 'factors' | 'disruptions'>('stations');

  // Trigger Gemini AI insights analysis
  const handleFetchAiInsights = async () => {
    if (!selectedTrain) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainNumber: selectedTrain.trainNumber }),
      });
      const data = await res.json();
      if (data.insights) {
        setAiInsights(data.insights);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const getSignalColorClass = (aspect: string) => {
    switch (aspect) {
      case 'GREEN':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-700/60';
      case 'DOUBLE_YELLOW':
        return 'text-amber-400 bg-amber-950/60 border-amber-700/60';
      case 'YELLOW':
        return 'text-yellow-400 bg-yellow-950/60 border-yellow-700/60';
      case 'RED':
        return 'text-red-400 bg-red-950/60 border-red-700/60';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  // If no trains or preloaded data is deleted
  if (!selectedTrain || trains.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400 shadow-inner">
          <Train className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Preloaded Data Deleted / কোনো ডেটা নেই</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Coaching Roster is Currently Empty
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            All preloaded train schedules and mock records have been removed. Add a new coaching train to calculate dynamic physics and ML ETAs, or restore demonstration schedules.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onOpenUploadData && (
            <button
              onClick={onOpenUploadData}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-md font-bold"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Real Data (আসল ডেটা আপলোড করুন)</span>
            </button>
          )}

          {onOpenAddTrain && (
            <button
              onClick={onOpenAddTrain}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add New Train (নতুন ট্রেন যোগ করুন)</span>
            </button>
          )}

          {onRestoreSampleTrains && (
            <button
              onClick={onRestoreSampleTrains}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-sky-400" />
              <span>Restore Sample Schedules (নমুনা ডেটা)</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Train Selection Roster Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
        <div className="flex flex-wrap items-center justify-between mb-2 px-1 gap-2">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Active Coaching Trains Under Dynamic Telemetry Radar</span>
          </div>
          <div className="flex items-center space-x-2">
            {onOpenRealtimeModal && (
              <button
                onClick={onOpenRealtimeModal}
                className="text-xs px-2.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-700/60 transition-colors flex items-center space-x-1.5 cursor-pointer"
                title="View ISRO-RTIS NavIC real-time telemetry stream & 100% accuracy pipeline"
              >
                <Satellite className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>ISRO-RTIS Stream ({rtisStatus?.pingLatencyMs || 22}ms)</span>
              </button>
            )}

            {onOpenUploadData && (
              <button
                onClick={onOpenUploadData}
                className="text-xs px-2.5 py-1 rounded bg-amber-950/80 hover:bg-amber-900/90 text-amber-300 border border-amber-700/60 transition-colors flex items-center space-x-1.5 cursor-pointer"
                title="Upload real train schedules & telemetry data"
              >
                <Upload className="w-3 h-3 text-amber-400" />
                <span>Upload Real Data</span>
              </button>
            )}

            {onOpenAddTrain && (
              <button
                onClick={onOpenAddTrain}
                className="text-xs px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                title="Add custom train to radar"
              >
                <Plus className="w-3 h-3" />
                <span>Add Train (নতুন ট্রেন)</span>
              </button>
            )}
            {onClearAllTrains && (
              <button
                onClick={onClearAllTrains}
                className="text-xs px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 transition-colors flex items-center space-x-1 cursor-pointer"
                title="Delete all trains (সব ডেটা মুছুন)"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete All (সব মুছুন)</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {trains.map((train) => {
            const isSelected = train.trainNumber === selectedTrain.trainNumber;
            const variance = train.dynamicMLForecastFinalDelayMinutes - train.traditionalForecastFinalDelayMinutes;

            return (
              <button
                key={train.trainNumber}
                onClick={() => {
                  onSelectTrain(train);
                  setAiInsights(null);
                }}
                className={`text-left p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500"></div>
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono-telemetry font-bold text-amber-300 text-sm">
                        #{train.trainNumber}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700">
                        {train.zone}
                      </span>
                      {onDeleteTrain && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTrain(train.trainNumber);
                          }}
                          className="text-slate-500 hover:text-red-400 p-0.5 rounded transition-colors inline-flex cursor-pointer"
                          title={`Delete Train #${train.trainNumber}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-100 truncate mt-0.5" title={train.trainName}>
                      {train.trainName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {train.origin.code} → {train.destination.code} ({train.totalDistanceKm} km)
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] uppercase text-slate-500">Current Delay</div>
                    <div
                      className={`text-xs font-mono-telemetry font-bold ${
                        train.currentDelayMinutes === 0
                          ? 'text-emerald-400'
                          : train.currentDelayMinutes < 20
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                    >
                      {train.currentDelayMinutes === 0 ? 'ON TIME' : `+${train.currentDelayMinutes}m`}
                    </div>
                    <div className="text-[10px] text-amber-400/90 font-mono-telemetry mt-0.5">
                      Δ ML: {variance >= 0 ? `+${variance}m` : `${variance}m`}
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate">Next: <strong className="text-slate-200">{train.nextStation}</strong></span>
                  <span className="font-mono-telemetry text-sky-400">{train.locomotive.currentSpeedKmph} km/h</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Selected Train Telemetry Cockpit */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-4 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center">
                <span className="font-mono-telemetry text-amber-400 mr-2">#{selectedTrain.trainNumber}</span>
                {selectedTrain.trainName}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700">
                {selectedTrain.type.replace('_', ' ')}
              </span>
              {selectedTrain.locomotive.kavachActive && (
                <span className="hidden sm:inline-flex items-center text-xs px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-sky-400" />
                  KAVACH ATP ENGAGED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
              <span className="text-slate-300 font-medium">{selectedTrain.hindiName}</span>
              <span>•</span>
              <span>
                Route: <strong className="text-slate-200">{selectedTrain.origin.name} ({selectedTrain.origin.code})</strong> to{' '}
                <strong className="text-slate-200">{selectedTrain.destination.name} ({selectedTrain.destination.code})</strong>
              </span>
              <span>•</span>
              <span>Section: <strong className="text-amber-300">{selectedTrain.currentBlockSection.sectionName}</strong></span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleFetchAiInsights}
              disabled={aiLoading}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-lg text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{aiLoading ? 'AI Analyzing...' : 'AI Dispatch & Delay Diagnosis'}</span>
            </button>
          </div>
        </div>

        {/* Real-time telemetry metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          {/* Current Speed & Loco */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>Speed / MPS</span>
              <Gauge className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold font-mono-telemetry text-slate-100">
                {selectedTrain.locomotive.currentSpeedKmph}
              </span>
              <span className="text-xs text-slate-500 font-mono-telemetry">/ {selectedTrain.locomotive.mpsKmph} km/h</span>
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-1">
              {selectedTrain.locomotive.locoClass}
            </div>
          </div>

          {/* Current Delay */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>Current Delay</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span
                className={`text-xl font-bold font-mono-telemetry ${
                  selectedTrain.currentDelayMinutes === 0
                    ? 'text-emerald-400'
                    : selectedTrain.currentDelayMinutes < 25
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                +{selectedTrain.currentDelayMinutes}
              </span>
              <span className="text-xs text-slate-400 font-mono-telemetry">mins</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">At last stop: {selectedTrain.lastPassedStation}</div>
          </div>

          {/* Traditional NTES Final Delay */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>Traditional NTES</span>
              <span className="text-[10px] text-slate-500 uppercase">Static</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold font-mono-telemetry text-slate-300">
                +{selectedTrain.traditionalForecastFinalDelayMinutes}
              </span>
              <span className="text-xs text-slate-500 font-mono-telemetry">mins</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Linear timetable recovery</div>
          </div>

          {/* Dynamic ML Forecast Final Delay */}
          <div className="bg-amber-950/30 border border-amber-800/60 p-3 rounded-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-amber-300 text-[11px] mb-1 font-medium">
              <span>Dynamic ML ETA</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40">
                ACTIVE
              </span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold font-mono-telemetry text-amber-300">
                +{selectedTrain.dynamicMLForecastFinalDelayMinutes}
              </span>
              <span className="text-xs text-amber-400 font-mono-telemetry">mins</span>
            </div>
            <div className="text-[10px] text-amber-400/80 font-mono-telemetry mt-1">
              Variance: +
              {selectedTrain.dynamicMLForecastFinalDelayMinutes -
                selectedTrain.traditionalForecastFinalDelayMinutes}
              m vs NTES
            </div>
          </div>

          {/* Block Section & Signal Aspect */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>Signal Aspect</span>
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  selectedTrain.currentBlockSection.signalAspect === 'GREEN'
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-500'
                    : selectedTrain.currentBlockSection.signalAspect === 'DOUBLE_YELLOW'
                    ? 'bg-amber-500 shadow-sm shadow-amber-500'
                    : selectedTrain.currentBlockSection.signalAspect === 'YELLOW'
                    ? 'bg-yellow-400 shadow-sm shadow-yellow-400'
                    : 'bg-red-500 shadow-sm shadow-red-500 animate-pulse'
                }`}
              ></div>
            </div>
            <div className="text-xs font-bold font-mono-telemetry mt-0.5">
              <span
                className={`px-2 py-0.5 rounded border text-[11px] ${getSignalColorClass(
                  selectedTrain.currentBlockSection.signalAspect
                )}`}
              >
                {selectedTrain.currentBlockSection.signalAspect.replace('_', ' ')}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 truncate">
              Headway: {selectedTrain.currentBlockSection.headwayDistanceKm} km
            </div>
          </div>

          {/* Weather Telemetry */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>Visibility / Fog</span>
              {selectedTrain.weather.condition === 'DENSE_FOG' ? (
                <CloudFog className="w-3.5 h-3.5 text-amber-400" />
              ) : selectedTrain.weather.condition === 'HEAVY_MONSOON' ? (
                <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-bold font-mono-telemetry text-slate-100">
                {selectedTrain.weather.visibilityMeters}
              </span>
              <span className="text-xs text-slate-500 font-mono-telemetry">meters</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {selectedTrain.weather.fogDeviceActive ? 'FogPass Device ON' : 'Normal Conditions'}
            </div>
          </div>
        </div>

        {/* Dynamic Track Block Section Visualizer */}
        <div className="mt-4 p-3 bg-slate-950/90 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center space-x-2">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Downstream Automatic Block Territory Visualizer</span>
            </span>
            <span className="text-[11px] font-mono-telemetry text-slate-400">
              Track Capacity Load: <strong className="text-amber-400">{selectedTrain.currentBlockSection.trackOccupancyPercent}%</strong>
            </span>
          </div>

          <div className="relative py-4 px-2">
            {/* Railway track rails */}
            <div className="relative h-6 bg-slate-900 rounded border-y-2 border-dashed border-slate-600 flex items-center">
              {/* Ties / Sleepers pattern */}
              <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(90deg,#94a3b8,#94a3b8_2px,transparent_2px,transparent_16px)]"></div>

              {/* Subject Train Marker */}
              <div
                className="absolute z-10 -top-2 flex flex-col items-center"
                style={{ left: '18%' }}
              >
                <div className="px-2 py-0.5 bg-amber-500 text-slate-950 font-mono-telemetry font-bold text-[10px] rounded shadow-lg flex items-center space-x-1">
                  <Train className="w-3 h-3" />
                  <span>#{selectedTrain.trainNumber}</span>
                </div>
                <div className="w-0.5 h-4 bg-amber-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-500/50 animate-ping"></div>
              </div>

              {/* Preceding Train Marker if exists */}
              {selectedTrain.currentBlockSection.precedingTrainId && (
                <div
                  className="absolute z-10 -top-2 flex flex-col items-center"
                  style={{ left: '56%' }}
                >
                  <div className="px-2 py-0.5 bg-slate-700 text-slate-200 font-mono-telemetry text-[10px] rounded border border-slate-600 truncate max-w-[170px]">
                    {selectedTrain.currentBlockSection.precedingTrainId}
                  </div>
                  <div className="w-0.5 h-4 bg-slate-500"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                </div>
              )}

              {/* Next Station Marker */}
              <div
                className="absolute z-10 -top-2 right-2 flex flex-col items-end"
              >
                <div className="px-2 py-0.5 bg-sky-950 text-sky-300 font-mono-telemetry font-bold text-[10px] rounded border border-sky-800">
                  {selectedTrain.nextStation} (Next Station)
                </div>
                <div className="w-0.5 h-4 bg-sky-500"></div>
                <div className="w-2 h-2 rounded-full bg-sky-400"></div>
              </div>
            </div>

            {/* Ground condition indicators below rails */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-1 border-t border-slate-800/80">
              <div className="flex items-center space-x-2">
                <span className="text-slate-500 font-mono-telemetry">KM {selectedTrain.currentKm}</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="text-slate-300 font-medium">
                  Headway to leading train: <strong className="text-amber-400">{selectedTrain.currentBlockSection.headwayDistanceKm} km</strong>
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {selectedTrain.speedRestrictions.length > 0 && (
                  <span className="text-red-400 flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Active TSR: {selectedTrain.speedRestrictions[0].imposedSpeedKmph} km/h (KM {selectedTrain.speedRestrictions[0].fromKm}-{selectedTrain.speedRestrictions[0].toKm})</span>
                  </span>
                )}
                <span className="text-slate-400">
                  Traction: <strong className="text-slate-200">{selectedTrain.currentBlockSection.tractionType.replace('_', ' ')}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. AI Insights Panel (when opened) */}
      {aiInsights && (
        <div className="bg-slate-900 border border-amber-500/50 rounded-xl p-5 shadow-xl shadow-amber-950/20 relative">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Gemini AI Centralized Traffic Control Operational Diagnosis
              </h3>
            </div>
            <button
              onClick={() => setAiInsights(null)}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800 cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
            {/* Root Cause & Summary */}
            <div className="space-y-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="font-semibold text-amber-300 mb-1">Executive Summary</div>
                <p className="text-slate-300 leading-relaxed">{aiInsights.summary}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="font-semibold text-sky-300 mb-1">Root-Cause Analysis (Why Static NTES Failed)</div>
                <p className="text-slate-300 leading-relaxed">{aiInsights.rootCauseAnalysis}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="font-semibold text-emerald-300 mb-1">Recommended Dispatch Precedence Action</div>
                <p className="text-slate-300 leading-relaxed">{aiInsights.recommendedPrecedenceAction}</p>
              </div>
            </div>

            {/* Controller Action & Announcements */}
            <div className="space-y-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="font-semibold text-amber-300 mb-2">Section Controller Directive Checklist</div>
                <ul className="space-y-1.5">
                  {aiInsights.controllerAdvisory.map((adv, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="font-semibold text-amber-400 mb-1 flex items-center space-x-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Public Station Audio Announcement (Bilingual Broadcast)</span>
                </div>
                <div className="mt-2 space-y-2 text-[11px]">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800/80 text-slate-200">
                    <span className="text-slate-400 font-semibold uppercase block text-[10px]">Hindi:</span>
                    {aiInsights.passengerAnnouncementHindi}
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800/80 text-slate-200">
                    <span className="text-slate-400 font-semibold uppercase block text-[10px]">English:</span>
                    {aiInsights.passengerAnnouncementEnglish}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Sub-Navigation & Operational Modules */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4">
          <button
            onClick={() => setActiveTabSub('stations')}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTabSub === 'stations'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Station-by-Station Dynamic ETA Forecast vs Static Schedule
          </button>

          <button
            onClick={() => setActiveTabSub('factors')}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTabSub === 'factors'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Delay Decomposition & Recovery Slacks
          </button>

          <button
            onClick={() => setActiveTabSub('disruptions')}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
              activeTabSub === 'disruptions'
                ? 'border-red-500 text-red-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>Interactive Disruption Simulator</span>
          </button>
        </div>

        {/* View A: Detailed Comparison Table */}
        {activeTabSub === 'stations' && (
          <div className="p-4 overflow-x-auto">
            <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
              <span>
                Comparing timetable schedule against traditional static NTES and real-time dynamic ML physics forecasting:
              </span>
              <span className="text-amber-400 font-mono-telemetry">
                90% Confidence Bounds Calculated
              </span>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Station</th>
                  <th className="py-2.5 px-2">Dist</th>
                  <th className="py-2.5 px-2">PF</th>
                  <th className="py-2.5 px-3">Timetable Arr</th>
                  <th className="py-2.5 px-3">Traditional NTES</th>
                  <th className="py-2.5 px-3 bg-amber-950/20 text-amber-300">Dynamic ML ETA</th>
                  <th className="py-2.5 px-3 bg-amber-950/20 text-amber-300">90% Window</th>
                  <th className="py-2.5 px-3">Variance vs Static</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-telemetry">
                {selectedTrain.stations.map((st) => {
                  const isPassed = st.status === 'DEPARTED';
                  const isCurrent = st.status === 'APPROACHING';

                  return (
                    <tr
                      key={st.code}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isCurrent
                          ? 'bg-amber-950/20 font-semibold'
                          : isPassed
                          ? 'opacity-60 bg-slate-950/40'
                          : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-sans font-semibold text-slate-100 flex items-center space-x-1.5">
                          <span>{st.name}</span>
                          <span className="text-[10px] text-amber-400 font-mono-telemetry">({st.code})</span>
                        </div>
                        <div className="font-sans text-[11px] text-slate-400">{st.hindiName}</div>
                      </td>

                      <td className="py-2.5 px-2 text-slate-400">{st.distanceKm} km</td>

                      <td className="py-2.5 px-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[10px]">
                          PF {st.platform}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-300">{st.scheduledArrival}</td>

                      <td className="py-2.5 px-3 text-slate-400">
                        {isPassed ? st.actualArrival : st.traditionalEta}
                        {!isPassed && (
                          <span className="ml-1 text-[10px] text-slate-500">
                            (+{st.delayMinutesTraditional}m)
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 font-bold text-amber-300 bg-amber-950/10">
                        {isPassed ? st.actualArrival : st.dynamicML_Eta}
                        {!isPassed && (
                          <span className="ml-1 text-[10px] text-amber-400">
                            (+{st.delayMinutesML}m)
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-sky-400 bg-amber-950/10 text-[11px]">
                        {isPassed ? 'Confirmed' : `${st.confidenceIntervalMin} - ${st.confidenceIntervalMax}`}
                      </td>

                      <td className="py-2.5 px-3">
                        {isPassed ? (
                          <span className="text-slate-500">—</span>
                        ) : st.varianceVsTraditional > 0 ? (
                          <span className="text-red-400 font-bold bg-red-950/40 px-1.5 py-0.5 rounded border border-red-900/60">
                            +{st.varianceVsTraditional}m under-reported
                          </span>
                        ) : st.varianceVsTraditional < 0 ? (
                          <span className="text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/60">
                            {st.varianceVsTraditional}m recovered
                          </span>
                        ) : (
                          <span className="text-slate-400">0m parity</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        {st.status === 'DEPARTED' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-slate-800 text-slate-400">
                            Departed
                          </span>
                        )}
                        {st.status === 'APPROACHING' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse">
                            Approaching
                          </span>
                        )}
                        {st.status === 'SCHEDULED' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-sans text-slate-500">
                            En Route
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* View B: Delay Factors & Recovery Decomposition */}
        {activeTabSub === 'factors' && (
          <div className="p-5">
            <h4 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-3">
              Sectional Delay Contribution Breakdown (Minutes Added / Recovered)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2.5">
                {selectedTrain.delayFactors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{factor.factor}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{factor.description}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Recovery Capability: {factor.recoverable ? 'Recoverable' : 'Unrecoverable Sectional Loss'}
                      </div>
                    </div>

                    <div
                      className={`text-sm font-mono-telemetry font-bold px-2.5 py-1 rounded border ${
                        factor.impactMinutes > 0
                          ? 'text-red-400 bg-red-950/40 border-red-900/60'
                          : 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60'
                      }`}
                    >
                      {factor.impactMinutes > 0 ? `+${factor.impactMinutes}m` : `${factor.impactMinutes}m`}
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Speed Restrictions (TSR) Box */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Active Caution Orders / TSRs on Path</span>
                  </span>
                  <span className="text-xs font-mono-telemetry text-amber-400">
                    {selectedTrain.speedRestrictions.length} Orders Active
                  </span>
                </div>

                {selectedTrain.speedRestrictions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded">
                    No active Temporary Speed Restrictions on current sectional block.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedTrain.speedRestrictions.map((tsr) => (
                      <div
                        key={tsr.id}
                        className="p-3 bg-slate-900 border border-slate-800 rounded flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-200">
                            {tsr.id} • KM {tsr.fromKm} - KM {tsr.toKm} ({tsr.lengthKm} km)
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Reason: {tsr.cause.replace('_', ' ')}
                          </div>
                        </div>

                        <div className="text-right font-mono-telemetry">
                          <div className="text-xs font-bold text-red-400">
                            Cap: {tsr.imposedSpeedKmph} km/h
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Loss: ~{tsr.delayImpactMinutes.toFixed(1)} mins
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View C: Interactive Real-Time Disruption Simulator */}
        {activeTabSub === 'disruptions' && (
          <div className="p-5 bg-slate-950/40">
            <div className="max-w-3xl">
              <h4 className="text-sm font-bold text-slate-200 flex items-center space-x-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Inject Ground Operational Disruptions in Real-Time</span>
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Test how the Dynamic ML forecasting engine instantly recalculates cascading station arrival times when sudden track events occur:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Simulation 1: TSR 30 km/h */}
                <button
                  disabled={isSimulating}
                  onClick={() =>
                    onSimulateDisruption({
                      trainNumber: selectedTrain.trainNumber,
                      disruptionType: 'TSR_IMPOSITION',
                      speedCapKmph: 30,
                    })
                  }
                  className="p-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500 rounded-lg text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                      Impose Emergency TSR (30 km/h)
                    </span>
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Simulates track fracture or urgent bridge renewal. Watch dynamic delay ripple across upcoming stops.
                  </p>
                </button>

                {/* Simulation 2: Signal Aspect Red Dropout */}
                <button
                  disabled={isSimulating}
                  onClick={() =>
                    onSimulateDisruption({
                      trainNumber: selectedTrain.trainNumber,
                      disruptionType: 'SIGNAL_FAILURE',
                    })
                  }
                  className="p-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-red-500 rounded-lg text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-300 group-hover:text-red-200">
                      Signal Aspect Dropout (RED Halting)
                    </span>
                    <Play className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Forces train halt to 0 km/h due to track circuit drop, adding immediate 18m buffer.
                  </p>
                </button>

                {/* Simulation 3: Dense Winter Fog */}
                <button
                  disabled={isSimulating}
                  onClick={() =>
                    onSimulateDisruption({
                      trainNumber: selectedTrain.trainNumber,
                      disruptionType: 'DENSE_FOG',
                    })
                  }
                  className="p-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500 rounded-lg text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-300 group-hover:text-sky-200">
                      Dense Winter Fog Wave (Vis &lt;150m)
                    </span>
                    <Play className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enforces 60 km/h fog safety cap over Northern Railway territory with Fog Pass Device.
                  </p>
                </button>

                {/* Simulation 4: Preceding Freight Stall */}
                <button
                  disabled={isSimulating}
                  onClick={() =>
                    onSimulateDisruption({
                      trainNumber: selectedTrain.trainNumber,
                      disruptionType: 'PRECEDING_FREIGHT_STALL',
                    })
                  }
                  className="p-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-yellow-500 rounded-lg text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-yellow-300 group-hover:text-yellow-200">
                      Preceding Freight Train Stalled
                    </span>
                    <Play className="w-3.5 h-3.5 text-yellow-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Heavy coal rake stalls on down line; train forced to crawl on yellow aspects with +24m delay.
                  </p>
                </button>
              </div>

              {/* Reset / Clear All button */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  disabled={isSimulating}
                  onClick={() =>
                    onSimulateDisruption({
                      trainNumber: selectedTrain.trainNumber,
                      disruptionType: 'CLEAR_ALL',
                    })
                  }
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Normal Line Speed & Clear Incidents</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
