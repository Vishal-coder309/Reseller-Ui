// Mock data layer for the reseller console. Typed seeds + helpers.
// Balances/plans/users are mutated client-side via the store (lib/store.tsx).

export type CustomerType = "reseller" | "user";
export type PlanType = "Prepaid" | "Postpaid";
export type UserStatus = "Active" | "Validity Expired";

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  mobile: string;
  company: string;
  address: string;
  pincode: string;
  location: string[];
  group: string[];
  module: string[];
  accountType: string; // e.g. "Promotional"
  type: CustomerType;
  voiceBalance: number;
  voicePlanId: number;
  ttsBalance: number;
  ttsPlanId: number;
  parent: string;
  expiry: string; // ISO date
  createdAt: string;
  planType: PlanType;
  status: UserStatus;
  clis: string[];
}

export interface VoicePlan {
  id: number;
  name: string;
  pulseDuration: number; // seconds
  pulsePrice: number; // paisa
  enabled: boolean;
}

export interface TtsPlan {
  id: number;
  name: string;
  perCharacter: number;
  perVariable: number;
  enabled: boolean;
}

export type CampaignStatus = "running" | "paused" | "complete" | "scheduled" | "failed";
export type CampaignKind = "live" | "prompt" | "history";
export type CampaignType = "Simple IVR" | "DTMF" | "Call Patch" | "Custom IVR";

export interface Campaign {
  id: number;
  name: string;
  userId: number;
  userName: string;
  parentUsername: string;
  status: CampaignStatus;
  kind: CampaignKind;
  type: CampaignType;
  channels: number;
  startTime: string;
  endTime: string;
  totalNumbers: number;
  callsDialed: number;
  pending: number;
  connected: number;
  totalPulses: number;
  dnd: number;
  dtmf: number;
  dtmf1: number;
  dtmf2: number;
  smsCount: number;
  retryCount: number;
  retries: number;
  pauseTime: string;
  variableCount: number;
  promptId?: number;
  cli: string;
  // detail / analysis
  answered: number;
  nonAnswered: number;
  expenditure: number; // INR
  // reseller-summary
  resellerPulse: number;
  userPulse: number;
  userSmsCount: number;
  pulseDuration: number;
  pulsePrice: number;
  // detail read-only
  validDtmf: string;
  menuWaitTime: number;
  retryInterval: string;
  location: string;
  promptName: string;
  promptDuration: string;
}

export type LedgerAction = "addition" | "deduction" | "tts_addition" | "campaign_deduction";
export interface LedgerEntry {
  id: number;
  userId: number;
  fromUser: string;
  toUser: string;
  actionOn: string;
  amount: number;
  campaign: string;
  action: LedgerAction;
  ttsCredits: number;
  date: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  username: string;
  userId: number;
  ip: string;
  date: string;
}

export interface VoicePlanLog {
  oldPlanId: number;
  newPlanId: number;
  userId: number;
  userName: string;
  requestDate: string;
}

export interface VoiceFile {
  id: number;
  fileName: string;
  fileType: string; // menu / welcome / noagent
  status: "Approved" | "Pending";
  uploadedBy: string;
  account: string;
  remarks: string;
}

// ---------------- seeds ----------------

export const RESELLER = {
  username: "DEMO_OPERATOR",
  name: "Vishal Yadav",
  email: "operator@orbitel.in",
  mobile: "98xxxxxx10",
  company: "Orbitel Communications",
  type: "reseller" as const,
  planName: "Reseller Base 30s",
  resellerPulsePrice: 15, // paisa — reseller's own cost; margin = user plan price − this
  voiceBalance: 5000,
  ttsBalance: 2000,
};

// Pool of caller-ID numbers the reseller can allocate to users.
export const CLI_POOL: string[] = [
  "04471000001", "04471000002", "04471000003", "02240000010", "04071000005",
  "02040000006", "01140000011", "03340000012", "07940000013", "08040000014",
  "01244000015", "01204000016", "02244000017", "04442000018", "05224000019",
];

export const voicePlans: VoicePlan[] = [
  { id: 101, name: "Standard 30s", pulseDuration: 30, pulsePrice: 22, enabled: true },
  { id: 102, name: "Economy 60s", pulseDuration: 60, pulsePrice: 18, enabled: true },
  { id: 103, name: "Premium 15s", pulseDuration: 15, pulsePrice: 30, enabled: false },
];

export const ttsPlans: TtsPlan[] = [
  { id: 201, name: "TTS Basic", perCharacter: 0.05, perVariable: 0.2, enabled: true },
  { id: 202, name: "TTS Pro", perCharacter: 0.03, perVariable: 0.15, enabled: true },
];

export const users: User[] = [
  {
    id: 5001, username: "acme_calls", name: "Ravi Menon", email: "ravi@acme.in", mobile: "98xxxxxx21",
    company: "Acme Retail", address: "12 MG Road", pincode: "560001", location: ["Bengaluru", "Chennai"],
    group: ["Retail"], module: ["Custom IVR", "SMS Webhooks"], accountType: "Promotional", type: "user",
    voiceBalance: 340, voicePlanId: 101, ttsBalance: 60, ttsPlanId: 201, parent: "DEMO_OPERATOR",
    expiry: "2026-12-31", createdAt: "2026-01-14", planType: "Prepaid", status: "Active", clis: ["04471000001"],
  },
  {
    id: 5002, username: "civic_poll", name: "Sunita Rao", email: "sunita@civic.org", mobile: "98xxxxxx22",
    company: "Civic Trust", address: "5 Anna Salai", pincode: "600002", location: ["Chennai"],
    group: ["NGO"], module: ["Webhooks"], accountType: "Promotional", type: "user",
    voiceBalance: 120, voicePlanId: 102, ttsBalance: 15, ttsPlanId: 202, parent: "DEMO_OPERATOR",
    expiry: "2026-09-15", createdAt: "2026-02-02", planType: "Prepaid", status: "Active", clis: ["04471000002", "04471000003"],
  },
  {
    id: 5003, username: "loanhub", name: "Imran Shaikh", email: "imran@loanhub.in", mobile: "98xxxxxx23",
    company: "LoanHub Finance", address: "88 SB Road", pincode: "411016", location: ["Pune", "Mumbai"],
    group: ["Finance"], module: ["Custom IVR", "Webhooks", "SMS Webhooks"], accountType: "Promotional",
    type: "reseller", voiceBalance: 900, voicePlanId: 101, ttsBalance: 200, ttsPlanId: 201, parent: "DEMO_OPERATOR",
    expiry: "2027-03-01", createdAt: "2025-11-20", planType: "Postpaid", status: "Active", clis: ["02240000010"],
  },
  {
    id: 5004, username: "shopmate", name: "Neha Gupta", email: "neha@shopmate.in", mobile: "98xxxxxx24",
    company: "ShopMate", address: "22 Park St", pincode: "700016", location: ["Kolkata"],
    group: ["Retail"], module: ["Custom IVR"], accountType: "Promotional", type: "user",
    voiceBalance: 0, voicePlanId: 103, ttsBalance: 5, ttsPlanId: 201, parent: "DEMO_OPERATOR",
    expiry: "2026-06-30", createdAt: "2026-01-05", planType: "Prepaid", status: "Validity Expired", clis: [],
  },
  {
    id: 5005, username: "healthline", name: "Dr. Anil Kumar", email: "anil@healthline.in", mobile: "98xxxxxx25",
    company: "HealthLine Clinics", address: "9 Residency Rd", pincode: "500034", location: ["Hyderabad"],
    group: ["Healthcare"], module: ["Custom IVR"], accountType: "Promotional", type: "user",
    voiceBalance: 210, voicePlanId: 102, ttsBalance: 45, ttsPlanId: 202, parent: "DEMO_OPERATOR",
    expiry: "2026-11-11", createdAt: "2026-03-18", planType: "Prepaid", status: "Active", clis: ["04071000005"],
  },
  {
    id: 5006, username: "eduwave", name: "Priya Nair", email: "priya@eduwave.in", mobile: "98xxxxxx26",
    company: "EduWave", address: "3 FC Road", pincode: "411004", location: ["Pune"],
    group: ["Education"], module: ["SMS Webhooks"], accountType: "Promotional", type: "user",
    voiceBalance: 75, voicePlanId: 101, ttsBalance: 22, ttsPlanId: 201, parent: "DEMO_OPERATOR",
    expiry: "2026-08-01", createdAt: "2026-04-09", planType: "Prepaid", status: "Active", clis: ["02040000006"],
  },
];

function mkCampaign(p: Partial<Campaign> & Pick<Campaign, "id" | "name" | "userId" | "userName" | "status" | "kind" | "type">): Campaign {
  const dialed = p.callsDialed ?? 0;
  const connected = p.connected ?? Math.round(dialed * 0.45);
  return {
    parentUsername: "DEMO_OPERATOR", channels: 30, startTime: "2026-08-03 09:15", endTime: "2026-08-03 09:52",
    totalNumbers: dialed, callsDialed: dialed, pending: 0, connected, totalPulses: connected * 2, dnd: Math.round(dialed * 0.03),
    dtmf: Math.round(connected * 0.3), dtmf1: Math.round(connected * 0.18), dtmf2: Math.round(connected * 0.08),
    smsCount: Math.round(connected * 0.5), retryCount: 1, retries: Math.round(dialed * 0.1), pauseTime: "-", variableCount: 0,
    cli: "04471000001", answered: connected, nonAnswered: dialed - connected, expenditure: connected * 0.44,
    resellerPulse: connected * 2, userPulse: connected * 2, userSmsCount: Math.round(connected * 0.5),
    pulseDuration: 30, pulsePrice: 22, validDtmf: "1,2,3", menuWaitTime: 5, retryInterval: "15 min",
    location: "Bengaluru", promptName: "welcome-hi.wav", promptDuration: "0:14", ...p,
  };
}

export const campaigns: Campaign[] = [
  mkCampaign({ id: 9001, name: "Diwali Push 01", userId: 5001, userName: "acme_calls", status: "running", kind: "live", type: "Simple IVR", callsDialed: 4200, pending: 1800, channels: 60 }),
  mkCampaign({ id: 9002, name: "KYC Reminder", userId: 5003, userName: "loanhub", status: "running", kind: "live", type: "DTMF", callsDialed: 2600, pending: 900, dtmf: 610 }),
  mkCampaign({ id: 9003, name: "Ward 12 Poll", userId: 5002, userName: "civic_poll", status: "paused", kind: "live", type: "DTMF", callsDialed: 1500, pending: 500, pauseTime: "09:40" }),
  mkCampaign({ id: 9004, name: "Clinic Slots", userId: 5005, userName: "healthline", status: "running", kind: "live", type: "Call Patch", callsDialed: 800, pending: 300 }),
  mkCampaign({ id: 9005, name: "Fee Reminder", userId: 5006, userName: "eduwave", status: "complete", kind: "live", type: "Simple IVR", callsDialed: 1200, pending: 0 }),

  mkCampaign({ id: 9101, name: "Loan Pre-approval", userId: 5003, userName: "loanhub", status: "running", kind: "prompt", type: "Simple IVR", callsDialed: 3100, pending: 700, promptId: 3301 }),
  mkCampaign({ id: 9102, name: "Offer Broadcast", userId: 5001, userName: "acme_calls", status: "complete", kind: "prompt", type: "Simple IVR", callsDialed: 5400, pending: 0, promptId: 3302 }),
  mkCampaign({ id: 9103, name: "Health Tips", userId: 5005, userName: "healthline", status: "scheduled", kind: "prompt", type: "Simple IVR", callsDialed: 0, promptId: 3303, startTime: "2026-08-04 10:00" }),

  mkCampaign({ id: 9201, name: "Festival Offer", userId: 5001, userName: "acme_calls", status: "complete", kind: "history", type: "Simple IVR", callsDialed: 8200, startTime: "2026-07-28 11:00", endTime: "2026-07-28 12:20" }),
  mkCampaign({ id: 9202, name: "Repayment Alert", userId: 5003, userName: "loanhub", status: "complete", kind: "history", type: "DTMF", callsDialed: 4600, startTime: "2026-07-25 15:00", endTime: "2026-07-25 15:44" }),
  mkCampaign({ id: 9203, name: "Survey Q2", userId: 5002, userName: "civic_poll", status: "failed", kind: "history", type: "DTMF", callsDialed: 300, startTime: "2026-07-20 09:00", endTime: "2026-07-20 09:05", connected: 12 }),
  mkCampaign({ id: 9204, name: "Admissions Open", userId: 5006, userName: "eduwave", status: "complete", kind: "history", type: "Custom IVR", callsDialed: 2100, startTime: "2026-07-15 10:30", endTime: "2026-07-15 11:10" }),
];

export const ledger: LedgerEntry[] = [
  { id: 7001, userId: 5001, fromUser: "DEMO_OPERATOR", toUser: "acme_calls", actionOn: "acme_calls", amount: 500, campaign: "-", action: "addition", ttsCredits: 0, date: "2026-07-30 10:12" },
  { id: 7002, userId: 5001, fromUser: "acme_calls", toUser: "-", actionOn: "Diwali Push 01", amount: 160, campaign: "Diwali Push 01", action: "campaign_deduction", ttsCredits: 0, date: "2026-08-03 09:52" },
  { id: 7003, userId: 5002, fromUser: "DEMO_OPERATOR", toUser: "civic_poll", actionOn: "civic_poll", amount: 100, campaign: "-", action: "addition", ttsCredits: 0, date: "2026-07-29 14:03" },
  { id: 7004, userId: 5003, fromUser: "DEMO_OPERATOR", toUser: "loanhub", actionOn: "loanhub", amount: 200, campaign: "-", action: "deduction", ttsCredits: 0, date: "2026-07-28 09:00" },
  { id: 7005, userId: 5005, fromUser: "DEMO_OPERATOR", toUser: "healthline", actionOn: "healthline", amount: 300, campaign: "-", action: "addition", ttsCredits: 0, date: "2026-07-27 16:40" },
  { id: 7006, userId: 5003, fromUser: "loanhub", toUser: "-", actionOn: "Repayment Alert", amount: 92, campaign: "Repayment Alert", action: "campaign_deduction", ttsCredits: 0, date: "2026-07-25 15:44" },
];

export const activityLogs: ActivityLog[] = [
  { id: 1, action: "LOGIN", username: "DEMO_OPERATOR", userId: 999, ip: "103.21.44.10", date: "2026-08-03 08:55" },
  { id: 2, action: "ADD_RECHARGE", username: "DEMO_OPERATOR", userId: 999, ip: "103.21.44.10", date: "2026-07-30 10:12" },
  { id: 3, action: "LOGIN", username: "acme_calls", userId: 5001, ip: "49.207.10.5", date: "2026-08-03 09:10" },
  { id: 4, action: "CREATE_USER", username: "DEMO_OPERATOR", userId: 999, ip: "103.21.44.10", date: "2026-04-09 12:00" },
  { id: 5, action: "LOGIN", username: "loanhub", userId: 5003, ip: "115.99.3.44", date: "2026-08-02 18:20" },
];

export const voicePlanLogs: VoicePlanLog[] = [
  { oldPlanId: 103, newPlanId: 101, userId: 5004, userName: "shopmate", requestDate: "2026-07-01 11:00" },
  { oldPlanId: 101, newPlanId: 102, userId: 5002, userName: "civic_poll", requestDate: "2026-06-18 09:30" },
];

export const voiceFiles: VoiceFile[] = [
  { id: 4001, fileName: "welcome-hi.wav", fileType: "welcome", status: "Approved", uploadedBy: "acme_calls", account: "Acme Retail", remarks: "-" },
  { id: 4002, fileName: "menu-loan.wav", fileType: "menu", status: "Approved", uploadedBy: "loanhub", account: "LoanHub Finance", remarks: "-" },
  { id: 4003, fileName: "noagent.wav", fileType: "noagent", status: "Pending", uploadedBy: "healthline", account: "HealthLine Clinics", remarks: "In review queue" },
  { id: 4004, fileName: "thanks-en.wav", fileType: "thanks", status: "Approved", uploadedBy: "eduwave", account: "EduWave", remarks: "-" },
  { id: 4005, fileName: "poll-q1.wav", fileType: "menu", status: "Pending", uploadedBy: "civic_poll", account: "Civic Trust", remarks: "Awaiting review" },
];

export const MODULE_OPTIONS = ["Custom IVR", "Webhooks", "SMS Webhooks"];

// A user's effective status: an expiry date in the past forces "Validity Expired".
export function effectiveStatus(u: Pick<User, "expiry" | "status">): UserStatus {
  return u.expiry && u.expiry < new Date().toISOString().slice(0, 10) ? "Validity Expired" : u.status;
}
