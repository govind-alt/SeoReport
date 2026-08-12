"use client";

import { useState, useRef } from "react";
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

const TIMEZONES = [
  "(GMT+05:30) Asia/Kolkata", "(GMT+00:00) UTC", "(GMT-05:00) America/New_York",
  "(GMT-06:00) America/Chicago", "(GMT-07:00) America/Denver", "(GMT-08:00) America/Los_Angeles",
  "(GMT+01:00) Europe/London", "(GMT+02:00) Europe/Paris", "(GMT+08:00) Asia/Singapore",
  "(GMT+09:00) Asia/Tokyo", "(GMT+10:00) Australia/Sydney", "(GMT-03:00) America/Sao_Paulo",
];

export default function OnboardingStep1({ params }: { params: Promise<{ domain: string }> }) {
  const router = useRouter();
  const logoRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [agencyName, setAgencyName] = useState("");
  const [website, setWebsite] = useState("");
  const [timezone, setTimezone] = useState("(GMT+05:30) Asia/Kolkata");
  const [country, setCountry] = useState("India");
  const [contactEmail, setContactEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyName || !timezone) {
      setError("Agency display name and timezone are required");
      return;
    }
    setLoading(true);
    try {
      // Update agency info via server action
      const formData = new FormData();
      formData.append("agencyName", agencyName);
      formData.append("website", website);
      formData.append("timezone", timezone);
      formData.append("contactEmail", contactEmail);
      formData.append("onboardingStep", "1");

      const res = await fetch("/api/onboarding/step1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyName, website, timezone, contactEmail }),
      });

      const resolvedParams = await params;
      router.push(`/${resolvedParams.domain}/onboarding/step-2`);
    } catch {
      setError("Failed to save. Please try again.");
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      const resolvedParams = await params;
      router.push(`/${resolvedParams.domain}`);
    } catch {
      router.push("/login");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "32px 24px", fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      <div style={{ width: "100%", maxWidth: "620px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#f1f5f9", marginBottom: "4px" }}>
            Welcome to RankFlow! Let&apos;s set up your workspace 🚀
          </div>
          <div style={{ fontSize: "13px", color: "#64748b" }}>Complete 4 quick steps to start generating SEO reports</div>
        </div>

        <WizardProgress current={1} />

        <div style={{
          background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "32px"
        }}>
          <div style={{ fontSize: "17px", fontWeight: 700, color: "#f1f5f9", marginBottom: "24px" }}>Step 1: Agency Profile</div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "8px", padding: "12px", marginBottom: "20px", color: "#fca5a5", fontSize: "13px" }}>❌ {error}</div>
          )}

          <form onSubmit={handleSave}>
            {/* Logo Upload */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "10px" }}>Agency Logo</label>
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div
                  onClick={() => logoRef.current?.click()}
                  style={{
                    width: "80px", height: "80px", borderRadius: "10px",
                    border: logoPreview ? "2px solid #3b82f6" : "2px dashed rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.05)", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", cursor: "pointer",
                    overflow: "hidden", flexShrink: 0, transition: "border-color 0.2s"
                  }}>
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  ) : (
                    <>
                      <span style={{ fontSize: "24px" }}>🖼</span>
                      <span style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>Upload</span>
                    </>
                  )}
                </div>
                <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoChange} style={{ display: "none" }} />
                <div style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.6 }}>
                  <div style={{ fontWeight: 600, color: "#94a3b8", marginBottom: "4px" }}>Upload your agency logo</div>
                  PNG, SVG or JPG · Recommended 200×60px<br />
                  Max file size: 2MB<br />
                  <button type="button" onClick={() => setLogoPreview("")} style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "12px", padding: 0, marginTop: "4px" }}>
                    {logoPreview ? "Remove logo" : "Skip for now →"}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginBottom: "20px" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>Agency Display Name *</label>
                <input type="text" placeholder="Digital Horizons Agency" required value={agencyName}
                  onChange={e => setAgencyName(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#f1f5f9", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "3px" }}>Shown on all client reports</div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>Agency Website</label>
                <input type="url" placeholder="https://youragency.com" value={website}
                  onChange={e => setWebsite(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#f1f5f9", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>Timezone *</label>
                <select value={timezone} onChange={e => setTimezone(e.target.value)} required
                  style={{ width: "100%", padding: "10px 14px", background: "rgba(30,41,59,0.9)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#f1f5f9", fontSize: "13px", outline: "none", boxSizing: "border-box" }}>
                  {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "3px" }}>Affects report scheduling and display times</div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>Country</label>
                <select value={country} onChange={e => setCountry(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", background: "rgba(30,41,59,0.9)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#f1f5f9", fontSize: "13px", outline: "none", boxSizing: "border-box" }}>
                  {["India", "United States", "United Kingdom", "Australia", "Canada", "Germany", "France", "Singapore"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>Primary Contact Email *</label>
              <input type="email" placeholder="admin@youragency.com" required value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#f1f5f9", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
              <div style={{ fontSize: "10px", color: "#64748b", marginTop: "3px" }}>Used for platform notifications</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button type="button" onClick={handleSkip} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#64748b", fontSize: "13px", padding: "10px 18px", cursor: "pointer" }}>
                Skip Setup
              </button>
              <button type="submit" disabled={loading} style={{
                padding: "12px 28px", background: loading ? "#475569" : "linear-gradient(135deg, #3b82f6, #6366f1)",
                border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer"
              }}>
                {loading ? "Saving..." : "Save & Continue → Step 2"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
