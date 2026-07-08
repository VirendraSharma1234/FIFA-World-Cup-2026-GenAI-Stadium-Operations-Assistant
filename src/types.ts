/**
 * Types for the FIFA World Cup 2026 Stadium Operations & Fan Assistant
 */

export type UserRole = 'fan' | 'staff';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
  category?: 'general' | 'transit' | 'safety' | 'accessibility' | 'sustainability' | 'concession';
  actionableLink?: {
    label: string;
    actionType: 'highlight_gate' | 'transit_info' | 'accessibility_map' | 'report_issue';
    payload: string;
  };
}

export interface StadiumIncident {
  id: string;
  type: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  status: 'reported' | 'dispatching' | 'resolving' | 'resolved';
  timestamp: string;
  reportedBy: 'fan' | 'volunteer' | 'sensor';
  volunteerAssigned?: string;
  playbook?: {
    steps: string[];
    paScript: {
      en: string;
      es: string;
      fr: string;
    };
    estimatedTime: string;
  };
}

export interface GateStatus {
  id: string;
  name: string;
  density: 'low' | 'moderate' | 'high' | 'critical';
  waitTimeMinutes: number;
  isOpen: boolean;
  accessible: boolean;
}

export interface TransitLine {
  id: string;
  name: string;
  type: 'subway' | 'bus' | 'shuttle' | 'train';
  status: 'normal' | 'delayed' | 'crowded' | 'suspended';
  frequencyMinutes: number;
  nextDeparture: string;
  sustainabilityRating: 'A+' | 'A' | 'B';
}

export interface SustainabilityMetric {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
  icon: string;
}
