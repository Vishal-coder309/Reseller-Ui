"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { MODULE_OPTIONS } from "@/lib/mock-data";
import { PageHead, Toast } from "@/components/ui";

interface ModuleRow { module: string; action: string; }

export default function CreateUser() {
  const store = useStore();
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  const [f, setF] = useState({
    username: "", password: "", confirm: "", name: "", email: "", mobile: "",
    company: "", address: "", pincode: "", customerType: "user" as "reseller" | "user",
    voicePlanId: store.voicePlans.find((p) => p.enabled)?.id ?? 0,
    userId: "", expiry: "", planType: "Prepaid" as "Prepaid" | "Postpaid",
    accountType: "Promotional",
  });
  const set = (k: keyof typeof f, v: string | number) => setF((s) => ({ ...s, [k]: v }));

  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [pickModule, setPickModule] = useState(MODULE_OPTIONS[0]);
  const [submission, setSubmission] = useState(false);
  const [sendLogo, setSendLogo] = useState(false);

  const addModule = () => {
    if (modules.some((m) => m.module === pickModule)) return;
    setModules((m) => [...m, { module: pickModule, action: "Allowed" }]);
  };

  const submit = () => {
    if (!f.username || f.password !== f.confirm) { setToast("Check username and matching passwords."); return; }
    store.createUser({
      username: f.username, name: f.name, email: f.email, mobile: f.mobile, company: f.company,
      address: f.address, pincode: f.pincode, type: f.customerType, voicePlanId: Number(f.voicePlanId),
      id: f.userId ? Number(f.userId) : undefined, expiry: f.expiry || undefined, planType: f.planType,
      accountType: f.accountType, module: modules.map((m) => m.module),
    });
    setToast(`User ${f.username} created`);
    setTimeout(() => router.push("/user-list"), 900);
  };

  return (
    <>
      <PageHead kicker="Manage Users" title="Create User" standfirst="Provision a new reseller or end user, assign a voice plan and set which modules they can use." />

      <div className="card card-pad" style={{ maxWidth: 900 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} data-split>
          <div className="field"><label>Username</label><input className="input" value={f.username} onChange={(e) => set("username", e.target.value)} /></div>
          <div className="field"><label>Name</label><input className="input" value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="field"><label>Password</label><input className="input" type="password" value={f.password} onChange={(e) => set("password", e.target.value)} /></div>
          <div className="field"><label>Confirm Password</label><input className="input" type="password" value={f.confirm} onChange={(e) => set("confirm", e.target.value)} />
            {f.confirm && f.password !== f.confirm && <div className="help" style={{ color: "var(--color-danger)" }}>Passwords do not match.</div>}
          </div>
          <div className="field"><label>Email</label><input className="input" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div className="field"><label>Mobile Number</label><input className="input" value={f.mobile} onChange={(e) => set("mobile", e.target.value)} /></div>
          <div className="field"><label>Company Name</label><input className="input" value={f.company} onChange={(e) => set("company", e.target.value)} /></div>
          <div className="field"><label>Pincode</label><input className="input" value={f.pincode} onChange={(e) => set("pincode", e.target.value)} /></div>
          <div className="field" style={{ gridColumn: "1 / -1" }}><label>Address</label><input className="input" value={f.address} onChange={(e) => set("address", e.target.value)} /></div>

          <div className="field"><label>Customer Type</label>
            <select className="input" value={f.customerType} onChange={(e) => set("customerType", e.target.value)}>
              <option value="user">User</option><option value="reseller">Reseller</option>
            </select>
          </div>
          <div className="field"><label>Voice Plan</label>
            <select className="input" value={f.voicePlanId} onChange={(e) => set("voicePlanId", Number(e.target.value))}>
              {store.voicePlans.filter((p) => p.enabled).map((p) => <option key={p.id} value={p.id}>{p.name} · {p.pulseDuration}s · {p.pulsePrice}p</option>)}
            </select>
          </div>
          <div className="field"><label>User-Id</label><input className="input" type="number" value={f.userId} onChange={(e) => set("userId", e.target.value)} placeholder="auto" /></div>
          <div className="field"><label>User Expiry</label><input className="input" type="date" value={f.expiry} onChange={(e) => set("expiry", e.target.value)} /></div>
          <div className="field"><label>Plan Type</label>
            <select className="input" value={f.planType} onChange={(e) => set("planType", e.target.value)}>
              <option value="Prepaid">Prepaid</option><option value="Postpaid">Postpaid</option>
            </select>
          </div>
          <div className="field"><label>Account Type</label>
            <select className="input" value={f.accountType} onChange={(e) => set("accountType", e.target.value)}>
              <option value="Promotional">Promotional</option>
            </select>
          </div>
        </div>

        {/* Module allocation */}
        <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--color-divider)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Module allocation</div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 12 }}>
            <div className="field" style={{ minWidth: 220 }}>
              <label>Module</label>
              <select className="input" value={pickModule} onChange={(e) => setPickModule(e.target.value)}>
                {MODULE_OPTIONS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <button className="btn btn-secondary" onClick={addModule}><i className="ph-duotone ph-plus" style={{ fontSize: 15 }} /> Add</button>
          </div>
          {modules.length > 0 && (
            <table className="table" style={{ maxWidth: 480 }}>
              <thead><tr><th>Module</th><th>Action</th><th></th></tr></thead>
              <tbody>
                {modules.map((m, i) => (
                  <tr key={m.module}>
                    <td>{m.module}</td>
                    <td className="text-muted">{m.action}</td>
                    <td><button className="btn btn-icon btn-secondary" aria-label="Remove" onClick={() => setModules((mm) => mm.filter((_, j) => j !== i))}><i className="ph-duotone ph-trash" style={{ fontSize: 15 }} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <label className="radio"><input type="checkbox" checked={submission} onChange={(e) => setSubmission(e.target.checked)} /><span className="dot" /> Submission</label>
          <label className="radio"><input type="checkbox" checked={sendLogo} onChange={(e) => setSendLogo(e.target.checked)} /><span className="dot" /> Send Logo and Domain</label>
        </div>

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--color-divider)", display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-primary" onClick={submit}><i className="ph-duotone ph-user-plus" style={{ fontSize: 15 }} /> Create User</button>
        </div>
      </div>

      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
