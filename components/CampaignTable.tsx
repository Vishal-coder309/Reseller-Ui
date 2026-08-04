"use client";

import { Fragment, useMemo, useState } from "react";
import { campaigns, Campaign, CampaignStatus } from "@/lib/mock-data";
import { StatusPill, EmptyRow, Toast } from "@/components/ui";

// colour language from UI-Design: gradient avatar chips + one tone per stat card
const AVATARS = [
  "linear-gradient(135deg,#00b8ff,#4fd0ff)", "linear-gradient(135deg,#0a6d95,#12a0c8)",
  "linear-gradient(135deg,#12b76a,#5fd39a)", "linear-gradient(135deg,#f2a900,#ffca4d)",
  "linear-gradient(135deg,#00415a,#0a6d95)", "linear-gradient(135deg,#7a5cff,#a08aff)",
];
const initials = (name: string) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
const CHIP_TONES = [
  { icon: "ph-stack", hex: "#00b8ff", chip: "linear-gradient(135deg,#e2f6ff,#c3ecff)", fg: "#00527c" },
  { icon: "ph-phone-outgoing", hex: "#7a5cff", chip: "linear-gradient(135deg,#efeaff,#ddd3ff)", fg: "#4c33c4" },
  { icon: "ph-hourglass-medium", hex: "#f2a900", chip: "linear-gradient(135deg,#fef4e0,#fde6bd)", fg: "#a86a00" },
  { icon: "ph-phone-call", hex: "#12b76a", chip: "linear-gradient(135deg,#e7f7ef,#cdeeda)", fg: "#067a47" },
  { icon: "ph-prohibit", hex: "#e5484d", chip: "linear-gradient(135deg,#fdecea,#f6d0cc)", fg: "#b42318" },
  { icon: "ph-arrows-clockwise", hex: "#00415a", chip: "linear-gradient(135deg,#e2f6ff,#bfebff)", fg: "#00415a" },
];

// Shared campaign summary: stat chips + filterable table.
// `kind` selects the seed subset; `userWise` groups rows under per-user header rows + date filters.
export function CampaignSummary({ kind, userWise }: { kind: "live" | "prompt"; userWise?: boolean }) {
  const [status, setStatus] = useState<"all" | CampaignStatus>("all");
  const [username, setUsername] = useState("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const base = campaigns.filter((c) => c.kind === kind);

  const rows = useMemo(() => {
    const f = base.filter((c) => (status === "all" || c.status === status) && (username === "all" || c.userName === username));
    return userWise ? [...f].sort((a, b) => a.userName.localeCompare(b.userName)) : f;
  }, [base, status, username, userWise]);

  const usernames = Array.from(new Set(base.map((c) => c.userName)));
  const sum = (f: (c: Campaign) => number) => rows.reduce((s, c) => s + f(c), 0);

  const chips = [
    { label: "Total", value: rows.length },
    { label: "Dialed", value: sum((c) => c.callsDialed) },
    { label: "Pending", value: sum((c) => c.pending) },
    { label: "Connected", value: sum((c) => c.connected) },
    { label: "DnD", value: sum((c) => c.dnd) },
    { label: "Retry Count", value: sum((c) => c.retryCount) },
  ];

  const toggle = (id: number) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));

  return (
    <>
      <div className="kpi-grid" data-cols style={{ gridTemplateColumns: "repeat(6,1fr)" }}>
        {chips.map((c, i) => {
          const t = CHIP_TONES[i % CHIP_TONES.length];
          return (
            <div key={c.label} style={{ background: "#fff", border: "1px solid rgba(0,65,90,0.08)", borderTop: `3px solid ${t.hex}`, borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-sm)", padding: "15px 16px", minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontSize: 11.5, color: "var(--color-neutral-600)" }}>{c.label}</div>
                <div style={{ width: 32, height: 32, flex: "none", borderRadius: 9, display: "grid", placeItems: "center", background: t.chip, color: t.fg }}>
                  <i className={`ph-duotone ${t.icon}`} style={{ fontSize: 17 }} />
                </div>
              </div>
              <div className="tabnum" style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 22, letterSpacing: "-.02em", marginTop: 4 }}>{c.value.toLocaleString("en-IN")}</div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="filters" style={{ padding: "16px 19px", marginBottom: 0 }}>
          <div className="field"><label>Status</label>
            <select className="input" style={{ minWidth: 140 }} value={status} onChange={(e) => setStatus(e.target.value as "all" | CampaignStatus)}>
              <option value="all">All</option><option value="running">Running</option><option value="paused">Paused</option><option value="complete">Complete</option><option value="scheduled">Scheduled</option>
            </select>
          </div>
          <div className="field"><label>Username</label>
            <select className="input" style={{ minWidth: 160 }} value={username} onChange={(e) => setUsername(e.target.value)}>
              <option value="all">All</option>{usernames.map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
          {userWise && (<>
            <div className="field"><label>From</label><input className="input" type="date" style={{ width: 160 }} /></div>
            <div className="field"><label>To</label><input className="input" type="date" style={{ width: 160 }} /></div>
          </>)}
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <button className="btn btn-secondary"><i className="ph-duotone ph-arrows-clockwise" style={{ fontSize: 15 }} /> Refresh</button>
            <button className="btn btn-secondary"><i className="ph-duotone ph-download-simple" style={{ fontSize: 15 }} /> Export CSV</button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr>
              <th><input type="checkbox" checked={allChecked} onChange={() => setSelected(allChecked ? new Set() : new Set(rows.map((r) => r.id)))} /></th>
              <th>Campaign Id</th><th>Name</th><th>User</th><th>Parent</th><th>Status</th><th className="num">Channels</th><th>Type</th>
              <th>Start</th><th>End</th><th className="num">Numbers</th><th className="num">Dialed</th><th className="num">Pending</th><th className="num">Connected</th>
              <th className="num">Pulses</th><th className="num">DnD</th><th className="num">DTMF</th><th className="num">SMS</th><th className="num">Retry</th><th className="num">Vars</th><th>Pause</th>
            </tr></thead>
            <tbody>
              {rows.length === 0 ? <EmptyRow colSpan={21} icon="ph-broadcast" message="No campaigns match this filter." /> :
                rows.map((c, i) => (
                  <Fragment key={c.id}>
                    {userWise && (i === 0 || rows[i - 1].userName !== c.userName) && (
                      <tr><td colSpan={21} style={{ background: "var(--color-bg)", fontWeight: 600, fontFamily: "var(--font-heading)", fontSize: 13 }}>
                        <i className="ph-duotone ph-user-circle" style={{ fontSize: 16, verticalAlign: "-3px", color: "var(--color-accent-700)", marginRight: 7 }} />
                        {c.userName} <span className="text-muted" style={{ fontWeight: 400 }}>· {rows.filter((r) => r.userName === c.userName).length} campaign{rows.filter((r) => r.userName === c.userName).length > 1 ? "s" : ""}</span>
                      </td></tr>
                    )}
                  <tr>
                    <td><input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} /></td>
                    <td className="tabnum">{c.id}</td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 30, height: 30, flex: "none", borderRadius: 9, background: AVATARS[c.id % AVATARS.length], color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 11 }}>{initials(c.name)}</span>
                        <a href={`/campaigns/${c.id}`} style={{ fontWeight: 600 }}>{c.name}</a>
                      </span>
                    </td>
                    <td>{c.userName}</td>
                    <td className="text-muted">{c.parentUsername}</td>
                    <td><StatusPill status={c.status} /></td>
                    <td className="num">{c.channels}</td>
                    <td className="text-muted">{c.type}</td>
                    <td className="tabnum">{c.startTime}</td>
                    <td className="tabnum">{c.endTime}</td>
                    <td className="num">{c.totalNumbers.toLocaleString("en-IN")}</td>
                    <td className="num">{c.callsDialed.toLocaleString("en-IN")}</td>
                    <td className="num">{c.pending.toLocaleString("en-IN")}</td>
                    <td className="num">{c.connected.toLocaleString("en-IN")}</td>
                    <td className="num">{c.totalPulses.toLocaleString("en-IN")}</td>
                    <td className="num">{c.dnd}</td>
                    <td className="num">{c.dtmf}</td>
                    <td className="num">{c.smsCount}</td>
                    <td className="num">{c.retryCount}</td>
                    <td className="num">{c.variableCount}</td>
                    <td className="text-muted">{c.pauseTime}</td>
                  </tr>
                  </Fragment>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// Historical campaigns: date/filter-by/search + Generate Full Report action.
export function HistorySummary() {
  const base = campaigns.filter((c) => c.kind === "history");
  const [filterBy, setFilterBy] = useState<"userId" | "campaignId" | "campaignName">("campaignName");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter((c) => {
      if (filterBy === "userId") return String(c.userId).includes(q);
      if (filterBy === "campaignId") return String(c.id).includes(q);
      return c.name.toLowerCase().includes(q);
    });
  }, [base, filterBy, search]);

  return (
    <>
      <div className="card">
        <div className="filters" style={{ padding: "16px 19px", marginBottom: 0 }}>
          <div className="field"><label>From</label><input className="input" type="date" style={{ width: 160 }} /></div>
          <div className="field"><label>To</label><input className="input" type="date" style={{ width: 160 }} /></div>
          <div className="field"><label>Filter by</label>
            <select className="input" value={filterBy} onChange={(e) => setFilterBy(e.target.value as typeof filterBy)}>
              <option value="userId">User Id</option><option value="campaignId">Campaign Id</option><option value="campaignName">Campaign Name</option>
            </select>
          </div>
          <div className="field" style={{ flex: 1, maxWidth: 240 }}><label>Search</label><input className="input" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setSearch(query)} /></div>
          <button className="btn btn-primary" onClick={() => setSearch(query)}><i className="ph-duotone ph-magnifying-glass" style={{ fontSize: 15 }} /> Search</button>
          <button className="btn btn-secondary" style={{ marginLeft: "auto" }}><i className="ph-duotone ph-download-simple" style={{ fontSize: 15 }} /> Export All Data</button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr>
              <th>Campaign Id</th><th>Name</th><th>User</th><th>Type</th><th>Status</th><th className="num">Numbers</th><th className="num">Dialed</th>
              <th className="num">Connected</th><th className="num">Expenditure (₹)</th><th>Start</th><th>End</th><th>Action</th>
            </tr></thead>
            <tbody>
              {rows.length === 0 ? <EmptyRow colSpan={12} icon="ph-clock-clockwise" message="No past campaigns in this range." /> :
                rows.map((c) => (
                  <tr key={c.id}>
                    <td className="tabnum">{c.id}</td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 30, height: 30, flex: "none", borderRadius: 9, background: AVATARS[c.id % AVATARS.length], color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 11 }}>{initials(c.name)}</span>
                        <a href={`/campaigns/${c.id}`} style={{ fontWeight: 600 }}>{c.name}</a>
                      </span>
                    </td>
                    <td>{c.userName}</td>
                    <td className="text-muted">{c.type}</td>
                    <td><StatusPill status={c.status} /></td>
                    <td className="num">{c.totalNumbers.toLocaleString("en-IN")}</td>
                    <td className="num">{c.callsDialed.toLocaleString("en-IN")}</td>
                    <td className="num">{c.connected.toLocaleString("en-IN")}</td>
                    <td className="num">{c.expenditure.toFixed(2)}</td>
                    <td className="tabnum">{c.startTime}</td>
                    <td className="tabnum">{c.endTime}</td>
                    <td><button className="btn btn-secondary btn-sm" onClick={() => setToast(`Summary report for "${c.name}" will be available in the Reports Section.`)}><i className="ph-duotone ph-file-text" style={{ fontSize: 14 }} /> Summary Report</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
