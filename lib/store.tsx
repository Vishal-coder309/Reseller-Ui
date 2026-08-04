"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  User, VoicePlan, TtsPlan, RESELLER, LedgerEntry, VoicePlanLog,
  users as seedUsers, voicePlans as seedVoicePlans, ttsPlans as seedTtsPlans,
  ledger as seedLedger, voicePlanLogs as seedVoicePlanLogs,
} from "./mock-data";

// Recharge/removal helpers return an error message (blocking the change) or null on success.
type Result = string | null;

interface Store {
  users: User[];
  voicePlans: VoicePlan[];
  ttsPlans: TtsPlan[];
  ledger: LedgerEntry[];
  voicePlanLogs: VoicePlanLog[];
  voiceBalance: number;
  ttsBalance: number;
  viewingAs: string | null;
  // mutations
  addRecharge: (userId: number, amount: number) => Result;
  removeRecharge: (userId: number, amount: number) => Result;
  addTtsRecharge: (userId: number, amount: number) => Result;
  removeTtsRecharge: (userId: number, amount: number) => Result;
  resetPassword: (userId: number) => void;
  toggleVoicePlan: (planId: number) => void;
  toggleTtsPlan: (planId: number) => void;
  addVoicePlan: (p: Omit<VoicePlan, "id">) => void;
  addTtsPlan: (p: Omit<TtsPlan, "id">) => void;
  createUser: (u: Partial<User>) => void;
  updateUser: (userId: number, patch: Partial<User>) => void;
  assignVoicePlan: (userId: number, planId: number) => void;
  assignTtsPlan: (userId: number, planId: number) => void;
  allocateCli: (userId: number, cli: string) => void;
  deallocateCli: (userId: number, cli: string) => void;
  setUserClis: (userId: number, clis: string[]) => void;
  setViewingAs: (username: string | null) => void;
}

const Ctx = createContext<Store | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [voicePlans, setVoicePlans] = useState<VoicePlan[]>(seedVoicePlans);
  const [ttsPlans, setTtsPlans] = useState<TtsPlan[]>(seedTtsPlans);
  const [ledger, setLedger] = useState<LedgerEntry[]>(seedLedger);
  const [voicePlanLogs, setVoicePlanLogs] = useState<VoicePlanLog[]>(seedVoicePlanLogs);
  const [voiceBalance, setVoiceBalance] = useState(RESELLER.voiceBalance);
  const [ttsBalance, setTtsBalance] = useState(RESELLER.ttsBalance);
  const [viewingAs, setViewingAs] = useState<string | null>(null);

  const patchUser = useCallback((userId: number, fn: (u: User) => User) => {
    setUsers((us) => us.map((u) => (u.id === userId ? fn(u) : u)));
  }, []);

  const now = () => new Date().toISOString().slice(0, 16).replace("T", " ");
  const addLedger = useCallback((e: Omit<LedgerEntry, "id" | "date">) => {
    setLedger((ls) => [{ ...e, id: Math.max(7000, ...ls.map((x) => x.id)) + 1, date: now() }, ...ls]);
  }, []);

  // Recharging a user debits the reseller's own balance; removing credits it back.
  // Blocks over-limit moves and never lets any balance go negative. Records a ledger entry.
  const addRecharge = useCallback((userId: number, amount: number): Result => {
    const u = users.find((x) => x.id === userId);
    if (!u) return "User not found.";
    if (amount > voiceBalance) return `Amount exceeds your Voice balance (₹${voiceBalance}).`;
    patchUser(userId, (x) => ({ ...x, voiceBalance: x.voiceBalance + amount }));
    setVoiceBalance((b) => b - amount);
    addLedger({ userId, fromUser: RESELLER.username, toUser: u.username, actionOn: u.username, amount, campaign: "-", action: "addition", ttsCredits: 0 });
    return null;
  }, [users, voiceBalance, patchUser, addLedger]);
  const removeRecharge = useCallback((userId: number, amount: number): Result => {
    const u = users.find((x) => x.id === userId);
    if (!u) return "User not found.";
    if (amount > u.voiceBalance) return `Amount exceeds the user's Voice balance (₹${u.voiceBalance}).`;
    patchUser(userId, (x) => ({ ...x, voiceBalance: x.voiceBalance - amount }));
    setVoiceBalance((b) => b + amount);
    addLedger({ userId, fromUser: u.username, toUser: RESELLER.username, actionOn: u.username, amount, campaign: "-", action: "deduction", ttsCredits: 0 });
    return null;
  }, [users, patchUser, addLedger]);
  const addTtsRecharge = useCallback((userId: number, amount: number): Result => {
    const u = users.find((x) => x.id === userId);
    if (!u) return "User not found.";
    if (amount > ttsBalance) return `Credits exceed your TTS balance (₹${ttsBalance}).`;
    patchUser(userId, (x) => ({ ...x, ttsBalance: x.ttsBalance + amount }));
    setTtsBalance((b) => b - amount);
    addLedger({ userId, fromUser: RESELLER.username, toUser: u.username, actionOn: u.username, amount, campaign: "-", action: "tts_addition", ttsCredits: amount });
    return null;
  }, [users, ttsBalance, patchUser, addLedger]);
  const removeTtsRecharge = useCallback((userId: number, amount: number): Result => {
    const u = users.find((x) => x.id === userId);
    if (!u) return "User not found.";
    if (amount > u.ttsBalance) return `Credits exceed the user's TTS balance (₹${u.ttsBalance}).`;
    patchUser(userId, (x) => ({ ...x, ttsBalance: x.ttsBalance - amount }));
    setTtsBalance((b) => b + amount);
    addLedger({ userId, fromUser: u.username, toUser: RESELLER.username, actionOn: u.username, amount, campaign: "-", action: "deduction", ttsCredits: amount });
    return null;
  }, [users, patchUser, addLedger]);
  const resetPassword = useCallback(() => { /* mock: no-op, UI shows a toast */ }, []);

  const toggleVoicePlan = useCallback((planId: number) => {
    setVoicePlans((ps) => ps.map((p) => (p.id === planId ? { ...p, enabled: !p.enabled } : p)));
  }, []);
  const toggleTtsPlan = useCallback((planId: number) => {
    setTtsPlans((ps) => ps.map((p) => (p.id === planId ? { ...p, enabled: !p.enabled } : p)));
  }, []);
  const addVoicePlan = useCallback((p: Omit<VoicePlan, "id">) => {
    setVoicePlans((ps) => [...ps, { ...p, id: Math.max(100, ...ps.map((x) => x.id)) + 1 }]);
  }, []);
  const addTtsPlan = useCallback((p: Omit<TtsPlan, "id">) => {
    setTtsPlans((ps) => [...ps, { ...p, id: Math.max(200, ...ps.map((x) => x.id)) + 1 }]);
  }, []);

  const createUser = useCallback((u: Partial<User>) => {
    setUsers((us) => {
      const id = u.id ?? Math.max(5000, ...us.map((x) => x.id)) + 1;
      const full: User = {
        id, username: u.username ?? `user_${id}`, name: u.name ?? "", email: u.email ?? "", mobile: u.mobile ?? "",
        company: u.company ?? "", address: u.address ?? "", pincode: u.pincode ?? "",
        location: u.location ?? [], group: u.group ?? [], module: u.module ?? [],
        accountType: u.accountType ?? "Promotional", type: u.type ?? "user",
        voiceBalance: u.voiceBalance ?? 0, voicePlanId: u.voicePlanId ?? seedVoicePlans[0].id,
        ttsBalance: u.ttsBalance ?? 0, ttsPlanId: u.ttsPlanId ?? seedTtsPlans[0].id,
        parent: "DEMO_OPERATOR", expiry: u.expiry ?? "2027-01-01",
        createdAt: new Date().toISOString().slice(0, 10), planType: u.planType ?? "Prepaid",
        status: "Active", clis: u.clis ?? [],
      };
      return [full, ...us];
    });
  }, []);

  const updateUser = useCallback((userId: number, patch: Partial<User>) => {
    // Changing the voice plan here should also leave an audit-trail entry.
    const before = users.find((u) => u.id === userId);
    if (before && patch.voicePlanId != null && patch.voicePlanId !== before.voicePlanId) {
      setVoicePlanLogs((ls) => [{ oldPlanId: before.voicePlanId, newPlanId: patch.voicePlanId!, userId, userName: before.username, requestDate: now() }, ...ls]);
    }
    patchUser(userId, (u) => ({ ...u, ...patch }));
  }, [users, patchUser]);

  // Assign a voice plan and append a Voice Plan Log entry (old → new) for the audit trail.
  const assignVoicePlan = useCallback((userId: number, planId: number) => {
    const u = users.find((x) => x.id === userId);
    if (!u || u.voicePlanId === planId) return;
    setVoicePlanLogs((ls) => [{ oldPlanId: u.voicePlanId, newPlanId: planId, userId, userName: u.username, requestDate: now() }, ...ls]);
    patchUser(userId, (x) => ({ ...x, voicePlanId: planId }));
  }, [users, patchUser]);
  const assignTtsPlan = useCallback((userId: number, planId: number) => {
    patchUser(userId, (x) => ({ ...x, ttsPlanId: planId }));
  }, [patchUser]);

  const allocateCli = useCallback((userId: number, cli: string) => {
    patchUser(userId, (u) => (u.clis.includes(cli) ? u : { ...u, clis: [...u.clis, cli] }));
  }, [patchUser]);
  const deallocateCli = useCallback((userId: number, cli: string) => {
    patchUser(userId, (u) => ({ ...u, clis: u.clis.filter((c) => c !== cli) }));
  }, [patchUser]);
  const setUserClis = useCallback((userId: number, clis: string[]) => {
    patchUser(userId, (u) => ({ ...u, clis }));
  }, [patchUser]);

  const value: Store = {
    users, voicePlans, ttsPlans, ledger, voicePlanLogs, voiceBalance, ttsBalance, viewingAs,
    addRecharge, removeRecharge, addTtsRecharge, removeTtsRecharge, resetPassword,
    toggleVoicePlan, toggleTtsPlan, addVoicePlan, addTtsPlan, createUser, updateUser,
    assignVoicePlan, assignTtsPlan, allocateCli, deallocateCli, setUserClis, setViewingAs,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used within AppProvider");
  return c;
}
