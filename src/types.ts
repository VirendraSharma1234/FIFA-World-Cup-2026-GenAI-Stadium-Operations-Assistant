/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GateMetric {
  id: string;
  name: string;
  throughputMin: number;
  waitTimeMinutes: number;
  scannerStatus: 'OPERATIONAL' | 'DEGRADED' | 'FAILED';
  totalEntered: number;
}

export interface ZoneMetric {
  id: string;
  name: string; // North, South, East, West, Club, Suite
  occupancyPercentage: number;
  crowdDensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  medicalStaffCount: number;
  securityStaffCount: number;
}

export interface RestroomMetric {
  id: string;
  name: string;
  level: number;
  gender: 'MALE' | 'FEMALE' | 'ALL_GENDER';
  waitTimeMinutes: number;
  cleanlinessStatus: 'EXCELLENT' | 'GOOD' | 'NEEDS_CLEANING';
  isAccessible: boolean;
}

export interface ConcessionMetric {
  id: string;
  name: string;
  level: number;
  cuisine: string;
  waitTimeMinutes: number;
  inventoryLevels: { [item: string]: number }; // item name to stock percentage
  activePromotion?: string;
  isAccessible: boolean;
}

export interface TransitMetric {
  id: string;
  type: 'TRAIN' | 'BUS' | 'RIDESHARE' | 'PARKING';
  name: string;
  status: 'ON_TIME' | 'DELAYED' | 'SUSPENDED';
  delayMinutes: number;
  congestionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  nextArrivalMinutes: number;
}

export interface ActiveIncident {
  id: string;
  title: string;
  description: string;
  location: string; // Section or area
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'CROWD_MANAGEMENT' | 'SECURITY' | 'MEDICAL' | 'FACILITY' | 'TRANSIT';
  timestamp: string;
  status: 'REPORTED' | 'DISPATCHED' | 'RESOLVING' | 'RESOLVED';
  recommendations: string[];
}

export interface FanSentiment {
  positivePercentage: number;
  neutralPercentage: number;
  negativePercentage: number;
  trendingKeywords: string[];
}

export interface MatchState {
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  minute: number;
  half: 1 | 2 | 'PRE_MATCH' | 'POST_MATCH' | 'HALFTIME';
  attendance: number;
}

export interface StadiumConfig {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  stadiumMapUrl?: string;
}

export interface StadiumState {
  stadium: StadiumConfig;
  match: MatchState;
  gates: GateMetric[];
  zones: ZoneMetric[];
  restrooms: RestroomMetric[];
  concessions: ConcessionMetric[];
  transit: TransitMetric[];
  incidents: ActiveIncident[];
  sentiment: FanSentiment;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface StaffRecommendation {
  id: string;
  category: 'crowd' | 'security' | 'medical' | 'concessions' | 'transit';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  isImplemented: boolean;
}

export interface FanAlert {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'danger' | 'warning' | 'info' | 'deal';
  targetGroup?: string; // e.g. "Gates", "Section 100", "All Fans"
}
