"use client";

import { useState } from "react";
import { PageHead, Tabs } from "@/components/ui";
import { CampaignSummary, HistorySummary } from "@/components/CampaignTable";

const STANDFIRST: Record<string, string> = {
  live: "Live voice campaigns dialing right now across your users, with per-campaign traffic and pulse counts.",
  user: "Campaigns grouped by user — every user's activity in one place, filterable by date range.",
  history: "Completed and past campaigns. Open a campaign for details or generate a full report.",
};

export default function Campaigns() {
  const [tab, setTab] = useState("live");
  return (
    <>
      <PageHead kicker="Campaigns" title="Campaigns" standfirst={STANDFIRST[tab]} />
      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[{ key: "live", label: "Live" }, { key: "user", label: "User-wise" }, { key: "history", label: "Historical" }]}
      />
      {tab === "live" && <CampaignSummary kind="live" />}
      {tab === "user" && <CampaignSummary kind="prompt" userWise />}
      {tab === "history" && <HistorySummary />}
    </>
  );
}
