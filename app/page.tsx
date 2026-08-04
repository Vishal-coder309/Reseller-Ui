"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { campaigns, CampaignType, RESELLER, effectiveStatus } from "@/lib/mock-data";
import { PageHead, StatusPill, EmptyRow } from "@/components/ui";

const fmt = (n: number) => n.toLocaleString("en-IN");

// one accent hex per tone — thin card top-rules + chips carry the colour (from UI-Design)
const TONES = {
  accent: { hex: "#00b8ff", chip: "linear-gradient(135deg,#e2f6ff,#c3ecff)", fg: "#00527c" },
  green: { hex: "#12b76a", chip: "linear-gradient(135deg,#e7f7ef,#cdeeda)", fg: "#067a47" },
  amber: { hex: "#f2a900", chip: "linear-gradient(135deg,#fef4e0,#fde6bd)", fg: "#a86a00" },
  violet: { hex: "#7a5cff", chip: "linear-gradient(135deg,#efeaff,#ddd3ff)", fg: "#4c33c4" },
  navy: { hex: "#00415a", chip: "linear-gradient(135deg,#00415a,#0a6d95)", fg: "#eafaff" },
  red: { hex: "#e5484d", chip: "linear-gradient(135deg,#fdecea,#f6d0cc)", fg: "#b42318" },
};
type Tone = keyof typeof TONES;

const AVATARS = [
  "linear-gradient(135deg,#00b8ff,#4fd0ff)", "linear-gradient(135deg,#0a6d95,#12a0c8)",
  "linear-gradient(135deg,#12b76a,#5fd39a)", "linear-gradient(135deg,#f2a900,#ffca4d)",
  "linear-gradient(135deg,#00415a,#0a6d95)", "linear-gradient(135deg,#7a5cff,#a08aff)",
];

function KpiCard({ tone, icon, label, value, sub }: { tone: Tone; icon: string; label: string; value: string | number; sub: string }) {
  const t = TONES[tone];
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(0,65,90,0.08)", borderTop: `3px solid ${t.hex}`, borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-sm)", padding: "16px 17px", minWidth: 0 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", background: t.chip, color: t.fg }}>
        <i className={`ph-duotone ${icon}`} style={{ fontSize: 20 }} />
      </div>
      <div style={{ fontSize: 11.5, color: "var(--color-neutral-600)", marginTop: 13 }}>{label}</div>
      <div className="tabnum" style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 23, letterSpacing: "-.02em", marginTop: 3 }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--color-neutral-500)", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 6, borderRadius: 999, background: "var(--color-neutral-200)", overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, Math.round(pct * 100))}%`, height: "100%", borderRadius: 999, background: color }} />
    </div>
  );
}

export default function Dashboard() {
  const { users, voiceBalance, ledger } = useStore();
  const [type, setType] = useState<"all" | CampaignType>("all");

  const live = campaigns.filter((c) => c.kind === "live");
  const running = live.filter((c) => c.status === "running").length;
  const activeUsers = users.filter((u) => effectiveStatus(u) === "Active").length;
  const dialedToday = live.reduce((s, c) => s + c.callsDialed, 0);
  const connectedToday = live.reduce((s, c) => s + c.connected, 0);
  const pendingToday = live.reduce((s, c) => s + c.pending, 0);
  const dndToday = live.reduce((s, c) => s + c.dnd, 0);
  const asr = dialedToday ? connectedToday / dialedToday : 0;
  const issued = users.reduce((s, u) => s + u.voiceBalance, 0);
  const lowBalance = users.filter((u) => u.voiceBalance < 100).length;

  const analysis = useMemo(() => campaigns.filter((c) => type === "all" || c.type === type), [type]);
  const totAnswered = analysis.reduce((s, c) => s + c.answered, 0);
  const totNon = analysis.reduce((s, c) => s + c.nonAnswered, 0);
  const totExp = analysis.reduce((s, c) => s + c.expenditure, 0);

  // per-user rollup, busiest first
  const userwise = useMemo(() => users
    .map((u, i) => {
      const cs = campaigns.filter((c) => c.userId === u.id);
      const dialed = cs.reduce((s, c) => s + c.callsDialed, 0);
      const connected = cs.reduce((s, c) => s + c.connected, 0);
      return { u, av: AVATARS[i % AVATARS.length], total: cs.length, dialed, connected, rate: dialed ? connected / dialed : 0 };
    })
    .filter((r) => r.total > 0)
    .sort((a, b) => b.dialed - a.dialed), [users]);

  // recent wallet movements, reseller perspective
  const activity = ledger
    .filter((l) => l.action !== "campaign_deduction")
    .slice(0, 5)
    .map((l) => ({
      out: l.action !== "deduction",
      who: l.actionOn,
      amt: l.amount,
      date: l.date,
    }));

  return (
    <>
      <PageHead kicker="Overview" title={`Welcome back, ${RESELLER.name.split(" ")[0]}`} />

      <div className="kpi-grid" data-cols style={{ gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
        <KpiCard tone="accent" icon="ph-wallet" label="Wallet Balance" value={`₹${fmt(voiceBalance)}`} sub={`₹${fmt(issued)} issued to users`} />
        <KpiCard tone="green" icon="ph-users-three" label="Active Users" value={`${activeUsers} / ${users.length}`} sub={lowBalance ? `${lowBalance} low on balance` : "all funded"} />
        <KpiCard tone="amber" icon="ph-broadcast" label="Live Campaigns" value={running} sub={`${live.length} scheduled today`} />
        <KpiCard tone="violet" icon="ph-phone-outgoing" label="Calls Dialed Today" value={fmt(dialedToday)} sub={`${fmt(pendingToday)} still pending`} />
        <KpiCard tone="navy" icon="ph-phone-call" label="Connect Rate" value={`${Math.round(asr * 100)}%`} sub={`${fmt(connectedToday)} connected`} />
      </div>

      {/* today's traffic + answered donut */}
      <div data-split style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 20 }}>
        <div className="card">
          <div className="card-head">
            <div><h3>Today&apos;s Traffic</h3><div className="sub">{live.length} campaigns dialing</div></div>
            <a className="btn btn-ghost" href="/campaigns">View all →</a>
          </div>
          <div style={{ padding: "14px 19px 6px", display: "grid", gap: 13 }}>
            {[
              { label: "Connected", value: connectedToday, of: dialedToday, tone: TONES.green },
              { label: "Pending", value: pendingToday, of: dialedToday + pendingToday, tone: TONES.amber },
              { label: "DnD blocked", value: dndToday, of: dialedToday, tone: TONES.red },
            ].map((r) => (
              <div key={r.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 600 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: r.tone.hex }} /> {r.label}
                  </span>
                  <span className="tabnum" style={{ color: "var(--color-neutral-600)" }}>{fmt(r.value)}</span>
                </div>
                <Bar pct={r.of ? r.value / r.of : 0} color={r.tone.hex} />
              </div>
            ))}
          </div>
          <div className="table-wrap" style={{ paddingTop: 6 }}>
            <table className="table">
              <thead><tr><th>Campaign</th><th>User</th><th>Status</th><th className="num">Dialed</th><th className="num">Connected</th><th className="num">Pulses</th><th style={{ width: 130 }}>Progress</th></tr></thead>
              <tbody>
                {live.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}><a href={`/campaigns/${c.id}`}>{c.name}</a></td>
                    <td className="text-muted">{c.userName}</td>
                    <td><StatusPill status={c.status} /></td>
                    <td className="num">{fmt(c.callsDialed)}</td>
                    <td className="num">{fmt(c.connected)}</td>
                    <td className="num">{fmt(c.totalPulses)}</td>
                    <td><Bar pct={c.totalNumbers ? c.callsDialed / c.totalNumbers : 0} color={TONES.accent.hex} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card card-pad">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
            <h3 style={{ fontSize: 16 }}>Answered vs Non-answered</h3>
            <select className="input" style={{ width: 130, minHeight: 32, fontSize: 12.5 }} value={type} onChange={(e) => setType(e.target.value as "all" | CampaignType)}>
              <option value="all">All types</option>
              <option value="Simple IVR">Simple IVR</option>
              <option value="DTMF">DTMF</option>
              <option value="Call Patch">Call Patch</option>
              <option value="Custom IVR">Custom IVR</option>
            </select>
          </div>
          <div style={{ color: "var(--color-neutral-600)", fontSize: 12, marginBottom: 14 }}>Across {analysis.length} campaigns</div>
          <DonutChart answered={totAnswered} non={totNon} />
          <div style={{ display: "flex", gap: 16, marginTop: 16, fontSize: 12.5, justifyContent: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: TONES.green.hex }} /> Answered {fmt(totAnswered)}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: TONES.red.hex }} /> Non {fmt(totNon)}</span>
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--color-divider)", fontSize: 13, display: "flex", justifyContent: "space-between" }}>
            <span>Total Expenditure</span><b className="tabnum">₹{totExp.toFixed(2)}</b>
          </div>
        </div>
      </div>

      {/* top users + recent wallet activity */}
      <div data-split style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-head">
            <div><h3>Top Users by Traffic</h3><div className="sub">Campaign rollup per user</div></div>
            <a className="btn btn-ghost" href="/user-list">All users →</a>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>User</th><th className="num">Campaigns</th><th className="num">Dialed</th><th className="num">Connected</th><th style={{ width: 150 }}>Connect rate</th></tr></thead>
              <tbody>
                {userwise.length === 0 ? <EmptyRow colSpan={5} icon="ph-users-three" message="No campaign traffic yet." /> :
                  userwise.map((r) => (
                    <tr key={r.u.id}>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                          <span style={{ width: 30, height: 30, borderRadius: "50%", flex: "none", background: r.av, color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 11.5 }}>
                            {r.u.username.slice(0, 2).toUpperCase()}
                          </span>
                          <span style={{ fontWeight: 600 }}>{r.u.username}</span>
                        </span>
                      </td>
                      <td className="num">{r.total}</td>
                      <td className="num">{fmt(r.dialed)}</td>
                      <td className="num">{fmt(r.connected)}</td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ flex: 1 }}><Bar pct={r.rate} color={r.rate >= 0.5 ? TONES.green.hex : TONES.amber.hex} /></span>
                          <span className="tabnum" style={{ fontSize: 12, color: "var(--color-neutral-600)", width: 34, textAlign: "right" }}>{Math.round(r.rate * 100)}%</span>
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div><h3>Recent Wallet Activity</h3><div className="sub">Latest credit movements</div></div>
          </div>
          <div style={{ padding: "6px 19px 14px" }}>
            {activity.length === 0 ? (
              <div className="text-muted" style={{ fontSize: 13, padding: "16px 0" }}>No wallet movements yet.</div>
            ) : activity.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < activity.length - 1 ? "1px solid var(--color-divider)" : undefined }}>
                <span style={{ width: 32, height: 32, flex: "none", borderRadius: "50%", display: "grid", placeItems: "center", background: a.out ? TONES.red.chip : TONES.green.chip, color: a.out ? TONES.red.fg : TONES.green.fg }}>
                  <i className={`ph-duotone ${a.out ? "ph-arrow-up-right" : "ph-arrow-down-left"}`} style={{ fontSize: 16 }} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>{a.out ? "Recharge to" : "Credit back from"} {a.who}</span>
                  <span className="tabnum" style={{ display: "block", fontSize: 11.5, color: "var(--color-neutral-500)" }}>{a.date}</span>
                </span>
                <b className="tabnum" style={{ color: a.out ? TONES.red.fg : TONES.green.fg }}>{a.out ? "−" : "+"}₹{fmt(a.amt)}</b>
              </div>
            ))}
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
        <circle cx={75} cy={75} r={r} fill="none" stroke={TONES.red.hex} strokeOpacity={0.25} strokeWidth={18} />
        <circle
          cx={75} cy={75} r={r} fill="none" stroke={TONES.green.hex} strokeWidth={18}
          strokeDasharray={`${c * pct} ${c}`} strokeLinecap="round" transform="rotate(-90 75 75)"
        />
        <text x={75} y={72} textAnchor="middle" style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 22, fill: "var(--color-text)" }}>{Math.round(pct * 100)}%</text>
        <text x={75} y={92} textAnchor="middle" style={{ fontSize: 11, fill: "var(--color-neutral-600)" }}>answered</text>
      </svg>
    </div>
  );
}
