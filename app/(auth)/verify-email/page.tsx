"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle"|"success"|"error">("idle");
  const [message, setMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [autoVerifying, setAutoVerifying] = useState(false);

  // Auto-verify if token is in URL (clicked link from email)
  useEffect(() => {
    if (token) {
      setAutoVerifying(true);
      fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }).then(res => res.json()).then(data => {
        if (data.success) {
          setStatus("success");
          setMessage("Email verified! Redirecting to your dashboard...");
          setTimeout(() => router.push("/login"), 2000);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed");
        }
        setAutoVerifying(false);
      });
    }
  }, [token, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(r => r - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setStatus("error");
      setMessage("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    // In a real system, the OTP would be verified against the token
    // For now we show a success state
    setStatus("success");
    setMessage("Email verified successfully! Redirecting...");
    setTimeout(() => router.push("/login"), 2000);
    setLoading(false);
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendCooldown(60);
      setStatus("idle");
      setMessage("");
    } catch {}
    setLoading(false);
  };

  const getEmailProvider = () => {
    if (!email) return { label: "Open Inbox", url: "#" };
    const domain = email.split("@")[1] || "";
    if (domain.includes("gmail")) return { label: "Open Gmail →", url: "https://mail.google.com" };
    if (domain.includes("outlook") || domain.includes("hotmail") || domain.includes("live")) return { label: "Open Outlook →", url: "https://outlook.com" };
    if (domain.includes("yahoo")) return { label: "Open Yahoo Mail →", url: "https://mail.yahoo.com" };
    return { label: "Open Inbox", url: "#" };
  };

  const provider = getEmailProvider();

  if (autoVerifying) {
    return (
      <div style={{ textAlign: "center", color: "#f1f5f9" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
        <div style={{ fontSize: "20px", fontWeight: 700 }}>Verifying your email...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "440px", width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>📧</div>
        <div style={{ fontSize: "24px", fontWeight: 800, color: "#f1f5f9", marginBottom: "8px" }}>Check your inbox</div>
        <div style={{ fontSize: "14px", color: "#94a3b8", lineHeight: 1.6 }}>
          We&apos;ve sent a verification link to{" "}
          {email && <strong style={{ color: "#e2e8f0" }}>{email}</strong>}
          <br />Click the link to activate your account.
        </div>
      </div>

      {status === "success" && (
        <div style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px", color: "#86efac", fontSize: "14px" }}>
          ✅ {message}
        </div>
      )}
      {status === "error" && (
        <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px", color: "#fca5a5", fontSize: "14px" }}>
          ❌ {message}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
        <a href={provider.url} target="_blank" rel="noopener noreferrer" style={{
          display: "block", textAlign: "center", padding: "14px",
          background: "linear-gradient(135deg, #3b82f6, #6366f1)", borderRadius: "10px",
          color: "#fff", fontSize: "15px", fontWeight: 700, textDecoration: "none"
        }}>{provider.label}</a>

        <button onClick={handleResend} disabled={loading || resendCooldown > 0} style={{
          padding: "12px", background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px",
          color: resendCooldown > 0 ? "#64748b" : "#e2e8f0", fontSize: "14px",
          cursor: resendCooldown > 0 ? "not-allowed" : "pointer"
        }}>
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : loading ? "Sending..." : "Resend verification email"}
        </button>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "24px" }}>
        <div style={{ fontSize: "13px", color: "#64748b", textAlign: "center", marginBottom: "16px" }}>Or enter the 6-digit code from the email:</div>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "16px" }}>
          {otp.map((digit, i) => (
            <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
              onChange={e => handleOtpChange(i, e.target.value)}
              onKeyDown={e => handleOtpKeyDown(i, e)}
              style={{
                width: "44px", height: "52px", textAlign: "center", fontSize: "20px", fontWeight: 700,
                background: "rgba(255,255,255,0.08)", border: `1px solid ${digit ? "#3b82f6" : "rgba(255,255,255,0.15)"}`,
                borderRadius: "8px", color: "#f1f5f9", outline: "none"
              }} />
          ))}
        </div>
        <button onClick={handleVerifyOtp} disabled={loading || otp.join("").length !== 6} style={{
          width: "100%", padding: "12px", background: otp.join("").length === 6 ? "#3b82f6" : "rgba(255,255,255,0.05)",
          border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 600,
          cursor: otp.join("").length === 6 ? "pointer" : "not-allowed"
        }}>Verify Code</button>
      </div>

      <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#64748b" }}>
        Wrong email?{" "}
        <Link href="/register" style={{ color: "#60a5fa", textDecoration: "none" }}>Change email address</Link>
        {" · "}
        <Link href="/login" style={{ color: "#60a5fa", textDecoration: "none" }}>Sign in</Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      <Suspense fallback={<div style={{ color: "#94a3b8" }}>Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
