import React, { useState } from 'react';
import { TrainJourney, StationStop } from '../types';
import {
  Train,
  Clock,
  MapPin,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Info,
  CheckCircle,
  Navigation,
  ChevronRight,
  ShieldCheck,
  Zap,
  Plus,
  RotateCcw,
  Upload,
} from 'lucide-react';

interface PassengerTrackerViewProps {
  trains: TrainJourney[];
  selectedTrain: TrainJourney | null;
  onSelectTrain: (train: TrainJourney) => void;
  onOpenAddTrain?: () => void;
  onRestoreSampleTrains?: () => void;
  onOpenUploadData?: () => void;
}

export const PassengerTrackerView: React.FC<PassengerTrackerViewProps> = ({
  trains,
  selectedTrain,
  onSelectTrain,
  onOpenAddTrain,
  onRestoreSampleTrains,
  onOpenUploadData,
}) => {
  const [selectedStationCode, setSelectedStationCode] = useState<string>(
    selectedTrain ? selectedTrain.nextStation || selectedTrain.stations[selectedTrain.stations.length - 1].code : ''
  );

  if (!selectedTrain || trains.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400">
          <Train className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">No Active Train Selected</h3>
          <p className="text-xs text-slate-400">
            Coaching roster is currently empty. Upload real authentic train data or add custom journeys to track dynamic arrival estimates.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onOpenUploadData && (
            <button
              onClick={onOpenUploadData}
              className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center space-x-1.5 cursor-pointer font-bold"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Real Data</span>
            </button>
          )}
          {onOpenAddTrain && (
            <button
              onClick={onOpenAddTrain}
              className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add Train</span>
            </button>
          )}
          {onRestoreSampleTrains && (
            <button
              onClick={onRestoreSampleTrains}
              className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-sky-400" />
              <span>Restore Samples</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const targetStation =
    selectedTrain.stations.find((s) => s.code === selectedStationCode) ||
    selectedTrain.stations[selectedTrain.stations.length - 1];

  const varianceVsTimetable = targetStation.delayMinutesML;
  const varianceVsTraditional = targetStation.varianceVsTraditional;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Mobile Phone Style Journey Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Train Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Train className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono-telemetry font-bold text-base text-amber-400">
                  #{selectedTrain.trainNumber}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                  {selectedTrain.type.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {selectedTrain.trainName}
              </h2>
              <div className="text-xs text-slate-400 font-medium">
                {selectedTrain.hindiName}
              </div>
            </div>
          </div>

          {/* Train Selector Dropdown for passenger */}
          <div>
            <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Select Train:
            </label>
            <select
              value={selectedTrain.trainNumber}
              onChange={(e) => {
                const found = trains.find((t) => t.trainNumber === e.target.value);
                if (found) onSelectTrain(found);
              }}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none w-full sm:w-auto cursor-pointer"
            >
              {trains.map((t) => (
                <option key={t.trainNumber} value={t.trainNumber}>
                  #{t.trainNumber} {t.trainName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic ETA Hero Card */}
        <div className="mt-5 p-4 sm:p-5 bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl border border-amber-500/30 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider flex items-center space-x-1.5 mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>DYNAMIC FORECAST ARRIVAL AT:</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-white font-mono-telemetry">
                  {targetStation.dynamicML_Eta}
                </h3>
                <span className="text-xs text-slate-400">
                  (Timetable: {targetStation.scheduledArrival})
                </span>
              </div>
              <div className="text-xs text-sky-400 font-mono-telemetry mt-1">
                90% Confidence Arrival Window: {targetStation.confidenceIntervalMin} - {targetStation.confidenceIntervalMax}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs uppercase text-slate-400">Target Station</div>
              <div className="text-lg font-bold text-amber-300">
                {targetStation.name} ({targetStation.code})
              </div>
              <div className="text-xs font-semibold text-slate-300 mt-0.5">
                Expected Platform Berth: <span className="text-white px-2 py-0.5 bg-slate-800 rounded border border-slate-700">PF {targetStation.platform}</span>
              </div>
            </div>
          </div>

          {/* Variance warning vs Traditional NTES */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-2">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span>
                Traditional NTES says{' '}
                <strong className="text-slate-100">{targetStation.traditionalEta}</strong>. Dynamic prediction adds{' '}
                <strong className="text-amber-400">+{varianceVsTraditional} mins</strong> based on live track block conditions.
              </span>
            </div>
            <span className="font-mono-telemetry text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              High Accuracy Ground-Truth Model
            </span>
          </div>
        </div>

        {/* "Why is my train delayed?" Transparency Breakdown */}
        <div className="mt-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Why is this train delayed? Real Ground Realities</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedTrain.delayFactors.map((df, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs"
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-200">{df.factor}</span>
                  <span
                    className={`font-mono-telemetry ${
                      df.impactMinutes > 0 ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {df.impactMinutes > 0 ? `+${df.impactMinutes}m` : `${df.impactMinutes}m`}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{df.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Station Progression Timeline */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Route Progression & Upcoming Stop Forecasts</span>
            </h4>
            <span className="text-[11px] text-slate-400">Click any station to set target</span>
          </div>

          <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {selectedTrain.stations.map((st, idx) => {
              const isSelectedTarget = st.code === selectedStationCode;
              const isDeparted = st.status === 'DEPARTED';
              const isApproaching = st.status === 'APPROACHING';

              return (
                <div
                  key={st.code}
                  onClick={() => setSelectedStationCode(st.code)}
                  className={`relative cursor-pointer group transition-all ${
                    isSelectedTarget
                      ? 'p-3 rounded-xl bg-slate-800/80 border border-amber-500 shadow-md'
                      : 'p-2 rounded-lg hover:bg-slate-800/40'
                  }`}
                >
                  {/* Timeline circle node */}
                  <div
                    className={`absolute -left-[18px] top-3.5 w-4 h-4 rounded-full border-2 transition-all ${
                      isDeparted
                        ? 'bg-emerald-500 border-emerald-400'
                        : isApproaching
                        ? 'bg-amber-400 border-amber-300 ring-4 ring-amber-500/20 animate-pulse'
                        : isSelectedTarget
                        ? 'bg-sky-400 border-sky-300'
                        : 'bg-slate-900 border-slate-600 group-hover:border-slate-400'
                    }`}
                  ></div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{st.name}</span>
                        <span className="text-xs font-mono-telemetry text-amber-400">({st.code})</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          PF {st.platform}
                        </span>
                        {isApproaching && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase animate-pulse">
                            Next Stop
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {st.distanceKm} km from origin • Halt: {st.haltMinutes} min
                      </div>
                    </div>

                    <div className="text-left sm:text-right font-mono-telemetry text-xs">
                      <div className="flex items-center sm:justify-end space-x-2">
                        <span className="text-slate-400">Sched: {st.scheduledArrival}</span>
                        <span className="text-slate-600">→</span>
                        <span className="font-bold text-amber-300 text-sm">
                          {isDeparted ? st.actualArrival : st.dynamicML_Eta}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {isDeparted
                          ? 'Departed'
                          : `90% Window: ${st.confidenceIntervalMin} - ${st.confidenceIntervalMax}`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coach Composition Guide */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="text-xs uppercase font-semibold text-slate-400 mb-2">
            Rake Coach Composition & Formation (From Engine)
          </div>
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 text-[11px] font-mono-telemetry">
            <span className="px-2 py-1 rounded bg-red-950 text-red-300 border border-red-800 font-bold">
              LOCO
            </span>
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              EOG
            </span>
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              H1
            </span>
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              A1
            </span>
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              A2
            </span>
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              B1
            </span>
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              B2
            </span>
            <span className="px-2 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800 font-semibold">
              PC (Pantry)
            </span>
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              B3
            </span>
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              B4
            </span>
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              B5
            </span>
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              EOG
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
