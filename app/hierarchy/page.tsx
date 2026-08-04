"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { RESELLER, User } from "@/lib/mock-data";
import { PageHead } from "@/components/ui";

const AVATARS = [
  "linear-gradient(135deg,#00b8ff,#4fd0ff)", "linear-gradient(135deg,#0a6d95,#12a0c8)",
  "linear-gradient(135deg,#12b76a,#5fd39a)", "linear-gradient(135deg,#f2a900,#ffca4d)",
  "linear-gradient(135deg,#00415a,#0a6d95)", "linear-gradient(135deg,#7a5cff,#a08aff)",
];
const fmt = (n: number) => n.toLocaleString("en-IN");

export default function Hierarchy() {
  const { users } = useStore();
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
  const childrenOf = (username: string) => users.filter((u) => u.parent === username);
  const toggle = (id: number) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  const subtree = (username: string): number =>
    childrenOf(username).reduce((n, k) => n + 1 + subtree(k.username), 0);
  const totalUsers = users.filter((u) => u.type === "user").length;
  const totalResellers = users.filter((u) => u.type === "reseller").length;

  const renderNode = (u: User, depth: number) => {
    const kids = childrenOf(u.username);
    const open = !collapsed[u.id];
    const reseller = u.type === "reseller";
    return (
      <div key={u.id}>
        <div className="tree-row" style={{ paddingLeft: 16 + depth * 34 }}>
          {kids.length > 0 ? (
            <button className="btn btn-icon" aria-label={open ? "Collapse" : "Expand"} onClick={() => toggle(u.id)} style={{ width: 24, height: 24, flex: "none", color: "var(--color-neutral-600)" }}>
              <i className="ph-duotone ph-caret-down" style={{ fontSize: 13, transform: open ? undefined : "rotate(-90deg)", transition: "transform .15s" }} />
            </button>
          ) : (
            <i className="ph-duotone ph-arrow-elbow-down-right" style={{ width: 24, flex: "none", fontSize: 14, color: "var(--color-neutral-400)", textAlign: "center" }} />
          )}
          <span style={{ width: 28, height: 28, flex: "none", borderRadius: "50%", background: AVATARS[u.id % AVATARS.length], color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 10.5 }}>
            {u.username.slice(0, 2).toUpperCase()}
          </span>
          <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            <Link href={`/update-user/${u.id}`} style={{ fontWeight: 600, fontSize: 13.5 }}>{u.username}</Link>
            <span style={{ fontSize: 12.5, color: "var(--color-neutral-500)" }}> · {u.company}</span>
          </span>
          {reseller && <span className="tag tag-violet" style={{ flex: "none" }}>reseller{kids.length > 0 ? ` · ${subtree(u.username)} below` : ""}</span>}
          <b className="tabnum" style={{ marginLeft: "auto", flex: "none", fontSize: 13, color: "var(--color-neutral-700)" }}>₹{fmt(u.voiceBalance)}</b>
        </div>
        {open && kids.map((k) => renderNode(k, depth + 1))}
      </div>
    );
  };

  return (
    <>
      <PageHead kicker="Users" title="Account Hierarchy" />
      <div className="card" style={{ maxWidth: 860 }}>
        {/* root: you */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#091f44", borderRadius: "var(--radius-md) var(--radius-md) 0 0", padding: "14px 18px", color: "#fff" }}>
          <span style={{ width: 36, height: 36, flex: "none", borderRadius: "50%", background: "linear-gradient(135deg,#00b8ff,#4fd0ff)", color: "#00344b", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 13 }}>
            {RESELLER.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
          </span>
          <span>
            <span style={{ display: "block", fontWeight: 600, fontFamily: "var(--font-heading)", fontSize: 15 }}>You ({RESELLER.username})</span>
            <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,.66)" }}>{totalUsers} users and {totalResellers} resellers under you</span>
          </span>
        </div>
        <div style={{ padding: "6px 0 10px" }}>
          {childrenOf(RESELLER.username).map((u) => renderNode(u, 0))}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 18px 12px", borderTop: "1px solid var(--color-divider)", fontSize: 12, color: "var(--color-neutral-600)" }}>
          <i className="ph-duotone ph-info" style={{ fontSize: 14, color: "var(--color-accent-700)" }} />
          Each account is listed under whoever manages it. Purple = reseller (has accounts of their own); click a name to edit it.
        </div>
      </div>
    </>
  );
}
