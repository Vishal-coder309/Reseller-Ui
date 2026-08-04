"use client";

import { use } from "react";
import Link from "next/link";
import { campaigns } from "@/lib/mock-data";
import { PageHead, StatusPill } from "@/components/ui";

export default function CampaignDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const c = campaigns.find((x) => x.id === Number(id));
  if (!c) return <PageHead kicker="Manage Campaign" title="Campaign not found" standfirst="This campaign does not exist." />;

  const info: [string, string][] = [
    ["Campaign Name", c.name],
    ["Type", c.type],
    ["Valid DTMF", c.validDtmf],
    ["Menu Wait Time", `${c.menuWaitTime} sec`],
    ["No. of Retries", String(c.retries)],
    ["Retry Interval", c.retryInterval],
    ["Location", c.location],
    ["CLI", c.cli],
    ["Prompt Name", c.promptName],
    ["Prompt Duration", c.promptDuration],
  ];

  const metrics: [string, string][] = [
    ["Total Numbers", c.totalNumbers.toLocaleString("en-IN")],
    ["Calls Dialed", c.callsDialed.toLocaleString("en-IN")],
    ["Connected", c.connected.toLocaleString("en-IN")],
    ["Pending", c.pending.toLocaleString("en-IN")],
    ["Total Pulses", c.totalPulses.toLocaleString("en-IN")],
    ["Expenditure", `₹${c.expenditure.toFixed(2)}`],
  ];

  return (
    <>
      <PageHead
        kicker="Manage Campaign"
        title={c.name}
        action={<Link href="/campaigns" className="btn btn-secondary">← Back</Link>}
      />
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <StatusPill status={c.status} />
        <span className="tag tag-accent">{c.type}</span>
      </div>

      <div data-split style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card card-pad">
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Campaign Info</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
            {info.map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>{k}</div>
                <div style={{ fontWeight: 600, fontSize: 13.5, marginTop: 3 }} className="tabnum">{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card card-pad">
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Results</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
            {metrics.map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>{k}</div>
                <div style={{ fontWeight: 600, fontSize: 18, marginTop: 3 }} className="tabnum">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
