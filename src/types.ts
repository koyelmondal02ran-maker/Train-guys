export type SignalAspectType = 'GREEN' | 'DOUBLE_YELLOW' | 'YELLOW' | 'RED';

export type TrainType = 'RAJDHANI' | 'VANDE_BHARAT' | 'SHATABDI' | 'SUPERFAST' | 'MAIL_EXPRESS';

export type ZoneCode = 'NR' | 'NCR' | 'ECR' | 'ER' | 'WR' | 'CR' | 'SR' | 'ECoR';

export interface StationStop {
  code: string;
  name: string;
  hindiName: string;
  distanceKm: number;
  scheduledArrival: string; // e.g. "14:20"
  scheduledDeparture: string; // e.g. "14:30"
  traditionalEta: string; // Traditional NTES projection (Schedule + current delay - static buffer)
  dynamicML_Eta: string; // Dynamic ML forecast
  confidenceIntervalMin: string; // 90% confidence lower bound
  confidenceIntervalMax: string; // 90% confidence upper bound
  delayMinutesTraditional: number;
  delayMinutesML: number;
  varianceVsTraditional: number; // Difference in minutes (e.g. +24 min: dynamic forecasts 24m worse due to bottleneck)
  platform: string;
  haltMinutes: number;
  status: 'DEPARTED' | 'ARRIVED' | 'APPROACHING' | 'SCHEDULED';
  actualArrival?: string;
  actualDeparture?: string;
}

export interface SpeedRestriction {
  id: string;
  fromKm: number;
  toKm: number;
  imposedSpeedKmph: number; // e.g. 30 km/h
  normalSpeedKmph: number; // e.g. 130 km/h
  cause: 'TRACK_MAINTENANCE' | 'BRIDGE_REHABILITATION' | 'DEEP_SCREENING' | 'CAUTION_ORDER' | 'FOG_SPEED_CAP';
  active: boolean;
  lengthKm: number;
  delayImpactMinutes: number;
}

export interface BlockSection {
  id: string;
  sectionName: string; // e.g. "CNB - PRYJ Section Down Line"
  startKm: number;
  endKm: number;
  signalAspect: SignalAspectType;
  trackOccupancyPercent: number; // e.g. 88%
  precedingTrainId?: string;
  precedingTrainType?: string;
  headwayDistanceKm: number; // Distance to preceding train
  tractionType: '25kV_AC_ELECTRIC' | 'DIESEL';
  mpsKmph: number; // Max Permissible Speed
  currentBottleneckRating: 'NORMAL' | 'MODERATE' | 'SEVERE';
}

export interface WeatherTelemetry {
  condition: 'CLEAR' | 'DENSE_FOG' | 'HEAVY_MONSOON' | 'EXTREME_HEAT' | 'NORMAL';
  visibilityMeters: number;
  speedReductionFactor: number; // 1.0 is normal, 0.6 means 40% speed drop
  fogDeviceActive: boolean; // "Fog Pass Device" fitted in locomotive cab
  temperatureC: number;
}

export interface LocomotiveTelemetry {
  locoNumber: string; // e.g. "WAP-7 #30452 Ghaziabad Shed"
  locoClass: string; // e.g. "WAP-7" or "Trainset 18"
  currentSpeedKmph: number;
  mpsKmph: number; // Max Permissible Speed
  throttlePercent: number;
  brakingState: 'RUNNING' | 'COASTING' | 'DECELERATING' | 'SERVICE_BRAKE' | 'HALTED';
  kavachActive: boolean; // Indigenous Automatic Train Protection System
  currentKm: number;
  latitude: number;
  longitude: number;
  heading: string;
}

export interface TrainJourney {
  trainNumber: string;
  trainName: string;
  hindiName: string;
  type: TrainType;
  zone: ZoneCode;
  origin: {
    code: string;
    name: string;
  };
  destination: {
    code: string;
    name: string;
  };
  totalDistanceKm: number;
  currentKm: number;
  lastPassedStation: string;
  nextStation: string;
  currentDelayMinutes: number;
  traditionalForecastFinalDelayMinutes: number;
  dynamicMLForecastFinalDelayMinutes: number;
  confidenceScore: number; // 0 - 100%
  locomotive: LocomotiveTelemetry;
  weather: WeatherTelemetry;
  currentBlockSection: BlockSection;
  speedRestrictions: SpeedRestriction[];
  stations: StationStop[];
  delayFactors: {
    factor: string;
    impactMinutes: number;
    description: string;
    recoverable: boolean;
  }[];
  downstreamCongestionIndex: number; // 0 - 100
  lastUpdatedIso: string;
}

export interface DisruptionSimulationPayload {
  trainNumber: string;
  disruptionType: 'TSR_IMPOSITION' | 'SIGNAL_FAILURE' | 'DENSE_FOG' | 'PRECEDING_FREIGHT_STALL' | 'CLEAR_ALL';
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  sectionKm?: number;
  speedCapKmph?: number;
}

export interface ETAPredictionRequest {
  trainNumber: string;
  currentKm: number;
  currentSpeed: number;
  currentDelay: number;
  weatherCondition: WeatherTelemetry['condition'];
  precedingHeadwayKm: number;
  activeTSRCount: number;
  downstreamCongestionPercent: number;
}

export interface PredictionDetailBreakdown {
  stationCode: string;
  stationName: string;
  distanceRemainingKm: number;
  scheduledTime: string;
  traditionalEta: string;
  traditionalDelayMin: number;
  dynamicMLEta: string;
  dynamicMLDelayMin: number;
  confidenceRange: string;
  primaryDelayDriver: string;
  expectedRecoveryBufferMin: number;
}

export interface AIInsightsResponse {
  summary: string;
  rootCauseAnalysis: string;
  controllerAdvisory: string[];
  passengerAnnouncementHindi: string;
  passengerAnnouncementEnglish: string;
  recommendedPrecedenceAction: string;
}

export interface RTISTelemetryStatus {
  satelliteSystem: string;
  satellitesLocked: number;
  signalQuality: 'EXCELLENT' | 'GOOD' | 'DEGRADED';
  dop: number;
  pingLatencyMs: number;
  packetSequence: number;
  lastPacketTime: string;
  sourceAuthenticity: string;
  connectedClients: number;
  isLiveStreaming: boolean;
  frequencySeconds: number;
}

export interface RealtimeStreamEvent {
  type: 'INITIAL_SNAPSHOT' | 'TELEMETRY_TICK' | 'TELEMETRY_INGEST' | 'STREAM_STATE_CHANGED' | 'HEARTBEAT';
  timestamp: string;
  rtisStatus: RTISTelemetryStatus;
  trains?: TrainJourney[];
  ingestedTrain?: string;
}
