"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
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

function NodeCard({ u, hit, dim }: { u: User; hit: boolean; dim: boolean }) {
  const reseller = u.type === "reseller";
  return (
    <div
      className="org-node"
      style={{
        borderTop: `3px solid ${reseller ? "#7a5cff" : "#00b8ff"}`,
        ...(hit ? { boxShadow: "0 0 0 3px rgba(0,184,255,0.45), var(--shadow-md)" } : undefined),
        ...(dim ? { opacity: 0.3, filter: "grayscale(0.4)" } : undefined),
      }}
    >
      <span style={{ width: 34, height: 34, borderRadius: "50%", background: AVATARS[u.id % AVATARS.length], color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 12 }}>
        {u.username.slice(0, 2).toUpperCase()}
      </span>
      <Link href={`/update-user/${u.id}`} style={{ fontWeight: 600, fontSize: 12.5, marginTop: 3, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.username}</Link>
      <span style={{ fontSize: 11, color: "var(--color-neutral-600)", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.company}</span>
      <span className={`tag ${reseller ? "tag-violet" : "tag-accent"}`} style={{ marginTop: 5 }}>{reseller ? "Reseller" : "User"}</span>
      <span className="tabnum" style={{ fontSize: 12, fontWeight: 700, color: "var(--color-neutral-700)", marginTop: 2 }}>₹{fmt(u.voiceBalance)}</span>
    </div>
  );
}

export default function Hierarchy() {
  const { users } = useStore();
  const [query, setQuery] = useState("");
  const childrenOf = (username: string) => users.filter((u) => u.parent === username);
  const totalUsers = users.filter((u) => u.type === "user").length;
  const totalResellers = users.filter((u) => u.type === "reseller").length;

  const q = query.trim().toLowerCase();
  const matches = (u: User) => !!q && (u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q) || u.company.toLowerCase().includes(q));
  const hits = q ? users.filter(matches).length : 0;

  // breadth-first levels; children stay grouped in parent order so edges stay near-vertical
  const levels: User[][] = [];
  let cur = childrenOf(RESELLER.username);
  while (cur.length) {
    levels.push(cur);
    cur = cur.flatMap((u) => childrenOf(u.username));
  }

  // edges are measured from the rendered DOM, so rows can be evenly spaced and
  // the curves always meet each card dead-centre no matter how many nodes there are
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const nodeEls = useRef<Map<string, HTMLElement>>(new Map());
  const [edges, setEdges] = useState<{ id: number; x1: number; y1: number; x2: number; y2: number }[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const setNodeRef = (name: string) => (el: HTMLDivElement | null) => {
    if (el) nodeEls.current.set(name, el);
    else nodeEls.current.delete(name);
  };

  const measure = useCallback(() => {
    const c = wrapRef.current;
    if (!c) return;
    const cr = c.getBoundingClientRect();
    setEdges(users.flatMap((u) => {
      const p = nodeEls.current.get(u.parent), k = nodeEls.current.get(u.username);
      if (!p || !k) return [];
      const pr = p.getBoundingClientRect(), kr = k.getBoundingClientRect();
      return [{ id: u.id, x1: pr.left + pr.width / 2 - cr.left, y1: pr.bottom - cr.top, x2: kr.left + kr.width / 2 - cr.left, y2: kr.top - cr.top }];
    }));
    setSize({ w: c.offsetWidth, h: c.offsetHeight });
  }, [users]);

  useLayoutEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  return (
    <>
      <PageHead kicker="Accounts" title="Account Hierarchy" />
      <div className="card">
        {/* toolbar */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "13px 18px", flexWrap: "wrap", borderBottom: "1px solid var(--color-divider)" }}>
          <div style={{ position: "relative", width: 280, flex: "none" }}>
            <i className="ph-duotone ph-magnifying-glass" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--color-neutral-500)", fontSize: 16 }} />
            <input className="input" style={{ paddingLeft: 34, borderRadius: 999 }} placeholder="Find a user or reseller…" aria-label="Search hierarchy" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {q && <span style={{ fontSize: 12.5, fontWeight: 600, color: hits ? "var(--color-accent-700)" : "var(--color-danger)" }}>{hits ? `${hits} match${hits > 1 ? "es" : ""} highlighted` : "No accounts match"}</span>}
          <div style={{ marginLeft: "auto", display: "flex", gap: 16, alignItems: "center", fontSize: 12, color: "var(--color-neutral-600)", flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#7a5cff" }} /> Reseller</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#00b8ff" }} /> User</span>
            <span className="text-muted">Lines show who manages whom</span>
          </div>
        </div>

        <div className="org-canvas">
          <div ref={wrapRef} style={{ position: "relative", padding: "34px 20px 44px", minWidth: "max-content", margin: "0 auto" }}>
            <svg width={size.w} height={size.h} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} aria-hidden="true">
              {edges.map((e) => {
                const my = (e.y1 + e.y2) / 2;
                return <path key={e.id} d={`M ${e.x1} ${e.y1} C ${e.x1} ${my}, ${e.x2} ${my}, ${e.x2} ${e.y2}`} fill="none" stroke="#b3c6cf" strokeWidth={2} strokeLinecap="round" />;
              })}
            </svg>

            {/* root: you */}
            <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
              <div ref={setNodeRef(RESELLER.username)} className="org-node" style={{ background: "#091f44", border: "none", width: 172, padding: "14px 12px 12px", boxShadow: "0 12px 28px rgba(9,31,68,0.32)", ...(q ? { opacity: 0.55 } : undefined) }}>
                <span style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#00b8ff,#4fd0ff)", color: "#00344b", display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 14 }}>
                  {RESELLER.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                </span>
                <span style={{ fontWeight: 600, fontFamily: "var(--font-heading)", fontSize: 14, color: "#fff", marginTop: 4 }}>You</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>{RESELLER.username}</span>
                <span style={{ fontSize: 11.5, color: "rgba(255,255,255,.85)", marginTop: 5 }}>{totalUsers} users · {totalResellers} resellers</span>
              </div>
            </div>

            {levels.map((lvl, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "center", gap: 26, marginTop: 56, position: "relative" }}>
                {lvl.map((u) => (
                  <div key={u.id} ref={setNodeRef(u.username)}>
                    <NodeCard u={u} hit={matches(u)} dim={!!q && !matches(u)} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
