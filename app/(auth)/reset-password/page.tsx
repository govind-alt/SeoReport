"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
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
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ height: "4px", flex: 1, borderRadius: "2px", background: i <= score ? color : "#334155", transition: "background 0.3s" }} />
        ))}
      </div>
      <div style={{ fontSize: "11px", color, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenEmail, setTokenEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      return;
    }
    fetch(`/api/auth/reset-password?token=${token}`)
      .then(r => r.json())
      .then(data => {
        setTokenValid(data.valid);
        if (data.email) setTokenEmail(data.email);
      })
      .catch(() => setTokenValid(false));
  }, [token]);

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

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Auto sign-in and redirect
      if (tokenEmail) {
        await signIn("credentials", { email: tokenEmail, password, redirect: false });
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div style={{ textAlign: "center", color: "#94a3b8" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
        Validating reset link...
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
        <div style={{ fontSize: "22px", fontWeight: 800, color: "#f1f5f9", marginBottom: "8px" }}>Link Invalid or Expired</div>
        <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "24px" }}>
          This reset link is invalid or has expired. Reset links are valid for 24 hours.
        </div>
        <Link href="/forgot-password" style={{
          display: "inline-block", padding: "12px 24px", background: "linear-gradient(135deg, #3b82f6, #6366f1)",
          borderRadius: "10px", color: "#fff", textDecoration: "none", fontWeight: 600
        }}>Request New Reset Link</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
        <div style={{ fontSize: "22px", fontWeight: 800, color: "#f1f5f9", marginBottom: "8px" }}>Password Updated!</div>
        <div style={{ fontSize: "14px", color: "#94a3b8" }}>Redirecting you to login...</div>
      </div>
    );
  }

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔐</div>
        <div style={{ fontSize: "24px", fontWeight: 800, color: "#f1f5f9", marginBottom: "8px" }}>Set new password</div>
        <div style={{ fontSize: "14px", color: "#94a3b8" }}>Enter your new password below</div>
        <div style={{ fontSize: "12px", color: "#f59e0b", marginTop: "8px", background: "rgba(245,158,11,0.1)", padding: "8px 16px", borderRadius: "8px", display: "inline-block" }}>
          ⏰ This link expires in 24 hours
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "8px", padding: "12px", marginBottom: "20px", color: "#fca5a5", fontSize: "13px" }}>
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>New Password</label>
          <div style={{ position: "relative" }}>
            <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" required value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: "100%", padding: "12px 44px 12px 16px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", color: "#f1f5f9", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "16px" }}>
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
          <PasswordStrength password={password} />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>Confirm New Password</label>
          <div style={{ position: "relative" }}>
            <input type={showConfirm ? "text" : "password"} placeholder="••••••••" required value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={{ width: "100%", padding: "12px 44px 12px 16px", background: "rgba(255,255,255,0.08)", border: `1px solid ${confirmPassword && confirmPassword !== password ? "#ef4444" : "rgba(255,255,255,0.15)"}`, borderRadius: "10px", color: "#f1f5f9", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "16px" }}>
              {showConfirm ? "🙈" : "👁"}
            </button>
          </div>
          {confirmPassword && confirmPassword !== password && (
            <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>⚠ Passwords do not match</div>
          )}
        </div>

        <button type="submit" disabled={loading} style={{
          width: "100%", padding: "13px", background: loading ? "#475569" : "linear-gradient(135deg, #3b82f6, #6366f1)",
          border: "none", borderRadius: "10px", color: "#fff", fontSize: "15px", fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer"
        }}>
          {loading ? "Updating Password..." : "Update Password"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#64748b" }}>
        <Link href="/login" style={{ color: "#60a5fa", textDecoration: "none" }}>← Back to login</Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
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
        padding: "40px", width: "100%", maxWidth: "420px"
      }}>
        <Suspense fallback={<div style={{ textAlign: "center", color: "#94a3b8" }}>Loading...</div>}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
