"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { RESELLER, LedgerEntry } from "@/lib/mock-data";

const fmt = (n: number) => n.toLocaleString("en-IN");
const fmtAmt = (n: number) => (n > 0 ? "+" : "−") + fmt(Math.abs(n));

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csvStr = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csvStr], { type: "text/csv" }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 0);
}

// Credits received from the superadmin — the store ledger only records user-facing moves.
const SUPERADMIN_TOPUPS = [
  { date: "2026-08-01 11:20", service: "Voice", product: RESELLER.planName, amt: 2000, reason: "Top-up from SUPERADMIN" },
];

// Ledger entries seen from the reseller's wallet: recharges to users are debits,
// removals are credits back. Users' own campaign spend never touches this wallet.
function ledgerRow(e: LedgerEntry) {
  if (e.action === "campaign_deduction") return null;
  const out = e.action !== "deduction";
  return {
    date: e.date,
    service: "Voice",
    product: RESELLER.planName,
    amt: out ? -e.amount : e.amount,
    reason: out ? `Recharge to ${e.actionOn}` : `Credit back from ${e.actionOn}`,
  };
}

export default function WalletModal({ onClose }: { onClose: () => void }) {
  const { voiceBalance, ledger, voicePlans } = useStore();
  const [productOpen, setProductOpen] = useState(false);
  const [range, setRange] = useState<{ start: number | null; end: number | null }>({ start: null, end: null });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (productOpen ? setProductOpen(false) : onClose());
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, productOpen]);

  const today = new Date();
  const year = today.getFullYear(), month = today.getMonth(), todayDay = today.getDate();
  const monLong = today.toLocaleString("en", { month: "long" }).toUpperCase();
  const monShort = today.toLocaleString("en", { month: "short" });
  const calDays = useMemo(() => {
    const first = new Date(year, month, 1).getDay();
    const count = new Date(year, month + 1, 0).getDate();
    return [...Array<null>(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  }, [year, month]);
  // 1st click sets start, 2nd click (after start) sets end; clicking before start restarts.
  const pickRange = (d: number) => setRange((r) => (r.start == null || r.end != null || d < r.start ? { start: d, end: null } : { start: r.start, end: d }));
  const rangeLabel = range.end != null && range.end !== range.start ? `${range.start} – ${range.end} ${monShort} ${year}` : `${range.start} ${monShort} ${year}`;

  const summary = [
    { service: "Voice", product: RESELLER.planName, credit: fmt(voiceBalance), type: "Debit" },
  ];
  const history = [...ledger.map(ledgerRow).filter((r) => r !== null), ...SUPERADMIN_TOPUPS]
    .sort((a, b) => b.date.localeCompare(a.date));
  const used30 = fmt(history.reduce((n, r) => n + (r.amt < 0 ? -r.amt : 0), 0));

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div onClick={onClose} className="modal-overlay offset">
      <div role="dialog" aria-modal="true" onClick={stop} className="modal-panel">
        <div className="modal-header" style={{ position: "sticky", top: 0, zIndex: 2 }}>
          <div>
            <h3 className="modal-title">Wallet</h3>
            <p className="modal-sub">Top-ups come in from your superadmin; recharges go out to your users.</p>
          </div>
          <button className="modal-close" aria-label="Close" onClick={onClose}><i className="ph-duotone ph-x" /></button>
        </div>
        <div className="modal-body" style={{ padding: 22 }}>
          <div data-split style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, alignItems: "stretch", marginBottom: 20 }}>
            <div className="card" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 11 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", display: "grid", placeItems: "center", flex: "none", background: "linear-gradient(135deg,#e2f6ff,#c3ecff)", color: "#00527c" }}><i className="ph-duotone ph-wallet" style={{ fontSize: 22 }} /></div>
                  <div style={{ fontSize: 13, color: "var(--color-neutral-600)", fontWeight: 600 }}>Wallet balance</div>
                </div>
                <button className="btn btn-secondary" onClick={() => setProductOpen(true)}><i className="ph-duotone ph-info" style={{ fontSize: 15 }} /> Product details</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginTop: 18 }}>
                <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", padding: "14px 16px" }}>
                  <div style={{ fontSize: 12, color: "var(--color-neutral-600)" }}>Total Balance</div>
                  <div className="tabnum" style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 28, marginTop: 5 }}>{fmt(voiceBalance)}</div>
                  <div style={{ fontSize: 11.5, color: "var(--color-neutral-500)", marginTop: 6 }}>Used in last 30 days {"·"} {used30}</div>
                </div>
              </div>
            </div>
            <div style={{ border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--color-surface)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", background: "var(--color-accent-700)", color: "var(--color-bg)", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-heading)" }}>
                <i className="ph-duotone ph-caret-left" style={{ cursor: "pointer" }} />{monLong} {year}<i className="ph-duotone ph-caret-right" style={{ cursor: "pointer" }} />
              </div>
              <div data-keep-cols style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, padding: 10 }}>
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (<div key={"h" + i} style={{ textAlign: "center", fontSize: 10.5, color: "var(--color-neutral-500)", padding: "2px 0" }}>{d}</div>))}
                {calDays.map((d, i) => {
                  if (!d) return <div key={"d" + i} />;
                  const future = d > todayDay;
                  const isEnd = d === range.start || d === range.end;
                  const inRange = range.start != null && range.end != null && d > range.start && d < range.end;
                  const cell = future
                    ? { color: "var(--color-neutral-300)", cursor: "not-allowed" }
                    : isEnd ? { background: "var(--color-accent)", color: "#00344b", fontWeight: 700 }
                    : inRange ? { background: "var(--color-accent-100)", color: "var(--color-accent-800)" }
                    : { color: "var(--color-text)" };
                  return <div key={"d" + i} onClick={future ? undefined : () => pickRange(d)} className="tabnum" style={{ textAlign: "center", fontSize: 12.5, padding: "6px 0", borderRadius: 6, cursor: "pointer", ...cell }}>{d}</div>;
                })}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 12px", borderTop: "1px solid var(--color-divider)", fontSize: 12 }}>
                <span style={{ color: "var(--color-neutral-600)" }}>{range.start != null ? rangeLabel : "Pick a start & end date"}</span>
                {range.start != null && (<button className="btn btn-ghost" onClick={() => setRange({ start: null, end: null })} style={{ fontSize: 12, padding: "2px 8px" }}>Clear</button>)}
              </div>
            </div>
          </div>

          {/* Summary — light pill header with icons above each label */}
          <div className="card" style={{ padding: "14px 16px 8px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "2px 8px 12px" }}>
              <h3 style={{ fontSize: 15, margin: 0 }}>Balance by service</h3>
              <button className="btn btn-icon" title="Download in Excel" aria-label="Download summary" onClick={() => downloadCsv("wallet-summary.csv", [["Services", "Product", "Credit", "Transaction Type"], ...summary.map((r) => [r.service, r.product, r.credit, r.type])])} style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--color-accent-100)", color: "var(--color-accent-700)", flex: "none" }}><i className="ph-duotone ph-download-simple" style={{ fontSize: 17 }} /></button>
            </div>
            <div data-keep-cols style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", alignItems: "center", background: "var(--color-neutral-200)", borderRadius: 14, padding: "12px 24px" }}>
              {[["Services", "ph-users-three"], ["Product", "ph-identification-badge"], ["Credit", "ph-wallet"], ["Transaction Type", "ph-arrows-down-up"]].map(([label, icon]) => (
                <div key={label} style={{ textAlign: "center" }}><i className={"ph-duotone " + icon} style={{ fontSize: 22, display: "block", margin: "0 auto 5px", color: "var(--color-accent-700)" }} /><div style={{ fontWeight: 600, fontFamily: "var(--font-heading)", fontSize: 13.5 }}>{label}</div></div>
              ))}
            </div>
            {summary.map((r, i) => (
              <div key={i} data-keep-cols style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", alignItems: "center", textAlign: "center", padding: "13px 24px", marginTop: 4, borderRadius: 10, fontSize: 14, background: i % 2 ? undefined : "var(--color-bg)" }}>
                <div style={{ fontWeight: 600, fontFamily: "var(--font-heading)" }}>{r.service}</div>
                <div className="text-muted">{r.product}</div>
                <div className="tabnum">{r.credit}</div>
                <div style={{ fontWeight: 600, color: r.type === "Credit" ? "#12b76a" : "var(--color-danger)" }}>{r.type}</div>
              </div>
            ))}
          </div>

          {/* History — dark pill header */}
          <div className="card" style={{ padding: "14px 16px 8px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "2px 8px 12px" }}>
              <h3 style={{ fontSize: 15, margin: 0 }}>Transaction history</h3>
              <button className="btn btn-icon" title="Download in Excel" aria-label="Download history" onClick={() => downloadCsv("wallet-history.csv", [["Date", "Service", "Product", "Credit", "Reason"], ...history.map((r) => [r.date, r.service, r.product, fmtAmt(r.amt), r.reason])])} style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--color-accent-100)", color: "var(--color-accent-700)", flex: "none" }}><i className="ph-duotone ph-download-simple" style={{ fontSize: 17 }} /></button>
            </div>
            <div data-keep-cols style={{ display: "grid", gridTemplateColumns: "0.9fr 0.8fr 1.1fr 0.9fr 1.6fr", alignItems: "center", textAlign: "center", background: "#091f44", borderRadius: 14, padding: "13px 24px", color: "#fff", fontWeight: 600, fontFamily: "var(--font-heading)", fontSize: 13.5 }}>
              <div>Date</div><div>Service</div><div>Product</div><div>Credit</div><div>Reason</div>
            </div>
            {history.map((r, i) => (
              <div key={i} data-keep-cols style={{ display: "grid", gridTemplateColumns: "0.9fr 0.8fr 1.1fr 0.9fr 1.6fr", alignItems: "center", textAlign: "center", padding: "13px 24px", marginTop: 4, borderRadius: 10, fontSize: 14, background: i % 2 ? undefined : "var(--color-bg)" }}>
                <div className="text-muted tabnum">{r.date}</div>
                <div style={{ fontWeight: 600, fontFamily: "var(--font-heading)" }}>{r.service}</div>
                <div className="text-muted">{r.product}</div>
                <div className="tabnum" style={{ color: r.amt > 0 ? "#12b76a" : "var(--color-danger)" }}>{fmtAmt(r.amt)}</div>
                <div className="text-muted">{r.reason}</div>
              </div>
            ))}
          </div>

          {/* nested product-details popup — no left offset: the panel's backdrop-filter makes it the containing block */}
          {productOpen && (
            <div onClick={(e) => { e.stopPropagation(); setProductOpen(false); }} className="modal-overlay">
              <div role="dialog" aria-modal="true" onClick={stop} className="modal-panel">
                <div className="modal-header">
                  <h3 className="modal-title">Product details</h3>
                  <button className="modal-close" aria-label="Close" onClick={() => setProductOpen(false)}><i className="ph-duotone ph-x" /></button>
                </div>
                <div className="modal-body" style={{ padding: "8px 22px 20px", overflowX: "auto" }}>
                  <table className="table" style={{ margin: 0 }}><thead><tr><th>Service</th><th>Product</th><th>Charged as</th><th className="num">Rate</th></tr></thead><tbody>
                    {voicePlans.map((p) => (<tr key={"v" + p.id}>
                      <td style={{ fontWeight: 600, fontFamily: "var(--font-heading)" }}>Voice</td>
                      <td className="text-muted">{p.name}</td>
                      <td className="text-muted">{p.pulseDuration} sec</td>
                      <td className="num">{p.pulsePrice} p / pulse</td>
                    </tr>))}
                  </tbody></table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
