import React, { useState } from "react";
import { Shield, Users, AlertTriangle, Play, RefreshCw, PlusCircle, CheckCircle2 } from "lucide-react";
import { StadiumIncident } from "../types";

interface StaffDashboardProps {
  incidents: StadiumIncident[];
  setIncidents: React.Dispatch<React.SetStateAction<StadiumIncident[]>>;
  onInvokePlaybook: (incident: StadiumIncident) => Promise<void>;
  loadingPlaybookId: string | null;
}

export function StaffDashboard({
  incidents,
  setIncidents,
  onInvokePlaybook,
  loadingPlaybookId
}: StaffDashboardProps) {
  // New Incident Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newType, setNewType] = useState("Crowd Congestion");
  const [newLoc, setNewLoc] = useState("Gate A Entry");
  const [newSeverity, setNewSeverity] = useState<"low" | "medium" | "high">("medium");
  const [newDesc, setNewDesc] = useState("");

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    const incident: StadiumIncident = {
      id: Math.random().toString(),
      type: newType,
      location: newLoc,
      severity: newSeverity,
      description: newDesc,
      status: "reported",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reportedBy: "sensor"
    };

    setIncidents((prev) => [incident, ...prev]);
    setNewDesc("");
    setShowAddForm(false);
  };

  const handleResolveIncident = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id ? { ...inc, status: "resolved" } : inc
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview stats header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        <div>
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-500 animate-pulse" />
            Active Stadium Operations Center
          </h3>
          <p className="text-[11px] text-slate-400">Live feed of matches, stadium sensors, and spectator-reported hazards.</p>
        </div>

        <div className="flex gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-900">
            <span className="text-slate-400 mr-2">TOTAL INCIDENTS:</span>
            <span className="text-white font-bold">{incidents.length}</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-900">
            <span className="text-slate-400 mr-2">UNRESOLVED:</span>
            <span className="text-rose-400 font-bold">
              {incidents.filter((i) => i.status !== "resolved").length}
            </span>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-semibold rounded px-3 py-1.5 text-xs tracking-wide transition-all shadow-md shadow-red-950/40 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>REPORT INCIDENT</span>
          </button>
        </div>
      </div>

      {/* Trigger Incident Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateIncident}
          className="bg-slate-950 p-5 rounded-xl border border-rose-950/40 space-y-4 shadow-xl"
        >
          <div className="border-b border-rose-950/40 pb-2">
            <h4 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              File Urgent Operations Alert
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-mono uppercase text-[9px]">Alert Type:</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 outline-none"
              >
                <option value="Crowd Congestion">Crowd Congestion</option>
                <option value="Medical Spill / Slippery">Medical Spill / Slippery</option>
                <option value="Mechanical / Elevator Failure">Mechanical Failure</option>
                <option value="Lost & Found Child">Lost & Found Incident</option>
                <option value="Unattended Bag Hazard">Security Concern</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-mono uppercase text-[9px]">Location / Sector:</label>
              <select
                value={newLoc}
                onChange={(e) => setNewLoc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 outline-none"
              >
                <option value="Gate A Plaza">Gate A (North Plaza)</option>
                <option value="Section 104 Ramps">Section 104 (West Stand)</option>
                <option value="Concession Zone 4">Concession Zone 4 (South Stand)</option>
                <option value="ADA Lift Sector 312">ADA Lift (Upper Deck)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-mono uppercase text-[9px]">Severity Tier:</label>
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 outline-none"
              >
                <option value="low">Low Severity (Minor cleanup)</option>
                <option value="medium">Medium Severity (Steward dispatch)</option>
                <option value="high">High Severity (Command intervention)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-mono uppercase text-[9px]">Description & Details:</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full h-16 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-300 placeholder-slate-700 outline-none text-xs"
              placeholder="e.g. Overcrowded ticket line at Gate A has backed up into the light rail train station platform."
            />
          </div>

          <div className="flex justify-end gap-2.5 text-xs">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-850 px-4 py-2 rounded text-slate-300 font-mono"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-semibold px-5 py-2 rounded shadow-lg shadow-rose-950/60"
            >
              DISPATCH SIGNAL
            </button>
          </div>
        </form>
      )}

      {/* Incident Feed List */}
      <div className="grid grid-cols-1 gap-4">
        {incidents.map((inc) => {
          const isHigh = inc.severity === "high";
          const isMed = inc.severity === "medium";
          const isResolved = inc.status === "resolved";

          return (
            <div
              key={inc.id}
              className={`p-5 rounded-xl border transition-all ${
                isResolved
                  ? "border-slate-800/50 bg-slate-900/20 opacity-60"
                  : isHigh
                  ? "border-rose-900/60 bg-gradient-to-r from-rose-950/20 to-slate-900"
                  : isMed
                  ? "border-amber-900/50 bg-gradient-to-r from-amber-950/20 to-slate-900"
                  : "border-slate-800 bg-slate-900/45"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                        isResolved
                          ? "bg-slate-950 text-slate-400 border-slate-800"
                          : isHigh
                          ? "bg-rose-950 text-rose-400 border-rose-800 shadow-[0_0_8px_rgba(239,68,68,0.25)]"
                          : isMed
                          ? "bg-amber-950 text-amber-400 border-amber-800"
                          : "bg-slate-950 text-slate-300 border-slate-800"
                      }`}
                    >
                      {inc.severity} Severity
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Timestamp: {inc.timestamp}
                    </span>
                    <span className="text-[10px] bg-slate-950 border border-slate-800/80 px-2 py-0.5 rounded text-slate-300 font-mono">
                      Location: {inc.location}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    {inc.type}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {inc.description}
                  </p>
                </div>

                {/* Tactical Actions */}
                <div className="flex items-center gap-2 self-start md:self-center">
                  {!isResolved && (
                    <>
                      <button
                        onClick={() => onInvokePlaybook(inc)}
                        disabled={loadingPlaybookId === inc.id}
                        className="inline-flex items-center gap-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-400 text-xs font-mono font-semibold px-3 py-2 rounded transition-all disabled:opacity-50 shadow-md shadow-cyan-950/50 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingPlaybookId === inc.id ? "animate-spin" : ""}`} />
                        <span>{inc.playbook ? "GENERATE NEW PLAYBOOK" : "INVOKE GEMINI PLAYBOOK"}</span>
                      </button>

                      <button
                        onClick={() => handleResolveIncident(inc.id)}
                        className="inline-flex items-center gap-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 text-xs font-mono font-semibold px-3 py-2 rounded transition-all shadow-md shadow-emerald-950/50 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>RESOLVE INCIDENT</span>
                      </button>
                    </>
                  )}

                  {isResolved && (
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                      <CheckCircle2 className="w-4 h-4 text-slate-400" />
                      <span>RESOLVED / MITIGATED</span>
                    </div>
                  )}
                </div>
              </div>

              {/* GenAI Playbook Section (Expanded details if loaded) */}
              {inc.playbook && !isResolved && (
                <div className="mt-4 pt-4 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Steps */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                      <Play className="w-3 h-3 text-cyan-400 fill-cyan-400 animate-pulse" />
                      Tactical Playbook Steps (Gemini Response)
                    </span>
                    <ol className="list-decimal pl-4 space-y-1.5 text-xs text-slate-300 leading-relaxed">
                      {inc.playbook.steps.map((step, idx) => (
                        <li key={idx}>
                          <span className="text-slate-300">{step}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="text-[10px] text-slate-400 font-mono pt-1">
                      Est. Mitigation Time: <strong className="text-cyan-500">{inc.playbook.estimatedTime}</strong>
                    </div>
                  </div>

                  {/* Public PA Scripts */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                      📢 Public Address Broadcast Scripts
                    </span>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">English (en):</span>
                        <p className="text-slate-300 italic">"{inc.playbook.paScript.en}"</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Español (es):</span>
                        <p className="text-slate-300 italic">"{inc.playbook.paScript.es}"</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Français (fr):</span>
                        <p className="text-slate-300 italic">"{inc.playbook.paScript.fr}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
