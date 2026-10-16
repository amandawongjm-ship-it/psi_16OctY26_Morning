export type RegionId = 'north' | 'south' | 'east' | 'west' | 'central' | 'national';

export type PSILevelName = 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';

export interface PSIBandInfo {
  name: PSILevelName;
  min: number;
  max: number;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  description: string;
  generalHealthAdvisory: string;
  vulnerableAdvisory: string;
  chronicAdvisory: string;
  maskRecommendation: string;
  outdoorStatus: 'normal' | 'caution' | 'reduce' | 'avoid' | 'stay_indoors';
}

export interface RegionAirQuality {
  id: RegionId;
  name: string;
  displayName: string;
  psi: number;
  pm25_1hr: number;
  pm25_24hr: number;
  pm10_24hr: number;
  so2: number;
  co: number;
  o3: number;
  no2: number;
  band: PSIBandInfo;
  dominantPollutant: string;
  trend: 'rising' | 'falling' | 'stable';
  coordinates: { lat: number; lng: number };
  majorTowns: string[];
}

export interface HistoricalReading {
  time: string;
  displayHour: string;
  psi: Record<RegionId, number>;
  pm25: Record<RegionId, number>;
}

export interface WeatherCondition {
  windSpeedKmH: number;
  windDirection: string;
  windDegree: number;
  tempC: number;
  humidity: number;
  visibilityKm: number;
  monsoonPeriod: string;
  hotspotsSumatra: number;
}

export interface AirQualitySnapshot {
  timestamp: string;
  updateTimestamp: string;
  status: 'live' | 'cached' | 'simulated';
  apiSource: string;
  regions: Record<RegionId, RegionAirQuality>;
  nationalPSI: number;
  highestRegion: RegionId;
  highestPSI: number;
  hourlyHistory: HistoricalReading[];
  weather: WeatherCondition;
}

export interface AlertRuleSettings {
  enabled: boolean;
  psiThreshold: number; // e.g. 101 for Unhealthy
  pm25Threshold: number; // e.g. 56 for Elevated
  targetRegion: RegionId | 'all';
  soundEnabled: boolean;
  browserPushEnabled: boolean;
  sensitiveGroupMode: boolean; // Trigger early warning
  autoRefreshInterval: number; // in seconds, default 60
}

export interface AlertNotificationItem {
  id: string;
  timestamp: string;
  regionId: RegionId | 'all';
  regionName: string;
  psi: number;
  pm25: number;
  threshold: number;
  levelName: PSILevelName;
  headline: string;
  recommendation: string;
  read: boolean;
  systemNotified: boolean;
}
