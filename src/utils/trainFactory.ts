import { TrainJourney, StationStop } from '../types';

interface CreateTrainInput {
  trainNumber: string;
  trainName: string;
  hindiName?: string;
  type?: TrainJourney['type'];
  zone?: TrainJourney['zone'];
  originCode?: string;
  originName?: string;
  destCode?: string;
  destName?: string;
  currentDelayMinutes?: number;
  currentSpeedKmph?: number;
  locoClass?: string;
}

export function createCustomTrain(input: CreateTrainInput): TrainJourney {
  const trainNumber = input.trainNumber.trim();
  const trainName = input.trainName.trim();
  const hindiName = input.hindiName?.trim() || `${trainName} (विशेष)`;
  const type = input.type || 'SUPERFAST';
  const zone = input.zone || 'NR';
  const originCode = (input.originCode || 'NDLS').toUpperCase();
  const originName = input.originName || 'New Delhi';
  const destCode = (input.destCode || 'HWH').toUpperCase();
  const destName = input.destName || 'Howrah Jn';
  const currentDelay = Number(input.currentDelayMinutes) || 0;
  const currentSpeed = Number(input.currentSpeedKmph) || 100;
  const locoClass = input.locoClass || (type === 'VANDE_BHARAT' ? 'Vande Bharat Trainset' : 'WAP-7');

  const stations: StationStop[] = [
    {
      code: originCode,
      name: originName,
      hindiName: originName,
      distanceKm: 0,
      scheduledArrival: '06:00',
      scheduledDeparture: '06:10',
      traditionalEta: '06:10',
      dynamicML_Eta: '06:10',
      confidenceIntervalMin: '06:08',
      confidenceIntervalMax: '06:12',
      delayMinutesTraditional: 0,
      delayMinutesML: 0,
      varianceVsTraditional: 0,
      platform: '1',
      haltMinutes: 10,
      status: 'DEPARTED',
      actualDeparture: '06:10',
    },
    {
      code: 'CNB',
      name: 'Kanpur Central',
      hindiName: 'कानपुर सेंट्रल',
      distanceKm: 440,
      scheduledArrival: '11:45',
      scheduledDeparture: '11:50',
      traditionalEta: '12:00',
      dynamicML_Eta: '12:12',
      confidenceIntervalMin: '12:08',
      confidenceIntervalMax: '12:18',
      delayMinutesTraditional: currentDelay,
      delayMinutesML: currentDelay + 12,
      varianceVsTraditional: 12,
      platform: '4',
      haltMinutes: 5,
      status: 'APPROACHING',
    },
    {
      code: 'PRYJ',
      name: 'Prayagraj Junction',
      hindiName: 'प्रयागराज जं.',
      distanceKm: 635,
      scheduledArrival: '13:50',
      scheduledDeparture: '13:55',
      traditionalEta: '14:05',
      dynamicML_Eta: '14:24',
      confidenceIntervalMin: '14:18',
      confidenceIntervalMax: '14:32',
      delayMinutesTraditional: currentDelay,
      delayMinutesML: currentDelay + 19,
      varianceVsTraditional: 19,
      platform: '6',
      haltMinutes: 5,
      status: 'SCHEDULED',
    },
    {
      code: destCode,
      name: destName,
      hindiName: destName,
      distanceKm: 980,
      scheduledArrival: '18:30',
      scheduledDeparture: '18:30',
      traditionalEta: '18:45',
      dynamicML_Eta: '19:12',
      confidenceIntervalMin: '19:02',
      confidenceIntervalMax: '19:22',
      delayMinutesTraditional: currentDelay,
      delayMinutesML: currentDelay + 27,
      varianceVsTraditional: 27,
      platform: '8',
      haltMinutes: 0,
      status: 'SCHEDULED',
    },
  ];

  return {
    trainNumber,
    trainName,
    hindiName,
    type,
    zone,
    origin: { code: originCode, name: originName },
    destination: { code: destCode, name: destName },
    totalDistanceKm: 980,
    currentKm: 380,
    lastPassedStation: originCode,
    nextStation: 'CNB',
    currentDelayMinutes: currentDelay,
    traditionalForecastFinalDelayMinutes: currentDelay,
    dynamicMLForecastFinalDelayMinutes: currentDelay + 27,
    confidenceScore: 91,
    locomotive: {
      locoNumber: `${locoClass} #${Math.floor(20000 + Math.random() * 19000)}`,
      locoClass,
      currentSpeedKmph: currentSpeed,
      mpsKmph: type === 'VANDE_BHARAT' ? 160 : 130,
      throttlePercent: 80,
      brakingState: 'RUNNING',
      kavachActive: true,
      currentKm: 380,
      latitude: 26.8467,
      longitude: 80.9462,
      heading: 'SE',
    },
    weather: {
      condition: 'CLEAR',
      visibilityMeters: 3800,
      speedReductionFactor: 1.0,
      fogDeviceActive: false,
      temperatureC: 27,
    },
    currentBlockSection: {
      id: `BLK-${trainNumber}-1`,
      sectionName: `${originCode} - CNB Down Fast Corridor`,
      startKm: 370,
      endKm: 440,
      signalAspect: 'GREEN',
      trackOccupancyPercent: 55,
      headwayDistanceKm: 8.5,
      tractionType: '25kV_AC_ELECTRIC',
      mpsKmph: 130,
      currentBottleneckRating: 'NORMAL',
    },
    speedRestrictions: [],
    stations,
    delayFactors: [
      {
        factor: 'Sectional Headway Buffer',
        impactMinutes: 8,
        description: 'Standard signal clearance headway spacing',
        recoverable: true,
      },
    ],
    downstreamCongestionIndex: 42,
    lastUpdatedIso: new Date().toISOString(),
  };
}
