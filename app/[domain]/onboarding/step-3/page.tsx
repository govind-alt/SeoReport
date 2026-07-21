"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const steps = [
  { n: 1, label: "Agency Profile" },
  { n: 2, label: "Connect SERanking" },
  { n: 3, label: "Import Projects" },
  { n: 4, label: "Branding" },
];

function WizardProgress({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "28px" }}>
      {steps.map((step, i) => (
        <div key={step.n} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0,
              background: step.n < current ? "#16a34a" : step.n === current ? "#3b82f6" : "rgba(255,255,255,0.1)",
              color: step.n <= current ? "#fff" : "#64748b",
              border: step.n === current ? "2px solid #60a5fa" : "none"
            }}>
              {step.n < current ? "✓" : step.n}
            </div>
            <span style={{ fontSize: "11px", fontWeight: step.n === current ? 700 : 400, color: step.n === current ? "#e2e8f0" : step.n < current ? "#86efac" : "#64748b", whiteSpace: "nowrap" }}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && <div style={{ flex: 1, height: "2px", margin: "0 10px", background: step.n < current ? "#16a34a" : "rgba(255,255,255,0.1)" }} />}
        </div>
      ))}
    </div>
  );
}

// Mock SERanking projects
const MOCK_PROJECTS = [
  { id: "site_12345", name: "Acme Corp", url: "acmecorp.com", keywords: 124 },
  { id: "site_23456", name: "TechStart", url: "techstart.io", keywords: 87 },
  { id: "site_34567", name: "GreenLeaf", url: "greenleaf.com", keywords: 56 },
  { id: "site_45678", name: "BlueSky Marketing", url: "bluesky.co.uk", keywords: 203 },
  { id: "site_56789", name: "Innovate Labs", url: "innovatelabs.com", keywords: 145 },
  { id: "site_67890", name: "ProReach Digital", url: "proreach.io", keywords: 78 },
];

type MappingStatus = "mapped" | "pending" | "unmapped";

interface ProjectMapping {
  projectId: string;
  clientName: string;
  status: MappingStatus;
}

export default function OnboardingStep3({ params }: { params: Promise<{ domain: string }> }) {
  const router = useRouter();
  const [projects] = useState(MOCK_PROJECTS);
  const [mappings, setMappings] = useState<Record<string, ProjectMapping>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const setMapping = (projectId: string, clientName: string) => {
    setMappings(prev => ({
      ...prev,
      [projectId]: {
        projectId,
        clientName,
        status: clientName ? (clientName === "create" ? "pending" : "mapped") : "unmapped"
      }
    }));
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.url.toLowerCase().includes(search.toLowerCase())
  );

  const mappedCount = Object.values(mappings).filter(m => m.status === "mapped").length;
  const pendingCount = Object.values(mappings).filter(m => m.status === "pending").length;
  const unmappedCount = projects.length - mappedCount - pendingCount;

  const handleContinue = async () => {
    setLoading(true);
    try {
      const resolvedParams = await params;
      router.push(`/${resolvedParams.domain}/onboarding/step-4`);
    } catch {
      router.push("/login");
    }
  };

  const handleBack = async () => {
    const resolvedParams = await params;
    router.push(`/${resolvedParams.domain}/onboarding/step-2`);
  };

  const statusColors: Record<MappingStatus, { bg: string; color: string; label: string }> = {
    mapped: { bg: "rgba(34,197,94,0.15)", color: "#86efac", label: "Mapped ✓" },
    pending: { bg: "rgba(245,158,11,0.15)", color: "#fcd34d", label: "Pending" },
    unmapped: { bg: "rgba(100,116,139,0.15)", color: "#94a3b8", label: "Unmapped" },
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "32px 24px", fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      <div style={{ width: "100%", maxWidth: "780px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#f1f5f9" }}>Welcome to RankFlow! Let&apos;s set up your workspace 🚀</div>
          <div style={{ fontSize: "13px", color: "#64748b" }}>Complete 4 quick steps to start generating SEO reports</div>
        </div>
        <WizardProgress current={3} />

        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <div style={{ fontSize: "17px", fontWeight: 700, color: "#f1f5f9" }}>Step 3: Map SERanking Projects to Clients</div>
            <button type="button" style={{ padding: "8px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#94a3b8", fontSize: "12px", cursor: "pointer" }}>
              🔄 Refresh from SERanking
            </button>
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px" }}>
            We found <strong style={{ color: "#e2e8f0" }}>{projects.length} projects</strong> in your SERanking account. Map each project to a client in RankFlow.
          </div>

          {/* Search and filter */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <input type="text" placeholder="🔍 Search projects..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, padding: "9px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#f1f5f9", fontSize: "13px", outline: "none" }} />
            <button type="button" onClick={() => {
              MOCK_PROJECTS.forEach(p => setMapping(p.id, p.name));
            }} style={{ padding: "9px 14px", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "8px", color: "#93c5fd", fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap" }}>
              Auto-create all clients
            </button>
          </div>

          {/* Table */}
          <div style={{ borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", marginBottom: "12px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.05)" }}>
                  {["SERanking Project", "URL", "Keywords", "Map to Client", "Status"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((project, i) => {
                  const mapping = mappings[project.id];
                  const status: MappingStatus = mapping?.status || "unmapped";
                  const sc = statusColors[status];
                  return (
                    <tr key={project.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: "13px" }}>{project.name}</div>
                        <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>{project.id}</div>
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: "12px", color: "#94a3b8" }}>{project.url}</td>
                      <td style={{ padding: "10px 14px", fontSize: "13px", color: "#e2e8f0", fontWeight: 600 }}>{project.keywords}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <select
                          value={mapping?.clientName || ""}
                          onChange={e => setMapping(project.id, e.target.value)}
                          style={{ padding: "6px 10px", background: "rgba(30,41,59,0.9)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "#f1f5f9", fontSize: "12px", outline: "none", width: "100%" }}>
                          <option value="">Select or create client...</option>
                          <option value="create">+ Create new client</option>
                          <option value={project.name}>{project.name} (existing)</option>
                        </select>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ background: sc.bg, color: sc.color, padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600 }}>
                          {sc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: "11px", color: "#64748b" }}>
              Showing {filtered.length} of {projects.length} projects · <strong style={{ color: "#e2e8f0" }}>{mappedCount} mapped, {pendingCount} pending, {unmappedCount} unmapped</strong> · You can map the rest later from client settings
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
            <button type="button" onClick={handleBack} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#94a3b8", fontSize: "13px", padding: "10px 18px", cursor: "pointer" }}>← Back</button>
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" onClick={handleContinue} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "#94a3b8", fontSize: "13px", padding: "10px 18px", cursor: "pointer" }}>Map rest later</button>
              <button type="button" onClick={handleContinue} disabled={loading} style={{
                padding: "10px 24px", background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer"
              }}>
                Save & Continue → Step 4
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
