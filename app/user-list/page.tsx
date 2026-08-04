"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { User, CLI_POOL, effectiveStatus } from "@/lib/mock-data";
import { PageHead, UserStatusPill, Modal, Popover, ListCell, EmptyRow, Toast } from "@/components/ui";
import CreateUserForm from "@/components/CreateUserForm";

const AVATARS = [
  "linear-gradient(135deg,#00b8ff,#4fd0ff)", "linear-gradient(135deg,#0a6d95,#12a0c8)",
  "linear-gradient(135deg,#12b76a,#5fd39a)", "linear-gradient(135deg,#f2a900,#ffca4d)",
  "linear-gradient(135deg,#00415a,#0a6d95)", "linear-gradient(135deg,#7a5cff,#a08aff)",
];

type ActionKind = "add" | "remove" | "reset" | "assignVoice";
const ACTION_TITLES: Record<ActionKind, string> = {
  add: "Add Recharge",
  remove: "Remove Recharge",
  reset: "Reset Password",
  assignVoice: "Assign Voice Plan",
};

export default function UserList() {
  const store = useStore();
  const { users, voicePlans } = store;
  const [pageSize, setPageSize] = useState(25);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [openAction, setOpenAction] = useState<{ user: User; kind: ActionKind } | null>(null);
  const [cliUser, setCliUser] = useState<User | null>(null);
  const [switchUser, setSwitchUser] = useState<User | null>(null);
  const [menuFor, setMenuFor] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const planName = (id: number) => voicePlans.find((p) => p.id === id)?.name ?? "—";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? users.filter((u) => u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q) || u.company.toLowerCase().includes(q) || String(u.id).includes(q))
      : users;
    return list.slice(0, pageSize);
  }, [users, search, pageSize]);

  return (
    <>
      <PageHead
        kicker="Users"
        title="Users"
        action={<button className="btn btn-primary" onClick={() => setAddOpen(true)}><i className="ph-duotone ph-user-plus" style={{ fontSize: 15 }} /> Add User</button>}
      />

      <div className="card">
        <div className="filters" style={{ padding: "16px 19px", marginBottom: 0 }}>
          <div className="field">
            <label>Show</label>
            <select className="input" style={{ width: 90 }} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
            </select>
          </div>
          <div className="field" style={{ flex: 1, maxWidth: 320 }}>
            <label>Search</label>
            <input className="input" placeholder="Username, name, company or ID…" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setSearch(query)} />
          </div>
          <button className="btn btn-primary" onClick={() => setSearch(query)}><i className="ph-duotone ph-magnifying-glass" style={{ fontSize: 15 }} /> Search</button>
          <button className="btn btn-secondary" onClick={() => { setQuery(""); setSearch(""); }}>Clear</button>
          <button className="btn btn-secondary" style={{ marginLeft: "auto" }}><i className="ph-duotone ph-download-simple" style={{ fontSize: 15 }} /> Export CSV</button>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead><tr>
              <th>User Id</th><th>Username</th><th>Location</th><th>Group</th><th>Module</th><th>Account Type</th>
              <th>Company</th><th>Type</th><th className="num">Voice ₹</th><th>Voice Plan</th>
              <th>CLIs</th><th>Parent</th><th>Expiry</th><th>Created</th><th>Status</th><th>Switch</th><th>Action</th><th>CLI</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? <EmptyRow colSpan={18} icon="ph-users-three" message="No users match your search." /> :
                filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="tabnum">{u.id}</td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
                        <span style={{ width: 28, height: 28, flex: "none", borderRadius: "50%", background: AVATARS[u.id % AVATARS.length], color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 10.5 }}>{u.username.slice(0, 2).toUpperCase()}</span>
                        <span style={{ fontWeight: 600 }}>{u.username}</span>
                      </span>
                    </td>
                    <td><ListCell label="Location" values={u.location} /></td>
                    <td><ListCell label="Group" values={u.group} /></td>
                    <td><ListCell label="Module" values={u.module} /></td>
                    <td><ListCell label="Account Type" values={[u.accountType]} /></td>
                    <td className="text-muted">{u.company}</td>
                    <td><span className={`tag ${u.type === "reseller" ? "tag-violet" : "tag-accent"}`}>{u.type}</span></td>
                    <td className="num" style={{ fontWeight: 600 }}>{u.voiceBalance.toLocaleString("en-IN")}</td>
                    <td className="text-muted">{planName(u.voicePlanId)}</td>
                    <td><ListCell label="Allocated CLIs" values={u.clis} empty="None" /></td>
                    <td className="text-muted">{u.parent}</td>
                    <td className="tabnum">{u.expiry}</td>
                    <td className="tabnum">{u.createdAt}</td>
                    <td><UserStatusPill status={effectiveStatus(u)} /></td>
                    <td>
                      <button className="btn btn-icon btn-secondary" aria-label="Switch user" title="Login as user" onClick={() => setSwitchUser(u)}>
                        <i className="ph-duotone ph-user-switch" style={{ fontSize: 16, color: "var(--color-accent-700)" }} />
                      </button>
                    </td>
                    <td style={{ position: "relative" }}>
                      <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); setMenuFor(menuFor === u.id ? null : u.id); }}>
                        Take Action <i className="ph-duotone ph-caret-down" style={{ fontSize: 13 }} />
                      </button>
                      {menuFor === u.id && (
                        <Popover onClose={() => setMenuFor(null)} align="right">
                          <Link href={`/update-user/${u.id}`} className="menu-item"><i className="ph-duotone ph-pencil-simple" /> Edit User</Link>
                          <button className="menu-item" onClick={() => { setOpenAction({ user: u, kind: "assignVoice" }); setMenuFor(null); }}><i className="ph-duotone ph-phone-call" /> Assign Voice Plan</button>
                          <div style={{ height: 1, background: "var(--color-divider)", margin: "4px 0" }} />
                          <button className="menu-item" onClick={() => { setOpenAction({ user: u, kind: "add" }); setMenuFor(null); }}><i className="ph-duotone ph-plus-circle" /> Add Recharge</button>
                          <button className="menu-item" onClick={() => { setOpenAction({ user: u, kind: "remove" }); setMenuFor(null); }}><i className="ph-duotone ph-minus-circle" /> Remove Recharge</button>
                          <div style={{ height: 1, background: "var(--color-divider)", margin: "4px 0" }} />
                          <button className="menu-item" onClick={() => { setOpenAction({ user: u, kind: "reset" }); setMenuFor(null); }}><i className="ph-duotone ph-key" /> Reset Password</button>
                        </Popover>
                      )}
                    </td>
                    <td style={{ position: "relative" }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setCliUser(u)}><i className="ph-duotone ph-phone-plus" style={{ fontSize: 14 }} /> CLI</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {openAction && openAction.kind === "assignVoice" && (
        <AssignPlanModal
          user={openAction.user}
          store={store}
          onClose={() => setOpenAction(null)}
          onDone={(msg) => { setToast(msg); setOpenAction(null); }}
        />
      )}

      {openAction && openAction.kind !== "assignVoice" && (
        <RechargeModal
          user={openAction.user}
          kind={openAction.kind}
          onClose={() => setOpenAction(null)}
          onDone={(msg) => { setToast(msg); setOpenAction(null); }}
          store={store}
        />
      )}

      {addOpen && (
        <Modal
          title="Create User"
          sub="Provision a new reseller or end user, assign a voice plan and set which modules they can use."
          onClose={() => setAddOpen(false)}
        >
          <CreateUserForm
            onToast={setToast}
            onCreated={(username) => { setToast(`User ${username} created`); setAddOpen(false); }}
          />
        </Modal>
      )}

      {cliUser && (
        <CliPicker user={cliUser} onClose={() => setCliUser(null)} onDone={(msg) => { setToast(msg); }} />
      )}

      {switchUser && (
        <Modal
          title="Switch to user"
          onClose={() => setSwitchUser(null)}
          actions={
            <>
              <button className="btn btn-secondary" onClick={() => setSwitchUser(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { store.setViewingAs(switchUser.username); setToast(`Now viewing as ${switchUser.username}`); setSwitchUser(null); }}>
                <i className="ph-duotone ph-user-switch" style={{ fontSize: 15 }} /> Switch
              </button>
            </>
          }
        >
          <p style={{ fontSize: 13.5, color: "var(--color-neutral-700)", lineHeight: 1.5, margin: 0 }}>
            You will log in as <b>{switchUser.username}</b> ({switchUser.name}). A banner will show while you are in this session, with an Exit button to return. This is a mock switch — no live login is performed.
          </p>
        </Modal>
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}

function AssignPlanModal({ user, store, onClose, onDone }: {
  user: User; store: ReturnType<typeof useStore>; onClose: () => void; onDone: (msg: string) => void;
}) {
  const current = store.users.find((u) => u.id === user.id)!;
  const options = store.voicePlans.filter((p) => p.enabled).map((p) => ({ id: p.id, name: p.name, detail: `${p.pulseDuration}s · ${p.pulsePrice}p/pulse` }));
  const currentId = current.voicePlanId;
  const currentPlan = options.find((p) => p.id === currentId);
  const [planId, setPlanId] = useState(currentId);

  const submit = () => {
    if (planId === currentId) { onClose(); return; }
    const newName = options.find((p) => p.id === planId)?.name ?? "";
    store.assignVoicePlan(user.id, planId);
    onDone(`Voice plan for ${user.username} → ${newName}`);
  };

  return (
    <Modal
      title={`Assign Voice Plan — ${user.username}`}
      onClose={onClose}
      actions={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}><i className="ph-duotone ph-check" style={{ fontSize: 15 }} /> Confirm</button>
        </>
      }
    >
      <div className="field" style={{ marginBottom: 14 }}>
        <label>Current plan</label>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{currentPlan ? `${currentPlan.name} · ${currentPlan.detail}` : "—"}</div>
      </div>
      <div className="field">
        <label>New voice plan</label>
        <select className="input" value={planId} onChange={(e) => setPlanId(Number(e.target.value))}>
          {options.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.detail}</option>)}
        </select>
        <div className="help">Only enabled plans are shown. Voice plan changes are recorded in Plan Logs.</div>
      </div>
    </Modal>
  );
}

function RechargeModal({ user, kind, onClose, onDone, store }: {
  user: User; kind: ActionKind; onClose: () => void; onDone: (msg: string) => void; store: ReturnType<typeof useStore>;
}) {
  const [amount, setAmount] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isReset = kind === "reset";

  const submit = () => {
    if (isReset) {
      if (!pw || pw !== pw2) { setError("Passwords must match and not be empty."); return; }
      store.resetPassword(user.id);
      onDone(`Password reset for ${user.username}`);
      return;
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) { setError("Enter an amount greater than zero."); return; }
    let err: string | null = null;
    if (kind === "add") err = store.addRecharge(user.id, amt);
    if (kind === "remove") err = store.removeRecharge(user.id, amt);
    if (err) { setError(err); return; }
    onDone(`${kind === "add" ? "Added" : "Removed"} ₹${amt} for ${user.username}`);
  };

  return (
    <Modal
      title={`${ACTION_TITLES[kind]} — ${user.username}`}
      onClose={onClose}
      actions={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>{isReset ? "Reset Password" : "Confirm"}</button>
        </>
      }
    >
      {isReset ? (
        <div style={{ display: "grid", gap: 14 }}>
          <div className="field"><label>New Password</label><input className="input" type="password" value={pw} onChange={(e) => { setPw(e.target.value); setError(null); }} /></div>
          <div className="field"><label>Confirm Password</label><input className="input" type="password" value={pw2} onChange={(e) => { setPw2(e.target.value); setError(null); }} />
            {pw2 && pw !== pw2 && <div className="help" style={{ color: "var(--color-danger)" }}>Passwords do not match.</div>}
          </div>
        </div>
      ) : (
        <div className="field">
          <label>Amount (Rs)</label>
          <input className="input" type="number" min={1} autoFocus value={amount} onChange={(e) => { setAmount(e.target.value); setError(null); }} placeholder="0" />
          <div className="help">
            {kind === "add" ? "Your" : "User's"} Voice balance available:{" "}
            <b className="tabnum">{kind === "add" ? store.voiceBalance : user.voiceBalance}</b>
          </div>
        </div>
      )}
      {error && <div className="help" style={{ color: "var(--color-danger)", marginTop: 10, fontWeight: 600 }}><i className="ph-duotone ph-warning-circle" /> {error}</div>}
    </Modal>
  );
}

// Searchable CLI picker: allocated numbers shown checked at top, search filters the pool,
// checkboxes toggle allocation, Apply commits to the store.
function CliPicker({ user, onClose, onDone }: { user: User; onClose: () => void; onDone: (msg: string) => void }) {
  const store = useStore();
  const current = store.users.find((u) => u.id === user.id)!;
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(current.clis));

  // Full universe of CLIs = shared pool plus any already allocated to this user.
  const all = Array.from(new Set([...current.clis, ...CLI_POOL]));
  const ordered = [...all].sort((a, b) => {
    const sa = selected.has(a) ? 0 : 1, sb = selected.has(b) ? 0 : 1;
    return sa - sb || a.localeCompare(b);
  });
  const visible = ordered.filter((c) => c.includes(q.trim()));

  const toggle = (c: string) => setSelected((s) => { const n = new Set(s); n.has(c) ? n.delete(c) : n.add(c); return n; });

  const apply = () => {
    store.setUserClis(user.id, Array.from(selected));
    onDone(`${selected.size} CLI${selected.size === 1 ? "" : "s"} allocated to ${user.username}`);
    onClose();
  };

  return (
    <Modal
      title={`Allocate CLI — ${user.username}`}
      onClose={onClose}
      actions={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={apply}><i className="ph-duotone ph-check" style={{ fontSize: 15 }} /> Apply</button>
        </>
      }
    >
      <div style={{ position: "relative", marginBottom: 12 }}>
        <i className="ph-duotone ph-magnifying-glass" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--color-neutral-500)", fontSize: 16 }} />
        <input className="input" style={{ paddingLeft: 34 }} autoFocus placeholder="Search caller IDs…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--color-neutral-600)", marginBottom: 6 }}>
        {selected.size} allocated of {all.length} available
      </div>
      <div className="cli-list">
        {visible.length === 0 ? (
          <div className="text-muted" style={{ fontSize: 13, padding: "10px" }}>No caller IDs match “{q}”.</div>
        ) : visible.map((c) => (
          <label key={c} className="cli-row">
            <input type="checkbox" checked={selected.has(c)} onChange={() => toggle(c)} />
            <i className="ph-duotone ph-phone" style={{ color: selected.has(c) ? "var(--color-accent-600)" : "var(--color-neutral-400)" }} />
            <span className="tabnum">{c}</span>
          </label>
        ))}
      </div>
    </Modal>
  );
}
