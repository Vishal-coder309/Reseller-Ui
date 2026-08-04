"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { campaigns, CampaignType } from "@/lib/mock-data";
import { PageHead, StatusPill, EmptyRow } from "@/components/ui";

const KPI_ICONS = [
  { label: "Total Resellers", icon: "ph-buildings", chip: "var(--color-accent-100)", color: "var(--color-accent-700)" },
  { label: "Total End Users", icon: "ph-users-three", chip: "#e7f7ef", color: "#067a47" },
  { label: "Voice Balance Issued", icon: "ph-phone-call", chip: "var(--color-accent-100)", color: "var(--color-accent-700)" },
  { label: "Campaigns Today", icon: "ph-broadcast", chip: "#fdf0e6", color: "#b46a18" },
];

export default function Dashboard() {
  const { users } = useStore();
  const [user, setUser] = useState("all");
  const [type, setType] = useState<"all" | CampaignType>("all");

  const totalResellers = users.filter((u) => u.type === "reseller").length;
  const totalUsers = users.filter((u) => u.type === "user").length;
  const voiceIssued = users.reduce((s, u) => s + u.voiceBalance, 0);
  const today = campaigns.filter((c) => c.kind === "live");

  const kpiValues = [totalResellers, totalUsers, `₹${voiceIssued.toLocaleString("en-IN")}`, today.length];

  const userwise = useMemo(() => {
    return users
      .filter((u) => user === "all" || String(u.id) === user)
      .map((u) => {
        const cs = campaigns.filter((c) => c.userId === u.id);
        return {
          u,
          total: cs.length,
          numbers: cs.reduce((s, c) => s + c.totalNumbers, 0),
          dialed: cs.reduce((s, c) => s + c.callsDialed, 0),
          dnd: cs.reduce((s, c) => s + c.dnd, 0),
          connected: cs.reduce((s, c) => s + c.connected, 0),
          pending: cs.reduce((s, c) => s + c.pending, 0),
        };
      });
  }, [users, user]);

  const analysis = useMemo(
    () => campaigns.filter((c) => (type === "all" || c.type === type) && (user === "all" || String(c.userId) === user)),
    [type, user]
  );
  const totAnswered = analysis.reduce((s, c) => s + c.answered, 0);
  const totNon = analysis.reduce((s, c) => s + c.nonAnswered, 0);
  const totExp = analysis.reduce((s, c) => s + c.expenditure, 0);

  return (
    <>
      <PageHead kicker="Overview" title="Reseller Dashboard" />

      <div className="kpi-grid" data-cols style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {KPI_ICONS.map((k, i) => (
          <div className="kpi" key={k.label}>
            <div className="kpi-top">
              <div>
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value">{kpiValues[i]}</div>
              </div>
              <div className="kpi-chip" style={{ background: k.chip, color: k.color }}>
                <i className={`ph-duotone ${k.icon}`} style={{ fontSize: 20 }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User-wise Campaign Summary */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-head">
          <div>
            <h3>User-wise Campaign Summary</h3>
            <div className="sub">Rollup of campaign performance per user</div>
          </div>
        </div>
        <div className="filters" style={{ padding: "14px 19px 0" }}>
          <div className="field"><label>Start Date</label><input className="input" type="date" style={{ width: 170 }} /></div>
          <div className="field"><label>End Date</label><input className="input" type="date" style={{ width: 170 }} /></div>
          <div className="field">
            <label>User</label>
            <select className="input" style={{ minWidth: 180 }} value={user} onChange={(e) => setUser(e.target.value)}>
              <option value="all">All users</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          </div>
          <button className="btn btn-secondary" style={{ marginLeft: "auto" }}><i className="ph-duotone ph-download-simple" style={{ fontSize: 15 }} /> Export CSV</button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr>
              <th>User ID</th><th>Username</th><th className="num">Campaigns</th><th className="num">Numbers</th>
              <th className="num">Dialed</th><th className="num">DnD</th><th className="num">Connected</th><th className="num">Pending</th><th></th>
            </tr></thead>
            <tbody>
              {userwise.length === 0 ? <EmptyRow colSpan={9} icon="ph-users-three" message="No users match this filter." /> :
                userwise.map((r) => (
                  <tr key={r.u.id}>
                    <td className="tabnum">{r.u.id}</td>
                    <td style={{ fontWeight: 600 }}>{r.u.username}</td>
                    <td className="num">{r.total}</td>
                    <td className="num">{r.numbers.toLocaleString("en-IN")}</td>
                    <td className="num">{r.dialed.toLocaleString("en-IN")}</td>
                    <td className="num">{r.dnd}</td>
                    <td className="num">{r.connected.toLocaleString("en-IN")}</td>
                    <td className="num">{r.pending.toLocaleString("en-IN")}</td>
                    <td><a className="btn btn-ghost" href="/campaigns">View</a></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today Live Campaigns Summary */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-head">
          <div>
            <h3>Today Live Campaigns Summary</h3>
            <div className="sub">{today.length} campaigns dialing today</div>
          </div>
          <a className="btn btn-ghost" href="/campaigns">View all →</a>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr>
              <th>Campaign Id</th><th>Name</th><th>User</th><th>Status</th><th className="num">Channels</th><th>Type</th>
              <th>Start</th><th className="num">Numbers</th><th className="num">Dialed</th><th className="num">Pending</th><th className="num">Connected</th>
              <th className="num">Pulses</th><th className="num">DnD</th><th className="num">DTMF</th><th className="num">DTMF1</th><th className="num">DTMF2</th>
              <th className="num">SMS</th><th className="num">Retry</th>
            </tr></thead>
            <tbody>
              {today.map((c) => (
                <tr key={c.id}>
                  <td className="tabnum">{c.id}</td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.userName}</td>
                  <td><StatusPill status={c.status} /></td>
                  <td className="num">{c.channels}</td>
                  <td className="text-muted">{c.type}</td>
                  <td className="tabnum">{c.startTime}</td>
                  <td className="num">{c.totalNumbers.toLocaleString("en-IN")}</td>
                  <td className="num">{c.callsDialed.toLocaleString("en-IN")}</td>
                  <td className="num">{c.pending.toLocaleString("en-IN")}</td>
                  <td className="num">{c.connected.toLocaleString("en-IN")}</td>
                  <td className="num">{c.totalPulses.toLocaleString("en-IN")}</td>
                  <td className="num">{c.dnd}</td>
                  <td className="num">{c.dtmf}</td>
                  <td className="num">{c.dtmf1}</td>
                  <td className="num">{c.dtmf2}</td>
                  <td className="num">{c.smsCount}</td>
                  <td className="num">{c.retryCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Analysis */}
      <div data-split style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-head">
            <div><h3>Campaign Analysis</h3><div className="sub">Answered vs non-answered and expenditure</div></div>
          </div>
          <div className="filters" style={{ padding: "14px 19px 0" }}>
            <div className="field">
              <label>Campaign Type</label>
              <select className="input" value={type} onChange={(e) => setType(e.target.value as "all" | CampaignType)}>
                <option value="all">All</option>
                <option value="Simple IVR">Simple IVR</option>
                <option value="DTMF">DTMF</option>
                <option value="Call Patch">Call Patch</option>
                <option value="Custom IVR">Custom IVR</option>
              </select>
            </div>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Campaign</th><th>Type</th><th className="num">Answered</th><th className="num">DTMF</th><th className="num">Non-Answered</th><th className="num">Expenditure (₹)</th></tr></thead>
              <tbody>
                {analysis.length === 0 ? <EmptyRow colSpan={6} icon="ph-chart-bar" message="No campaigns match this filter." /> :
                  analysis.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td className="text-muted">{c.type}</td>
                      <td className="num">{c.answered.toLocaleString("en-IN")}</td>
                      <td className="num">{c.dtmf}</td>
                      <td className="num">{c.nonAnswered.toLocaleString("en-IN")}</td>
                      <td className="num">{c.expenditure.toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card card-pad">
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>Answered vs Non-answered</h3>
          <div style={{ color: "var(--color-neutral-600)", fontSize: 12, marginBottom: 16 }}>Totals for the current filter</div>
          <DonutChart answered={totAnswered} non={totNon} />
          <div style={{ display: "flex", gap: 16, marginTop: 16, fontSize: 12.5 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--color-accent)" }} /> Answered {totAnswered.toLocaleString("en-IN")}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--color-neutral-300)" }} /> Non {totNon.toLocaleString("en-IN")}</span>
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--color-divider)", fontSize: 13 }}>
            Total Expenditure <b className="tabnum">₹{totExp.toFixed(2)}</b>
          </div>
        </div>
      </div>
    </>
  );
}

function DonutChart({ answered, non }: { answered: number; non: number }) {
  const total = answered + non || 1;
  const pct = answered / total;
  const r = 54, c = 2 * Math.PI * r;
  return (
    <div style={{ display: "grid", placeItems: "center" }}>
      <svg width={150} height={150} viewBox="0 0 150 150">
        <circle cx={75} cy={75} r={r} fill="none" stroke="var(--color-neutral-200)" strokeWidth={18} />
        <circle
          cx={75} cy={75} r={r} fill="none" stroke="var(--color-accent)" strokeWidth={18}
          strokeDasharray={`${c * pct} ${c}`} strokeLinecap="round" transform="rotate(-90 75 75)"
        />
        <text x={75} y={72} textAnchor="middle" style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 22, fill: "var(--color-text)" }}>{Math.round(pct * 100)}%</text>
        <text x={75} y={92} textAnchor="middle" style={{ fontSize: 11, fill: "var(--color-neutral-600)" }}>answered</text>
      </svg>
    </div>
  );
}
