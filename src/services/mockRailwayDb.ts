import { TrainJourney, SpeedRestriction, WeatherTelemetry, BlockSection, StationStop, DisruptionSimulationPayload } from '../types';
import { calculateDynamicETA } from './etaEngine';
import { REAL_INDIAN_RAILWAY_TRAINS } from '../realRailwayData';

// Sample master trains store for optional restoration
const sampleMasterTrains: TrainJourney[] = [
  {
    trainNumber: '12302',
    trainName: 'Howrah Rajdhani Express',
    hindiName: 'हावड़ा राजधानी एक्सप्रेस',
    type: 'RAJDHANI',
    zone: 'ER',
    origin: { code: 'NDLS', name: 'New Delhi' },
    destination: { code: 'HWH', name: 'Howrah Junction' },
    totalDistanceKm: 1450,
    currentKm: 512,
    lastPassedStation: 'CNB',
    nextStation: 'PRYJ',
    currentDelayMinutes: 22,
    traditionalForecastFinalDelayMinutes: 10,
    dynamicMLForecastFinalDelayMinutes: 38,
    confidenceScore: 94,
    locomotive: {
      locoNumber: 'WAP-7 #30452 GZB',
      locoClass: 'WAP-7 (6350 HP 3-Phase Electric)',
      currentSpeedKmph: 118,
      mpsKmph: 130,
      throttlePercent: 78,
      brakingState: 'RUNNING',
      kavachActive: true,
      currentKm: 512,
      latitude: 25.9244,
      longitude: 80.8123,
      heading: 'East-Southeast',
    },
    weather: {
      condition: 'CLEAR',
      visibilityMeters: 3500,
      speedReductionFactor: 1.0,
      fogDeviceActive: false,
      temperatureC: 28,
    },
    currentBlockSection: {
      id: 'SEC-NCR-CNB-PRYJ-04',
      sectionName: 'Fatehpur - Sirathu Automatic Block Line 3',
      startKm: 480,
      endKm: 560,
      signalAspect: 'DOUBLE_YELLOW',
      trackOccupancyPercent: 84,
      precedingTrainId: 'BOXN-88219 (Coal Freight)',
      precedingTrainType: 'Heavy Haul Freight (45 km/h)',
      headwayDistanceKm: 4.2,
      tractionType: '25kV_AC_ELECTRIC',
      mpsKmph: 130,
      currentBottleneckRating: 'MODERATE',
    },
    speedRestrictions: [
      {
        id: 'TSR-NCR-524',
        fromKm: 524,
        toKm: 531,
        imposedSpeedKmph: 30,
        normalSpeedKmph: 130,
        cause: 'BRIDGE_REHABILITATION',
        active: true,
        lengthKm: 7,
        delayImpactMinutes: 11.2,
      },
      {
        id: 'TSR-ECR-688',
        fromKm: 688,
        toKm: 692,
        imposedSpeedKmph: 45,
        normalSpeedKmph: 130,
        cause: 'TRACK_MAINTENANCE',
        active: true,
        lengthKm: 4,
        delayImpactMinutes: 4.8,
      },
    ],
    stations: [
      {
        code: 'NDLS',
        name: 'New Delhi',
        hindiName: 'नई दिल्ली',
        distanceKm: 0,
        scheduledArrival: '16:55',
        scheduledDeparture: '16:55',
        traditionalEta: '16:55',
        dynamicML_Eta: '16:55',
        confidenceIntervalMin: '16:55',
        confidenceIntervalMax: '16:55',
        delayMinutesTraditional: 0,
        delayMinutesML: 0,
        varianceVsTraditional: 0,
        platform: '9',
        haltMinutes: 0,
        status: 'DEPARTED',
        actualArrival: '16:55',
        actualDeparture: '16:58',
      },
      {
        code: 'CNB',
        name: 'Kanpur Central',
        hindiName: 'कानपुर सेंट्रल',
        distanceKm: 440,
        scheduledArrival: '21:32',
        scheduledDeparture: '21:37',
        traditionalEta: '21:54',
        dynamicML_Eta: '21:54',
        confidenceIntervalMin: '21:52',
        confidenceIntervalMax: '21:56',
        delayMinutesTraditional: 22,
        delayMinutesML: 22,
        varianceVsTraditional: 0,
        platform: '4',
        haltMinutes: 5,
        status: 'DEPARTED',
        actualArrival: '21:54',
        actualDeparture: '22:01',
      },
      {
        code: 'PRYJ',
        name: 'Prayagraj Junction',
        hindiName: 'प्रयागराज जंक्शन',
        distanceKm: 635,
        scheduledArrival: '23:43',
        scheduledDeparture: '23:45',
        traditionalEta: '00:03',
        dynamicML_Eta: '00:15',
        confidenceIntervalMin: '00:11',
        confidenceIntervalMax: '00:19',
        delayMinutesTraditional: 20,
        delayMinutesML: 32,
        varianceVsTraditional: 12,
        platform: '5',
        haltMinutes: 2,
        status: 'APPROACHING',
      },
      {
        code: 'DDU',
        name: 'Pt. Deen Dayal Upadhyaya Jn',
        hindiName: 'पंडित दीन दयाल उपाध्याय जं.',
        distanceKm: 788,
        scheduledArrival: '01:47',
        scheduledDeparture: '01:57',
        traditionalEta: '02:04',
        dynamicML_Eta: '02:26',
        confidenceIntervalMin: '02:20',
        confidenceIntervalMax: '02:32',
        delayMinutesTraditional: 17,
        delayMinutesML: 39,
        varianceVsTraditional: 22,
        platform: '2',
        haltMinutes: 10,
        status: 'SCHEDULED',
      },
      {
        code: 'GAYA',
        name: 'Gaya Junction',
        hindiName: 'गया जंक्शन',
        distanceKm: 993,
        scheduledArrival: '04:10',
        scheduledDeparture: '04:13',
        traditionalEta: '04:23',
        dynamicML_Eta: '04:47',
        confidenceIntervalMin: '04:40',
        confidenceIntervalMax: '04:55',
        delayMinutesTraditional: 13,
        delayMinutesML: 37,
        varianceVsTraditional: 24,
        platform: '1',
        haltMinutes: 3,
        status: 'SCHEDULED',
      },
      {
        code: 'DHN',
        name: 'Dhanbad Junction',
        hindiName: 'धनबाद जंक्शन',
        distanceKm: 1193,
        scheduledArrival: '06:50',
        scheduledDeparture: '06:55',
        traditionalEta: '07:00',
        dynamicML_Eta: '07:28',
        confidenceIntervalMin: '07:19',
        confidenceIntervalMax: '07:37',
        delayMinutesTraditional: 10,
        delayMinutesML: 38,
        varianceVsTraditional: 28,
        platform: '1',
        haltMinutes: 5,
        status: 'SCHEDULED',
      },
      {
        code: 'ASN',
        name: 'Asansol Junction',
        hindiName: 'आसनसोल जंक्शन',
        distanceKm: 1251,
        scheduledArrival: '07:53',
        scheduledDeparture: '07:55',
        traditionalEta: '08:02',
        dynamicML_Eta: '08:31',
        confidenceIntervalMin: '08:21',
        confidenceIntervalMax: '08:41',
        delayMinutesTraditional: 9,
        delayMinutesML: 38,
        varianceVsTraditional: 29,
        platform: '5',
        haltMinutes: 2,
        status: 'SCHEDULED',
      },
      {
        code: 'HWH',
        name: 'Howrah Junction',
        hindiName: 'हावड़ा जंक्शन',
        distanceKm: 1450,
        scheduledArrival: '10:05',
        scheduledDeparture: '10:05',
        traditionalEta: '10:15',
        dynamicML_Eta: '10:43',
        confidenceIntervalMin: '10:32',
        confidenceIntervalMax: '10:54',
        delayMinutesTraditional: 10,
        delayMinutesML: 38,
        varianceVsTraditional: 28,
        platform: '8',
        haltMinutes: 0,
        status: 'SCHEDULED',
      },
    ],
    delayFactors: [
      {
        factor: 'Temporary Speed Restriction (TSR-524)',
        impactMinutes: 11,
        description: '30 km/h speed order over Fatehpur girder bridge reconstruction',
        recoverable: false,
      },
      {
        factor: 'Downstream Preceding Freight Train',
        impactMinutes: 8,
        description: 'Trailing BOXN coal rake (45 km/h) causing double-yellow aspects',
        recoverable: true,
      },
      {
        factor: 'Mughalsarai (DDU) Yard Saturated Line',
        impactMinutes: 9,
        description: 'Yard capacity utilization at 112%, waiting for reception platform clear',
        recoverable: false,
      },
      {
        factor: 'Engineered Recovery Slack Available',
        impactMinutes: -6,
        description: 'Slack built into Grand Chord DHN-HWH high-speed section',
        recoverable: true,
      },
    ],
    downstreamCongestionIndex: 78,
    lastUpdatedIso: new Date().toISOString(),
  },
  {
    trainNumber: '22436',
    trainName: 'Vande Bharat Express',
    hindiName: 'वंदे भारत एक्सप्रेस',
    type: 'VANDE_BHARAT',
    zone: 'NR',
    origin: { code: 'NDLS', name: 'New Delhi' },
    destination: { code: 'BSB', name: 'Varanasi Junction' },
    totalDistanceKm: 759,
    currentKm: 310,
    lastPassedStation: 'ALJN',
    nextStation: 'CNB',
    currentDelayMinutes: 4,
    traditionalForecastFinalDelayMinutes: 4,
    dynamicMLForecastFinalDelayMinutes: 0,
    confidenceScore: 98,
    locomotive: {
      locoNumber: 'VB-Rake #14 Trainset',
      locoClass: 'Self-propelled 16-Car EMU (160 km/h)',
      currentSpeedKmph: 148,
      mpsKmph: 160,
      throttlePercent: 92,
      brakingState: 'RUNNING',
      kavachActive: true,
      currentKm: 310,
      latitude: 27.8974,
      longitude: 78.088,
      heading: 'Southeast',
    },
    weather: {
      condition: 'CLEAR',
      visibilityMeters: 4000,
      speedReductionFactor: 1.0,
      fogDeviceActive: false,
      temperatureC: 26,
    },
    currentBlockSection: {
      id: 'SEC-NCR-TDL-ETW-02',
      sectionName: 'Tundla - Etawah High Speed 3rd Line',
      startKm: 260,
      endKm: 380,
      signalAspect: 'GREEN',
      trackOccupancyPercent: 42,
      headwayDistanceKm: 16.5,
      tractionType: '25kV_AC_ELECTRIC',
      mpsKmph: 160,
      currentBottleneckRating: 'NORMAL',
    },
    speedRestrictions: [],
    stations: [
      {
        code: 'NDLS',
        name: 'New Delhi',
        hindiName: 'नई दिल्ली',
        distanceKm: 0,
        scheduledArrival: '06:00',
        scheduledDeparture: '06:00',
        traditionalEta: '06:00',
        dynamicML_Eta: '06:00',
        confidenceIntervalMin: '06:00',
        confidenceIntervalMax: '06:00',
        delayMinutesTraditional: 0,
        delayMinutesML: 0,
        varianceVsTraditional: 0,
        platform: '16',
        haltMinutes: 0,
        status: 'DEPARTED',
        actualArrival: '06:00',
        actualDeparture: '06:03',
      },
      {
        code: 'CNB',
        name: 'Kanpur Central',
        hindiName: 'कानपुर सेंट्रल',
        distanceKm: 440,
        scheduledArrival: '10:08',
        scheduledDeparture: '10:10',
        traditionalEta: '10:12',
        dynamicML_Eta: '10:09',
        confidenceIntervalMin: '10:07',
        confidenceIntervalMax: '10:11',
        delayMinutesTraditional: 4,
        delayMinutesML: 1,
        varianceVsTraditional: -3,
        platform: '5',
        haltMinutes: 2,
        status: 'APPROACHING',
      },
      {
        code: 'PRYJ',
        name: 'Prayagraj Junction',
        hindiName: 'प्रयागराज जंक्शन',
        distanceKm: 635,
        scheduledArrival: '12:08',
        scheduledDeparture: '12:10',
        traditionalEta: '12:12',
        dynamicML_Eta: '12:08',
        confidenceIntervalMin: '12:06',
        confidenceIntervalMax: '12:10',
        delayMinutesTraditional: 4,
        delayMinutesML: 0,
        varianceVsTraditional: -4,
        platform: '6',
        haltMinutes: 2,
        status: 'SCHEDULED',
      },
      {
        code: 'BSB',
        name: 'Varanasi Junction',
        hindiName: 'वाराणसी जंक्शन',
        distanceKm: 759,
        scheduledArrival: '14:00',
        scheduledDeparture: '14:00',
        traditionalEta: '14:04',
        dynamicML_Eta: '14:00',
        confidenceIntervalMin: '13:58',
        confidenceIntervalMax: '14:02',
        delayMinutesTraditional: 4,
        delayMinutesML: 0,
        varianceVsTraditional: -4,
        platform: '1',
        haltMinutes: 0,
        status: 'SCHEDULED',
      },
    ],
    delayFactors: [
      {
        factor: 'High Acceleration & 160 km/h Permissible Speed',
        impactMinutes: -4,
        description: 'Vande Bharat dynamic recovery erasing 4 mins initial delay',
        recoverable: true,
      },
      {
        factor: 'Clear Signal Aspect Priority (Super Green Wave)',
        impactMinutes: 0,
        description: 'Automatic Route Relay Interlocking prioritizing Vande Bharat rake',
        recoverable: true,
      },
    ],
    downstreamCongestionIndex: 28,
    lastUpdatedIso: new Date().toISOString(),
  },
  {
    trainNumber: '12952',
    trainName: 'Mumbai Tejas Rajdhani Express',
    hindiName: 'मुंबई तेजस राजधानी एक्सप्रेस',
    type: 'RAJDHANI',
    zone: 'WR',
    origin: { code: 'NDLS', name: 'New Delhi' },
    destination: { code: 'MMCT', name: 'Mumbai Central' },
    totalDistanceKm: 1384,
    currentKm: 730,
    lastPassedStation: 'KOTA',
    nextStation: 'RTM',
    currentDelayMinutes: 14,
    traditionalForecastFinalDelayMinutes: 8,
    dynamicMLForecastFinalDelayMinutes: 26,
    confidenceScore: 91,
    locomotive: {
      locoNumber: 'WAP-7 #37012 BRC',
      locoClass: 'WAP-7',
      currentSpeedKmph: 124,
      mpsKmph: 130,
      throttlePercent: 82,
      brakingState: 'RUNNING',
      kavachActive: true,
      currentKm: 730,
      latitude: 24.2189,
      longitude: 75.2912,
      heading: 'South-Southwest',
    },
    weather: {
      condition: 'CLEAR',
      visibilityMeters: 4500,
      speedReductionFactor: 1.0,
      fogDeviceActive: false,
      temperatureC: 31,
    },
    currentBlockSection: {
      id: 'SEC-WR-KOTA-RTM-03',
      sectionName: 'Shamgarh - Nagda Junction Line 2',
      startKm: 690,
      endKm: 780,
      signalAspect: 'GREEN',
      trackOccupancyPercent: 62,
      headwayDistanceKm: 11.0,
      tractionType: '25kV_AC_ELECTRIC',
      mpsKmph: 130,
      currentBottleneckRating: 'NORMAL',
    },
    speedRestrictions: [
      {
        id: 'TSR-WR-312',
        fromKm: 955,
        toKm: 962,
        imposedSpeedKmph: 40,
        normalSpeedKmph: 130,
        cause: 'DEEP_SCREENING',
        active: true,
        lengthKm: 7,
        delayImpactMinutes: 9.5,
      },
    ],
    stations: [
      {
        code: 'NDLS',
        name: 'New Delhi',
        hindiName: 'नई दिल्ली',
        distanceKm: 0,
        scheduledArrival: '16:55',
        scheduledDeparture: '16:55',
        traditionalEta: '16:55',
        dynamicML_Eta: '16:55',
        confidenceIntervalMin: '16:55',
        confidenceIntervalMax: '16:55',
        delayMinutesTraditional: 0,
        delayMinutesML: 0,
        varianceVsTraditional: 0,
        platform: '1',
        haltMinutes: 0,
        status: 'DEPARTED',
        actualArrival: '16:55',
        actualDeparture: '17:02',
      },
      {
        code: 'KOTA',
        name: 'Kota Junction',
        hindiName: 'कोटा जंक्शन',
        distanceKm: 466,
        scheduledArrival: '21:30',
        scheduledDeparture: '21:40',
        traditionalEta: '21:44',
        dynamicML_Eta: '21:44',
        confidenceIntervalMin: '21:42',
        confidenceIntervalMax: '21:46',
        delayMinutesTraditional: 14,
        delayMinutesML: 14,
        varianceVsTraditional: 0,
        platform: '1',
        haltMinutes: 10,
        status: 'DEPARTED',
        actualArrival: '21:44',
        actualDeparture: '21:52',
      },
      {
        code: 'RTM',
        name: 'Ratlam Junction',
        hindiName: 'रतलाम जंक्शन',
        distanceKm: 733,
        scheduledArrival: '00:25',
        scheduledDeparture: '00:28',
        traditionalEta: '00:39',
        dynamicML_Eta: '00:41',
        confidenceIntervalMin: '00:38',
        confidenceIntervalMax: '00:44',
        delayMinutesTraditional: 14,
        delayMinutesML: 16,
        varianceVsTraditional: 2,
        platform: '4',
        haltMinutes: 3,
        status: 'APPROACHING',
      },
      {
        code: 'BRC',
        name: 'Vadodara Junction',
        hindiName: 'वडोदरा जंक्शन',
        distanceKm: 993,
        scheduledArrival: '03:46',
        scheduledDeparture: '03:54',
        traditionalEta: '03:57',
        dynamicML_Eta: '04:14',
        confidenceIntervalMin: '04:09',
        confidenceIntervalMax: '04:19',
        delayMinutesTraditional: 11,
        delayMinutesML: 28,
        varianceVsTraditional: 17,
        platform: '1',
        haltMinutes: 8,
        status: 'SCHEDULED',
      },
      {
        code: 'ST',
        name: 'Surat',
        hindiName: 'सूरत',
        distanceKm: 1123,
        scheduledArrival: '05:20',
        scheduledDeparture: '05:25',
        traditionalEta: '05:30',
        dynamicML_Eta: '05:49',
        confidenceIntervalMin: '05:42',
        confidenceIntervalMax: '05:56',
        delayMinutesTraditional: 10,
        delayMinutesML: 29,
        varianceVsTraditional: 19,
        platform: '2',
        haltMinutes: 5,
        status: 'SCHEDULED',
      },
      {
        code: 'BVI',
        name: 'Borivali',
        hindiName: 'बोरीवली',
        distanceKm: 1354,
        scheduledArrival: '07:57',
        scheduledDeparture: '07:59',
        traditionalEta: '08:05',
        dynamicML_Eta: '08:24',
        confidenceIntervalMin: '08:16',
        confidenceIntervalMax: '08:32',
        delayMinutesTraditional: 8,
        delayMinutesML: 27,
        varianceVsTraditional: 19,
        platform: '7',
        haltMinutes: 2,
        status: 'SCHEDULED',
      },
      {
        code: 'MMCT',
        name: 'Mumbai Central',
        hindiName: 'मुंबई सेंट्रल',
        distanceKm: 1384,
        scheduledArrival: '08:35',
        scheduledDeparture: '08:35',
        traditionalEta: '08:43',
        dynamicML_Eta: '09:01',
        confidenceIntervalMin: '08:52',
        confidenceIntervalMax: '09:10',
        delayMinutesTraditional: 8,
        delayMinutesML: 26,
        varianceVsTraditional: 18,
        platform: '1',
        haltMinutes: 0,
        status: 'SCHEDULED',
      },
    ],
    delayFactors: [
      {
        factor: 'Suburban Peak Commuter Corridors (Virar-Borivali-MMCT)',
        impactMinutes: 12,
        description: 'Suburban local train headway prioritization into Mumbai terminal',
        recoverable: false,
      },
      {
        factor: 'TSR-312 Deep Screening Caution Order',
        impactMinutes: 9,
        description: 'Track renewal between Godhra and Vadodara',
        recoverable: false,
      },
    ],
    downstreamCongestionIndex: 72,
    lastUpdatedIso: new Date().toISOString(),
  },
  {
    trainNumber: '12626',
    trainName: 'Kerala Express',
    hindiName: 'केरल एक्सप्रेस',
    type: 'SUPERFAST',
    zone: 'SR',
    origin: { code: 'NDLS', name: 'New Delhi' },
    destination: { code: 'TVC', name: 'Thiruvananthapuram Central' },
    totalDistanceKm: 3026,
    currentKm: 890,
    lastPassedStation: 'BPL',
    nextStation: 'NGP',
    currentDelayMinutes: 52,
    traditionalForecastFinalDelayMinutes: 35,
    dynamicMLForecastFinalDelayMinutes: 88,
    confidenceScore: 86,
    locomotive: {
      locoNumber: 'WAP-7 #30588 ED',
      locoClass: 'WAP-7 Erode Shed',
      currentSpeedKmph: 105,
      mpsKmph: 130,
      throttlePercent: 70,
      brakingState: 'RUNNING',
      kavachActive: false,
      currentKm: 890,
      latitude: 22.3129,
      longitude: 77.892,
      heading: 'South',
    },
    weather: {
      condition: 'NORMAL',
      visibilityMeters: 3000,
      speedReductionFactor: 1.0,
      fogDeviceActive: false,
      temperatureC: 33,
    },
    currentBlockSection: {
      id: 'SEC-CR-ITR-NGP-02',
      sectionName: 'Itarsi - Nagpur Ghat Descent Section',
      startKm: 830,
      endKm: 940,
      signalAspect: 'YELLOW',
      trackOccupancyPercent: 89,
      precedingTrainId: '12138 Punjab Mail',
      precedingTrainType: 'Superfast Express (Delayed 40m)',
      headwayDistanceKm: 3.1,
      tractionType: '25kV_AC_ELECTRIC',
      mpsKmph: 110,
      currentBottleneckRating: 'SEVERE',
    },
    speedRestrictions: [
      {
        id: 'TSR-CR-894',
        fromKm: 894,
        toKm: 902,
        imposedSpeedKmph: 20,
        normalSpeedKmph: 110,
        cause: 'CAUTION_ORDER',
        active: true,
        lengthKm: 8,
        delayImpactMinutes: 18.5,
      },
    ],
    stations: [
      {
        code: 'NDLS',
        name: 'New Delhi',
        hindiName: 'नई दिल्ली',
        distanceKm: 0,
        scheduledArrival: '20:10',
        scheduledDeparture: '20:10',
        traditionalEta: '20:10',
        dynamicML_Eta: '20:10',
        confidenceIntervalMin: '20:10',
        confidenceIntervalMax: '20:10',
        delayMinutesTraditional: 0,
        delayMinutesML: 0,
        varianceVsTraditional: 0,
        platform: '3',
        haltMinutes: 0,
        status: 'DEPARTED',
        actualArrival: '20:10',
        actualDeparture: '20:15',
      },
      {
        code: 'BPL',
        name: 'Bhopal Junction',
        hindiName: 'भोपाल जंक्शन',
        distanceKm: 700,
        scheduledArrival: '05:30',
        scheduledDeparture: '05:35',
        traditionalEta: '06:22',
        dynamicML_Eta: '06:22',
        confidenceIntervalMin: '06:20',
        confidenceIntervalMax: '06:24',
        delayMinutesTraditional: 52,
        delayMinutesML: 52,
        varianceVsTraditional: 0,
        platform: '1',
        haltMinutes: 5,
        status: 'DEPARTED',
        actualArrival: '06:22',
        actualDeparture: '06:30',
      },
      {
        code: 'NGP',
        name: 'Nagpur Junction',
        hindiName: 'नागपुर जंक्शन',
        distanceKm: 1090,
        scheduledArrival: '11:55',
        scheduledDeparture: '12:00',
        traditionalEta: '12:43',
        dynamicML_Eta: '13:16',
        confidenceIntervalMin: '13:08',
        confidenceIntervalMax: '13:24',
        delayMinutesTraditional: 48,
        delayMinutesML: 81,
        varianceVsTraditional: 33,
        platform: '2',
        haltMinutes: 5,
        status: 'APPROACHING',
      },
      {
        code: 'BPQ',
        name: 'Balharshah Junction',
        hindiName: 'बल्लारशाह जंक्शन',
        distanceKm: 1298,
        scheduledArrival: '15:20',
        scheduledDeparture: '15:25',
        traditionalEta: '16:04',
        dynamicML_Eta: '16:48',
        confidenceIntervalMin: '16:38',
        confidenceIntervalMax: '16:58',
        delayMinutesTraditional: 44,
        delayMinutesML: 88,
        varianceVsTraditional: 44,
        platform: '3',
        haltMinutes: 5,
        status: 'SCHEDULED',
      },
      {
        code: 'BZA',
        name: 'Vijayawada Junction',
        hindiName: 'विजयवाड़ा जंक्शन',
        distanceKm: 1748,
        scheduledArrival: '21:50',
        scheduledDeparture: '22:00',
        traditionalEta: '22:28',
        dynamicML_Eta: '23:18',
        confidenceIntervalMin: '23:02',
        confidenceIntervalMax: '23:34',
        delayMinutesTraditional: 38,
        delayMinutesML: 88,
        varianceVsTraditional: 50,
        platform: '1',
        haltMinutes: 10,
        status: 'SCHEDULED',
      },
      {
        code: 'CBE',
        name: 'Coimbatore Junction',
        hindiName: 'कोयम्बटूर जंक्शन',
        distanceKm: 2515,
        scheduledArrival: '09:27',
        scheduledDeparture: '09:30',
        traditionalEta: '10:02',
        dynamicML_Eta: '10:55',
        confidenceIntervalMin: '10:35',
        confidenceIntervalMax: '11:15',
        delayMinutesTraditional: 35,
        delayMinutesML: 88,
        varianceVsTraditional: 53,
        platform: '2',
        haltMinutes: 3,
        status: 'SCHEDULED',
      },
      {
        code: 'TVC',
        name: 'Thiruvananthapuram Central',
        hindiName: 'तिरुवनंतपुरम सेंट्रल',
        distanceKm: 3026,
        scheduledArrival: '18:05',
        scheduledDeparture: '18:05',
        traditionalEta: '18:40',
        dynamicML_Eta: '19:33',
        confidenceIntervalMin: '19:10',
        confidenceIntervalMax: '19:56',
        delayMinutesTraditional: 35,
        delayMinutesML: 88,
        varianceVsTraditional: 53,
        platform: '1',
        haltMinutes: 0,
        status: 'SCHEDULED',
      },
    ],
    delayFactors: [
      {
        factor: 'Ghat Section Preceding Train Cascading Halt',
        impactMinutes: 24,
        description: 'Delayed Punjab Mail ahead on single clear aspect block',
        recoverable: false,
      },
      {
        factor: 'TSR-894 Severe 20 km/h Slow Order',
        impactMinutes: 18,
        description: 'Track realignment and culvert repair at KM 894',
        recoverable: false,
      },
      {
        factor: 'Multi-Day Long Distance Cumulative Drift',
        impactMinutes: 14,
        description: 'Station dwell creeps across 4 division crew-change points',
        recoverable: false,
      },
    ],
    downstreamCongestionIndex: 88,
    lastUpdatedIso: new Date().toISOString(),
  },
  {
    trainNumber: '12802',
    trainName: 'Purushottam Express',
    hindiName: 'पुरुषोत्तम एक्सप्रेस',
    type: 'SUPERFAST',
    zone: 'ECoR',
    origin: { code: 'NDLS', name: 'New Delhi' },
    destination: { code: 'PURI', name: 'Puri' },
    totalDistanceKm: 1865,
    currentKm: 280,
    lastPassedStation: 'ALJN',
    nextStation: 'CNB',
    currentDelayMinutes: 45,
    traditionalForecastFinalDelayMinutes: 30,
    dynamicMLForecastFinalDelayMinutes: 72,
    confidenceScore: 89,
    locomotive: {
      locoNumber: 'WAP-7 #30211 SRC',
      locoClass: 'WAP-7',
      currentSpeedKmph: 85,
      mpsKmph: 130,
      throttlePercent: 60,
      brakingState: 'RUNNING',
      kavachActive: false,
      currentKm: 280,
      latitude: 27.512,
      longitude: 78.43,
      heading: 'Southeast',
    },
    weather: {
      condition: 'DENSE_FOG',
      visibilityMeters: 180,
      speedReductionFactor: 0.6,
      fogDeviceActive: true,
      temperatureC: 14,
    },
    currentBlockSection: {
      id: 'SEC-NCR-TDL-SKB-01',
      sectionName: 'Tundla - Shikohabad Fog Corridor',
      startKm: 230,
      endKm: 310,
      signalAspect: 'YELLOW',
      trackOccupancyPercent: 82,
      headwayDistanceKm: 3.8,
      tractionType: '25kV_AC_ELECTRIC',
      mpsKmph: 130,
      currentBottleneckRating: 'SEVERE',
    },
    speedRestrictions: [
      {
        id: 'TSR-FOG-GEN',
        fromKm: 200,
        toKm: 440,
        imposedSpeedKmph: 60,
        normalSpeedKmph: 130,
        cause: 'FOG_SPEED_CAP',
        active: true,
        lengthKm: 240,
        delayImpactMinutes: 34.0,
      },
    ],
    stations: [
      {
        code: 'NDLS',
        name: 'New Delhi',
        hindiName: 'नई दिल्ली',
        distanceKm: 0,
        scheduledArrival: '22:40',
        scheduledDeparture: '22:40',
        traditionalEta: '22:40',
        dynamicML_Eta: '22:40',
        confidenceIntervalMin: '22:40',
        confidenceIntervalMax: '22:40',
        delayMinutesTraditional: 0,
        delayMinutesML: 0,
        varianceVsTraditional: 0,
        platform: '8',
        haltMinutes: 0,
        status: 'DEPARTED',
        actualArrival: '22:40',
        actualDeparture: '22:45',
      },
      {
        code: 'CNB',
        name: 'Kanpur Central',
        hindiName: 'कानपुर सेंट्रल',
        distanceKm: 440,
        scheduledArrival: '04:00',
        scheduledDeparture: '04:05',
        traditionalEta: '04:45',
        dynamicML_Eta: '05:18',
        confidenceIntervalMin: '05:12',
        confidenceIntervalMax: '05:24',
        delayMinutesTraditional: 45,
        delayMinutesML: 78,
        varianceVsTraditional: 33,
        platform: '4',
        haltMinutes: 5,
        status: 'APPROACHING',
      },
      {
        code: 'PRYJ',
        name: 'Prayagraj Junction',
        hindiName: 'प्रयागराज जंक्शन',
        distanceKm: 635,
        scheduledArrival: '06:55',
        scheduledDeparture: '07:00',
        traditionalEta: '07:35',
        dynamicML_Eta: '08:12',
        confidenceIntervalMin: '08:02',
        confidenceIntervalMax: '08:22',
        delayMinutesTraditional: 40,
        delayMinutesML: 77,
        varianceVsTraditional: 37,
        platform: '5',
        haltMinutes: 5,
        status: 'SCHEDULED',
      },
      {
        code: 'DDU',
        name: 'Pt. Deen Dayal Upadhyaya Jn',
        hindiName: 'पंडित दीन दयाल उपाध्याय जं.',
        distanceKm: 788,
        scheduledArrival: '09:40',
        scheduledDeparture: '09:50',
        traditionalEta: '10:15',
        dynamicML_Eta: '10:55',
        confidenceIntervalMin: '10:42',
        confidenceIntervalMax: '11:08',
        delayMinutesTraditional: 35,
        delayMinutesML: 75,
        varianceVsTraditional: 40,
        platform: '2',
        haltMinutes: 10,
        status: 'SCHEDULED',
      },
      {
        code: 'GAYA',
        name: 'Gaya Junction',
        hindiName: 'गया जंक्शन',
        distanceKm: 993,
        scheduledArrival: '12:30',
        scheduledDeparture: '12:35',
        traditionalEta: '13:02',
        dynamicML_Eta: '13:42',
        confidenceIntervalMin: '13:28',
        confidenceIntervalMax: '13:56',
        delayMinutesTraditional: 32,
        delayMinutesML: 72,
        varianceVsTraditional: 40,
        platform: '1',
        haltMinutes: 5,
        status: 'SCHEDULED',
      },
      {
        code: 'BBS',
        name: 'Bhubaneswar',
        hindiName: 'भुवनेश्वर',
        distanceKm: 1802,
        scheduledArrival: '04:15',
        scheduledDeparture: '04:20',
        traditionalEta: '04:45',
        dynamicML_Eta: '05:27',
        confidenceIntervalMin: '05:10',
        confidenceIntervalMax: '05:44',
        delayMinutesTraditional: 30,
        delayMinutesML: 72,
        varianceVsTraditional: 42,
        platform: '2',
        haltMinutes: 5,
        status: 'SCHEDULED',
      },
      {
        code: 'PURI',
        name: 'Puri',
        hindiName: 'पुरी',
        distanceKm: 1865,
        scheduledArrival: '06:15',
        scheduledDeparture: '06:15',
        traditionalEta: '06:45',
        dynamicML_Eta: '07:27',
        confidenceIntervalMin: '07:08',
        confidenceIntervalMax: '07:46',
        delayMinutesTraditional: 30,
        delayMinutesML: 72,
        varianceVsTraditional: 42,
        platform: '4',
        haltMinutes: 0,
        status: 'SCHEDULED',
      },
    ],
    delayFactors: [
      {
        factor: 'Severe Winter Fog Safety Restriction (NCR Zone)',
        impactMinutes: 34,
        description: 'Speed capped at 60-75 km/h for 240 km between Aligarh and Kanpur',
        recoverable: false,
      },
      {
        factor: 'Downstream Yard Pre-sorting Block',
        impactMinutes: 12,
        description: 'Kanpur Central outer signal regulation due to platform occupation',
        recoverable: false,
      },
    ],
    downstreamCongestionIndex: 82,
    lastUpdatedIso: new Date().toISOString(),
  },
];

// Initialize with authentic real Indian Railways scheduled journeys
let activeTrains: TrainJourney[] = JSON.parse(JSON.stringify(REAL_INDIAN_RAILWAY_TRAINS));
recalculateAllTrainETAs();

export function clearAllTrains(): void {
  activeTrains = [];
}

export function deleteTrain(trainNo: string): boolean {
  const initialCount = activeTrains.length;
  activeTrains = activeTrains.filter((t) => t.trainNumber !== trainNo);
  return activeTrains.length < initialCount;
}

export function addTrain(train: TrainJourney): TrainJourney {
  const index = activeTrains.findIndex((t) => t.trainNumber === train.trainNumber);
  if (index >= 0) {
    activeTrains[index] = train;
  } else {
    activeTrains.push(train);
  }
  recalculateAllTrainETAs();
  return train;
}

export function bulkAddTrains(trains: TrainJourney[]): TrainJourney[] {
  for (const train of trains) {
    const index = activeTrains.findIndex((t) => t.trainNumber === train.trainNumber);
    if (index >= 0) {
      activeTrains[index] = train;
    } else {
      activeTrains.push(train);
    }
  }
  recalculateAllTrainETAs();
  return activeTrains;
}

export function loadRealRailwayData(): TrainJourney[] {
  activeTrains = JSON.parse(JSON.stringify(REAL_INDIAN_RAILWAY_TRAINS));
  recalculateAllTrainETAs();
  return activeTrains;
}

export function restoreSampleTrains(): TrainJourney[] {
  activeTrains = JSON.parse(JSON.stringify(sampleMasterTrains));
  recalculateAllTrainETAs();
  return activeTrains;
}

export function getMasterTrains(): TrainJourney[] {
  return activeTrains;
}

export function getTrainByNumber(trainNo: string): TrainJourney | undefined {
  return activeTrains.find((t) => t.trainNumber === trainNo);
}

/**
 * Recalculate dynamic predictions for all trains based on their ground parameters
 */
export function recalculateAllTrainETAs() {
  activeTrains = activeTrains.map((train) => {
    const updatedStations = calculateDynamicETA(
      train.stations,
      train.currentKm,
      train.currentDelayMinutes,
      train.speedRestrictions,
      train.weather,
      train.currentBlockSection,
      train.type,
      train.locomotive.mpsKmph
    );

    const destinationStation = updatedStations[updatedStations.length - 1];
    const dynFinalDelay = destinationStation.delayMinutesML;
    const tradFinalDelay = destinationStation.delayMinutesTraditional;

    return {
      ...train,
      stations: updatedStations,
      dynamicMLForecastFinalDelayMinutes: dynFinalDelay,
      traditionalForecastFinalDelayMinutes: tradFinalDelay,
      lastUpdatedIso: new Date().toISOString(),
    };
  });
}

// Initial calculation run
recalculateAllTrainETAs();

/**
 * Apply real-time disruption simulation
 */
export function simulateDisruption(payload: DisruptionSimulationPayload): TrainJourney | null {
  const train = activeTrains.find((t) => t.trainNumber === payload.trainNumber);
  if (!train) return null;

  if (payload.disruptionType === 'CLEAR_ALL') {
    train.speedRestrictions = [];
    train.weather = {
      condition: 'CLEAR',
      visibilityMeters: 4000,
      speedReductionFactor: 1.0,
      fogDeviceActive: false,
      temperatureC: 28,
    };
    train.currentBlockSection.signalAspect = 'GREEN';
    train.currentBlockSection.trackOccupancyPercent = 45;
    train.currentBlockSection.headwayDistanceKm = 12.0;
    train.currentBlockSection.currentBottleneckRating = 'NORMAL';
    train.currentDelayMinutes = Math.max(0, train.currentDelayMinutes - 15);
  } else if (payload.disruptionType === 'TSR_IMPOSITION') {
    const imposedSpeed = payload.speedCapKmph || 30;
    const tsrKm = payload.sectionKm || train.currentKm + 20;
    train.speedRestrictions.push({
      id: `TSR-SIM-${Date.now()}`,
      fromKm: tsrKm,
      toKm: tsrKm + 8,
      imposedSpeedKmph: imposedSpeed,
      normalSpeedKmph: train.locomotive.mpsKmph,
      cause: 'CAUTION_ORDER',
      active: true,
      lengthKm: 8,
      delayImpactMinutes: 14.5,
    });
    train.delayFactors.push({
      factor: `Simulated TSR ${imposedSpeed} km/h at KM ${tsrKm}`,
      impactMinutes: 14,
      description: 'Emergency Caution Order imposed due to rail fracture / track renewal',
      recoverable: false,
    });
  } else if (payload.disruptionType === 'SIGNAL_FAILURE') {
    train.currentBlockSection.signalAspect = 'RED';
    train.currentBlockSection.trackOccupancyPercent = 95;
    train.currentBlockSection.currentBottleneckRating = 'SEVERE';
    train.currentBlockSection.headwayDistanceKm = 0.8;
    train.currentDelayMinutes += 18;
    train.locomotive.currentSpeedKmph = 0;
    train.locomotive.brakingState = 'HALTED';
    train.delayFactors.push({
      factor: 'Simulated Automatic Signal Aspect Failure',
      impactMinutes: 18,
      description: 'Track circuit dropout in block section ahead; stop & proceed protocol',
      recoverable: false,
    });
  } else if (payload.disruptionType === 'DENSE_FOG') {
    train.weather = {
      condition: 'DENSE_FOG',
      visibilityMeters: 120,
      speedReductionFactor: 0.55,
      fogDeviceActive: true,
      temperatureC: 11,
    };
    train.locomotive.currentSpeedKmph = 60;
    train.delayFactors.push({
      factor: 'Sudden Dense Fog Incursion (Visibility < 150m)',
      impactMinutes: 28,
      description: 'Locopilot restricted to 60 km/h with Fog Pass Device audio beacons',
      recoverable: false,
    });
  } else if (payload.disruptionType === 'PRECEDING_FREIGHT_STALL') {
    train.currentBlockSection.signalAspect = 'YELLOW';
    train.currentBlockSection.trackOccupancyPercent = 92;
    train.currentBlockSection.headwayDistanceKm = 2.1;
    train.currentBlockSection.precedingTrainId = 'STALLED-BTPN-66102 (Petroleum Tanker)';
    train.currentBlockSection.currentBottleneckRating = 'SEVERE';
    train.currentDelayMinutes += 24;
    train.locomotive.currentSpeedKmph = 35;
    train.delayFactors.push({
      factor: 'Preceding Freight Train Stalled in Block',
      impactMinutes: 24,
      description: 'Loco traction power drop on goods train blocking down line progression',
      recoverable: false,
    });
  }

  // Re-run dynamic engine
  recalculateAllTrainETAs();
  return getTrainByNumber(payload.trainNumber) || null;
}

/**
 * Generate Station Passenger Information Display System (PIDS) data
 */
export function getStationDisplayData(stationCode: string) {
  const matchingTrains: any[] = [];

  for (const t of activeTrains) {
    const stIndex = t.stations.findIndex((s) => s.code.toUpperCase() === stationCode.toUpperCase());
    if (stIndex >= 0) {
      const st = t.stations[stIndex];
      matchingTrains.push({
        trainNumber: t.trainNumber,
        trainName: t.trainName,
        hindiName: t.hindiName,
        origin: t.origin,
        destination: t.destination,
        scheduledTime: st.scheduledArrival || st.scheduledDeparture,
        traditionalEta: st.traditionalEta,
        dynamicMLEta: st.dynamicML_Eta,
        confidenceInterval: `${st.confidenceIntervalMin} - ${st.confidenceIntervalMax}`,
        delayMinutesTraditional: st.delayMinutesTraditional,
        delayMinutesML: st.delayMinutesML,
        platform: st.platform,
        status: st.status,
        varianceMinutes: st.varianceVsTraditional,
        locoClass: t.locomotive.locoClass,
        zone: t.zone,
      });
    }
  }

  return {
    stationCode: stationCode.toUpperCase(),
    stationName:
      stationCode === 'NDLS'
        ? 'NEW DELHI / नई दिल्ली'
        : stationCode === 'CNB'
        ? 'KANPUR CENTRAL / कानपुर सेंट्रल'
        : stationCode === 'PRYJ'
        ? 'PRAYAGRAJ JN / प्रयागराज जं.'
        : stationCode === 'DDU'
        ? 'PT. DEEN DAYAL UPADHYAYA JN / पं. दीन दयाल उपाध्याय'
        : stationCode === 'HWH'
        ? 'HOWRAH JN / हावड़ा जंक्शन'
        : stationCode === 'BSB'
        ? 'VARANASI JN / वाराणसी जंक्शन'
        : stationCode === 'MMCT'
        ? 'MUMBAI CENTRAL / मुंबई सेंट्रल'
        : stationCode,
    currentTime: new Date().toLocaleTimeString('en-IN', { hour12: false }),
    trains: matchingTrains,
  };
}
