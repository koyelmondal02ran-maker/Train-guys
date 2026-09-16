import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Monitor, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

interface StationTrainItem {
  trainNumber: string;
  trainName: string;
  hindiName: string;
  origin: { code: string; name: string };
  destination: { code: string; name: string };
  scheduledTime: string;
  traditionalEta: string;
  dynamicMLEta: string;
  confidenceInterval: string;
  delayMinutesTraditional: number;
  delayMinutesML: number;
  platform: string;
  status: string;
  varianceMinutes: number;
  locoClass: string;
  zone: string;
}

interface StationDisplayData {
  stationCode: string;
  stationName: string;
  currentTime: string;
  trains: StationTrainItem[];
}

interface StationDisplayViewProps {
  initialStationCode?: string;
}

export const StationDisplayView: React.FC<StationDisplayViewProps> = ({
  initialStationCode = 'CNB',
}) => {
  const [stationCode, setStationCode] = useState(initialStationCode);
  const [displayData, setDisplayData] = useState<StationDisplayData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [displayTheme, setDisplayTheme] = useState<'amber-led' | 'blue-modern'>('amber-led');

  const STATIONS = [
    { code: 'CNB', name: 'Kanpur Central (कानपुर सेंट्रल)' },
    { code: 'NDLS', name: 'New Delhi (नई दिल्ली)' },
    { code: 'PRYJ', name: 'Prayagraj Junction (प्रयागराज)' },
    { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya (पं. दीन दयाल)' },
    { code: 'HWH', name: 'Howrah Junction (हावड़ा)' },
    { code: 'BSB', name: 'Varanasi Junction (वाराणसी)' },
    { code: 'MMCT', name: 'Mumbai Central (मुंबई सेंट्रल)' },
  ];

  const fetchDisplayData = async (code: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stations/${code}/display`);
      const data = await res.json();
      if (data.displayData) {
        setDisplayData(data.displayData);
      }
    } catch (e) {
      console.error('Error fetching station display data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisplayData(stationCode);
    const interval = setInterval(() => fetchDisplayData(stationCode), 8000);
    return () => clearInterval(interval);
  }, [stationCode]);

  // Authentic Indian Railways Chime using Web Audio API
  const playRailwayChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

        gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      };

      // Traditional 3-note IR chime: G4 -> C5 -> E5
      playTone(392.0, 0.0, 0.6);
      playTone(523.25, 0.4, 0.7);
      playTone(659.25, 0.8, 1.1);

      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 2000);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Station Selector & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase font-semibold text-slate-400">
              National Train Enquiry System (NTES)
            </div>
            <div className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Passenger Information Display System (PIDS)</span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                LIVE TERMINAL
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Station Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-400">Station:</label>
            <select
              value={stationCode}
              onChange={(e) => setStationCode(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:border-amber-500 focus:outline-none cursor-pointer"
            >
              {STATIONS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Theme selector */}
          <div className="flex items-center space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setDisplayTheme('amber-led')}
              className={`px-2.5 py-1 rounded cursor-pointer ${
                displayTheme === 'amber-led'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Amber LED
            </button>
            <button
              onClick={() => setDisplayTheme('blue-modern')}
              className={`px-2.5 py-1 rounded cursor-pointer ${
                displayTheme === 'blue-modern'
                  ? 'bg-sky-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Modern LCD
            </button>
          </div>

          {/* Audio Chime Button */}
          <button
            onClick={playRailwayChime}
            disabled={isPlayingAudio}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 cursor-pointer transition-colors"
          >
            <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce text-amber-300' : ''}`} />
            <span>{isPlayingAudio ? 'Chime Playing...' : 'Station Chime'}</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={() => fetchDisplayData(stationCode)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 cursor-pointer"
            title="Refresh Display Feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Authentic Station LED/LCD Display Board */}
      <div
        className={`rounded-2xl border-4 p-4 md:p-6 shadow-2xl overflow-hidden transition-all ${
          displayTheme === 'amber-led'
            ? 'bg-black border-amber-900/60 shadow-amber-950/40 text-amber-400'
            : 'bg-slate-950 border-slate-700 shadow-slate-950/80 text-sky-200'
        }`}
      >
        {/* Top Header Bar of Station Display */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-between pb-3 border-b-2 gap-2 ${
            displayTheme === 'amber-led'
              ? 'border-amber-800/80'
              : 'border-sky-900/80'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full animate-ping ${
                displayTheme === 'amber-led' ? 'bg-amber-400' : 'bg-sky-400'
              }`}
            ></div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-widest font-display-board uppercase">
                {displayData?.stationName || stationCode}
              </h2>
              <div className="text-xs tracking-wider opacity-80 uppercase">
                Dynamic Train Arrival / Departure Information System
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs uppercase opacity-70">CURRENT TIME</div>
              <div className="text-xl md:text-2xl font-bold font-mono-telemetry tracking-widest">
                {displayData?.currentTime || '23:00:12'}
              </div>
            </div>
          </div>
        </div>

        {/* Live Train Display Board Grid */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`text-xs md:text-sm uppercase font-bold tracking-wider border-b ${
                  displayTheme === 'amber-led'
                    ? 'border-amber-800 text-amber-300 bg-amber-950/20'
                    : 'border-sky-800 text-sky-300 bg-sky-950/30'
                }`}
              >
                <th className="py-3 px-3">Train No.</th>
                <th className="py-3 px-3">Train Name / गाड़ी का नाम</th>
                <th className="py-3 px-2">From → To</th>
                <th className="py-3 px-3 text-center">PF No.</th>
                <th className="py-3 px-3">Sched. Time</th>
                <th className="py-3 px-3 font-extrabold text-amber-300">
                  <span className="flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Dynamic ML ETA</span>
                  </span>
                </th>
                <th className="py-3 px-3">Traditional NTES</th>
                <th className="py-3 px-3 text-right">Status / विलंब स्थिति</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-amber-900/30 font-display-board text-sm md:text-base">
              {displayData?.trains && displayData.trains.length > 0 ? (
                displayData.trains.map((train) => {
                  const isArrived = train.status === 'ARRIVED';
                  const isDeparted = train.status === 'DEPARTED';
                  const isApproaching = train.status === 'APPROACHING';

                  return (
                    <tr
                      key={train.trainNumber}
                      className={`hover:bg-amber-950/30 transition-colors ${
                        isApproaching ? 'bg-amber-950/20 animate-glow' : ''
                      }`}
                    >
                      {/* Train Number */}
                      <td className="py-3.5 px-3 font-bold font-mono-telemetry tracking-wider">
                        {train.trainNumber}
                      </td>

                      {/* Train Name (Bilingual) */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold tracking-wide">{train.trainName}</div>
                        <div className="text-xs opacity-80 font-sans">{train.hindiName}</div>
                      </td>

                      {/* Origin -> Destination */}
                      <td className="py-3.5 px-2 text-xs font-mono-telemetry opacity-90">
                        {train.origin.code} → {train.destination.code}
                      </td>

                      {/* Platform */}
                      <td className="py-3.5 px-3 text-center font-bold text-lg">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded border ${
                            displayTheme === 'amber-led'
                              ? 'bg-amber-950/60 border-amber-600 text-amber-300'
                              : 'bg-sky-900/60 border-sky-600 text-sky-100'
                          }`}
                        >
                          {train.platform}
                        </span>
                      </td>

                      {/* Scheduled Time */}
                      <td className="py-3.5 px-3 font-mono-telemetry opacity-80">
                        {train.scheduledTime}
                      </td>

                      {/* Dynamic ML Forecast */}
                      <td className="py-3.5 px-3 font-mono-telemetry font-extrabold text-base md:text-lg text-amber-300">
                        {train.dynamicMLEta}
                        <div className="text-[10px] font-sans opacity-70">
                          {train.confidenceInterval}
                        </div>
                      </td>

                      {/* Traditional NTES */}
                      <td className="py-3.5 px-3 font-mono-telemetry opacity-70 text-sm">
                        {train.traditionalEta}
                        {train.delayMinutesTraditional > 0 && (
                          <div className="text-[10px]">
                            (+{train.delayMinutesTraditional}m static)
                          </div>
                        )}
                      </td>

                      {/* Status / Delay Tag */}
                      <td className="py-3.5 px-3 text-right">
                        {isDeparted ? (
                          <span className="px-2 py-0.5 rounded text-xs uppercase bg-slate-800 text-slate-400">
                            DEPARTED
                          </span>
                        ) : isApproaching ? (
                          <span className="px-2.5 py-1 rounded text-xs font-bold uppercase bg-amber-500 text-black animate-pulse">
                            ARRIVING / आगमन
                          </span>
                        ) : train.delayMinutesML === 0 ? (
                          <span className="px-2 py-0.5 rounded text-xs uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                            RIGHT TIME / समय पर
                          </span>
                        ) : (
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded text-xs uppercase font-bold bg-red-950/90 text-red-400 border border-red-800">
                              LATE +{train.delayMinutesML}M
                            </span>
                            {train.varianceMinutes > 0 && (
                              <div className="text-[10px] text-amber-400/90 mt-0.5">
                                +{train.varianceMinutes}m beyond static NTES
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm opacity-60">
                    No coaching trains scheduled on active display radar for {stationCode}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* LED Footer Ticker / Ground Operational Advisory */}
        <div
          className={`mt-4 pt-3 border-t text-xs flex flex-col sm:flex-row items-center justify-between gap-2 opacity-80 ${
            displayTheme === 'amber-led' ? 'border-amber-900/60' : 'border-sky-900/60'
          }`}
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="font-sans">
              Dynamic ETAs computed via real-time sectional block sensors, caution orders, and headway analytics.
            </span>
          </div>
          <div className="font-mono-telemetry text-[11px]">
            INDIAN RAILWAYS CENTRE FOR RAILWAY INFORMATION SYSTEMS (CRIS)
          </div>
        </div>
      </div>
    </div>
  );
};
