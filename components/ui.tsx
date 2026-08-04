"use client";

import { ReactNode, useEffect, useState } from "react";
import { CampaignStatus, UserStatus } from "@/lib/mock-data";

export function PageHead({ kicker, title, standfirst, action }: { kicker: string; title: string; standfirst: string; action?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <div className="kicker">{kicker}</div>
        <h1>{title}</h1>
        <p className="standfirst">{standfirst}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

const CAMPAIGN_PILL: Record<CampaignStatus, { cls: string; label: string }> = {
  running: { cls: "pill-accent", label: "Running" },
  paused: { cls: "pill-neutral", label: "Paused" },
  complete: { cls: "pill-success", label: "Complete" },
  scheduled: { cls: "pill-accent", label: "Scheduled" },
  failed: { cls: "pill-danger", label: "Failed" },
};

export function StatusPill({ status }: { status: CampaignStatus }) {
  const p = CAMPAIGN_PILL[status];
  return <span className={`pill ${p.cls}`}><span className="dot" />{p.label}</span>;
}

export function UserStatusPill({ status }: { status: UserStatus }) {
  const ok = status === "Active";
  return <span className={`pill ${ok ? "pill-success" : "pill-danger"}`}><span className="dot" />{status}</span>;
}

export function Modal({ title, onClose, children, actions }: { title: string; onClose: () => void; children: ReactNode; actions?: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="btn btn-icon" aria-label="Close" onClick={onClose}><i className="ph-duotone ph-x" style={{ fontSize: 18 }} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
}

export function Popover({ children, onClose, align = "left" }: { children: ReactNode; onClose: () => void; align?: "left" | "right" }) {
  useEffect(() => {
    const onDoc = () => onClose();
    // defer so the opening click doesn't immediately close it
    const t = setTimeout(() => document.addEventListener("click", onDoc), 0);
    return () => { clearTimeout(t); document.removeEventListener("click", onDoc); };
  }, [onClose]);
  return (
    <div className={`popover ${align === "right" ? "right" : ""}`} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  );
}

// Toast that auto-dismisses. Controlled by `message`; parent clears it.
export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [message, onDone]);
  if (!message) return null;
  return (
    <div className="toast" role="status">
      <i className="ph-duotone ph-check-circle" style={{ fontSize: 18, color: "var(--color-success)" }} />
      {message}
    </div>
  );
}

// A cell that opens a popover listing values (Location/Group/Module/AccountType/CLI).
export function ListCell({ label, values, empty = "None" }: { label: string; values: string[]; empty?: string }) {
  const [open, setOpen] = useState(false);
  if (values.length === 0) return <span className="text-muted">{empty}</span>;
  return (
    <span className="pop-wrap">
      <button className="cell-link" onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}>
        {values.length === 1 ? values[0] : `${values[0]} +${values.length - 1}`}
      </button>
      {open && (
        <Popover onClose={() => setOpen(false)}>
          <div style={{ padding: "4px 8px", fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>{label}</div>
          {values.map((v) => (
            <div key={v} style={{ padding: "6px 10px", fontSize: 13 }}>{v}</div>
          ))}
        </Popover>
      )}
    </span>
  );
}

// Simple in-page tab bar. `tabs` = [{key,label}]; parent owns the active key.
export function Tabs({ tabs, active, onChange }: { tabs: { key: string; label: string }[]; active: string; onChange: (k: string) => void }) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button key={t.key} className={`tab ${active === t.key ? "active" : ""}`} onClick={() => onChange(t.key)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyRow({ colSpan, icon, message }: { colSpan: number; icon: string; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ textAlign: "center", padding: "42px 20px", color: "var(--color-neutral-500)" }}>
        <i className={`ph-duotone ${icon}`} style={{ fontSize: 30, display: "block", margin: "0 auto 8px", color: "var(--color-neutral-400)" }} />
        {message}
      </td>
    </tr>
  );
}
