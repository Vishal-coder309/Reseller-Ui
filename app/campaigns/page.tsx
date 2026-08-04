"use client";

import { useState } from "react";
import { PageHead, Tabs } from "@/components/ui";
import { CampaignSummary, HistorySummary } from "@/components/CampaignTable";

export default function Campaigns() {
  const [tab, setTab] = useState("live");
  return (
    <>
      <PageHead kicker="Campaigns" title="Campaigns" />
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
