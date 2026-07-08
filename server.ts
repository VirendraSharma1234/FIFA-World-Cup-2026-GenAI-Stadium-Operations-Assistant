import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Express
const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";

// Lazy-loaded Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured. Please add it in the Settings > Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. GenAI Assistant Chat Proxy
app.post("/api/copilot", async (req, res) => {
  try {
    const { message, role, seatCode, language, ticketTier, currentIncidentContext } = req.body;

    const ai = getGeminiClient();

    const systemInstruction = `
You are the official FIFA World Cup 2026 Multilingual Matchday AI Co-Pilot, integrated into stadium operations at MetLife Stadium / Estadio Azteca.
Your job is to provide direct, intelligent, precise, and supportive responses to user queries.
You must adapt your response based on whether the user is a 'fan' or 'venue staff/volunteer'.

USER CONTEXT:
- Role: ${role || "fan"}
- Preferred Language: ${language || "English"}
- Ticket Tier: ${ticketTier || "General Admission"}
- Seat / Location: ${seatCode || "Not scanned / General Area"}
- Active Stadium Operations Context: ${JSON.stringify(currentIncidentContext || {})}

STADIUM FACTS FOR FIFA WORLD CUP 2026:
- Gates: Gate A (North, high flow, nearest train), Gate B (East, low density), Gate C (South, VIP & ADA accessible ramps), Gate D (West, medium flow).
- Mobility & Accessibility: Level 1 has full wheelchair access. ADA Shuttle carts are available at Gate C and run continuously to transit hubs. Ramps are situated at North-East and South-West corners.
- Transportation: Rapid Transit Subway operates from Gate A Plaza directly to downtown hubs. EV Shuttles depart every 5 minutes from Gate B to the Eco-Parking lot.
- Sustainability: Fans get points for returning reusable beer/water cups to 'Green Recycling Pillars' at Concession Zones 2 and 4. The stadium runs on 100% wind-offset electricity.
- Help Desks: Located at Section 112 (Fan Zone) and Section 324 (Upper Tier).
- Emergency: Report urgent hazards via the app or find stadium stewards in yellow high-vis vests.

GUIDELINES:
1. Always answer in the requested language: ${language || "English"}.
2. If role is 'fan', keep the tone friendly, high-energy, helpful, and hospitality-focused. Direct them to Gates, food, accessibility routes, or green recycling spots.
3. If role is 'staff', keep the tone professional, objective, and action-oriented. Provide direct instructions, procedural checklists, and crowd safety hints.
4. Structure your response into a JSON payload with 'text', 'category', and 'actionableLink'.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message || "Hello! Introduce yourself briefly and give 2 stadium tips.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
              description: "The core natural language response formatted with markdown-ready spacing, paragraphs, and list items. Keep it concise, engaging, and clear."
            },
            category: {
              type: Type.STRING,
              description: "One of: 'general', 'transit', 'safety', 'accessibility', 'sustainability', 'concession'."
            },
            actionableLink: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING, description: "A highly actionable label, e.g. 'View Gate C Ramps' or 'Show Shuttle Timings'." },
                actionType: { type: Type.STRING, description: "Must be one of: 'highlight_gate', 'transit_info', 'accessibility_map', 'report_issue'." },
                payload: { type: Type.STRING, description: "Relevant identifier or location code (e.g. 'Gate C', 'shuttle_timetable', 'Section 112')." }
              }
            }
          },
          required: ["text", "category"]
        }
      }
    });

    const parsedResponse = JSON.parse(response.text || "{}");
    res.json(parsedResponse);
  } catch (error: any) {
    console.error("Gemini Copilot Error:", error);
    res.status(500).json({
      text: `Apologies, matchday communications are congested. Error: ${error.message || "Unknown GenAI Error"}`,
      category: "general"
    });
  }
});

// 3. GenAI Incident Response Playbook Generator (Staff Only)
app.post("/api/incident-playbook", async (req, res) => {
  try {
    const { incidentType, location, severity, description } = req.body;

    const ai = getGeminiClient();

    const systemInstruction = `
You are the FIFA World Cup 2026 Command Center AI Strategist.
Your task is to analyze stadium incident logs and generate a structured, professional, and rapid tactical incident response playbook.
Your output must be targeted at emergency responders, security supervisors, and volunteer stewards.

INPUT DETECTED:
- Incident Type: ${incidentType}
- Location: ${location}
- Severity: ${severity}
- Description: ${description}

STADIUM RESOURCES:
- Security Stewards: Units Alpha, Bravo, Charlie.
- Emergency Medical: Field Med-Station 1 (West Stand) and Med-Station 2 (East Stand).
- Facilities / Cleanup Crew: Rapid Response Janitorial Team.
- Public Address: Stadium-wide sound horns and jumbo digital screens.

Generate a JSON response containing:
1. 'steps': A logical sequence of 4-5 tactical steps for responders. Specify unit dispatch, crowd containment, or safety buffer zones.
2. 'paScript': A set of public address announcements to keep fans calm and informed. Provide translations in English, Spanish (Host Language/Mexico), and French (Host Language/Canada).
3. 'estimatedTime': Simple estimation of resolution time, e.g., '10-15 minutes'.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate tactical response playbook for: ${incidentType} at ${location}.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Tactical checklist actions, e.g., 'Deploy Unit Alpha to cordon Section 102'."
            },
            paScript: {
              type: Type.OBJECT,
              properties: {
                en: { type: Type.STRING, description: "PA Announcement in English" },
                es: { type: Type.STRING, description: "PA Announcement in Spanish" },
                fr: { type: Type.STRING, description: "PA Announcement in French" }
              },
              required: ["en", "es", "fr"]
            },
            estimatedTime: {
              type: Type.STRING,
              description: "E.g., '10-15 Minutes'"
            }
          },
          required: ["steps", "paScript", "estimatedTime"]
        }
      }
    });

    const parsedPlaybook = JSON.parse(response.text || "{}");
    res.json(parsedPlaybook);
  } catch (error: any) {
    console.error("Gemini Playbook Error:", error);
    res.status(500).json({
      error: "Failed to generate tactical playbook.",
      details: error.message || "Unknown error"
    });
  }
});

// -------------------------------------------------------------
// VITE CLIENT DEV MIDDLEWARE & STATIC ASSET PLAYBOOK
// -------------------------------------------------------------

async function start() {
  const distPath = path.join(process.cwd(), "dist");
  const distIndexPath = path.join(distPath, "index.html");
  const runningCompiledServer = path.basename(process.argv[1] || "") === "server.cjs";
  const shouldServeStatic = runningCompiledServer && fs.existsSync(distIndexPath);

  if (!shouldServeStatic) {
    // Development server mount
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static delivery
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[FIFA2026] Server active at http://localhost:${PORT}`);
  });
}

start();
