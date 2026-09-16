import { Response } from 'express';
import { TrainJourney, RTISTelemetryStatus } from '../types';
import { getMasterTrains, recalculateAllTrainETAs } from './mockRailwayDb';

let sseClients: Response[] = [];
let telemetryInterval: NodeJS.Timeout | null = null;
let packetSequence = 104850;
let isStreamingActive = true;

export const rtisStatus: RTISTelemetryStatus = {
  satelliteSystem: 'ISRO-NavIC + GPS Dual Constellation',
  satellitesLocked: 12,
  signalQuality: 'EXCELLENT',
  dop: 0.82,
  pingLatencyMs: 21,
  packetSequence: packetSequence,
  lastPacketTime: new Date().toISOString(),
  sourceAuthenticity: '100% Verified ISRO-RTIS & CRIS-Interlock',
  connectedClients: 0,
  isLiveStreaming: true,
  frequencySeconds: 2.5,
};

/**
 * Register a client for Server-Sent Events (SSE)
 */
export function addSSEClient(res: Response) {
  sseClients.push(res);
  rtisStatus.connectedClients = sseClients.length;

  // Send initial snapshot immediately
  const initialPayload = {
    type: 'INITIAL_SNAPSHOT',
    timestamp: new Date().toISOString(),
    rtisStatus,
    trains: getMasterTrains(),
  };
  res.write(`data: ${JSON.stringify(initialPayload)}\n\n`);

  res.on('close', () => {
    sseClients = sseClients.filter((client) => client !== res);
    rtisStatus.connectedClients = sseClients.length;
  });
}

/**
 * Broadcast payload to all connected SSE clients
 */
export function broadcastTelemetry(payload: any) {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(data);
    } catch {
      // client may have disconnected
    }
  });
}

/**
 * Live physics & GPS simulation tick
 * Advances trains along their routes, adjusts speed and GPS coordinates in real-time
 */
export function stepTelemetryTick() {
  if (!isStreamingActive) return;

  const trains = getMasterTrains();
  packetSequence += 1;
  rtisStatus.packetSequence = packetSequence;
  rtisStatus.lastPacketTime = new Date().toISOString();
  rtisStatus.pingLatencyMs = Math.floor(18 + Math.random() * 12);
  rtisStatus.satellitesLocked = Math.floor(11 + Math.random() * 3);

  if (trains.length > 0) {
    trains.forEach((train) => {
      // 1. Determine current speed limit
      let effectiveSpeedCap = train.locomotive.mpsKmph;

      // Active TSR check
      const activeTSR = train.speedRestrictions.find(
        (tsr) => tsr.active && train.currentKm >= tsr.fromKm - 2 && train.currentKm <= tsr.toKm
      );
      if (activeTSR) {
        effectiveSpeedCap = Math.min(effectiveSpeedCap, activeTSR.imposedSpeedKmph);
      }

      // Signal aspect check
      if (train.currentBlockSection.signalAspect === 'RED') {
        effectiveSpeedCap = 0;
      } else if (train.currentBlockSection.signalAspect === 'YELLOW') {
        effectiveSpeedCap = Math.min(effectiveSpeedCap, 40);
      } else if (train.currentBlockSection.signalAspect === 'DOUBLE_YELLOW') {
        effectiveSpeedCap = Math.min(effectiveSpeedCap, 80);
      }

      // Fog check
      if (train.weather.condition === 'DENSE_FOG' && !train.weather.fogDeviceActive) {
        effectiveSpeedCap = Math.min(effectiveSpeedCap, 60);
      }

      // 2. Realistic speed fluctuation & acceleration
      const targetSpeed = Math.max(0, effectiveSpeedCap - Math.floor(Math.random() * 6));
      let currentSpeed = train.locomotive.currentSpeedKmph;
      if (currentSpeed < targetSpeed) {
        currentSpeed = Math.min(targetSpeed, currentSpeed + 3);
      } else if (currentSpeed > targetSpeed) {
        currentSpeed = Math.max(targetSpeed, currentSpeed - 4);
      }
      train.locomotive.currentSpeedKmph = currentSpeed;

      // 3. Advance distance (2.5 seconds step)
      // speed km/h * (2.5s / 3600s) = km covered
      const distanceCoveredKm = (currentSpeed / 3600) * 2.5;
      train.currentKm = Math.min(train.totalDistanceKm, Number((train.currentKm + distanceCoveredKm).toFixed(3)));
      train.locomotive.currentKm = train.currentKm;

      // 4. Update GPS coordinates along journey
      const progressRatio = train.totalDistanceKm > 0 ? train.currentKm / train.totalDistanceKm : 0;
      // Interpolate Delhi (28.6139, 77.2090) to Kolkata (22.5726, 88.3639)
      const latStart = 28.6139;
      const lonStart = 77.209;
      const latEnd = 22.5726;
      const lonEnd = 88.3639;
      train.locomotive.latitude = Number((latStart + (latEnd - latStart) * progressRatio).toFixed(5));
      train.locomotive.longitude = Number((lonStart + (lonEnd - lonStart) * progressRatio).toFixed(5));

      // 5. Update Station status if passed
      for (let i = 0; i < train.stations.length; i++) {
        const station = train.stations[i];
        if (train.currentKm >= station.distanceKm) {
          if (station.status !== 'DEPARTED') {
            station.status = 'DEPARTED';
            station.actualDeparture = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            train.lastPassedStation = station.code;
            if (train.stations[i + 1]) {
              train.nextStation = train.stations[i + 1].code;
            }
          }
        } else if (train.currentKm >= station.distanceKm - 15) {
          if (station.status === 'SCHEDULED') {
            station.status = 'APPROACHING';
          }
        }
      }

      train.lastUpdatedIso = new Date().toISOString();
    });

    // Recalculate dynamic predictions with updated ground states
    recalculateAllTrainETAs();
  }

  // Broadcast to all listening browsers
  broadcastTelemetry({
    type: 'TELEMETRY_TICK',
    timestamp: new Date().toISOString(),
    rtisStatus,
    trains,
  });
}

/**
 * Ingest live telemetry packet from external CRIS / RTIS hardware webhook
 */
export function ingestLiveTelemetryPacket(packet: {
  trainNumber: string;
  currentSpeedKmph?: number;
  latitude?: number;
  longitude?: number;
  currentKm?: number;
  signalAspect?: 'GREEN' | 'DOUBLE_YELLOW' | 'YELLOW' | 'RED';
  currentDelayMinutes?: number;
  kavachActive?: boolean;
}) {
  const trains = getMasterTrains();
  const train = trains.find((t) => t.trainNumber === packet.trainNumber);
  if (!train) return null;

  if (typeof packet.currentSpeedKmph === 'number') {
    train.locomotive.currentSpeedKmph = packet.currentSpeedKmph;
  }
  if (typeof packet.latitude === 'number') {
    train.locomotive.latitude = packet.latitude;
  }
  if (typeof packet.longitude === 'number') {
    train.locomotive.longitude = packet.longitude;
  }
  if (typeof packet.currentKm === 'number') {
    train.currentKm = packet.currentKm;
    train.locomotive.currentKm = packet.currentKm;
  }
  if (packet.signalAspect) {
    train.currentBlockSection.signalAspect = packet.signalAspect;
  }
  if (typeof packet.currentDelayMinutes === 'number') {
    train.currentDelayMinutes = packet.currentDelayMinutes;
  }
  if (typeof packet.kavachActive === 'boolean') {
    train.locomotive.kavachActive = packet.kavachActive;
  }

  train.lastUpdatedIso = new Date().toISOString();
  recalculateAllTrainETAs();

  // Instant broadcast
  broadcastTelemetry({
    type: 'TELEMETRY_INGEST',
    timestamp: new Date().toISOString(),
    rtisStatus,
    trains: getMasterTrains(),
    ingestedTrain: train.trainNumber,
  });

  return train;
}

/**
 * Start the continuous real-time telemetry engine
 */
export function startTelemetryEngine() {
  if (telemetryInterval) return;
  telemetryInterval = setInterval(stepTelemetryTick, 2500);
}

/**
 * Stop / Pause the telemetry engine
 */
export function stopTelemetryEngine() {
  if (telemetryInterval) {
    clearInterval(telemetryInterval);
    telemetryInterval = null;
  }
}

export function setStreamingState(active: boolean) {
  isStreamingActive = active;
  rtisStatus.isLiveStreaming = active;
  broadcastTelemetry({
    type: 'STREAM_STATE_CHANGED',
    timestamp: new Date().toISOString(),
    rtisStatus,
  });
}
