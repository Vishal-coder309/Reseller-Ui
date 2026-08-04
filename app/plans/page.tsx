"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageHead, Toast } from "@/components/ui";

export default function Plans() {
  const [toast, setToast] = useState<string | null>(null);
  return (
    <>
      <PageHead kicker="Plans" title="Plans" />
      <VoicePlans onToast={setToast} />
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}

function VoicePlans({ onToast }: { onToast: (m: string) => void }) {
  const { voicePlans, toggleVoicePlan, addVoicePlan } = useStore();
  const [name, setName] = useState("");
  const [duration, setDuration] = useState<15 | 30 | 60>(30);
  const [price, setPrice] = useState("");

  const add = () => {
    if (!name.trim() || !price) { onToast("Enter a plan name and price."); return; }
    addVoicePlan({ name: name.trim(), pulseDuration: duration, pulsePrice: Number(price), enabled: true });
    onToast(`Plan "${name}" added`);
    setName(""); setPrice("");
  };

  return (
    <>
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Add Voice Plan</div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="field" style={{ minWidth: 200, flex: 1 }}><label>Plan Name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Standard 30s" /></div>
          <div className="field"><label>Pulse Duration</label>
            <select className="input" style={{ width: 120 }} value={duration} onChange={(e) => setDuration(Number(e.target.value) as 15 | 30 | 60)}>
              <option value={15}>15 sec</option><option value={30}>30 sec</option><option value={60}>60 sec</option>
            </select>
          </div>
          <div className="field"><label>Pulse Price (Paisa)</label><input className="input" style={{ width: 140 }} type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="22" /></div>
          <button className="btn btn-primary" onClick={add}><i className="ph-duotone ph-plus" style={{ fontSize: 15 }} /> Add Plan</button>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div><h3>Voice Plans</h3><div className="sub">{voicePlans.length} plans</div></div></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Plan Id</th><th>Plan Name</th><th className="num">Pulse Duration</th><th className="num">Pulse Price (paisa)</th><th>Status</th><th>Enable/Disable</th></tr></thead>
            <tbody>
              {voicePlans.map((p) => (
                <tr key={p.id}>
                  <td className="tabnum">{p.id}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td className="num">{p.pulseDuration}s</td>
                  <td className="num">{p.pulsePrice}</td>
                  <td><span className={`pill ${p.enabled ? "pill-success" : "pill-neutral"}`}><span className="dot" />{p.enabled ? "Enabled" : "Disabled"}</span></td>
                  <td><label className="switch"><input type="checkbox" checked={p.enabled} onChange={() => toggleVoicePlan(p.id)} /><span className="track" /></label></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
