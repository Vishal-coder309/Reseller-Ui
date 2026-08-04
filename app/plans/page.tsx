"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageHead, Toast, Modal } from "@/components/ui";

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
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("30");
  const [price, setPrice] = useState("");
  const valid = name.trim() && price && Number(duration) > 0;

  const add = () => {
    addVoicePlan({ name: name.trim(), pulseDuration: Number(duration), pulsePrice: Number(price), enabled: true });
    onToast(`Plan "${name}" added`);
    setName(""); setPrice(""); setAddOpen(false);
  };

  return (
    <>
      <div className="card">
        <div className="card-head">
          <div><h3>Voice Plans</h3><div className="sub">{voicePlans.length} plans</div></div>
          <button className="btn btn-primary" onClick={() => setAddOpen(true)}><i className="ph-duotone ph-plus" style={{ fontSize: 15 }} /> Add Plan</button>
        </div>
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

      {addOpen && (
        <Modal
          title="Add Voice Plan"
          sub="Define the pulse duration and price. The plan is enabled immediately and can be assigned to users."
          onClose={() => setAddOpen(false)}
          actions={
            <>
              <button className="btn btn-secondary" onClick={() => setAddOpen(false)}>Discard</button>
              <button className="btn btn-primary" disabled={!valid} onClick={add}><i className="ph-duotone ph-plus" style={{ fontSize: 15 }} /> Add Plan</button>
            </>
          }
        >
          <div style={{ display: "grid", gap: 14, maxWidth: 560 }}>
            <div className="field"><label>Plan Name</label><input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Standard 30s" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="field"><label>Pulse Duration (sec)</label><input className="input" type="number" min={1} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="30" /></div>
              <div className="field"><label>Pulse Price (Paisa)</label><input className="input" type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="22" /></div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
