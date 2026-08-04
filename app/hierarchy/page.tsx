"use client";

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

function NodeCard({ u }: { u: User }) {
  const reseller = u.type === "reseller";
  return (
    <div className="org-node" style={reseller ? { borderTop: "3px solid #7a5cff" } : { borderTop: "3px solid #00b8ff" }}>
      <span style={{ width: 40, height: 40, borderRadius: "50%", background: AVATARS[u.id % AVATARS.length], color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 13 }}>
        {u.username.slice(0, 2).toUpperCase()}
      </span>
      <Link href={`/update-user/${u.id}`} style={{ fontWeight: 600, fontSize: 13, marginTop: 4, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.username}</Link>
      <span style={{ fontSize: 11, color: "var(--color-neutral-600)", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.company}</span>
      <span className={`tag ${reseller ? "tag-violet" : "tag-accent"}`} style={{ marginTop: 5 }}>{reseller ? "Reseller" : "User"}</span>
      <span className="tabnum" style={{ fontSize: 12, fontWeight: 700, color: "var(--color-neutral-700)", marginTop: 2 }}>₹{fmt(u.voiceBalance)}</span>
    </div>
  );
}

export default function Hierarchy() {
  const { users } = useStore();
  const childrenOf = (username: string) => users.filter((u) => u.parent === username);
  const totalUsers = users.filter((u) => u.type === "user").length;
  const totalResellers = users.filter((u) => u.type === "reseller").length;

  const renderChildren = (username: string) => {
    const kids = childrenOf(username);
    if (kids.length === 0) return null;
    return (
      <ul>
        {kids.map((u) => (
          <li key={u.id}>
            <NodeCard u={u} />
            {renderChildren(u.username)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <PageHead kicker="Users" title="Account Hierarchy" />
      <div className="card" style={{ overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center", justifyContent: "center", padding: "14px 18px 0", fontSize: 12, color: "var(--color-neutral-600)", flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#7a5cff" }} /> Reseller — manages accounts of their own</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#00b8ff" }} /> User — runs campaigns</span>
          <span className="text-muted">Lines show who manages whom · click a name to edit</span>
        </div>
        <ul className="org">
          <li>
            {/* root: you */}
            <div className="org-node" style={{ background: "#091f44", border: "none", width: 190, padding: "16px 14px 14px" }}>
              <span style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#00b8ff,#4fd0ff)", color: "#00344b", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 14 }}>
                {RESELLER.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
              </span>
              <span style={{ fontWeight: 600, fontFamily: "var(--font-heading)", fontSize: 14, color: "#fff", marginTop: 4 }}>You</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>{RESELLER.username}</span>
              <span style={{ fontSize: 11.5, color: "rgba(255,255,255,.85)", marginTop: 5 }}>{totalUsers} users · {totalResellers} resellers</span>
            </div>
            {renderChildren(RESELLER.username)}
          </li>
        </ul>
      </div>
    </>
  );
}
