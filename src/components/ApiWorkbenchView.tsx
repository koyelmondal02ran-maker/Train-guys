import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Zap,
  Sliders,
  Code2,
  Send,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ApiWorkbenchView: React.FC = () => {
  // Simulator state
  const [currentSpeed, setCurrentSpeed] = useState<number>(105);
  const [currentDelay, setCurrentDelay] = useState<number>(25);
  const [distanceRemaining, setDistanceRemaining] = useState<number>(420);
  const [weatherCondition, setWeatherCondition] = useState<'CLEAR' | 'DENSE_FOG' | 'HEAVY_MONSOON'>('CLEAR');
  const [activeTSRCount, setActiveTSRCount] = useState<number>(1);
  const [precedingHeadwayKm, setPrecedingHeadwayKm] = useState<number>(4.2);
  const [mps, setMps] = useState<number>(130);

  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);

  // API Explorer state
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET /api/trains');
  const [apiResponse, setApiResponse] = useState<string>('Click "Send Request" to invoke live endpoint...');
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const runPrediction = async () => {
    setIsPredicting(true);
    try {
      const res = await fetch('/api/predict-eta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSpeed,
          currentDelay,
          distanceRemaining,
          weatherCondition,
          activeTSRCount,
          precedingHeadwayKm,
          mps,
        }),
      });
      const data = await res.json();
      setPredictionResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPredicting(false);
    }
  };

  const executeEndpoint = async (ep: string) => {
    setApiLoading(true);
    try {
      let res;
      if (ep === 'GET /api/trains') {
        res = await fetch('/api/trains');
      } else if (ep === 'GET /api/trains/12302') {
        res = await fetch('/api/trains/12302');
      } else if (ep === 'GET /api/stations/CNB/display') {
        res = await fetch('/api/stations/CNB/display');
      } else if (ep === 'GET /api/metrics') {
        res = await fetch('/api/metrics');
      } else if (ep === 'POST /api/predict-eta') {
        res = await fetch('/api/predict-eta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentSpeed: 110,
            currentDelay: 20,
            distanceRemaining: 350,
            weatherCondition: 'DENSE_FOG',
            activeTSRCount: 1,
            precedingHeadwayKm: 3.5,
          }),
        });
      } else if (ep === 'POST /api/simulate-event') {
        res = await fetch('/api/simulate-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trainNumber: '12302',
            disruptionType: 'TSR_IMPOSITION',
            speedCapKmph: 30,
          }),
        });
      } else if (ep === 'DELETE /api/trains') {
        res = await fetch('/api/trains', { method: 'DELETE' });
      } else if (ep === 'POST /api/trains/restore-sample') {
        res = await fetch('/api/trains/restore-sample', { method: 'POST' });
      }

      if (res) {
        const json = await res.json();
        setApiResponse(JSON.stringify(json, null, 2));
      }
    } catch (e: any) {
      setApiResponse(JSON.stringify({ error: e.message }, null, 2));
    } finally {
      setApiLoading(false);
    }
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(apiResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Interactive Dynamic ML Inference Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Dynamic ETA Mathematical Inference Sandbox
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate complex multi-variable delay propagation across speed restrictions, headways, and weather
            </p>
          </div>

          <button
            onClick={runPrediction}
            disabled={isPredicting}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isPredicting ? 'Inferring...' : 'Compute Dynamic ETA'}</span>
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-xs">
          {/* Current Speed */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Current Speed:</span>
              <strong className="font-mono-telemetry text-amber-400">{currentSpeed} km/h</strong>
            </div>
            <input
              type="range"
              min="0"
              max="160"
              value={currentSpeed}
              onChange={(e) => setCurrentSpeed(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500 mt-1">Locomotive GPS feed</div>
          </div>

          {/* Current Delay */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Current Delay:</span>
              <strong className="font-mono-telemetry text-amber-400">+{currentDelay} mins</strong>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              value={currentDelay}
              onChange={(e) => setCurrentDelay(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500 mt-1">Lateness at last passed station</div>
          </div>

          {/* Distance Remaining */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Remaining Distance:</span>
              <strong className="font-mono-telemetry text-amber-400">{distanceRemaining} km</strong>
            </div>
            <input
              type="range"
              min="50"
              max="1500"
              step="25"
              value={distanceRemaining}
              onChange={(e) => setDistanceRemaining(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500 mt-1">Downstream section length</div>
          </div>

          {/* Active Caution Orders (TSR) */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Active TSR Slow Orders:</span>
              <strong className="font-mono-telemetry text-amber-400">{activeTSRCount}</strong>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              value={activeTSRCount}
              onChange={(e) => setActiveTSRCount(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500 mt-1">30 km/h bridge or track renewals</div>
          </div>

          {/* Headway Distance */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Preceding Train Headway:</span>
              <strong className="font-mono-telemetry text-amber-400">{precedingHeadwayKm} km</strong>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={precedingHeadwayKm}
              onChange={(e) => setPrecedingHeadwayKm(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500 mt-1">&lt;3 km triggers yellow aspect crawl</div>
          </div>

          {/* Weather Condition */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <label className="text-slate-300 mb-1 block">Weather / Visibility:</label>
            <select
              value={weatherCondition}
              onChange={(e) => setWeatherCondition(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-1.5 focus:outline-none"
            >
              <option value="CLEAR">Clear Weather (Normal)</option>
              <option value="DENSE_FOG">Dense Winter Fog (Max 60 km/h)</option>
              <option value="HEAVY_MONSOON">Heavy Monsoon Caution</option>
            </select>
            <div className="text-[10px] text-slate-500 mt-1">Atmospheric speed caps</div>
          </div>

          {/* Permissible Track Speed */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Section MPS:</span>
              <strong className="font-mono-telemetry text-amber-400">{mps} km/h</strong>
            </div>
            <input
              type="range"
              min="100"
              max="160"
              step="5"
              value={mps}
              onChange={(e) => setMps(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500 mt-1">Route classification limit</div>
          </div>
        </div>

        {/* Prediction Results Banner */}
        {predictionResult && (
          <div className="mt-5 p-4 bg-slate-950 rounded-xl border border-amber-500/40">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-800 text-center">
              <div>
                <div className="text-xs uppercase text-slate-400">Traditional NTES Static Delay</div>
                <div className="text-2xl font-bold font-mono-telemetry text-slate-300 mt-1">
                  +{predictionResult.prediction.traditionalArrivalDelayMinutes}m
                </div>
                <div className="text-[10px] text-slate-500">Assumes static linear schedule</div>
              </div>

              <div className="bg-amber-950/40 p-2 rounded-lg border border-amber-700/50">
                <div className="text-xs uppercase text-amber-300 font-semibold">
                  Dynamic ML Predicted Arrival Delay
                </div>
                <div className="text-2xl font-bold font-mono-telemetry text-amber-300 mt-1">
                  +{predictionResult.prediction.dynamicMLArrivalDelayMinutes}m
                </div>
                <div className="text-[10px] text-amber-400">
                  Confidence: {predictionResult.prediction.confidenceWindowMinutes}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase text-slate-400">NTES Under-Reporting Error</div>
                <div className="text-2xl font-bold font-mono-telemetry text-red-400 mt-1">
                  +{predictionResult.prediction.varianceMinutes} mins
                </div>
                <div className="text-[10px] text-slate-500">Hidden ground delay revealed</div>
              </div>
            </div>

            {/* Delay Component Math Breakdown */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-telemetry">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400">TSR Slow Orders</div>
                <div className="text-red-400 font-bold">
                  +{predictionResult.prediction.factorsBreakdown.tsrDelayMinutes}m
                </div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400">Fog / Weather Cap</div>
                <div className="text-red-400 font-bold">
                  +{predictionResult.prediction.factorsBreakdown.weatherDelayMinutes}m
                </div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400">Headway Impedance</div>
                <div className="text-yellow-400 font-bold">
                  +{predictionResult.prediction.factorsBreakdown.headwayBlockDelayMinutes}m
                </div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400">High-Speed Recovery Slack</div>
                <div className="text-emerald-400 font-bold">
                  {predictionResult.prediction.factorsBreakdown.openLineRecoveryCreditMinutes}m
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Interactive REST API Workbench for Integrators */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-sky-400" />
              <h3 className="text-base font-bold text-white">
                Live REST API Documentation & Testbed
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Production endpoints for mobile apps, station PIDS displays, and dispatch control rooms
            </p>
          </div>

          <span className="text-[11px] font-mono-telemetry text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
            HTTP 200 Ready • Fullstack Express
          </span>
        </div>

        {/* Endpoint Selector Tabs */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            'GET /api/trains',
            'GET /api/trains/12302',
            'GET /api/stations/CNB/display',
            'POST /api/predict-eta',
            'POST /api/simulate-event',
            'GET /api/metrics',
            'DELETE /api/trains',
            'POST /api/trains/restore-sample',
          ].map((ep) => (
            <button
              key={ep}
              onClick={() => {
                setSelectedEndpoint(ep);
                executeEndpoint(ep);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-telemetry transition-colors cursor-pointer border ${
                selectedEndpoint === ep
                  ? 'bg-sky-950 border-sky-500 text-sky-200 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {ep}
            </button>
          ))}
        </div>

        {/* Request Execution Bar */}
        <div className="mt-4 flex items-center space-x-2">
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono-telemetry text-slate-200 flex items-center space-x-2">
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                selectedEndpoint.startsWith('GET')
                  ? 'bg-sky-900 text-sky-200'
                  : 'bg-emerald-900 text-emerald-200'
              }`}
            >
              {selectedEndpoint.split(' ')[0]}
            </span>
            <span className="text-slate-300">{selectedEndpoint.split(' ')[1]}</span>
          </div>

          <button
            onClick={() => executeEndpoint(selectedEndpoint)}
            disabled={apiLoading}
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer disabled:opacity-50 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{apiLoading ? 'Calling...' : 'Send Request'}</span>
          </button>
        </div>

        {/* Live JSON Response Viewer */}
        <div className="mt-4 relative">
          <div className="flex items-center justify-between bg-slate-950 px-3 py-1.5 border-t border-x border-slate-800 rounded-t-lg text-xs text-slate-400">
            <span className="font-mono-telemetry text-[11px]">Response Payload (application/json)</span>
            <button
              onClick={copyResponse}
              className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>

          <pre className="bg-black border border-slate-800 rounded-b-lg p-3 font-mono-telemetry text-xs text-amber-300 max-h-80 overflow-y-auto leading-relaxed">
            {apiResponse}
          </pre>
        </div>
      </div>
    </div>
  );
};
