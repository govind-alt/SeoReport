"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px",
        padding: "40px", width: "100%", maxWidth: "400px", textAlign: "center"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>{sent ? "✅" : "🔑"}</div>
        
        {!sent ? (
          <>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#f1f5f9", marginBottom: "8px" }}>Forgot password?</div>
            <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "28px" }}>
              Enter your email and we&apos;ll send you a reset link
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)",
                borderRadius: "8px", padding: "12px", marginBottom: "20px", color: "#fca5a5", fontSize: "13px"
              }}>❌ {error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px", textAlign: "left" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>Email Address</label>
                <input type="email" placeholder="john@agency.com" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px",
                    color: "#f1f5f9", fontSize: "14px", outline: "none", boxSizing: "border-box"
                  }} />
              </div>

              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "13px", background: loading ? "#475569" : "linear-gradient(135deg, #3b82f6, #6366f1)",
                border: "none", borderRadius: "10px", color: "#fff", fontSize: "15px",
                fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginBottom: "16px"
              }}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <Link href="/login" style={{ color: "#60a5fa", fontSize: "13px", textDecoration: "none" }}>← Back to login</Link>
          </>
        ) : (
          <>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#f1f5f9", marginBottom: "8px" }}>Check your email!</div>
            <div style={{ fontSize: "14px", color: "#94a3b8", lineHeight: 1.6, marginBottom: "24px" }}>
              We&apos;ve sent a password reset link to <strong style={{ color: "#e2e8f0" }}>{email}</strong>.
              <br />The link expires in 24 hours.
            </div>
            <div style={{
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
              borderRadius: "10px", padding: "14px", marginBottom: "24px", color: "#86efac", fontSize: "13px"
            }}>
              ✅ Check your spam folder if you don&apos;t see it within a few minutes.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" style={{
                display: "block", padding: "12px", background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                borderRadius: "10px", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: "14px"
              }}>Open Gmail →</a>
              <button onClick={() => setSent(false)} style={{
                padding: "10px", background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px",
                color: "#94a3b8", fontSize: "13px", cursor: "pointer"
              }}>Send to a different email</button>
              <Link href="/login" style={{ color: "#60a5fa", fontSize: "13px", textDecoration: "none", marginTop: "4px" }}>← Back to login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
