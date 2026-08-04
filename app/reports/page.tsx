"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { campaigns, RESELLER, LedgerAction, activityLogs as seedActivity } from "@/lib/mock-data";
import { PageHead, Tabs, StatusPill, EmptyRow } from "@/components/ui";

export default function Reports() {
  const [tab, setTab] = useState("credits");
  const STANDFIRST: Record<string, string> = {
    credits: "Ledger of credit movements across your users. Covers completed campaigns from the last 3 months.",
    summary: "Margin reconciliation per campaign: reseller pulse cost versus user pulse charge, derived from plan pricing.",
    activity: "Login and account activity across your users, with IP address and timestamp.",
    planlogs: "Audit trail of voice plan changes requested for your users.",
  };
  return (
    <>
      <PageHead kicker="Reports" title="Reports" standfirst={STANDFIRST[tab]} />
      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { key: "credits", label: "Credits History" },
          { key: "summary", label: "Reseller Summary" },
          { key: "activity", label: "Activity Logs" },
          { key: "planlogs", label: "Plan Logs" },
        ]}
      />
      {tab === "credits" && <CreditsHistory />}
      {tab === "summary" && <ResellerSummary />}
      {tab === "activity" && <ActivityLogs />}
      {tab === "planlogs" && <PlanLogs />}
    </>
  );
}

const isCredit = (a: LedgerAction) => a === "addition" || a === "tts_addition";

function CreditsHistory() {
  const { ledger } = useStore();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? ledger.filter((l) => l.toUser.toLowerCase().includes(q) || l.fromUser.toLowerCase().includes(q) || l.campaign.toLowerCase().includes(q)) : ledger;
  }, [ledger, search]);

  return (
    <>
      <div className="banner">
        <i className="ph-duotone ph-info" style={{ fontSize: 18, color: "var(--color-accent-700)", flex: "none", marginTop: 1 }} />
        <div>This ledger reflects completed campaigns over the last 3 months and is <b>not a billing document</b>. For invoicing, use the Reseller Summary.</div>
      </div>
      <div className="card">
        <div className="filters" style={{ padding: "16px 19px", marginBottom: 0 }}>
          <div className="field"><label>From</label><input className="input" type="date" style={{ width: 170 }} /></div>
          <div className="field"><label>To</label><input className="input" type="date" style={{ width: 170 }} /></div>
          <div className="field" style={{ flex: 1, maxWidth: 280 }}><label>Search</label><input className="input" placeholder="User or campaign…" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setSearch(query)} /></div>
          <button className="btn btn-primary" onClick={() => setSearch(query)}><i className="ph-duotone ph-funnel" style={{ fontSize: 15 }} /> Filter</button>
          <button className="btn btn-secondary" style={{ marginLeft: "auto" }}><i className="ph-duotone ph-download-simple" style={{ fontSize: 15 }} /> Export CSV</button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr>
              <th>Credit History Id</th><th>User Id</th><th>From User</th><th>To User</th><th>Action On</th>
              <th className="num">Amount</th><th>Campaign</th><th>Action</th><th className="num">TTS Credits</th><th>Date</th>
            </tr></thead>
            <tbody>
              {rows.length === 0 ? <EmptyRow colSpan={10} icon="ph-clock-counter-clockwise" message="No credit movements in this range." /> :
                rows.map((l) => (
                  <tr key={l.id}>
                    <td className="tabnum">{l.id}</td>
                    <td className="tabnum">{l.userId}</td>
                    <td>{l.fromUser}</td>
                    <td>{l.toUser}</td>
                    <td className="text-muted">{l.actionOn}</td>
                    <td className={`num ${isCredit(l.action) ? "amount-pos" : "amount-neg"}`}>{isCredit(l.action) ? "+" : "−"}₹{l.amount}</td>
                    <td className="text-muted">{l.campaign}</td>
                    <td><span className="tag tag-accent" style={{ fontFamily: "ui-monospace,monospace" }}>{l.action}</span></td>
                    <td className="num">{l.ttsCredits || "—"}</td>
                    <td className="tabnum">{l.date}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ResellerSummary() {
  const { users, voicePlans } = useStore();
  const [user, setUser] = useState("all");

  const rows = useMemo(() => {
    return campaigns
      .filter((c) => user === "all" || c.userName === user)
      .map((c) => {
        // Pulses derive from the user's actual voice plan; margin = user price − reseller cost.
        const u = users.find((x) => x.id === c.userId);
        const plan = u ? voicePlans.find((p) => p.id === u.voicePlanId) : undefined;
        const userPrice = plan?.pulsePrice ?? c.pulsePrice;      // paisa per pulse
        const resellerPrice = RESELLER.resellerPulsePrice;       // paisa per pulse
        const pulses = c.totalPulses;
        return {
          c,
          plan,
          pulseDuration: plan?.pulseDuration ?? c.pulseDuration,
          userPrice,
          resellerPulse: (pulses * resellerPrice) / 100, // ₹ cost to reseller
          userPulse: (pulses * userPrice) / 100,          // ₹ charged to user
          margin: (pulses * (userPrice - resellerPrice)) / 100,
        };
      });
  }, [user, users, voicePlans]);

  const totalMargin = rows.reduce((s, r) => s + r.margin, 0);

  return (
    <div className="card">
      <div className="filters" style={{ padding: "16px 19px", marginBottom: 0 }}>
        <div className="field"><label>User</label>
          <select className="input" style={{ minWidth: 180 }} value={user} onChange={(e) => setUser(e.target.value)}>
            <option value="all">All users</option>{users.map((u) => <option key={u.id} value={u.username}>{u.username}</option>)}
          </select>
        </div>
        <div className="field"><label>From</label><input className="input" type="date" style={{ width: 160 }} /></div>
        <div className="field"><label>To</label><input className="input" type="date" style={{ width: 160 }} /></div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 13 }}>Total Margin <b className="amount-pos tabnum">₹{totalMargin.toFixed(2)}</b></div>
          <button className="btn btn-secondary"><i className="ph-duotone ph-download-simple" style={{ fontSize: 15 }} /> Export CSV</button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>Reseller</th><th>Reseller Plan</th><th>Username</th><th>User Plan</th><th className="num">Pulse Dur</th><th className="num">User Price (p)</th>
            <th>Campaign</th><th>Status</th><th className="num">Connected</th><th className="num">Pulses</th>
            <th className="num">Reseller Pulse (₹)</th><th className="num">User Pulse (₹)</th><th className="num">Margin (₹)</th>
          </tr></thead>
          <tbody>
            {rows.length === 0 ? <EmptyRow colSpan={13} icon="ph-scales" message="No campaigns for this user." /> :
              rows.map((r) => (
                <tr key={r.c.id}>
                  <td>{RESELLER.username}</td>
                  <td className="text-muted">{RESELLER.planName}</td>
                  <td style={{ fontWeight: 600 }}>{r.c.userName}</td>
                  <td className="text-muted">{r.plan?.name ?? "—"}</td>
                  <td className="num">{r.pulseDuration}s</td>
                  <td className="num">{r.userPrice}p</td>
                  <td>{r.c.name}</td>
                  <td><StatusPill status={r.c.status} /></td>
                  <td className="num">{r.c.connected.toLocaleString("en-IN")}</td>
                  <td className="num">{r.c.totalPulses.toLocaleString("en-IN")}</td>
                  <td className="num">{r.resellerPulse.toFixed(2)}</td>
                  <td className="num">{r.userPulse.toFixed(2)}</td>
                  <td className="num amount-pos">{r.margin.toFixed(2)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityLogs() {
  const { users, ledger } = useStore();
  const [user, setUser] = useState("all");

  // Base seed logs, augmented with recharge activity derived from the (mutable) ledger.
  const logs = useMemo(() => {
    const fromLedger = ledger
      .filter((l) => l.fromUser === RESELLER.username || l.toUser === RESELLER.username)
      .map((l) => ({
        id: 100000 + l.id,
        action: l.action === "tts_addition" ? "ADD_TTS_RECHARGE" : l.fromUser === RESELLER.username ? "ADD_RECHARGE" : "REMOVE_RECHARGE",
        username: RESELLER.username, userId: 999, ip: "103.21.44.10", date: l.date,
      }));
    return [...fromLedger, ...seedActivity].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [ledger]);

  const rows = useMemo(() => logs.filter((l) => user === "all" || l.username === user), [logs, user]);

  return (
    <div className="card">
      <div className="filters" style={{ padding: "16px 19px", marginBottom: 0 }}>
        <div className="field"><label>From</label><input className="input" type="date" style={{ width: 160 }} /></div>
        <div className="field"><label>To</label><input className="input" type="date" style={{ width: 160 }} /></div>
        <div className="field"><label>User</label>
          <select className="input" style={{ minWidth: 180 }} value={user} onChange={(e) => setUser(e.target.value)}>
            <option value="all">All</option>
            <option value="DEMO_OPERATOR">DEMO_OPERATOR</option>
            {users.map((u) => <option key={u.id} value={u.username}>{u.username}</option>)}
          </select>
        </div>
        <button className="btn btn-secondary" style={{ marginLeft: "auto" }}><i className="ph-duotone ph-download-simple" style={{ fontSize: 15 }} /> Export CSV</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>#</th><th>Action</th><th>Username</th><th>User ID</th><th>IP Address</th><th>Date &amp; Time</th></tr></thead>
          <tbody>
            {rows.length === 0 ? <EmptyRow colSpan={6} icon="ph-list-checks" message="No activity for this filter." /> :
              rows.map((l) => (
                <tr key={l.id}>
                  <td className="tabnum">{l.id}</td>
                  <td><span className="tag tag-accent" style={{ fontFamily: "ui-monospace,monospace" }}>{l.action}</span></td>
                  <td style={{ fontWeight: 600 }}>{l.username}</td>
                  <td className="tabnum">{l.userId}</td>
                  <td className="tabnum">{l.ip}</td>
                  <td className="tabnum">{l.date}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlanLogs() {
  const { voicePlanLogs, voicePlans } = useStore();
  const planName = (id: number) => voicePlans.find((p) => p.id === id)?.name ?? `#${id}`;
  return (
    <div className="card">
      <div className="card-head"><div><h3>Plan Change Log</h3><div className="sub">{voicePlanLogs.length} changes</div></div></div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Old Plan</th><th>New Plan</th><th>User Id</th><th>User Name</th><th>Request Date</th></tr></thead>
          <tbody>
            {voicePlanLogs.length === 0 ? <EmptyRow colSpan={5} icon="ph-swap" message="No plan changes recorded." /> :
              voicePlanLogs.map((l, i) => (
                <tr key={i}>
                  <td><span className="tabnum">{l.oldPlanId}</span> <span className="text-muted">{planName(l.oldPlanId)}</span></td>
                  <td><span className="tabnum">{l.newPlanId}</span> <span className="text-muted">{planName(l.newPlanId)}</span></td>
                  <td className="tabnum">{l.userId}</td>
                  <td style={{ fontWeight: 600 }}>{l.userName}</td>
                  <td className="tabnum">{l.requestDate}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
