import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ControlRoomView } from './components/ControlRoomView';
import { StationDisplayView } from './components/StationDisplayView';
import { PassengerTrackerView } from './components/PassengerTrackerView';
import { ApiWorkbenchView } from './components/ApiWorkbenchView';
import { AddTrainModal } from './components/AddTrainModal';
import { RealtimeGatewayModal } from './components/RealtimeGatewayModal';
import { UploadDataModal } from './components/UploadDataModal';
import { TrainJourney, DisruptionSimulationPayload, RTISTelemetryStatus, RealtimeStreamEvent } from './types';
import { getMasterTrains } from './services/mockRailwayDb';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'control-room' | 'station-pids' | 'passenger-tracker' | 'api-workbench'
  >('control-room');

  const [trains, setTrains] = useState<TrainJourney[]>([]);
  const [selectedTrain, setSelectedTrain] = useState<TrainJourney | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [punctualityRate, setPunctualityRate] = useState(100);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRealtimeModalOpen, setIsRealtimeModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [rtisStatus, setRtisStatus] = useState<RTISTelemetryStatus | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  const selectedTrainRef = useRef<TrainJourney | null>(null);
  selectedTrainRef.current = selectedTrain;

  const fetchTrains = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/trains');
      if (res.ok) {
        const data = await res.json();
        const trainList: TrainJourney[] = data.trains || [];
        setTrains(trainList);

        if (trainList.length > 0) {
          setSelectedTrain((prev) => {
            if (!prev) return trainList[0];
            const updated = trainList.find((t) => t.trainNumber === prev.trainNumber);
            return updated || trainList[0];
          });
        } else {
          setSelectedTrain(null);
        }
      } else {
        const fallback = getMasterTrains();
        setTrains(fallback);
        setSelectedTrain(fallback.length > 0 ? fallback[0] : null);
      }

      const metricsRes = await fetch('/api/metrics');
      if (metricsRes.ok) {
        const mData = await metricsRes.json();
        if (mData.punctualityRatePercent !== undefined) {
          setPunctualityRate(mData.punctualityRatePercent);
        }
      }

      const rtisRes = await fetch('/api/rtis/status');
      if (rtisRes.ok) {
        const rData = await rtisRes.json();
        if (rData.rtis) {
          setRtisStatus(rData.rtis);
          setIsLiveStreaming(rData.rtis.isLiveStreaming);
        }
      }
    } catch (e) {
      console.warn('Backend fetch failed, using local service fallback:', e);
      const fallback = getMasterTrains();
      setTrains(fallback);
      setSelectedTrain(fallback.length > 0 ? fallback[0] : null);
    } finally {
      setIsRefreshing(false);
    }
  };

  // -------------------------------------------------------------
  // Real-Time Server-Sent Events (SSE) Stream Integration
  // -------------------------------------------------------------
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/stream');

      eventSource.onmessage = (event) => {
        try {
          const payload: RealtimeStreamEvent = JSON.parse(event.data);

          if (payload.rtisStatus) {
            setRtisStatus(payload.rtisStatus);
            setIsLiveStreaming(payload.rtisStatus.isLiveStreaming);
          }

          if (payload.trains) {
            const list = payload.trains;
            setTrains(list);

            if (list.length > 0) {
              const currentSel = selectedTrainRef.current;
              if (!currentSel) {
                setSelectedTrain(list[0]);
              } else {
                const match = list.find((t) => t.trainNumber === currentSel.trainNumber);
                setSelectedTrain(match || list[0]);
              }
            } else {
              setSelectedTrain(null);
            }
          }
        } catch (err) {
          console.error('Failed to parse incoming SSE packet:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.warn('SSE stream connection issue, falling back to interval polling:', err);
      };
    } catch (err) {
      console.warn('EventSource initialization failed:', err);
    }

    // Initial fetch
    fetchTrains();

    // Secondary backup interval in case SSE drops
    const backupInterval = setInterval(fetchTrains, 15000);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(backupInterval);
    };
  }, []);

  const handleSimulateDisruption = async (payload: DisruptionSimulationPayload) => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/simulate-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchTrains();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDeleteTrain = async (trainNumber: string) => {
    try {
      const res = await fetch(`/api/trains/${trainNumber}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchTrains();
      }
    } catch (e) {
      console.error('Failed to delete train:', e);
    }
  };

  const handleClearAllTrains = async () => {
    try {
      const res = await fetch('/api/trains', {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchTrains();
      }
    } catch (e) {
      console.error('Failed to clear all trains:', e);
    }
  };

  const handleAddTrain = async (newTrain: TrainJourney) => {
    try {
      const res = await fetch('/api/trains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrain),
      });
      if (res.ok) {
        await fetchTrains();
        setSelectedTrain(newTrain);
      }
    } catch (e) {
      console.error('Failed to add train:', e);
    }
  };

  const handleRestoreSample = async () => {
    try {
      const res = await fetch('/api/trains/restore-sample', {
        method: 'POST',
      });
      if (res.ok) {
        await fetchTrains();
      }
    } catch (e) {
      console.error('Failed to restore sample trains:', e);
    }
  };

  const handleToggleStream = async (active: boolean) => {
    try {
      const res = await fetch('/api/rtis/toggle-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });
      if (res.ok) {
        setIsLiveStreaming(active);
        if (rtisStatus) {
          setRtisStatus({ ...rtisStatus, isLiveStreaming: active });
        }
      }
    } catch (e) {
      console.error('Failed to toggle stream:', e);
    }
  };

  const handleIngestPacket = async (packet: any) => {
    try {
      const res = await fetch('/api/telemetry/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packet),
      });
      if (res.ok) {
        await fetchTrains();
      }
    } catch (e) {
      console.error('Failed to ingest live packet:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        trainCount={trains.length}
        punctualityRate={punctualityRate}
        onRefresh={fetchTrains}
        isRefreshing={isRefreshing}
        onOpenAddTrain={() => setIsAddModalOpen(true)}
        onClearAll={handleClearAllTrains}
        onRestoreSample={handleRestoreSample}
        onOpenRealtimeModal={() => setIsRealtimeModalOpen(true)}
        onOpenUploadData={() => setIsUploadModalOpen(true)}
        rtisStatus={rtisStatus}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'control-room' && (
          <ControlRoomView
            trains={trains}
            selectedTrain={selectedTrain}
            onSelectTrain={(t) => setSelectedTrain(t)}
            onSimulateDisruption={handleSimulateDisruption}
            isSimulating={isSimulating}
            onDeleteTrain={handleDeleteTrain}
            onClearAllTrains={handleClearAllTrains}
            onRestoreSampleTrains={handleRestoreSample}
            onOpenAddTrain={() => setIsAddModalOpen(true)}
            onOpenRealtimeModal={() => setIsRealtimeModalOpen(true)}
            onOpenUploadData={() => setIsUploadModalOpen(true)}
            rtisStatus={rtisStatus}
          />
        )}

        {activeTab === 'station-pids' && (
          <StationDisplayView initialStationCode="CNB" />
        )}

        {activeTab === 'passenger-tracker' && (
          <PassengerTrackerView
            trains={trains}
            selectedTrain={selectedTrain}
            onSelectTrain={(t) => setSelectedTrain(t)}
            onOpenAddTrain={() => setIsAddModalOpen(true)}
            onRestoreSampleTrains={handleRestoreSample}
            onOpenUploadData={() => setIsUploadModalOpen(true)}
          />
        )}

        {activeTab === 'api-workbench' && <ApiWorkbenchView />}
      </main>

      <AddTrainModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTrain={handleAddTrain}
      />

      <UploadDataModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={fetchTrains}
      />

      <RealtimeGatewayModal
        isOpen={isRealtimeModalOpen}
        onClose={() => setIsRealtimeModalOpen(false)}
        rtisStatus={rtisStatus}
        activeTrains={trains}
        onToggleStream={handleToggleStream}
        onIngestPacket={handleIngestPacket}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Indian Railways Coaching Train Dynamic ETA Forecasting Architecture • Ministry of Railways, Govt of India
          </div>
          <div className="font-mono-telemetry text-slate-400 text-[11px] flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>NavIC RTIS & KAVACH Telemetry Live Stream active (2.5s cycle)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
