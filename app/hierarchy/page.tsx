"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { RESELLER, User, effectiveStatus } from "@/lib/mock-data";
import { PageHead, UserStatusPill } from "@/components/ui";

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

  // count the whole subtree, not just direct children
  const subtree = (username: string): { users: number; resellers: number } =>
    childrenOf(username).reduce(
      (acc, k) => {
        const sub = subtree(k.username);
        return { users: acc.users + sub.users + (k.type === "user" ? 1 : 0), resellers: acc.resellers + sub.resellers + (k.type === "reseller" ? 1 : 0) };
      },
      { users: 0, resellers: 0 }
    );
  const total = subtree(RESELLER.username);

  const summary = (username: string) => {
    const kids = childrenOf(username);
    const r = kids.filter((k) => k.type === "reseller").length;
    const u = kids.length - r;
    const parts = [u && `${u} user${u > 1 ? "s" : ""}`, r && `${r} reseller${r > 1 ? "s" : ""}`].filter(Boolean);
    return parts.join(" · ");
  };

  const renderNode = (u: User, depth: number) => {
    const kids = childrenOf(u.username);
    const open = !collapsed[u.id];
    const reseller = u.type === "reseller";
    return (
      <div key={u.id} style={{ marginLeft: 20, borderLeft: "2px solid var(--color-divider)", paddingLeft: 18, paddingTop: 10 }}>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderLeft: `3px solid ${reseller ? "#7a5cff" : "#00b8ff"}` }}>
          {kids.length > 0 ? (
            <button className="btn btn-icon" aria-label={open ? "Collapse" : "Expand"} onClick={() => toggle(u.id)} style={{ width: 26, height: 26, color: "var(--color-neutral-600)" }}>
              <i className="ph-duotone ph-caret-down" style={{ fontSize: 14, transform: open ? undefined : "rotate(-90deg)", transition: "transform .15s" }} />
            </button>
          ) : (
            <span style={{ width: 26, flex: "none" }} />
          )}
          <span style={{ width: 32, height: 32, flex: "none", borderRadius: "50%", background: AVATARS[u.id % AVATARS.length], color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 11.5 }}>
            {u.username.slice(0, 2).toUpperCase()}
          </span>
          <span style={{ minWidth: 0 }}>
            <Link href={`/update-user/${u.id}`} style={{ fontWeight: 600, fontSize: 13.5 }}>{u.username}</Link>
            <span style={{ display: "block", fontSize: 11.5, color: "var(--color-neutral-600)" }}>{u.company}</span>
          </span>
          <span className={`tag ${reseller ? "tag-violet" : "tag-accent"}`}>{u.type}</span>
          <UserStatusPill status={effectiveStatus(u)} />
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
            {kids.length > 0 && <span style={{ fontSize: 12, color: "var(--color-neutral-600)" }}>{summary(u.username)}</span>}
            <b className="tabnum" style={{ fontSize: 13 }}>₹{fmt(u.voiceBalance)}</b>
          </span>
        </div>
        {open && kids.map((k) => renderNode(k, depth + 1))}
      </div>
    );
  };

  const roots = childrenOf(RESELLER.username);

  return (
    <>
      <PageHead kicker="Users" title="Account Hierarchy" />
      <div className="card card-pad">
        {/* root: you */}
        <div style={{ display: "flex", alignItems: "center", gap: 13, background: "#091f44", borderRadius: "var(--radius-md)", padding: "14px 18px", color: "#fff" }}>
          <span style={{ width: 40, height: 40, flex: "none", borderRadius: "50%", background: "linear-gradient(135deg,#00b8ff,#4fd0ff)", color: "#00344b", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 14 }}>
            {RESELLER.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
          </span>
          <span>
            <span style={{ display: "block", fontWeight: 600, fontFamily: "var(--font-heading)", fontSize: 15 }}>{RESELLER.username}</span>
            <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,.66)" }}>{RESELLER.company} · you</span>
          </span>
          <span style={{ marginLeft: "auto", fontSize: 12.5, color: "rgba(255,255,255,.8)" }}>
            {total.users} user{total.users !== 1 ? "s" : ""} · {total.resellers} reseller{total.resellers !== 1 ? "s" : ""} in your network
          </span>
        </div>
        {roots.map((u) => renderNode(u, 1))}
      </div>
    </>
  );
}
