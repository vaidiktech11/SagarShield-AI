export type RiskSeverity = 'high' | 'moderate' | 'stable';

export type AssetType = 'substation' | 'hospital' | 'shelter' | 'road' | 'port' | 'water_supply';

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface CycloneTrackPoint {
  timeOffsetHours: number; // e.g., -48, -24, -12, -6, 0 (landfall), 6
  timeLabel: string;
  lat: number;
  lng: number;
  windSpeedKmph: number;
  centralPressureHpa: number;
  surgeHeightMeters: number;
  category: string; // e.g. "Severe Cyclonic Storm", "Super Cyclone"
  radiusKm: number;
}

export interface CycloneProfile {
  id: string;
  name: string;
  state: string;
  coastalZone: string;
  historicalReference?: string;
  landfallTime: string;
  maxWindSpeedKmph: number;
  peakSurgeHeightMeters: number;
  lowestPressureHpa: number;
  track: CycloneTrackPoint[];
  center: GeoCoordinate;
  zoom: number;
  description: string;
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  category: AssetType;
  district: string;
  state: string;
  panchayat: string;
  location: GeoCoordinate;
  elevationMeters: number; // Copernicus DEM 30m retrieved elevation
  criticality: 'Critical' | 'High' | 'Medium';
  capacityOrSpecs: string;
  backupPowerAvailable: boolean;
  accessRoadId?: string;
  baselineVulnerability: number; // 1-10
}

export interface AssetRiskAssessment {
  assetId: string;
  assetName: string;
  vulnerabilityScore: number; // 1-10
  severity: RiskSeverity;
  elevationMeters: number;
  predictedSurgeWaterLevel: number;
  surgeDeltaMeters: number; // elevation - surge water level (negative means flooded)
  floodingProbabilityPercent: number;
  powerOutageRisk: 'Imminent' | 'Likely' | 'Unlikely';
  accessSeveranceRisk: 'Severed' | 'Restricted' | 'Accessible';
  evacuationCorridorSafe: boolean;
  operationalImpact: string;
  tacticalHardeningMeasures: string[];
  aiReasoning: string;
  recommendedEvacuationTimeHours: number;
  priorityLevel: 'P0 - Immediate Evacuate' | 'P1 - Deploy Defenses' | 'P2 - Standby & Monitor';
}

export interface ElevationContourPoint {
  lat: number;
  lng: number;
  elevation: number;
  inundated: boolean;
  waterDepthMeters: number;
}

export interface DistrictAdvisory {
  cycloneName: string;
  district: string;
  timestamp: string;
  alertLevel: 'Red Warning (Take Action)' | 'Orange Warning (Be Prepared)' | 'Yellow Watch';
  english: {
    title: string;
    executiveSummary: string;
    districtMagistrateDirectives: string[];
    panchayatPublicSms: string;
    chokePointsIdentified: string[];
    evacuationDeadline: string;
  };
  odia: {
    title: string;
    executiveSummary: string;
    districtMagistrateDirectives: string[];
    panchayatPublicSms: string;
    evacuationDeadline: string;
  };
  telugu: {
    title: string;
    executiveSummary: string;
    districtMagistrateDirectives: string[];
    panchayatPublicSms: string;
    evacuationDeadline: string;
  };
  bengali: {
    title: string;
    executiveSummary: string;
    districtMagistrateDirectives: string[];
    panchayatPublicSms: string;
    evacuationDeadline: string;
  };
  hindi: {
    title: string;
    executiveSummary: string;
    districtMagistrateDirectives: string[];
    panchayatPublicSms: string;
    evacuationDeadline: string;
  };
}

export interface SlideItem {
  number: number;
  title: string;
  subtitle: string;
  category: string;
  bullets: string[];
  keyMetric: string;
  metricLabel: string;
  architectureHighlight?: string;
  quote?: string;
}
