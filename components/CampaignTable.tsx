"use client";

import { Fragment, useMemo, useState } from "react";
import { campaigns, Campaign, CampaignStatus } from "@/lib/mock-data";
import { StatusPill, EmptyRow, Toast } from "@/components/ui";

// Shared campaign summary: stat chips + filterable table.
// `kind` selects the seed subset; `userWise` groups rows under per-user header rows + date filters.
export function CampaignSummary({ kind, userWise }: { kind: "live" | "prompt"; userWise?: boolean }) {
  const [status, setStatus] = useState<"all" | CampaignStatus>("all");
  const [username, setUsername] = useState("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  // ponytail: seed campaigns aren't in the store — pause/resume/stop overrides are session-local
  const [override, setOverride] = useState<Record<number, CampaignStatus>>({});
  const [toast, setToast] = useState<string | null>(null);
  // "Take Action" dropdown: fixed-position so it escapes the table's overflow scroll; flips up near the viewport bottom
  const [menu, setMenu] = useState<{ id: number; left: number; y: number; up: boolean } | null>(null);
  const base = campaigns.filter((c) => c.kind === kind).map((c) => ({ ...c, status: override[c.id] ?? c.status }));

  const toggleMenu = (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
    const rc = e.currentTarget.getBoundingClientRect();
    const up = rc.bottom > window.innerHeight - 240;
    setMenu((m) => (m && m.id === id ? null : { id, left: rc.right, up, y: up ? window.innerHeight - rc.top + 4 : rc.bottom + 4 }));
  };
  const setCampaignStatus = (c: Campaign, s: CampaignStatus) => {
    setOverride((o) => ({ ...o, [c.id]: s }));
    setMenu(null);
    setToast(`"${c.name}" ${s === "paused" ? "paused" : s === "running" ? "resumed" : "stopped"}.`);
  };

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
        {chips.map((c) => (
          <div className="kpi" key={c.label}>
            <div className="kpi-label">{c.label}</div>
            <div className="kpi-value" style={{ fontSize: 22 }}>{c.value.toLocaleString("en-IN")}</div>
          </div>
        ))}
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
              <th className="num">Pulses</th><th className="num">DnD</th><th className="num">DTMF</th><th className="num">SMS</th><th className="num">Retry</th><th className="num">Vars</th><th>Pause</th><th>Action</th>
            </tr></thead>
            <tbody>
              {rows.length === 0 ? <EmptyRow colSpan={22} icon="ph-broadcast" message="No campaigns match this filter." /> :
                rows.map((c, i) => (
                  <Fragment key={c.id}>
                    {userWise && (i === 0 || rows[i - 1].userName !== c.userName) && (
                      <tr><td colSpan={22} style={{ background: "var(--color-bg)", fontWeight: 600, fontFamily: "var(--font-heading)", fontSize: 13 }}>
                        <i className="ph-duotone ph-user-circle" style={{ fontSize: 16, verticalAlign: "-3px", color: "var(--color-accent-700)", marginRight: 7 }} />
                        {c.userName} <span className="text-muted" style={{ fontWeight: 400 }}>· {rows.filter((r) => r.userName === c.userName).length} campaign{rows.filter((r) => r.userName === c.userName).length > 1 ? "s" : ""}</span>
                      </td></tr>
                    )}
                  <tr>
                    <td><input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} /></td>
                    <td className="tabnum">{c.id}</td>
                    <td style={{ fontWeight: 600 }}><a href={`/campaigns/${c.id}`}>{c.name}</a></td>
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
                    <td><div style={{ position: "relative" }}>
                      <button className="btn btn-secondary" onClick={(e) => toggleMenu(c.id, e)}>Take Action <i className="ph-duotone ph-caret-down" style={{ fontSize: 13 }} /></button>
                      {menu && menu.id === c.id && (<>
                        <div onClick={() => setMenu(null)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                        <div style={{ position: "fixed", left: menu.left, [menu.up ? "bottom" : "top"]: menu.y, transform: "translateX(-100%)", zIndex: 41, display: "flex", flexDirection: "column", width: 200, background: "var(--color-surface)", border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", overflow: "hidden", padding: "5px 0" }}>
                          {c.status === "running" && (<button className="btn btn-ghost" onClick={() => setCampaignStatus(c, "paused")} style={{ width: "100%", margin: 0, justifyContent: "flex-start", borderRadius: 0 }}><i className="ph-duotone ph-pause" style={{ fontSize: 16 }} /> Pause</button>)}
                          {c.status === "paused" && (<button className="btn btn-ghost" onClick={() => setCampaignStatus(c, "running")} style={{ width: "100%", margin: 0, justifyContent: "flex-start", borderRadius: 0 }}><i className="ph-duotone ph-play" style={{ fontSize: 16 }} /> Resume</button>)}
                          {(c.status === "running" || c.status === "paused" || c.status === "scheduled") && (<button className="btn btn-ghost" onClick={() => { if (window.confirm(`Stop "${c.name}"? This ends the campaign and cannot be undone.`)) setCampaignStatus(c, "complete"); }} style={{ width: "100%", margin: 0, justifyContent: "flex-start", borderRadius: 0, color: "var(--color-accent-2-700)" }}><i className="ph-duotone ph-stop" style={{ fontSize: 16 }} /> Stop</button>)}
                          <a href={`/campaigns/${c.id}`} className="btn btn-ghost" style={{ width: "100%", margin: 0, justifyContent: "flex-start", borderRadius: 0 }}><i className="ph-duotone ph-eye" style={{ fontSize: 16 }} /> View Details</a>
                        </div>
                      </>)}
                    </div></td>
                  </tr>
                  </Fragment>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
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
                    <td style={{ fontWeight: 600 }}><a href={`/campaigns/${c.id}`}>{c.name}</a></td>
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
