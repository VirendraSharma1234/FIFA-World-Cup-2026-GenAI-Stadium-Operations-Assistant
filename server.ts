/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import {
  StadiumState,
  StadiumConfig,
  MatchState,
  GateMetric,
  ZoneMetric,
  RestroomMetric,
  ConcessionMetric,
  TransitMetric,
  ActiveIncident,
  FanSentiment,
  StaffRecommendation,
  FanAlert
} from "./src/types";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Host Stadium Configurations
const STADIUMS: { [id: string]: StadiumConfig } = {
  metlife: {
    id: "metlife",
    name: "MetLife Stadium (New York New Jersey Stadium)",
    city: "East Rutherford, NJ",
    country: "USA",
    capacity: 82500
  },
  azteca: {
    id: "azteca",
    name: "Estadio Azteca",
    city: "Mexico City",
    country: "Mexico",
    capacity: 87523
  },
  bcplace: {
    id: "bcplace",
    name: "BC Place",
    city: "Vancouver, BC",
    country: "Canada",
    capacity: 54500
  }
};

// Initial State Generator
function createInitialState(stadiumId: string): StadiumState {
  const stadium = STADIUMS[stadiumId] || STADIUMS.metlife;
  
  const match: MatchState = {
    team1: stadiumId === "azteca" ? "Mexico" : stadiumId === "bcplace" ? "Canada" : "USA",
    team2: "Argentina",
    score1: 1,
    score2: 1,
    minute: 35,
    half: 1,
    attendance: Math.floor(stadium.capacity * 0.94)
  };

  const gates: GateMetric[] = [
    { id: "gate_a", name: "Gate A (North Entrance)", throughputMin: 220, waitTimeMinutes: 8, scannerStatus: "OPERATIONAL", totalEntered: Math.floor(match.attendance * 0.28) },
    { id: "gate_b", name: "Gate B (East Entrance)", throughputMin: 180, waitTimeMinutes: 12, scannerStatus: "OPERATIONAL", totalEntered: Math.floor(match.attendance * 0.24) },
    { id: "gate_c", name: "Gate C (South Plaza)", throughputMin: 240, waitTimeMinutes: 5, scannerStatus: "OPERATIONAL", totalEntered: Math.floor(match.attendance * 0.30) },
    { id: "gate_d", name: "Gate D (West VIP)", throughputMin: 90, waitTimeMinutes: 3, scannerStatus: "OPERATIONAL", totalEntered: Math.floor(match.attendance * 0.12) }
  ];

  const zones: ZoneMetric[] = [
    { id: "zone_north", name: "North Concourse (Lower/Upper)", occupancyPercentage: 78, crowdDensity: "MEDIUM", medicalStaffCount: 4, securityStaffCount: 16 },
    { id: "zone_south", name: "South Concourse (Lower/Upper)", occupancyPercentage: 82, crowdDensity: "HIGH", medicalStaffCount: 4, securityStaffCount: 18 },
    { id: "zone_east", name: "East Concourse (Lower/Upper)", occupancyPercentage: 65, crowdDensity: "MEDIUM", medicalStaffCount: 3, securityStaffCount: 12 },
    { id: "zone_west", name: "West Concourse (Lower/Upper)", occupancyPercentage: 70, crowdDensity: "MEDIUM", medicalStaffCount: 3, securityStaffCount: 14 },
    { id: "zone_club", name: "Club Level & Suites", occupancyPercentage: 90, crowdDensity: "HIGH", medicalStaffCount: 2, securityStaffCount: 20 }
  ];

  const restrooms: RestroomMetric[] = [
    { id: "rest_n1", name: "Restroom N1 (North - L1)", level: 1, gender: "ALL_GENDER", waitTimeMinutes: 4, cleanlinessStatus: "EXCELLENT", isAccessible: true },
    { id: "rest_n2", name: "Restroom N2 (North - L2)", level: 2, gender: "MALE", waitTimeMinutes: 11, cleanlinessStatus: "GOOD", isAccessible: false },
    { id: "rest_s1", name: "Restroom S1 (South - L1)", level: 1, gender: "FEMALE", waitTimeMinutes: 14, cleanlinessStatus: "GOOD", isAccessible: true },
    { id: "rest_s2", name: "Restroom S2 (South - L2)", level: 2, gender: "FEMALE", waitTimeMinutes: 18, cleanlinessStatus: "NEEDS_CLEANING", isAccessible: true },
    { id: "rest_e1", name: "Restroom E1 (East - L1)", level: 1, gender: "MALE", waitTimeMinutes: 3, cleanlinessStatus: "GOOD", isAccessible: true },
    { id: "rest_w1", name: "Restroom W1 (West - L1)", level: 1, gender: "ALL_GENDER", waitTimeMinutes: 2, cleanlinessStatus: "EXCELLENT", isAccessible: true }
  ];

  const concessions: ConcessionMetric[] = [
    {
      id: "conc_n1",
      name: "Trophy Burgers & Fries",
      level: 1,
      cuisine: "American / Fast Food",
      waitTimeMinutes: 9,
      inventoryLevels: { "Burgers": 82, "Fries": 75, "Soda": 90, "Water": 88 },
      isAccessible: true
    },
    {
      id: "conc_s1",
      name: "Global Taco Stadium",
      level: 1,
      cuisine: "Mexican / Street Food",
      waitTimeMinutes: 15,
      inventoryLevels: { "Tacos": 60, "Nachos": 50, "Soda": 85, "Water": 70 },
      activePromotion: "15% off Nachos before Halftime",
      isAccessible: true
    },
    {
      id: "conc_e1",
      name: "Kickoff Pizza Slice",
      level: 1,
      cuisine: "Italian / Pizza",
      waitTimeMinutes: 12,
      inventoryLevels: { "Pizza Slices": 72, "Garlic Knots": 40, "Soda": 95, "Water": 92 },
      isAccessible: false
    },
    {
      id: "conc_w1",
      name: "Arena Healthy Bites",
      level: 1,
      cuisine: "Salads / Vegan Options",
      waitTimeMinutes: 4,
      inventoryLevels: { "Vegan Wraps": 90, "Fruit Cups": 85, "Smoothies": 80, "Water": 95 },
      isAccessible: true
    },
    {
      id: "conc_c1",
      name: "Champion Craft Beer & Dogs",
      level: 2,
      cuisine: "Hot Dogs / Local Beer",
      waitTimeMinutes: 8,
      inventoryLevels: { "Hot Dogs": 85, "Pretzels": 65, "Craft Beer": 78, "Water": 85 },
      isAccessible: true
    }
  ];

  const transit: TransitMetric[] = [
    { id: "transit_rail", type: "TRAIN", name: "Express Rail Link (Central Station)", status: "ON_TIME", delayMinutes: 0, congestionLevel: "MEDIUM", nextArrivalMinutes: 6 },
    { id: "transit_shuttle", type: "BUS", name: "FIFA Plaza Shuttles", status: "ON_TIME", delayMinutes: 0, congestionLevel: "LOW", nextArrivalMinutes: 4 },
    { id: "transit_rideshare", type: "RIDESHARE", name: "Gate D Uber/Lyft Hub", status: "ON_TIME", delayMinutes: 0, congestionLevel: "HIGH", nextArrivalMinutes: 5 },
    { id: "transit_parking", type: "PARKING", name: "East Lot Parking Shuttle", status: "ON_TIME", delayMinutes: 0, congestionLevel: "LOW", nextArrivalMinutes: 8 }
  ];

  const incidents: ActiveIncident[] = [
    {
      id: "inc_01",
      title: "Concourse Congestion Block",
      description: "Severe overcrowding detected around Concession S1 (Global Taco) spilling into Section 120 corridor.",
      location: "South Concourse, Section 120",
      severity: "MEDIUM",
      category: "CROWD_MANAGEMENT",
      timestamp: new Date().toLocaleTimeString(),
      status: "DISPATCHED",
      recommendations: [
        "Deploy 3 crowd managers to Section 120 to divide queue streams",
        "Display alternative concessions on overhead monitors at South Concourse",
        "Enable one-way pedestrian routing"
      ]
    }
  ];

  const sentiment: FanSentiment = {
    positivePercentage: 68,
    neutralPercentage: 22,
    negativePercentage: 10,
    trendingKeywords: ["Kickoff", "Atmosphere", "MetLife Stadium", "Tacos", "Security queue"]
  };

  return {
    stadium,
    match,
    gates,
    zones,
    restrooms,
    concessions,
    transit,
    incidents,
    sentiment
  };
}

// In-Memory App State
let currentStadiumId = "metlife";
let appState = createInitialState(currentStadiumId);
let recommendations: StaffRecommendation[] = [
  {
    id: "rec_01",
    category: "crowd",
    priority: "medium",
    title: "South Concourse Crowd Division",
    message: "Deploy 3 additional crowd control stewards to South Concourse Section 120 to divide concession and restroom queues.",
    timestamp: new Date().toLocaleTimeString(),
    isImplemented: false
  },
  {
    id: "rec_02",
    category: "transit",
    priority: "low",
    title: "Post-Match Transit Capacity Alert",
    message: "Pre-alert rail dispatcher to prepare supplementary cars for post-match departure surge at the Express Rail Link.",
    timestamp: new Date().toLocaleTimeString(),
    isImplemented: false
  }
];

let alerts: FanAlert[] = [
  {
    id: "alert_01",
    title: "South Concourse Traffic Update",
    message: "The South Concourse near Section 120 is currently highly active. For a faster experience, try concessions in the West Concourse (Section 140) where wait times are under 4 minutes.",
    timestamp: new Date().toLocaleTimeString(),
    category: "info",
    targetGroup: "South Concourse"
  }
];

// Lazy Gemini API Client Initializer
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined in the environment. Please configure it in your Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Robust fallback and retry helper for Gemini API to handle high load (503 / 429) errors gracefully
async function generateContentWithFallback(ai: GoogleGenAI, params: any): Promise<any> {
  const modelsToTry = [
    "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite"
  ];
  
  let lastError: any = null;
  
  for (const model of modelsToTry) {
    const attempts = 2; // Try up to 2 times for each model
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        console.log(`Attempting Gemini generation using model ${model} (attempt ${attempt}/${attempts})...`);
        const response = await ai.models.generateContent({
          ...params,
          model: model // Ensure the candidate model is used
        });
        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini generation failed for model ${model} (attempt ${attempt}/${attempts}):`, err.message || err);
        
        // Check if error is a high-demand or transient spike (503 / 429)
        const errStr = String(err.message || err).toLowerCase();
        const isTransient = errStr.includes("503") || 
                            errStr.includes("unavailable") || 
                            errStr.includes("429") || 
                            errStr.includes("exhausted") || 
                            errStr.includes("demand") ||
                            errStr.includes("overloaded");
        
        if (isTransient && attempt < attempts) {
          // Pause slightly before retry
          const waitTime = 1200 * attempt;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else if (!isTransient) {
          // If it's a non-transient error (like parameters error), don't retry, move to next model
          break;
        }
      }
    }
  }
  
  throw lastError || new Error("All Gemini generation model candidates and retries failed.");
}

// Background simulation ticker (ticks every 12 seconds)
setInterval(() => {
  // Advance match minute
  if (appState.match.minute < 90) {
    appState.match.minute += 1;
    if (appState.match.minute === 45) {
      appState.match.half = "HALFTIME";
    } else if (appState.match.minute === 46) {
      appState.match.half = 2;
    }
  } else if (appState.match.minute >= 90) {
    appState.match.half = "POST_MATCH";
  }

  // Simulating gate total entries increasing
  const enteredRate = appState.match.minute < 15 ? 120 : appState.match.minute < 45 ? 15 : 5;
  appState.gates.forEach(gate => {
    if (gate.scannerStatus === "OPERATIONAL") {
      gate.totalEntered = Math.min(appState.stadium.capacity * 0.24, gate.totalEntered + enteredRate);
    } else if (gate.scannerStatus === "DEGRADED") {
      gate.totalEntered = Math.min(appState.stadium.capacity * 0.24, gate.totalEntered + Math.floor(enteredRate * 0.5));
    }
  });

  // Fluctuating wait times slightly
  appState.concessions.forEach(c => {
    const fluctuation = Math.random() > 0.5 ? 1 : -1;
    c.waitTimeMinutes = Math.max(2, Math.min(25, c.waitTimeMinutes + fluctuation));
    // Consume a bit of inventory
    Object.keys(c.inventoryLevels).forEach(item => {
      const consumption = Math.random() > 0.7 ? 1 : 0;
      c.inventoryLevels[item] = Math.max(15, c.inventoryLevels[item] - consumption);
    });
  });

  appState.restrooms.forEach(r => {
    const fluctuation = Math.random() > 0.6 ? 2 : -1;
    r.waitTimeMinutes = Math.max(1, Math.min(25, r.waitTimeMinutes + fluctuation));
  });

  // Real-time Automated Anomaly Detection
  appState.gates.forEach(gate => {
    if (gate.scannerStatus === "FAILED" && !recommendations.some(r => r.title.includes(gate.name))) {
      const recId = `rec_auto_gate_${gate.id}`;
      recommendations.unshift({
        id: recId,
        category: "security",
        priority: "critical",
        title: `${gate.name} Scanner Malfunction`,
        message: `${gate.name} has experienced a hardware/software failure. Dispatch technical support immediately and redirect incoming queues.`,
        timestamp: new Date().toLocaleTimeString(),
        isImplemented: false
      });
    }
  });

  appState.concessions.forEach(c => {
    if (c.waitTimeMinutes >= 20 && !recommendations.some(r => r.title.includes(c.name))) {
      const recId = `rec_auto_conc_${c.id}`;
      recommendations.unshift({
        id: recId,
        category: "concessions",
        priority: "medium",
        title: `${c.name} Queue Warning`,
        message: `${c.name} wait times have exceeded 20 minutes. Distribute a real-time smart discount to nearby stands to load-balance traffic.`,
        timestamp: new Date().toLocaleTimeString(),
        isImplemented: false
      });
    }
  });

}, 12000);

// ==========================================
// API ENDPOINTS
// ==========================================

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Get Stadium State
app.get("/api/stadium-state", (req, res) => {
  res.json({
    state: appState,
    recommendations,
    alerts
  });
});

// Change Stadium
app.post("/api/stadium-state/select", (req, res) => {
  const { stadiumId } = req.body;
  if (!STADIUMS[stadiumId]) {
    return res.status(400).json({ error: "Invalid stadium selected." });
  }
  currentStadiumId = stadiumId;
  appState = createInitialState(currentStadiumId);
  
  // Reset recommendations & alerts
  recommendations = [
    {
      id: "rec_01",
      category: "crowd",
      priority: "medium",
      title: "South Concourse Crowd Division",
      message: "Deploy 3 additional crowd control stewards to South Concourse Section 120 to divide concession and restroom queues.",
      timestamp: new Date().toLocaleTimeString(),
      isImplemented: false
    }
  ];
  alerts = [
    {
      id: "alert_01",
      title: "Welcome to " + appState.stadium.name,
      message: "Enjoy the match! Stay tuned to this companion app for live directions, concession wait times, and exclusive halftime promotions.",
      timestamp: new Date().toLocaleTimeString(),
      category: "info",
      targetGroup: "All Fans"
    }
  ];

  res.json({
    success: true,
    state: appState,
    recommendations,
    alerts
  });
});

// Simulate Incident
app.post("/api/simulate-incident", (req, res) => {
  const { category, type } = req.body;
  const timestamp = new Date().toLocaleTimeString();

  let incident: ActiveIncident | null = null;

  if (category === "MEDICAL") {
    incident = {
      id: "inc_" + Date.now(),
      title: "Heat Exhaustion Alert",
      description: "A fan has collapsed near Upper Tier Section 315 due to heat and poor ventilation.",
      location: "Upper Tier, Section 315",
      severity: "HIGH",
      category: "MEDICAL",
      timestamp,
      status: "REPORTED",
      recommendations: [
        "Dispatch nearest paramedics team (Team Alpha) to Section 315",
        "Direct Section 315 stewards to clear corridors for medical cart access",
        "Distribute hydration notices on overhead video panels in the Upper Tier"
      ]
    };
    
    // Add staff recommendation
    recommendations.unshift({
      id: "rec_" + incident.id,
      category: "medical",
      priority: "high",
      title: "Emergency Dispatch: Section 315",
      message: "Paramedic team dispatch initiated to Section 315. Coordinate with Section 315 supervisor to ensure clear corridor access.",
      timestamp,
      isImplemented: false
    });

  } else if (category === "SECURITY") {
    incident = {
      id: "inc_" + Date.now(),
      title: "Gate B Scanner System Failure",
      description: "Network glitch caused 4 ticketing scanners at Gate B to lose connection, creating sudden backup queue.",
      location: "Gate B (East Entrance)",
      severity: "CRITICAL",
      category: "SECURITY",
      timestamp,
      status: "REPORTED",
      recommendations: [
        "Deploy mobile backup scanners to Gate B entrance instantly",
        "Instruct security supervisors to switch ticket scanning to manual validation mode if connection is down > 5 mins",
        "Push real-time redirect alert to incoming fans approaching Gate B"
      ]
    };

    // Update Gate state
    const gateB = appState.gates.find(g => g.id === "gate_b");
    if (gateB) {
      gateB.scannerStatus = "FAILED";
      gateB.waitTimeMinutes = 35;
    }

    recommendations.unshift({
      id: "rec_" + incident.id,
      category: "security",
      priority: "critical",
      title: "Gate B Technical Breakdown",
      message: "Deploy immediate backup scanners and redirect incoming fans from East Plaza to Gate A to avoid hazardous choke points.",
      timestamp,
      isImplemented: false
    });

    // Push Fan Alert
    alerts.unshift({
      id: "alert_gate_b",
      title: "Gate B (East) Entry Delay",
      message: "Gate B is currently experiencing heavy queuing due to technical issues. If you have not entered yet, please proceed to Gate A or Gate C for immediate, wait-free scanning.",
      timestamp,
      category: "danger",
      targetGroup: "East Entrance Fans"
    });

  } else if (category === "TRANSIT") {
    incident = {
      id: "inc_" + Date.now(),
      title: "Rail Service Delay",
      description: "A minor signaling incident on the Express Rail Link has caused a 20-minute delay for inbound/outbound transit lines.",
      location: "Express Rail Link Station",
      severity: "MEDIUM",
      category: "TRANSIT",
      timestamp,
      status: "REPORTED",
      recommendations: [
        "Inform station coordinators and deploy crowd barriers to manage queuing safely",
        "Increase availability of regional FIFA Shuttle Buses to transport fans to key city hotels",
        "Display transit delay warning on all public address displays"
      ]
    };

    // Update Transit state
    const rail = appState.transit.find(t => t.id === "transit_rail");
    if (rail) {
      rail.status = "DELAYED";
      rail.delayMinutes = 20;
      rail.congestionLevel = "CRITICAL";
    }

    recommendations.unshift({
      id: "rec_" + incident.id,
      category: "transit",
      priority: "high",
      title: "Rail Delay Mitigation Plan",
      message: "Coordinate with City Shuttles to activate auxiliary bus loops to redirect rail commuters towards main hub stations.",
      timestamp,
      isImplemented: false
    });

    // Push Fan Alert
    alerts.unshift({
      id: "alert_rail",
      title: "Transit Delay: Rail Service",
      message: "Express Rail Link is currently experiencing a 20-minute signal delay. Complementary FIFA Shuttle Buses are departing continuously from Gate C Shuttle Hub.",
      timestamp,
      category: "warning",
      targetGroup: "Transit Users"
    });
  }

  if (incident) {
    appState.incidents.unshift(incident);
    appState.sentiment.negativePercentage = Math.min(40, appState.sentiment.negativePercentage + 8);
    appState.sentiment.positivePercentage = Math.max(40, appState.sentiment.positivePercentage - 8);
    res.json({ success: true, incident });
  } else {
    res.status(400).json({ error: "Invalid incident simulation request." });
  }
});

// Resolve Incident
app.post("/api/resolve-incident", (req, res) => {
  const { incidentId } = req.body;
  const incidentIndex = appState.incidents.findIndex(inc => inc.id === incidentId);
  
  if (incidentIndex !== -1) {
    const inc = appState.incidents[incidentIndex];
    inc.status = "RESOLVED";
    
    // Restore Gate / Transit state if it was linked to the incident
    if (inc.title.includes("Gate B")) {
      const gateB = appState.gates.find(g => g.id === "gate_b");
      if (gateB) {
        gateB.scannerStatus = "OPERATIONAL";
        gateB.waitTimeMinutes = 8;
      }
      alerts = alerts.filter(a => a.id !== "alert_gate_b");
    }
    if (inc.title.includes("Rail Service")) {
      const rail = appState.transit.find(t => t.id === "transit_rail");
      if (rail) {
        rail.status = "ON_TIME";
        rail.delayMinutes = 0;
        rail.congestionLevel = "MEDIUM";
      }
      alerts = alerts.filter(a => a.id !== "alert_rail");
    }

    // Update sentiment positively
    appState.sentiment.negativePercentage = Math.max(5, appState.sentiment.negativePercentage - 6);
    appState.sentiment.positivePercentage = Math.min(85, appState.sentiment.positivePercentage + 6);

    res.json({ success: true, state: appState });
  } else {
    res.status(404).json({ error: "Incident not found" });
  }
});

// Implement Staff Recommendation
app.post("/api/implement-recommendation", (req, res) => {
  const { recId } = req.body;
  const rec = recommendations.find(r => r.id === recId);
  if (rec) {
    rec.isImplemented = true;
    
    // Add success feedback or action
    if (rec.title.includes("South Concourse")) {
      const zoneSouth = appState.zones.find(z => z.id === "zone_south");
      if (zoneSouth) {
        zoneSouth.securityStaffCount += 3;
      }
    }
    res.json({ success: true, recommendations });
  } else {
    res.status(404).json({ error: "Recommendation not found" });
  }
});

// Concession Deal Push
app.post("/api/concession-deal", (req, res) => {
  const { concessionId, discountText } = req.body;
  const concession = appState.concessions.find(c => c.id === concessionId);
  if (concession) {
    concession.activePromotion = discountText;
    
    const dealAlert: FanAlert = {
      id: "deal_" + Date.now(),
      title: `Special Offer: ${concession.name}`,
      message: `${discountText}! Located on Level ${concession.level}. Skip the line and get delicious refreshments now.`,
      timestamp: new Date().toLocaleTimeString(),
      category: "deal",
      targetGroup: "All Fans"
    };

    alerts.unshift(dealAlert);
    res.json({ success: true, concession, alerts });
  } else {
    res.status(404).json({ error: "Concession not found" });
  }
});


// ==========================================
// GEMINI INTELLIGENCE API ENDPOINTS
// ==========================================

// Staff Assistant Operations Endpoint
app.post("/api/staff-assistant", async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    const ai = getGeminiClient();

    // Prepare live stadium context details
    const activeIncidentsStr = appState.incidents
      .map(i => `- [${i.severity}] ${i.title} at ${i.location} (Status: ${i.status}) - ${i.description}`)
      .join("\n") || "No critical active incidents reported.";

    const gatesStr = appState.gates
      .map(g => `- ${g.name}: Wait Time ${g.waitTimeMinutes}m, Scanner: ${g.scannerStatus}, Entries: ${g.totalEntered}`)
      .join("\n");

    const zonesStr = appState.zones
      .map(z => `- ${z.name}: Occupancy ${z.occupancyPercentage}%, Density ${z.crowdDensity}, Guards: ${z.securityStaffCount}`)
      .join("\n");

    const transitStr = appState.transit
      .map(t => `- ${t.name} (${t.type}): Status ${t.status}, Delay ${t.delayMinutes}m, Congestion ${t.congestionLevel}`)
      .join("\n");

    const systemInstruction = `You are the Stadium Operations Command Center Assistant for the FIFA World Cup 2026. You are an expert strategist in crowd control, security management, medical triage, and stadium logistics. 

Current Stadium Context:
- Stadium: ${appState.stadium.name} in ${appState.stadium.city} (Capacity: ${appState.stadium.capacity})
- Current Match: ${appState.match.team1} vs ${appState.match.team2}, Minute: ${appState.match.minute}' (${appState.match.half})
- Active Incidents:\n${activeIncidentsStr}
- Gates Overview:\n${gatesStr}
- Zones & Density:\n${zonesStr}
- Transit Overview:\n${transitStr}

Your Role:
Analyze operational staff concerns or queries based on this actual live data. Act like a high-level strategic director.
Ensure you always provide a strictly structured response with the following format:
- **Situation Assessment**: Summarize the operational status, highlighting immediate risks based on the current data.
- **Risk Analysis**: Map out secondary consequences (crush hazards, gate breaches, transit blockages) if unmitigated.
- **Recommended Actions**: A prioritized, numbered, step-by-step mitigation plan that can be deployed right now. Be practical, resource-conscious, and tactical.
- **Resource Allocation**: Specify how many stewards, guards, paramedics, or facility technicians should be redeployed or set to high alert.

Important Guardrails:
1. Prioritize human safety and secure crowd flow over any other metrics.
2. Acknowledge your limitations as an AI. If the user asks for actions or data outside of our stadium state parameters, explain that clearly without guessing.
3. Be professional, authoritative, and direct. Avoid conversational filler or introductory greetings in your output.`;

    // Format chat history for @google/genai
    const formattedContents = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((h: any) => {
        formattedContents.push({
          role: h.role,
          parts: [{ text: h.content }]
        });
      });
    }
    // Append the latest user query
    formattedContents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await generateContentWithFallback(ai, {
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.3,
        topP: 0.9
      }
    });

    const replyText = response.text || "I was unable to analyze the stadium command center operations at this moment. Please retry.";
    res.json({ reply: replyText });

  } catch (error: any) {
    console.error("Gemini Staff Assistant Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with the Gemini Operational Intelligence Engine." });
  }
});


// Fan Assistant Chatbot Endpoint (Multilingual Concierge)
app.post("/api/fan-chatbot", async (req, res) => {
  try {
    const { message, chatHistory, userLocation, isAccessibilityMode } = req.body;
    const ai = getGeminiClient();

    // Context summarizing nearby amenities & delays
    const restroomsStr = appState.restrooms
      .map(r => `- ${r.name} (Level ${r.level}): Wait ${r.waitTimeMinutes}m, Status: ${r.cleanlinessStatus}, Accessible: ${r.isAccessible ? "Yes" : "No"}`)
      .join("\n");

    const concessionsStr = appState.concessions
      .map(c => `- ${c.name} (Level ${c.level}, ${c.cuisine}): Wait ${c.waitTimeMinutes}m, Active Deal: ${c.activePromotion || "None"}`)
      .join("\n");

    const activeFanAlertsStr = alerts
      .map(a => `[${a.category.toUpperCase()}] ${a.title}: ${a.message}`)
      .join("\n") || "No urgent delay alerts.";

    const systemInstruction = `You are the Personalized Fan Companion App Multilingual Assistant for the FIFA World Cup 2026. You are a warm, supportive, and highly informative concierge helper for fans attending the matches at ${appState.stadium.name} in ${appState.stadium.city}.

Current Live Context for Fans:
- Match Status: ${appState.match.team1} vs ${appState.match.team2} (${appState.match.minute}' - ${appState.match.half})
- Fan's Current Location: ${userLocation || "Entering Stadium"}
- Accessibility Assistance Active: ${isAccessibilityMode ? "YES" : "NO"}
- Restrooms Overview:\n${restroomsStr}
- Concessions Overview:\n${concessionsStr}
- Live Safety & Transit Alerts:\n${activeFanAlertsStr}

Your Guidelines:
1. **Multilingualism**: Detect the language of the fan's query (e.g. Spanish, Portuguese, German, Japanese, English, etc.) and respond perfectly in that same language.
2. **Direct, Concise, Friendly Answers**: Fans are in a noisy stadium looking at a mobile screen. Keep paragraphs very short (max 2-3 sentences), use bullet points, and highlight exact names/locations in bold.
3. **Accessibility Integration**: If Accessibility mode is YES, or if a user hints at a disability (e.g., wheelchair, cane, stroller, sensory overload):
   - Always map paths that are step-free, specifically directing them to elevators and accessible restrooms/ramps.
   - Highlight any accessible facilities and sensory-friendly zones if relevant.
   - Provide direct options to request physical helper stewards (Guest Services) to meet them at their location.
4. **Dynamic Directions**:
   - Provide step-by-step walking navigation from their current location.
   - Advise them to avoid congested zones (such as South Concourse Section 120) based on current live alerts.
5. **No Medical/Legal Advice**: If a fan reports a health issue or security hazard, immediately instruct them to notify a steward or go to the nearest First Aid Station. Do not diagnose.
6. **Acknowledge Limitations**: If they ask about something we don't have data for (e.g., player signatures, specific ticket purchases), direct them politely to the nearest Guest Services booth. Do not hallucinate details.`;

    // Format chat history for @google/genai
    const formattedContents = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((h: any) => {
        formattedContents.push({
          role: h.role,
          parts: [{ text: h.content }]
        });
      });
    }
    // Append the latest user query
    formattedContents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await generateContentWithFallback(ai, {
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.5,
        topP: 0.95
      }
    });

    const replyText = response.text || "Hello! I am ready to guide you around the stadium. What can I help you find?";
    res.json({ reply: replyText });

  } catch (error: any) {
    console.error("Gemini Fan Assistant Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with the Gemini Fan Assistance Chatbot." });
  }
});


// ==========================================
// VITE OR STATIC FILE SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting development server with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FIFA World Cup 2026 GenAI Operations Assistant running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
