"use client";

import { useState, useEffect, useCallback } from "react";
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

const FONTS = ["Inter (Recommended)", "Roboto", "Open Sans", "Lato", "Poppins", "Montserrat"];

export default function OnboardingStep4({ params }: { params: Promise<{ domain: string }> }) {
  const router = useRouter();
  const [primaryColor, setPrimaryColor] = useState("#4a5270");
  const [secondaryColor, setSecondaryColor] = useState("#8B5CF6");
  const [font, setFont] = useState("Inter (Recommended)");
  const [emailFromName, setEmailFromName] = useState("Digital Horizons Reports");
  const [emailFromAddress, setEmailFromAddress] = useState("reports@digitalhorizons.com");
  const [footerText, setFooterText] = useState("Confidential — prepared by [Agency Name] for [Client Name] only.");
  const [showPoweredBy, setShowPoweredBy] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await fetch("/api/onboarding/step4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primaryColor, secondaryColor, font, emailFromName, emailFromAddress, footerText, showPoweredBy }),
      });
      const resolvedParams = await params;
      router.push(`/${resolvedParams.domain}`);
    } catch {
      const resolvedParams = await params;
      router.push(`/${resolvedParams.domain}`);
    }
  };

  const handleBack = async () => {
    const resolvedParams = await params;
    router.push(`/${resolvedParams.domain}/onboarding/step-3`);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "32px 24px", fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      <div style={{ width: "100%", maxWidth: "820px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#f1f5f9" }}>Welcome to RankFlow! Let&apos;s set up your workspace 🚀</div>
          <div style={{ fontSize: "13px", color: "#64748b" }}>Complete 4 quick steps to start generating SEO reports</div>
        </div>
        <WizardProgress current={4} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: "20px" }}>
          {/* Form */}
          <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "32px" }}>
            <div style={{ fontSize: "17px", fontWeight: 700, color: "#f1f5f9", marginBottom: "24px" }}>Step 4: White-Label Branding</div>

            {/* Brand Colors */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "10px" }}>Brand Colors</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "Primary Color", sub: "(report header, buttons)", val: primaryColor, set: setPrimaryColor },
                  { label: "Secondary Color", sub: "", val: secondaryColor, set: setSecondaryColor },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "#cbd5e1" }}>{item.label} <span style={{ fontSize: "10px", color: "#64748b" }}>{item.sub}</span></span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input type="color" value={item.val} onChange={e => item.set(e.target.value)}
                        style={{ width: "32px", height: "32px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", cursor: "pointer", background: "none", padding: "2px" }} />
                      <input type="text" value={item.val} onChange={e => item.set(e.target.value)}
                        style={{ width: "90px", padding: "6px 10px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "#f1f5f9", fontSize: "12px", fontFamily: "monospace", outline: "none" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: "10px", color: "#64748b", marginTop: "6px" }}>These colors appear in client reports and the client portal</div>
            </div>

            {/* Font */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "8px" }}>Report Font</label>
              <select value={font} onChange={e => setFont(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", background: "rgba(30,41,59,0.9)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#f1f5f9", fontSize: "13px", outline: "none" }}>
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Email */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>Email From Name</label>
                <input type="text" value={emailFromName} onChange={e => setEmailFromName(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#f1f5f9", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>Email From Address</label>
                <input type="email" value={emailFromAddress} onChange={e => setEmailFromAddress(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#f1f5f9", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "8px" }}>Report Footer Text</label>
              <textarea value={footerText} onChange={e => setFooterText(e.target.value)} rows={2}
                style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#f1f5f9", fontSize: "13px", outline: "none", boxSizing: "border-box", resize: "vertical" }} />
            </div>

            {/* Powered by toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
              <div
                onClick={() => setShowPoweredBy(!showPoweredBy)}
                style={{
                  width: "40px", height: "22px", borderRadius: "11px", cursor: "pointer", position: "relative",
                  background: showPoweredBy ? "#3b82f6" : "rgba(255,255,255,0.2)", transition: "background 0.2s", flexShrink: 0
                }}>
                <div style={{
                  position: "absolute", top: "3px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff",
                  transition: "left 0.2s", left: showPoweredBy ? "21px" : "3px"
                }} />
              </div>
              <div>
                <div style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: 600 }}>Show &quot;Powered by RankFlow&quot; badge</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Uncheck to white-label completely (Enterprise plan)</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button type="button" onClick={handleBack} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#94a3b8", fontSize: "13px", padding: "10px 18px", cursor: "pointer" }}>← Back</button>
              <button type="button" onClick={handleComplete} disabled={loading} style={{
                padding: "12px 28px", background: loading ? "#475569" : "linear-gradient(135deg, #16a34a, #059669)",
                border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer"
              }}>
                {loading ? "Saving..." : "🎉 Complete Setup & Go to Dashboard"}
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#e2e8f0", marginBottom: "14px" }}>Live Preview</div>
            <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
              {/* Report header */}
              <div style={{ background: primaryColor, padding: "14px 16px" }}>
                <div style={{ fontSize: "8px", opacity: 0.6, color: "#fff", marginBottom: "4px" }}>AGENCY LOGO</div>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#fff" }}>Monthly SEO Report</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)" }}>Acme Corp · June 2024</div>
              </div>
              {/* Report body */}
              <div style={{ background: "#fff", padding: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                  {[{ v: "8,420", l: "Sessions" }, { v: "47", l: "Top 10" }].map(item => (
                    <div key={item.l} style={{ background: "#f8fafc", borderRadius: "6px", padding: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "15px", fontWeight: 800, color: primaryColor }}>{item.v}</div>
                      <div style={{ fontSize: "9px", color: "#64748b" }}>{item.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ height: "32px", background: "#f1f5f9", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "9px", color: "#94a3b8" }}>📊 Chart</span>
                </div>
                <div style={{ fontSize: "8px", color: "#94a3b8", textAlign: "center" }}>Digital Horizons Agency · Confidential</div>
                {showPoweredBy && <div style={{ fontSize: "7px", color: secondaryColor, textAlign: "center", marginTop: "4px" }}>Powered by RankFlow</div>}
              </div>
            </div>
            <div style={{ fontSize: "10px", color: "#64748b", marginTop: "10px", textAlign: "center" }}>Preview updates as you type</div>
          </div>
        </div>
      </div>
    </div>
  );
}
