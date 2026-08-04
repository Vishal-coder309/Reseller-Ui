"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { MODULE_OPTIONS } from "@/lib/mock-data";
import { PageHead, Toast } from "@/components/ui";

export default function UpdateUser({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const store = useStore();
  const router = useRouter();
  const user = store.users.find((u) => u.id === Number(id));
  const [toast, setToast] = useState<string | null>(null);

  const [f, setF] = useState(() => ({
    name: user?.name ?? "", email: user?.email ?? "", mobile: user?.mobile ?? "",
    address: user?.address ?? "", pincode: user?.pincode ?? "", company: user?.company ?? "",
    voicePlanId: user?.voicePlanId ?? store.voicePlans[0]?.id ?? 0,
    accountType: user?.accountType ?? "Promotional", expiry: user?.expiry ?? "",
    planType: user?.planType ?? "Prepaid",
  }));
  const [modules, setModules] = useState<string[]>(user?.module ?? []);
  const [submission, setSubmission] = useState(false);
  const set = (k: keyof typeof f, v: string | number) => setF((s) => ({ ...s, [k]: v }));

  if (!user) return <PageHead kicker="Manage Users" title="User not found" standfirst="This user no longer exists. Return to the user list." />;

  const toggleModule = (m: string) => setModules((ms) => ms.includes(m) ? ms.filter((x) => x !== m) : [...ms, m]);

  const submit = () => {
    store.updateUser(user.id, {
      name: f.name, email: f.email, mobile: f.mobile, address: f.address, pincode: f.pincode,
      company: f.company, voicePlanId: Number(f.voicePlanId),
      accountType: f.accountType, expiry: f.expiry, planType: f.planType as "Prepaid" | "Postpaid", module: modules,
    });
    setToast(`User ${user.username} updated`);
    setTimeout(() => router.push("/user-list"), 900);
  };

  return (
    <>
      <PageHead kicker="Manage Users" title={`Update User — ${user.username}`} />

      <div className="card card-pad" style={{ maxWidth: 900 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} data-split>
          <div className="field"><label>Name</label><input className="input" value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="field"><label>Email</label><input className="input" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div className="field"><label>Mobile</label><input className="input" value={f.mobile} onChange={(e) => set("mobile", e.target.value)} /></div>
          <div className="field"><label>Company</label><input className="input" value={f.company} onChange={(e) => set("company", e.target.value)} /></div>
          <div className="field"><label>Pincode</label><input className="input" value={f.pincode} onChange={(e) => set("pincode", e.target.value)} /></div>
          <div className="field" style={{ gridColumn: "1 / -1" }}><label>Address</label><input className="input" value={f.address} onChange={(e) => set("address", e.target.value)} /></div>

          <div className="field"><label>Voice Plan</label>
            <select className="input" value={f.voicePlanId} onChange={(e) => set("voicePlanId", Number(e.target.value))}>
              {store.voicePlans.filter((p) => p.enabled || p.id === user.voicePlanId).map((p) => <option key={p.id} value={p.id}>{p.name} · {p.pulseDuration}s · {p.pulsePrice}p{p.enabled ? "" : " (disabled)"}</option>)}
            </select>
          </div>
          <div className="field"><label>User Type</label><input className="input" value={user.type} disabled /></div>
          <div className="field"><label>Account Type</label>
            <select className="input" value={f.accountType} onChange={(e) => set("accountType", e.target.value)}><option>Promotional</option></select>
          </div>
          <div className="field"><label>User Expiry</label><input className="input" type="date" value={f.expiry} onChange={(e) => set("expiry", e.target.value)} /></div>
          <div className="field"><label>Plan Type</label>
            <select className="input" value={f.planType} onChange={(e) => set("planType", e.target.value)}><option>Prepaid</option><option>Postpaid</option></select>
          </div>
        </div>

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--color-divider)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Module allocation</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            {MODULE_OPTIONS.map((m) => (
              <label className="radio" key={m}><input type="checkbox" checked={modules.includes(m)} onChange={() => toggleModule(m)} /><span className="dot" /> {m}</label>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <label className="radio"><input type="checkbox" checked={submission} onChange={(e) => setSubmission(e.target.checked)} /><span className="dot" /> Submission</label>
        </div>

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--color-divider)", display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-primary" onClick={submit}><i className="ph-duotone ph-check" style={{ fontSize: 15 }} /> Update User</button>
        </div>
      </div>

      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
