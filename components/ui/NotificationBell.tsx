"use client";

import { useState, useEffect, useRef } from "react";

interface Notification {
  id: string;
  icon: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
  type: "success" | "error" | "info" | "warning";
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", icon: "✅", title: "Report generated", detail: "Acme Corp — June 2024 report is ready", time: "1h ago", read: false, type: "success" },
  { id: "2", icon: "📧", title: "Email sent", detail: "Report delivered to sarah@acmecorp.com", time: "1h ago", read: false, type: "info" },
  { id: "3", icon: "🔄", title: "Data synced", detail: "All 24 projects refreshed successfully", time: "3h ago", read: false, type: "success" },
  { id: "4", icon: "❌", title: "Report failed", detail: "BlueSky Marketing — API timeout. Click to retry.", time: "9h ago", read: true, type: "error" },
  { id: "5", icon: "👤", title: "Client login", detail: "sarah@acmecorp.com viewed May 2024 report", time: "12h ago", read: true, type: "info" },
  { id: "6", icon: "⚠️", title: "Report overdue", detail: "GreenLeaf — report was due Jun 1st", time: "2d ago", read: true, type: "warning" },
];

const typeColors = {
  success: "#22c55e",
  error: "#ef4444",
  info: "#3b82f6",
  warning: "#f59e0b",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = () => {
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        id="notif-bell"
        onClick={() => setOpen(!open)}
        style={{
          width: "38px", height: "38px", borderRadius: "10px",
          background: open ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${open ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.12)"}`,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px", position: "relative", transition: "all 0.2s"
        }}>
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: "-4px", right: "-4px",
            background: "#ef4444", color: "#fff", borderRadius: "50%",
            width: "18px", height: "18px", fontSize: "10px", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid var(--sidebar-bg, #0f172a)"
          }}>{unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          width: "360px", background: "#1e293b",
          border: "1px solid rgba(255,255,255,0.12)", borderRadius: "14px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          zIndex: 1000, overflow: "hidden",
          animation: "fadeIn 0.15s ease"
        }}>
          {/* Header */}
          <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: "14px" }}>
              Notifications{unreadCount > 0 && <span style={{ marginLeft: "8px", background: "#ef4444", color: "#fff", borderRadius: "10px", padding: "1px 7px", fontSize: "11px" }}>{unreadCount}</span>}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{ background: "none", border: "none", color: "#60a5fa", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}>Mark all read</button>
              )}
              <button onClick={clearAll} style={{ background: "none", border: "none", color: "#64748b", fontSize: "12px", cursor: "pointer" }}>Clear all</button>
            </div>
          </div>

          {/* Notification List */}
          <div style={{ maxHeight: "380px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>🎉</div>
                <div style={{ fontSize: "13px" }}>All caught up! No notifications.</div>
              </div>
            ) : (
              notifications.map((notif, i) => (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  style={{
                    padding: "14px 18px", borderBottom: i < notifications.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    display: "flex", gap: "12px", alignItems: "flex-start", cursor: "pointer",
                    background: notif.read ? "transparent" : "rgba(59,130,246,0.06)",
                    transition: "background 0.15s"
                  }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                    background: `${typeColors[notif.type]}20`, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "16px"
                  }}>
                    {notif.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: notif.read ? 400 : 600, color: "#e2e8f0", marginBottom: "2px" }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.4, marginBottom: "4px" }}>{notif.detail}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{notif.time}</div>
                  </div>
                  {!notif.read && (
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6", flexShrink: 0, marginTop: "6px" }} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "12px 18px", borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
            <button style={{ background: "none", border: "none", color: "#60a5fa", fontSize: "12px", cursor: "pointer" }}>
              View all activity →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
