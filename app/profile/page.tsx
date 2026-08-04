"use client";

import { useStore } from "@/lib/store";
import { RESELLER } from "@/lib/mock-data";
import { PageHead } from "@/components/ui";

export default function Profile() {
  const { voiceBalance, ttsBalance } = useStore();
  const rows: [string, string][] = [
    ["Username", RESELLER.username],
    ["Name", RESELLER.name],
    ["Email", RESELLER.email],
    ["Mobile", RESELLER.mobile],
    ["Company", RESELLER.company],
    ["User Type", RESELLER.type],
    ["Plan Name", RESELLER.planName],
    ["Voice Balance", `₹${voiceBalance}`],
    ["TTS Balance", `₹${ttsBalance}`],
  ];
  return (
    <>
      <PageHead kicker="Account" title="My Profile" standfirst="Your reseller account details and current balances." />
      <div className="card card-pad" style={{ maxWidth: 620 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }} data-split>
          {rows.map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>{k}</div>
              <div style={{ fontWeight: 600, fontSize: 15, marginTop: 3 }} className="tabnum">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
