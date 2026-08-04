"use client";

import { useState } from "react";
import { PageHead, Tabs } from "@/components/ui";
import { CampaignSummary, HistorySummary } from "@/components/CampaignTable";

const STANDFIRST: Record<string, string> = {
  live: "Live voice campaigns dialing right now across your users, with per-campaign traffic and pulse counts.",
  prompt: "Prompt-based (recorded audio) campaigns, filterable by date range and prompt.",
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
        tabs={[{ key: "live", label: "Live" }, { key: "prompt", label: "Prompt-wise" }, { key: "history", label: "Historical" }]}
      />
      {tab === "live" && <CampaignSummary kind="live" />}
      {tab === "prompt" && <CampaignSummary kind="prompt" showPrompt />}
      {tab === "history" && <HistorySummary />}
    </>
  );
}
