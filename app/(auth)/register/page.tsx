"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    if (password.length === 0) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    if (score <= 1) return { score, label: "Very Weak", color: "#ef4444" };
    if (score === 2) return { score, label: "Weak", color: "#f97316" };
    if (score === 3) return { score, label: "Fair", color: "#eab308" };
    if (score === 4) return { score, label: "Strong", color: "#22c55e" };
    return { score: 5, label: "Very Strong", color: "#16a34a" };
  };
  const { score, label, color } = getStrength();
  if (!password) return null;
  return (
    <div style={{ marginTop: "6px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{
            height: "4px", flex: 1, borderRadius: "2px",
            background: i <= score ? color : "#e2e8f0",
            transition: "background 0.3s"
          }} />
        ))}
      </div>
      <div style={{ fontSize: "11px", color, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [subdomainStatus, setSubdomainStatus] = useState<"idle"|"checking"|"available"|"taken">("idle");
  const [showToS, setShowToS] = useState(false);

  // Debounced subdomain check
  useEffect(() => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainStatus("idle");
      return;
    }
    setSubdomainStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/register?subdomain=${encodeURIComponent(subdomain)}`);
        const data = await res.json();
        setSubdomainStatus(data.available ? "available" : "taken");
      } catch {
        setSubdomainStatus("idle");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [subdomain]);

  const handleAgencyNameChange = (val: string) => {
    setAgencyName(val);
    if (!subdomain) {
      const auto = val.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, "-");
      setSubdomain(auto.slice(0, 30));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!agreeTerms) {
      setError("You must agree to the Terms of Service");
      return;
    }
    if (subdomainStatus === "taken") {
      setError("This subdomain is already taken. Please choose another.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, agencyName, subdomain, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto sign in
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (!signInRes?.error) {
        router.push("/verify-email?email=" + encodeURIComponent(email));
      } else {
        router.push("/login");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const subdomainColor = subdomainStatus === "available" ? "#16a34a" : subdomainStatus === "taken" ? "#ef4444" : "#94a3b8";
  const subdomainMsg = subdomainStatus === "available" ? `✓ Available — dashboard: ${subdomain}.rankflow.app`
    : subdomainStatus === "taken" ? "✗ Already taken. Please choose another."
    : subdomainStatus === "checking" ? "Checking availability..."
    : "";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      {/* ToS Modal */}
      {showToS && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "24px"
        }} onClick={() => setShowToS(false)}>
          <div style={{
            background: "#fff", borderRadius: "12px", padding: "32px", maxWidth: "560px",
            width: "100%", maxHeight: "80vh", overflow: "auto"
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>Terms of Service</h2>
            <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.7 }}>
              By using RankFlow, you agree to use the platform in accordance with applicable laws. 
              You are responsible for maintaining the confidentiality of your account credentials. 
              RankFlow reserves the right to suspend accounts that violate these terms. 
              All data is processed securely and never shared with third parties without consent.
              This is a 14-day free trial — no credit card required.
            </p>
            <button style={{
              marginTop: "20px", background: "#3b82f6", color: "#fff", border: "none",
              padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 600
            }} onClick={() => setShowToS(false)}>Close</button>
          </div>
        </div>
      )}

      <div style={{
        background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px",
        padding: "40px", width: "100%", maxWidth: "480px"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "48px", height: "48px", background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", fontWeight: 800, color: "#fff", margin: "0 auto 12px"
          }}>RF</div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#f1f5f9", marginBottom: "4px" }}>Create Agency Account</div>
          <div style={{ fontSize: "13px", color: "#94a3b8" }}>Start automating your SEO reports — 14-day free trial</div>
        </div>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)",
            borderRadius: "8px", padding: "12px 16px", marginBottom: "20px",
            color: "#fca5a5", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px"
          }}>❌ {error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            {[
              { label: "First Name", value: firstName, onChange: setFirstName, placeholder: "John", id: "fn" },
              { label: "Last Name", value: lastName, onChange: setLastName, placeholder: "Doe", id: "ln" }
            ].map(f => (
              <div key={f.id}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>{f.label} *</label>
                <input id={f.id} type="text" placeholder={f.placeholder} required value={f.value}
                  onChange={e => f.onChange(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px",
                    color: "#f1f5f9", fontSize: "14px", outline: "none", boxSizing: "border-box"
                  }} />
              </div>
            ))}
          </div>

          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>Work Email *</label>
            <input type="email" placeholder="john@youragency.com" required value={email} autoComplete="off"
              onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#f1f5f9", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>

          {/* Agency Name */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>Agency Name *</label>
            <input type="text" placeholder="Digital Horizons Agency" required value={agencyName} autoComplete="organization"
              onChange={e => handleAgencyNameChange(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#f1f5f9", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Shown on all client reports</div>
          </div>

          {/* Subdomain */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>Agency Subdomain *</label>
            <div style={{ display: "flex", gap: "0" }}>
              <input type="text" placeholder="digital-horizons" required value={subdomain} autoComplete="off"
                onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.08)", border: `1px solid ${subdomainStatus === "available" ? "#16a34a" : subdomainStatus === "taken" ? "#ef4444" : "rgba(255,255,255,0.15)"}`, borderRadius: "8px 0 0 8px", color: "#f1f5f9", fontSize: "14px", outline: "none" }} />
              <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderLeft: "none", borderRadius: "0 8px 8px 0", color: "#94a3b8", fontSize: "13px", whiteSpace: "nowrap" }}>.rankflow.app</div>
            </div>
            {subdomainMsg && <div style={{ fontSize: "11px", color: subdomainColor, marginTop: "4px" }}>{subdomainMsg}</div>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>Password *</label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" required value={password} autoComplete="new-password"
                onChange={e => setPassword(e.target.value)}
                style={{ width: "100%", padding: "10px 44px 10px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#f1f5f9", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "16px" }}>
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>Confirm Password *</label>
            <div style={{ position: "relative" }}>
              <input type={showConfirm ? "text" : "password"} placeholder="••••••••" required value={confirmPassword} autoComplete="new-password"
                onChange={e => setConfirmPassword(e.target.value)}
                style={{ width: "100%", padding: "10px 44px 10px 14px", background: "rgba(255,255,255,0.08)", border: `1px solid ${confirmPassword && confirmPassword !== password ? "#ef4444" : "rgba(255,255,255,0.15)"}`, borderRadius: "8px", color: "#f1f5f9", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "16px" }}>
                {showConfirm ? "🙈" : "👁"}
              </button>
            </div>

            {confirmPassword && confirmPassword !== password && (
              <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>⚠ Passwords do not match</div>
            )}
          </div>

          {/* Checkboxes */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer" }}>
              <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)}
                style={{ marginTop: "2px", flexShrink: 0 }} />
              <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                I agree to the <button type="button" onClick={() => setShowToS(true)} style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "13px", padding: 0, textDecoration: "underline" }}>Terms of Service</button> and <a href="#" style={{ color: "#60a5fa" }}>Privacy Policy</a>
              </span>
            </label>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer" }}>
              <input type="checkbox" checked={marketingConsent} onChange={e => setMarketingConsent(e.target.checked)}
                style={{ marginTop: "2px", flexShrink: 0 }} />
              <span style={{ fontSize: "13px", color: "#94a3b8" }}>I&apos;d like to receive product updates and tips (optional)</span>
            </label>
          </div>

          <button type="submit" disabled={loading || subdomainStatus === "taken"} style={{
            width: "100%", padding: "14px", background: loading ? "#475569" : "linear-gradient(135deg, #3b82f6, #6366f1)",
            border: "none", borderRadius: "10px", color: "#fff", fontSize: "15px", fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s"
          }}>
            {loading ? "Creating Account..." : "Create Agency Account →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#64748b" }}>
          Already have an account? <Link href="/login" style={{ color: "#60a5fa", textDecoration: "none" }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
