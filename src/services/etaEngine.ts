import { StationStop, SpeedRestriction, WeatherTelemetry, BlockSection } from '../types';

/**
 * Utility to parse HH:mm to minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Utility to format minutes from midnight to HH:mm (24h format, handles overflow)
 */
export function minutesToTime(totalMins: number): string {
  let normalized = Math.round(totalMins) % 1440;
  if (normalized < 0) normalized += 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Core Dynamic ETA Inference Calculation
 * Computes station-by-station arrival times using physics, ground constraints, and historical delay trends
 */
export function calculateDynamicETA(
  stations: StationStop[],
  currentKm: number,
  currentDelayMins: number,
  speedRestrictions: SpeedRestriction[],
  weather: WeatherTelemetry,
  currentBlock: BlockSection,
  trainType: string,
  normalMpsKmph: number
): StationStop[] {
  let accumulatedMLDelay = currentDelayMins;
  let accumulatedTraditionalDelay = currentDelayMins;
  let prevStationKm = currentKm;

  return stations.map((st, idx) => {
    // If station is already passed
    if (st.status === 'DEPARTED') {
      return {
        ...st,
        traditionalEta: st.actualArrival || st.scheduledArrival,
        dynamicML_Eta: st.actualArrival || st.scheduledArrival,
        confidenceIntervalMin: st.actualArrival || st.scheduledArrival,
        confidenceIntervalMax: st.actualArrival || st.scheduledArrival,
        delayMinutesTraditional: st.actualArrival
          ? Math.max(0, timeToMinutes(st.actualArrival) - timeToMinutes(st.scheduledArrival))
          : 0,
        delayMinutesML: st.actualArrival
          ? Math.max(0, timeToMinutes(st.actualArrival) - timeToMinutes(st.scheduledArrival))
          : 0,
        varianceVsTraditional: 0,
      };
    }

    const sectionDistKm = Math.max(1, st.distanceKm - prevStationKm);
    prevStationKm = st.distanceKm;

    // --- 1. Traditional NTES Formula ---
    // Traditional method assumes:
    // Future Arrival = Scheduled Arrival + Current Delay - (Static timetable recovery buffer approx 1 min per 50 km)
    const staticRecoveryMins = Math.min(accumulatedTraditionalDelay, Math.floor(sectionDistKm / 45));
    accumulatedTraditionalDelay = Math.max(0, accumulatedTraditionalDelay - staticRecoveryMins);
    const traditionalArrivalMins = timeToMinutes(st.scheduledArrival) + accumulatedTraditionalDelay;
    const traditionalEtaStr = minutesToTime(traditionalArrivalMins);

    // --- 2. Dynamic ML / Ground Physics Formula ---
    // Factors:
    // a) Active Speed Restrictions in this upcoming section
    const relevantTSRs = speedRestrictions.filter(
      (tsr) => tsr.active && tsr.toKm > (st.distanceKm - sectionDistKm) && tsr.fromKm < st.distanceKm
    );
    let tsrDelayMinutes = 0;
    for (const tsr of relevantTSRs) {
      // Time lost = (Length / TSR Speed - Length / Normal Speed) + Deceleration/Acceleration loss (approx 2.5 mins)
      const normalTime = (tsr.lengthKm / Math.min(normalMpsKmph, tsr.normalSpeedKmph)) * 60;
      const restrictedTime = (tsr.lengthKm / tsr.imposedSpeedKmph) * 60;
      const brakingLoss = 2.4; // 2.4 mins for deceleration & pickup of 24-coach rake
      tsrDelayMinutes += Math.max(0, restrictedTime - normalTime + brakingLoss);
    }

    // b) Downstream Congestion & Preceding Train Headway
    let headwayDelayMinutes = 0;
    if (idx === 0 || idx === 1) {
      // Immediate next section impact
      if (currentBlock.headwayDistanceKm < 2.5) {
        // Red / Yellow aspect halt risk
        headwayDelayMinutes += 9.5;
      } else if (currentBlock.headwayDistanceKm < 5.0) {
        // Double Yellow caution (running at 50-60% MPS)
        headwayDelayMinutes += 4.5;
      }
    }

    // c) Weather & Visibility degradation
    let weatherDelayMinutes = 0;
    if (weather.condition === 'DENSE_FOG') {
      // Fog reduces permissible speed from 130 km/h to 60-75 km/h
      const fogSpeed = weather.fogDeviceActive ? 75 : 60;
      const normalSectionTime = (sectionDistKm / normalMpsKmph) * 60;
      const fogSectionTime = (sectionDistKm / fogSpeed) * 60;
      weatherDelayMinutes = Math.max(0, (fogSectionTime - normalSectionTime) * 0.7);
    } else if (weather.condition === 'HEAVY_MONSOON') {
      weatherDelayMinutes = (sectionDistKm / normalMpsKmph) * 60 * 0.18;
    }

    // d) Yard Bottleneck / Platform Berth Wait
    // Major junction yards (e.g. Kanpur, Mughalsarai, Dadar) encounter yard approach delays
    let yardCongestionDelay = 0;
    const isMajorJunction = ['CNB', 'PRYJ', 'DDU', 'GAYA', 'DHN', 'HWH', 'BSB', 'BCT', 'BRC', 'RTM', 'KOTA', 'NDLS'].includes(st.code);
    if (isMajorJunction) {
      yardCongestionDelay += (currentBlock.trackOccupancyPercent > 80 ? 6.5 : 2.0);
    }

    // e) Real-World Recovery Capability (Dynamic slack absorption)
    // High-powered rakes (Vande Bharat with 160 km/h and high acceleration, WAP-7 Rajdhani)
    // can absorb up to 0.4 min per 10 km on open line if no TSR is present
    let recoveryCapabilityMins = 0;
    if (relevantTSRs.length === 0 && weather.condition === 'CLEAR' && currentBlock.signalAspect === 'GREEN') {
      const trainRecoveryFactor = trainType === 'VANDE_BHARAT' ? 0.055 : 0.038;
      recoveryCapabilityMins = sectionDistKm * trainRecoveryFactor;
    }

    // Dynamic Net Delay change for this station
    const netSectionDelta = tsrDelayMinutes + headwayDelayMinutes + weatherDelayMinutes + yardCongestionDelay - recoveryCapabilityMins;
    accumulatedMLDelay = Math.max(0, accumulatedMLDelay + netSectionDelta);

    const mlArrivalMins = timeToMinutes(st.scheduledArrival) + accumulatedMLDelay;
    const dynamicEtaStr = minutesToTime(mlArrivalMins);

    // Dynamic confidence interval (grows with remaining distance and volatility)
    const distRemaining = Math.max(1, st.distanceKm - currentKm);
    const uncertaintyMinutes = Math.round(1.5 + Math.sqrt(distRemaining) * 0.28 + (relevantTSRs.length * 1.5) + (weather.condition === 'DENSE_FOG' ? 4 : 0));
    
    const minMins = Math.max(timeToMinutes(st.scheduledArrival), mlArrivalMins - uncertaintyMinutes);
    const maxMins = mlArrivalMins + uncertaintyMinutes;

    const diffVsTraditional = Math.round(accumulatedMLDelay - accumulatedTraditionalDelay);

    return {
      ...st,
      traditionalEta: traditionalEtaStr,
      dynamicML_Eta: dynamicEtaStr,
      confidenceIntervalMin: minutesToTime(minMins),
      confidenceIntervalMax: minutesToTime(maxMins),
      delayMinutesTraditional: Math.round(accumulatedTraditionalDelay),
      delayMinutesML: Math.round(accumulatedMLDelay),
      varianceVsTraditional: diffVsTraditional,
    };
  });
}
