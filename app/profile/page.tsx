"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { RESELLER } from "@/lib/mock-data";
import { PageHead } from "@/components/ui";

const lockedBox: React.CSSProperties = { background: "var(--color-bg)", border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", padding: "10px 13px", fontSize: 13.5, fontWeight: 600, color: "var(--color-neutral-600)" };
const valueBox: React.CSSProperties = { ...lockedBox, color: "var(--color-text)" };
const label: React.CSSProperties = { fontSize: 12, color: "var(--color-neutral-600)", marginBottom: 6 };

export default function Profile() {
  const { voiceBalance } = useStore();
  // ponytail: profile edits are session-local — the mock store has no reseller mutation
  const [profile, setProfile] = useState({ name: RESELLER.name, email: RESELLER.email, mobile: RESELLER.mobile, company: RESELLER.company });
  const [draft, setDraft] = useState(profile);
  const [edit, setEdit] = useState(false);
  const [saved, setSaved] = useState(false);
  const pf = edit ? draft : profile;
  const initials = profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const editable: { key: keyof typeof profile; label: string; type?: string }[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email ID", type: "email" },
    { key: "mobile", label: "Mobile number" },
    { key: "company", label: "Company" },
  ];

  return (
    <>
      <PageHead kicker="Account" title="My Profile" />
      <div data-split style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, alignItems: "start" }}>
        <div className="card" style={{ padding: "26px 20px", textAlign: "center" }}>
          <div style={{ width: 74, height: 74, borderRadius: "50%", background: "linear-gradient(135deg,#00b8ff,#4fd0ff)", color: "#00344b", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 26, margin: "0 auto" }}>{initials}</div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 18, marginTop: 12 }}>{profile.name}</div>
          <div style={{ fontSize: 12.5, color: "var(--color-neutral-600)", marginTop: 2 }}>Reseller Operator</div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
            <span className="pill pill-success"><span className="dot" />active</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--color-neutral-600)", marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--color-divider)" }}>
            Member since March 2025<br />Company <b>{profile.company}</b>
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
            <h3 style={{ fontSize: 16, margin: 0 }}>Profile details</h3>
            {!edit && (
              <button className="btn btn-secondary" onClick={() => { setEdit(true); setSaved(false); setDraft(profile); }}>
                <i className="ph-duotone ph-pencil-simple" style={{ fontSize: 15 }} /> Edit profile
              </button>
            )}
            {edit && (
              <div style={{ display: "flex", gap: 9 }}>
                <button className="btn btn-secondary" onClick={() => setEdit(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => { setProfile(draft); setEdit(false); setSaved(true); }}>
                  <i className="ph-duotone ph-check" style={{ fontSize: 15 }} /> Save changes
                </button>
              </div>
            )}
          </div>
          {saved && (
            <div style={{ display: "flex", gap: 9, alignItems: "center", background: "var(--color-success-bg)", border: "1px solid #bfe6d2", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: 12.5, color: "#067a47", marginBottom: 16 }}>
              <i className="ph-duotone ph-check-circle" style={{ fontSize: 16 }} /> Profile updated.
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" }} data-split>
            <div><div style={label}>Username</div><div style={lockedBox}>{RESELLER.username}</div></div>
            {editable.map((f) => (
              <div key={f.key}>
                <div style={label}>{f.label}</div>
                {!edit && <div style={valueBox}>{pf[f.key]}</div>}
                {edit && <input className="input" type={f.type} aria-label={f.label} value={draft[f.key]} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))} />}
              </div>
            ))}
            <div><div style={label}>User type</div><div style={lockedBox}>{RESELLER.type}</div></div>
            <div><div style={label}>Plan name</div><div style={lockedBox}>{RESELLER.planName}</div></div>
            <div><div style={label}>Balance</div><div className="tabnum" style={lockedBox}>₹{voiceBalance}</div></div>
          </div>
          <div className="banner" style={{ marginTop: 18, marginBottom: 0 }}>
            <i className="ph-duotone ph-info" style={{ fontSize: 16, color: "var(--color-accent-700)", flex: "none", marginTop: 1 }} />
            <div>You can edit your name, email, mobile and company. Username, user type, plan and balance are managed by the platform admin.</div>
          </div>
        </div>
      </div>
    </>
  );
}
