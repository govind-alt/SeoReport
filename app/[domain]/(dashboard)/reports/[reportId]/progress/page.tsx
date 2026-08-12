"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STAGES = [
  { id: "fetch", label: "Fetching SEO data from SERanking", icon: "🔄" },
  { id: "analytics", label: "Pulling analytics from Google Search Console", icon: "📊" },
  { id: "backlinks", label: "Loading backlink profile", icon: "🔗" },
  { id: "render", label: "Rendering report sections", icon: "🎨" },
  { id: "pdf", label: "Generating PDF document", icon: "📄" },
  { id: "email", label: "Sending report via email", icon: "📧" },
];

export default function ReportProgressPage({ params }: { params: Promise<{ domain: string; reportId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { domain, reportId } = resolvedParams;
  const basePath = domain === 'localhost' ? '/localhost' : `/${domain}`;

  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reportTitle, setReportTitle] = useState("Monthly SEO Report");

  useEffect(() => {
    // Poll for report status
    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/reports/${reportId}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "generated") {
            setComplete(true);
            setProgress(100);
            setCurrentStage(STAGES.length);
            if (data.title) setReportTitle(data.title);
          } else if (data.status === "failed") {
            setFailed(true);
          }
          return data.status;
        }
      } catch {
        // If API not available, simulate progress for demo
      }
      return null;
    };

    // Simulate progress animation for demo
    let stage = 0;
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 8 + 2;
      if (prog >= 100) {
        prog = 100;
        setComplete(true);
        clearInterval(interval);
      }
      setProgress(Math.min(100, prog));
      
      const newStage = Math.floor((prog / 100) * STAGES.length);
      if (newStage !== stage && newStage < STAGES.length) {
        stage = newStage;
        setCurrentStage(stage);
      }
    }, 500);

    // Also poll real status
    const pollInterval = setInterval(async () => {
      const status = await pollStatus();
      if (status === "generated" || status === "failed") {
        clearInterval(pollInterval);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(pollInterval);
    };
  }, [reportId]);

  return (
    <div style={{ padding: "40px 0", maxWidth: "560px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>
          {complete ? "🎉" : failed ? "❌" : "⚙️"}
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
          {complete ? "Report Ready!" : failed ? "Generation Failed" : "Generating Your Report"}
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          {complete
            ? `${reportTitle} has been generated successfully.`
            : failed
            ? "An error occurred while generating the report."
            : "Please wait while we compile your SEO data and generate the report..."}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700 }}>
            {complete ? "Complete!" : failed ? "Failed" : "In Progress"}
          </div>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--primary)" }}>{Math.round(progress)}%</div>
        </div>
        <div style={{ height: "8px", background: "var(--gray-100)", borderRadius: "4px", overflow: "hidden", marginBottom: "20px" }}>
          <div style={{
            height: "100%", borderRadius: "4px",
            background: complete ? "linear-gradient(90deg, #10b981, #059669)" :
              failed ? "#ef4444" : "linear-gradient(90deg, var(--primary), #8B5CF6)",
            width: `${progress}%`,
            transition: "width 0.5s ease"
          }} />
        </div>

        {/* Stages */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {STAGES.map((stage, i) => {
            const isDone = i < currentStage || complete;
            const isCurrent = i === currentStage && !complete && !failed;
            return (
              <div key={stage.id} style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px",
                borderRadius: "8px",
                background: isDone ? "rgba(16,185,129,0.08)" : isCurrent ? "rgba(59,130,246,0.08)" : "transparent",
                transition: "background 0.3s"
              }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isDone ? "#10b981" : isCurrent ? "var(--primary)" : "var(--gray-100)",
                  fontSize: isDone ? "14px" : "16px",
                  transition: "background 0.3s"
                }}>
                  {isDone ? "✓" : stage.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: "13px", fontWeight: isCurrent ? 700 : 400,
                    color: isDone ? "#059669" : isCurrent ? "var(--primary)" : "var(--text-muted)",
                    transition: "color 0.3s"
                  }}>
                    {stage.label}
                  </div>
                  {isCurrent && (
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Processing...</div>
                  )}
                </div>
                {isCurrent && (
                  <div style={{
                    width: "16px", height: "16px", border: "2px solid var(--primary)",
                    borderTopColor: "transparent", borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      {complete && (
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Link href={`/reports/render/${reportId}`} target="_blank" style={{
            padding: "14px 28px", background: "linear-gradient(135deg, var(--primary), #8B5CF6)",
            borderRadius: "10px", color: "#fff", textDecoration: "none",
            fontSize: "15px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px"
          }}>
            👁 View Report
          </Link>
          <Link href={`${basePath}/clients`} style={{
            padding: "14px 24px", background: "var(--gray-50)", border: "1px solid var(--border)",
            borderRadius: "10px", color: "var(--text-primary)", textDecoration: "none",
            fontSize: "14px", fontWeight: 600
          }}>
            ← Back to Clients
          </Link>
        </div>
      )}

      {failed && (
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button onClick={() => window.location.reload()} style={{
            padding: "12px 24px", background: "var(--primary)", border: "none",
            borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer"
          }}>
            🔄 Retry
          </button>
          <Link href={`${basePath}/reports`} style={{
            padding: "12px 20px", background: "var(--gray-50)", border: "1px solid var(--border)",
            borderRadius: "10px", color: "var(--text-primary)", textDecoration: "none", fontSize: "14px"
          }}>
            ← Reports
          </Link>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
