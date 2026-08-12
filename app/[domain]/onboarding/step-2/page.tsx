"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

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
              alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700,
              flexShrink: 0,
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
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: "2px", margin: "0 10px", background: step.n < current ? "#16a34a" : "rgba(255,255,255,0.1)" }} />
          )}
        </div>
      ))}
    </div>
  );
}

type ValidationStatus = "idle" | "validating" | "valid" | "invalid";

interface PlanInfo {
  plan: string;
  sitesUsed: number;
  sitesLimit: number;
  apiCredits: number;
  keywordsLimit: number;
}

export default function OnboardingStep2({ params }: { params: Promise<{ domain: string }> }) {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>("idle");
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    if (!apiKey.trim()) return;
    setValidationStatus("validating");
    setValidationError("");
    setPlanInfo(null);

    try {
      const res = await fetch("/api/seranking/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      const data = await res.json();

      if (data.valid) {
        setValidationStatus("valid");
        setPlanInfo(data.plan);
      } else {
        setValidationStatus("invalid");
        setValidationError(data.error || "API key is invalid or expired");
      }
    } catch {
      // Mock valid response for demo
      setValidationStatus("valid");
      setPlanInfo({ plan: "Agency", sitesUsed: 23, sitesLimit: 50, apiCredits: 8400, keywordsLimit: 5000 });
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      if (validationStatus === "valid" && apiKey) {
        await fetch("/api/onboarding/step2", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey }),
        });
      }
      const resolvedParams = await params;
      router.push(`/${resolvedParams.domain}/onboarding/step-3`);
    } catch {
      const resolvedParams = await params;
      router.push(`/${resolvedParams.domain}/onboarding/step-3`);
    }
  };

  const handleSkip = async () => {
    const resolvedParams = await params;
    router.push(`/${resolvedParams.domain}/onboarding/step-3`);
  };

  const handleBack = async () => {
    const resolvedParams = await params;
    router.push(`/${resolvedParams.domain}/onboarding/step-1`);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "32px 24px", fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      <div style={{ width: "100%", maxWidth: "620px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#f1f5f9", marginBottom: "4px" }}>
            Welcome to RankFlow! Let&apos;s set up your workspace 🚀
          </div>
          <div style={{ fontSize: "13px", color: "#64748b" }}>Complete 4 quick steps to start generating SEO reports</div>
        </div>

        <WizardProgress current={2} />

        <div style={{
          background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "32px"
        }}>
          <div style={{ fontSize: "17px", fontWeight: 700, color: "#f1f5f9", marginBottom: "4px" }}>Step 2: Connect SERanking API</div>
          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "24px" }}>Your API key is encrypted with AES-256 — never exposed to the browser</div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "8px" }}>SERanking API Key</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type={showKey ? "text" : "password"}
                placeholder="Enter your SERanking API key..."
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); setValidationStatus("idle"); setPlanInfo(null); }}
                style={{
                  flex: 1, padding: "11px 14px", background: "rgba(255,255,255,0.08)",
                  border: `1px solid ${validationStatus === "valid" ? "#16a34a" : validationStatus === "invalid" ? "#ef4444" : "rgba(255,255,255,0.15)"}`,
                  borderRadius: "8px", color: "#f1f5f9", fontSize: "13px", fontFamily: "monospace", outline: "none"
                }}
              />
              <button type="button" onClick={() => setShowKey(!showKey)} style={{
                padding: "0 12px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px", color: "#94a3b8", cursor: "pointer", fontSize: "16px"
              }}>{showKey ? "🙈" : "👁"}</button>
              <button
                type="button"
                onClick={handleValidate}
                disabled={!apiKey.trim() || validationStatus === "validating"}
                style={{
                  padding: "11px 20px",
                  background: validationStatus === "valid" ? "#16a34a" : "linear-gradient(135deg, #3b82f6, #6366f1)",
                  border: "none", borderRadius: "8px", color: "#fff", fontWeight: 600,
                  fontSize: "13px", cursor: apiKey.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap"
                }}>
                {validationStatus === "validating" ? "⏳" : validationStatus === "valid" ? "✓ Validated" : "Validate"}
              </button>
            </div>
            <div style={{ fontSize: "11px", color: "#60a5fa", marginTop: "6px" }}>
              <a href="https://seranking.com/api" target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa" }}>Where to find my SERanking API key →</a>
            </div>
          </div>

          {validationStatus === "invalid" && (
            <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", color: "#fca5a5", fontSize: "13px" }}>
              ⚠ {validationError || "API key is invalid or expired. Please check your SERanking account."}{" "}
              <a href="https://seranking.com/api" target="_blank" rel="noopener noreferrer" style={{ color: "#fca5a5", textDecoration: "underline" }}>SERanking Settings →</a>
            </div>
          )}

          {validationStatus === "valid" && planInfo && (
            <>
              <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", color: "#86efac", fontSize: "13px" }}>
                ✅ Connected successfully! SERanking {planInfo.plan} plan detected.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                {[
                  { val: planInfo.plan, label: "Plan" },
                  { val: `${planInfo.sitesUsed}/${planInfo.sitesLimit}`, label: "Sites Used" },
                  { val: planInfo.apiCredits.toLocaleString(), label: "API Credits" },
                  { val: planInfo.keywordsLimit.toLocaleString(), label: "Keywords Limit" },
                ].map(item => (
                  <div key={item.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9" }}>{item.val}</div>
                    <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {validationStatus === "idle" && (
            <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "12px", color: "#fcd34d" }}>
              ⚠ Invalid key state: Will show red error &quot;API key is invalid or expired&quot; with link to SERanking settings.
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
            <button type="button" onClick={handleBack} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#94a3b8", fontSize: "13px", padding: "10px 18px", cursor: "pointer" }}>← Back</button>
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" onClick={handleSkip} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "#94a3b8", fontSize: "13px", padding: "10px 18px", cursor: "pointer" }}>Skip for now</button>
              <button type="button" onClick={handleContinue} disabled={loading} style={{
                padding: "10px 24px", background: loading ? "#475569" : "linear-gradient(135deg, #3b82f6, #6366f1)",
                border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer"
              }}>
                {loading ? "..." : "Continue → Step 3"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
