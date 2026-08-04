"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { RESELLER } from "@/lib/mock-data";
import WalletModal from "@/components/WalletModal";

const NOTIFS = [
  { icon: "ph-check-circle", color: "#12b76a", bg: "#e7f7ef", title: "Recharge complete", sub: "vishal_voice credited with ₹500 voice balance.", time: "12 min ago" },
  { icon: "ph-user-plus", color: "#0a6d95", bg: "#e2f6ff", title: "New user created", sub: "acme_calls was added under your account.", time: "2 h ago" },
  { icon: "ph-wallet", color: "#f2a900", bg: "#fdf6e3", title: "Low voice balance", sub: "Your voice wallet is running low — top up to keep user recharges flowing.", time: "Yesterday" },
];

interface NavItem { href: string; label: string; icon: string; }

// Flat, minimal nav — one item per destination. Consolidated pages carry their own tabs.
const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "ph-gauge" },
  { href: "/user-list", label: "Accounts", icon: "ph-users-three" },
  { href: "/hierarchy", label: "Hierarchy", icon: "ph-tree-structure" },
  { href: "/campaigns", label: "Campaigns", icon: "ph-broadcast" },
  { href: "/plans", label: "Plans", icon: "ph-cards" },
  { href: "/reports", label: "Summary Reports", icon: "ph-chart-bar" },
  { href: "/voice-files", label: "Voice Files", icon: "ph-file-audio" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { viewingAs, setViewingAs } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifRead, setNotifRead] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <aside
        style={{
          width: 250, flex: "none", position: "sticky", top: 0, height: "100vh",
          display: "flex", flexDirection: "column", background: "#091f44",
          borderRight: "1px solid rgba(255,255,255,0.09)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "20px 20px 16px" }}>
          <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "linear-gradient(135deg,#00b8ff,#4fd0ff)", display: "grid", placeItems: "center", color: "#00344b", boxShadow: "0 3px 10px rgba(0,184,255,0.35)" }}>
            <i className="ph-duotone ph-broadcast" style={{ fontSize: 20 }} />
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 17, letterSpacing: "-.01em", color: "#f3f2f2" }}>Voice Console</div>
            <div style={{ fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,0.72)" }}>Reseller</div>
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: "auto", padding: "10px 12px 12px", scrollbarWidth: "none" }}>
          {NAV.map((it) => {
            const active = isActive(pathname, it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                style={{
                  display: "flex", alignItems: "center", gap: 11, padding: "10px 11px",
                  borderRadius: "var(--radius-md)", marginBottom: 3, fontSize: 13.5,
                  color: active ? "#fff" : "rgba(255,255,255,0.80)",
                  background: active ? "rgba(0,184,255,0.22)" : "transparent",
                  textDecoration: "none",
                  boxShadow: active ? "inset 0 0 0 1px rgba(0,184,255,0.35)" : undefined,
                }}
                className="nav-item"
              >
                <i className={`ph-duotone ${it.icon}`} style={{ fontSize: 18, color: active ? "#4fd0ff" : "rgba(255,255,255,0.7)", flex: "none" }} />
                <span style={{ flex: 1 }}>{it.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "0 12px 4px" }}>
          <button onClick={() => { setSupportOpen(true); setMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 11px", borderRadius: "var(--radius-md)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.80)", fontSize: 13, fontFamily: "var(--font-body)", textAlign: "left" }}>
            <i className="ph-duotone ph-question" style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", flex: "none" }} /> <span style={{ flex: 1 }}>Help &amp; support</span>
          </button>
        </div>

        <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.12)", position: "relative" }}>
          {menuOpen && (
            <div style={{ position: "absolute", left: 12, right: 12, bottom: 66, background: "var(--color-surface)", border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-md)", overflow: "hidden", zIndex: 40 }}>
              <Link href="/profile" className="menu-item" onClick={() => setMenuOpen(false)}><i className="ph-duotone ph-user-circle" style={{ fontSize: 18, color: "var(--color-accent-700)" }} /> My Profile</Link>
              <Link href="/reports" className="menu-item" onClick={() => setMenuOpen(false)}><i className="ph-duotone ph-clock-counter-clockwise" style={{ fontSize: 18, color: "var(--color-accent-700)" }} /> Activity Logs</Link>
              <div style={{ height: 1, background: "var(--color-divider)" }} />
              <button className="menu-item danger" onClick={() => setMenuOpen(false)}><i className="ph-duotone ph-sign-out" style={{ fontSize: 18 }} /> Sign out</button>
            </div>
          )}
          <button onClick={() => setMenuOpen((o) => !o)} aria-label="Account menu" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: "var(--radius-md)", background: "var(--color-bg)", width: "100%", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#00b8ff,#4fd0ff)", color: "#00344b", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 13, flex: "none" }}>{RESELLER.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</div>
            <div style={{ minWidth: 0, flex: 1, lineHeight: 1.2 }}>
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-heading)" }}>{RESELLER.name}</div>
              <div style={{ fontSize: 11, color: "var(--color-neutral-600)" }}>Reseller Operator</div>
            </div>
            <i className="ph-duotone ph-caret-up-down" style={{ fontSize: 15, color: "var(--color-neutral-600)", flex: "none" }} />
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header style={{ position: "sticky", top: 0, zIndex: 20, height: 64, display: "flex", alignItems: "center", gap: 16, padding: "0 34px", background: "color-mix(in srgb, var(--color-bg) 86%, transparent)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--color-divider)" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
            <i className="ph-duotone ph-magnifying-glass" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-neutral-500)", fontSize: 17 }} />
            <input className="input" style={{ paddingLeft: 36, height: 38, borderRadius: 999 }} placeholder="Search users, campaigns…" aria-label="Search" />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <button className="btn btn-primary" onClick={() => setWalletOpen(true)}><i className="ph-duotone ph-wallet" style={{ fontSize: 16 }} /> Wallet</button>
            <div style={{ position: "relative" }}>
              <button className="btn btn-icon" aria-label="Notifications" aria-expanded={notifOpen} onClick={() => setNotifOpen((o) => !o)} style={{ color: "var(--color-neutral-600)", position: "relative" }}>
                <i className="ph-duotone ph-bell" style={{ fontSize: 19 }} />
                {!notifRead && <span style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: "50%", background: "var(--color-danger)" }} />}
              </button>
              {notifOpen && (<>
                <div style={{ position: "fixed", inset: 0, zIndex: 30 }} onClick={() => setNotifOpen(false)} />
                <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, width: 390, zIndex: 31, background: "var(--color-surface)", border: "1px solid var(--color-divider)", borderRadius: 16, boxShadow: "var(--shadow-lg)", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--color-divider)" }}>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: 14.5, fontWeight: 600 }}>Notifications</div>
                    {!notifRead && (<button onClick={() => setNotifRead(true)} style={{ border: "none", background: "none", padding: 0, fontSize: 12, fontWeight: 600, color: "var(--color-accent-700)", cursor: "pointer", fontFamily: "inherit" }}>Mark all as read</button>)}
                  </div>
                  {NOTIFS.map((n, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "13px 18px", borderBottom: i < NOTIFS.length - 1 ? "1px solid var(--color-divider)" : undefined, background: !notifRead ? "color-mix(in srgb, var(--color-accent-100) 55%, transparent)" : undefined }}>
                      <div style={{ width: 36, height: 36, flex: "none", borderRadius: "50%", background: n.bg, color: n.color, display: "grid", placeItems: "center" }}><i className={"ph-duotone " + n.icon} style={{ fontSize: 18 }} /></div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#091f44" }}>{n.title}{!notifRead && <span style={{ width: 6, height: 6, flex: "none", borderRadius: "50%", background: "var(--color-danger)" }} />}</div>
                        <div style={{ fontSize: 12.5, color: "var(--color-neutral-600)", lineHeight: 1.45, marginTop: 2 }}>{n.sub}</div>
                        <div style={{ fontSize: 11.5, color: "var(--color-neutral-500)", marginTop: 4 }}>{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>)}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: "30px 34px 64px" }}>
          <div>
            {viewingAs && (
              <div className="viewing-as">
                <i className="ph-duotone ph-user-switch" style={{ fontSize: 18 }} />
                <span style={{ flex: 1 }}>Viewing as <b>{viewingAs}</b>. Actions are scoped to this user (mock session).</span>
                <button className="btn btn-secondary btn-sm" onClick={() => setViewingAs(null)}>
                  <i className="ph-duotone ph-sign-out" style={{ fontSize: 14 }} /> Exit
                </button>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>

      {walletOpen && <WalletModal onClose={() => setWalletOpen(false)} />}

      {supportOpen && (
        <div onClick={() => setSupportOpen(false)} className="modal-overlay" style={{ left: 250 }}>
          <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} className="modal-panel" style={{ overflow: "hidden" }}>
            <div className="modal-header">
              <h3 className="modal-title">Help &amp; support</h3>
              <button className="modal-close" aria-label="Close" onClick={() => setSupportOpen(false)}><i className="ph-duotone ph-x" /></button>
            </div>
            <div className="modal-body" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
              <a className="hoverable-accent" href={`mailto:${RESELLER.email}`} style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", padding: "13px 15px", textDecoration: "none", color: "var(--color-text)", background: "var(--color-surface)" }}>
                <i className="ph-duotone ph-envelope-simple" style={{ fontSize: 20, color: "var(--color-accent-700)", flex: "none" }} />
                <div><div style={{ fontWeight: 600, fontSize: 13.5, fontFamily: "var(--font-heading)" }}>Email support</div><div style={{ fontSize: 12, color: "var(--color-neutral-600)" }}>{RESELLER.email}</div></div>
              </a>
              <a className="hoverable-accent" href="tel:18001234567" style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", padding: "13px 15px", textDecoration: "none", color: "var(--color-text)", background: "var(--color-surface)" }}>
                <i className="ph-duotone ph-headset" style={{ fontSize: 20, color: "var(--color-accent-700)", flex: "none" }} />
                <div><div style={{ fontWeight: 600, fontSize: 13.5, fontFamily: "var(--font-heading)" }}>Call platform support</div><div style={{ fontSize: 12, color: "var(--color-neutral-600)" }}>1800 123 4567 · Mon–Sat, 9–7</div></div>
              </a>
              <div style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", padding: "13px 15px", background: "var(--color-surface)" }}>
                <i className="ph-duotone ph-info" style={{ fontSize: 20, color: "var(--color-accent-700)", flex: "none" }} />
                <div><div style={{ fontWeight: 600, fontSize: 13.5, fontFamily: "var(--font-heading)" }}>Account</div><div style={{ fontSize: 12, color: "var(--color-neutral-600)" }}>{RESELLER.company} · {RESELLER.name} (Reseller)</div></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
