# Reseller Console — Build Workflow & Spec

> **Executor:** Claude Opus 4.8 (high reasoning effort).
> **Status legend:** `[ ]` pending · `[x]` done. **Keep this file updated as you work** — check off items and add notes under each phase.

---

## 1. Objective

Build a **Reseller (Operator) console** for the ExpressIVR OBD voice-broadcast platform as a **Next.js (App Router, TypeScript) app** in this directory (`D:\Reseller-UI`), with a **mock data layer** (no backend wiring yet).

Two hard rules:
1. **Functionality** comes ONLY from the live panel `https://obd3.expressivr.com/` (reseller account). The full enumeration is in §4 below — treat it as the functional source of truth. (Optional live verification: username `DEMO_OPERATOR`, password `orbitel@987` — read-only, never submit forms or switch users there.)
2. **Design** comes ONLY from `D:\UI-Design\user-page-redesign\user-page-redesign\project\User Console.dc.html` and its design system `_ds/broadsheet-4944f9a1-9954-4596-bd54-79cf69886a7a/styles.css`. Read that HTML file before building — it defines the exact visual language. Match it; do not invent a different look.

---

## 2. Design language (source: User Console.dc.html)

**Fonts & icons**
- Font: **Plus Jakarta Sans** (weights 400–800), headings weight 600–700, letter-spacing −0.01/−0.02em on headings
- Icons: **Phosphor duotone** (`@phosphor-icons/web` duotone CSS, class `ph-duotone ph-*`)

**Tokens (CSS variables — port verbatim into `globals.css`)**
```css
--color-bg: #eef6fb;          /* page ground (light blue) */
--color-surface: #ffffff;     /* cards */
--color-text: #06344a;
--color-divider: rgba(0,65,90,0.13);
--color-neutral-200:#e6eef2; --color-neutral-300:#cbd8de; --color-neutral-400:#a9bcc4;
--color-neutral-500:#4d6d7d; --color-neutral-600:#3d6475; --color-neutral-700:#2b5062;
--color-neutral-800:#00415a; --color-neutral-900:#00293a;
--color-accent:#00b8ff;
--color-accent-100:#e2f6ff; --color-accent-200:#bfebff; --color-accent-300:#8adcff;
--color-accent-500:#00b8ff; --color-accent-600:#009fe0; --color-accent-700:#00415a;
--color-accent-800:#00354a; --color-accent-900:#00293a;
--shadow-sm: 0 1px 2px rgba(0,65,90,0.06), 0 4px 14px rgba(0,65,90,0.07);
--shadow-md: 0 8px 26px rgba(0,65,90,0.12);
--shadow-lg: 0 18px 44px rgba(0,65,90,0.18);
--radius-sm: 6px; --radius-md: 11px; --radius-lg: 18px;
```
- Links `#0079b8`, hover `#00b8ff`
- Primary button: gradient `linear-gradient(135deg,#005a86,#00a6ea)`, white text, shadow `0 3px 10px rgba(0,150,220,0.28)`
- Danger/negative text: `#b42318` (bg `#fdecea`); success: `#12b76a` (bg `#e7f7ef`)

**Layout & chrome**
- **Sidebar**: 250px, sticky full-height, background **navy `#0a1f44`**, border-right `rgba(255,255,255,0.09)`. Brand chip: 36px rounded square, gradient `#00b8ff→#4fd0ff`, broadcast icon; title "Voice Console" + uppercase sub-label "Reseller". Nav in **groups** with 10px uppercase letter-spaced group labels (`rgba(255,255,255,0.72)`); items are icon+label rows, hover `rgba(255,255,255,0.10)`, active item filled highlight. Bottom: Help & support button, then user card (avatar circle, name, role, caret) opening a popover menu (My Profile / Activity Logs / Sign out in red).
- **Header**: sticky 64px, `backdrop-filter: blur(8px)` over semi-transparent bg, bottom divider. Left: rounded search input with magnifier icon. Right: **Voice credits pill** (accent-100 bg, phone icon) + **TTS credits pill** + bell icon-button with notification dot.
- **Main**: padding 30px 34px, content `max-width: 1200px`. Every page opens with: uppercase 10.5px letter-spaced **kicker** (accent-700), 30px **h1**, 14.5px muted **standfirst** paragraph.
- Responsive: ≤1240px stat grids → 2 cols; ≤1080px split layouts → 1 col; ≤720px grids → 1 col. Tables scroll horizontally inside their card (`overflow-x:auto`).

**Recurring components (copy patterns from the design file)**
- **KPI stat card**: white card, small muted label, 26px bold tabular number, 36px icon chip top-right with tinted background
- **Table card**: white card, header row (16px title + subtitle, right-side ghost action), `.table` inside — uppercase 11px th, row hover tint, tabular numerals
- **Status pill**: rounded-full, 11.5px semibold, colored dot before text (e.g. running = accent tint, complete = green tint, expired/failed = red tint)
- **Modal**: fixed overlay `rgba(0,41,58,0.45)`, centered white dialog radius-lg shadow-lg, max-width ~420–440px
- **Forms**: `.field` label 12px muted + `.input` (36px min-height, surface bg, divider border, radius-md); `.help` 11.5px hint lines; `details.adv` collapsible "Advanced" sections
- **Empty states**: centered 30px duotone icon + muted message inside the table body

---

## 3. Tech decisions

- Next.js latest, **App Router + TypeScript**, no Tailwind — plain CSS with the token variables (matches the DS exactly). CSS Modules or a single `globals.css` + component classes mirroring the DS class names (`.btn`, `.card`, `.table`, `.field`, `.input`, `.tag`…).
- Fonts via `next/font/google` (Plus Jakarta Sans). Phosphor icons via the CDN CSS link or `@phosphor-icons/web` package.
- Mock data in `lib/mock-data.ts` typed with interfaces (`User`, `VoicePlan`, `TtsPlan`, `Campaign`, `LedgerEntry`, `ActivityLog`, `VoiceFile`). Client-side state (React state/context) for mutations — recharges, plan toggles, user creation — so the console feels alive without a backend.
- All routes under one authenticated shell layout (sidebar + header). A simple mock login page is optional; not required.

---

## 4. Functionality spec (source of truth — enumerated from the live panel)

### Global chrome
- Header shows **TTS Balance (Rs)** and **Voice Balance (Rs)** at all times; profile dropdown → Profile, Activity Logs, Logout.

### Nav structure — CURRENT (flat, minimal; restructured 2026-08-03)
| Nav item | Route | Notes |
|---|---|---|
| Dashboard | `/` | |
| Users | `/user-list` | "Add User" button → `/create-user`; row Take Action covers plan-assign, recharge, edit; `/update-user/[id]` |
| Campaigns | `/campaigns` | tabs: Live / Prompt-wise / Historical (+ detail `/campaigns/[id]`) |
| Plans | `/plans` | tabs: Voice Plans / TTS Plans, each with an inline Add-plan form |
| Reports | `/reports` | tabs: Credits History / Reseller Summary / Activity Logs / Plan Logs |
| Voice Files | `/voice-files` | |

_(The per-feature enumeration in §4.1–4.13 below remains the functional source of truth; only the page grouping changed — those features now live under the consolidated tabbed pages above. The original grouped nav was retired in the 2026-08-03 logic rework.)_

### 4.1 Dashboard
- Stat cards: **Total Resellers**, **Total End Users** (extend with derived stats: total voice balance issued, campaigns today).
- **User-wise Campaign Summary** table — filters: Start Date, End Date, User; Export CSV. Columns: User ID, Username, Total Campaigns, Total Numbers, Calls Dialed, DnD Count, Connected Calls, Pending Calls, Action.
- **Today Live Campaigns Summary** table — Columns: Campaign Id, Campaign Name, User Id, User Name, Status, Channels, Type, Start/End Time, Total Numbers, Calls Dialed, Pending, Connected, Total Pulses, DnD, DTMF/DTMF1/DTMF2 Count, SMS Count, Retry Count, No. of Retries.
- **Campaign Analysis** — filters: date range, User, Campaign Type (All / Simple IVR / DTMF / Call Patch / Custom IVR), Campaign Name. Table: Campaign Name, Type, Answered, DTMF, Non Answered, **Expenditure (INR)** + a small chart card (answered vs non-answered).

### 4.2 Create User
Fields: Username · Password · Confirm Password · Name · Email · Mobile Number · Company Name · Address · Pincode · **Customer Type** (Reseller / User) · **Voice Plan** (select from reseller's plans) · User-Id (number) · **User Expiry** (date) · **Plan Type** (Prepaid / Postpaid) · **Account Type** (Promotional) · **Module allocation** (add-select building a Module/Action table: Custom IVR, Webhooks, TTS, SMS Webhooks) · checkbox **Submission** · checkbox **Send Logo and Domain** · Create User button.

### 4.3 User List (the core screen)
- Toolbar: page-size select, Search, Clear, Export CSV, Add User.
- Columns: User Id, Username, Location, Group, Module, Account Type, Company, Type (reseller/user), **Voice Balance**, Voice Plan, **TTS Balance**, TTS Plan, Parent, User Expiry, Created At, Status (Active / Validity Expired), **Switch User**, Action, **Allocate CLI**.
- Location / Group / Module / Account Type cells open **popovers** listing allocated values.
- **Switch User**: login-as-user icon per row → confirm dialog → (mock) banner "Viewing as {user}".
- **Take Action** dropdown per row: Edit User · **Add Recharge** · **Remove Recharge** · Reset Password · **Add TTS Recharge** · **Remove TTS Recharge**.
- Modals (each small, one amount field): Add/Remove Recharge Amount(Rs); Add/Remove TTS Recharge Credits; Reset Password (Password + Confirm). Mock-mutate balances so the change is visible.
- **Allocate CLI** popover: assign caller-ID numbers to the user.

### 4.4 Update User (`/update-user/[id]`)
Prefilled Name, Email, Mobile, Address, Pincode, Company; Update Plan select; User Type (disabled); Account Type; User Expiry; Plan Type; Module table; Submission checkbox; Update User button.

### 4.5 Credits History
Info banner (ledger covers completed campaigns, last 3 months, not for billing). Filters: date range, Search, Export CSV. Columns: Credit History Id, User Id, From User, To User, Action On, Amount, Campaign, **Action** (`addition` / `deduction` / `tts_addition` / `campaign_deduction`), TTS Credits, Date. Color the amount by direction (+green / −red).

### 4.6 Reseller Summary
Margin reconciliation per campaign. Filters: User, date range, Export CSV. Columns: Reseller Username, Reseller Plan, Username, Campaign Type, Pulse Duration, Pulse Price, Campaign Name, Start/End Date, Status, TCD, Calls Dialed, Retry Count, Connected Calls, **Reseller Pulse**, **User Pulse**, User SMS Count.

### 4.7 Activity Logs
Filters: date range, User (All + each user), Export CSV. Columns: #, Action (LOGIN etc.), Username, User ID, IP Address, Date & Time.

### 4.8 Voice Plan Logs
Plan-change audit. Columns: Old Plan Id, New Plan Id, User Id, User Name, Request Date.

### 4.9 Campaign management
- **Voice Campaign Summary (live)**: filters Status + Username; stat chips row (Total, Total Campaign, Dialed, Pending, DnD, Connected, Total Calls Dialed, Retry Count, Total Ready); Export CSV + Refresh; bulk-select checkbox column; columns as in 4.1 Today table + Parent Username, Pause Time, Total Variable Count, Action.
- **Prompt Campaign Summary**: same + date range + Prompt Id/Name filter, adds Prompt ID column.
- **Historical Campaign Summary**: date range + filter-by (User Id / Campaign Id / Campaign Name) + Search; Export All Data; campaign name links to detail; row action **Generate Full Report** (async toast: "report will be available in Reports Section").
- **Campaign Info detail** (read-only): Campaign Name, Type, Valid DTMF, Menu Wait Time, No. of Retries, Retry Interval, Location, CLI, Prompt name + duration.

### 4.10 Voice Plans
- **Add**: Plan Name, Pulse Duration (15/30/60 sec), Pulse Price (Paisa) → Add Plan.
- **View**: Plan Id, Plan Name, Pulse Duration, Pulse Price, Status, enable/disable toggle. (These plans are what's assignable to users — "custom voice plans".)

### 4.11 TTS Plans
- **Add**: Plan Name, Per Character, Per Variable → Add Plan.
- **View**: Plan Id, Plan Name, Per Character, Per Variable, Status, enable/disable toggle.

### 4.12 Voice Files
Columns: Voice File Id, File Name, File Type (menu/welcome/noagent…), Status (Approved/Pending), Uploaded By, Account, Remarks, Action (Listen / Download). Include a "Restricted Voice Content" compliance notice panel.

### 4.13 Profile
Read-only card: Username, Name, Email, Mobile, Company, User Type (reseller), Plan Name, Balance.

---

## 5. Build phases (check off as completed)

- [x] **P0 — Scaffold**: `npx create-next-app@latest` (TS, App Router, ESLint, no Tailwind, no src-dir preference — your call). *Note: this `Workflow.md` blocks scaffolding into the folder — temporarily move it out (or scaffold to a temp dir and merge), then restore it.*
- [x] **P1 — Theme**: `globals.css` with tokens from §2 + DS component classes (`.btn/.btn-primary/.btn-secondary/.btn-ghost/.btn-icon`, `.card`, `.table`, `.field/.input`, `.tag`, status pills, modal). Load Plus Jakarta Sans + Phosphor duotone.
- [x] **P2 — Shell**: navy sidebar with grouped nav (§4 nav table), sticky header with Voice/TTS pills, search, bell, user menu popover. Active-route highlighting.
- [x] **P3 — Mock data**: `lib/mock-data.ts` + types; seed ~6 users, 3 voice plans, 1–2 TTS plans, ~12 campaigns across statuses, ledger entries, activity logs, voice files. React context (or zustand if preferred) for mutable state (balances, plans, users).
- [x] **P4 — Dashboard** (§4.1)
- [x] **P5 — User List** (§4.3) with all 6 action modals + CLI popover + Switch User confirm
- [x] **P6 — Create User / Update User** (§4.2, §4.4)
- [x] **P7 — Credits History** (§4.5)
- [x] **P8 — Voice Plans + TTS Plans** (§4.10, §4.11)
- [x] **P9 — Campaigns**: live / prompt / historical / detail (§4.9)
- [x] **P10 — Reseller Summary, Activity Logs, Voice Plan Logs** (§4.6–4.8)
- [x] **P11 — Voice Files + Profile** (§4.12, §4.13)
- [x] **P12 — Polish & verify**: run `npm run dev`, open every route in a browser (Playwright), screenshot, compare against `User Console.dc.html` look; check breakpoints 1240/1080/720, table overflow, every modal, empty states.

## 6. Verification checklist
- [x] Every nav item routes to a working page
- [x] Recharge/debit modals actually change the mock balance in the table and header pills
- [x] Plan enable/disable toggles work; new plans appear in Create User's plan select
- [x] Switch User shows confirm + "viewing as" state
- [x] Visual: navy sidebar, light-blue ground, cyan accent, Jakarta Sans, duotone icons — side-by-side comparable with the design file
- [x] `npm run build` passes clean

## 7. Progress notes
_(Executor: append dated notes here as phases complete.)_

- **2026-08-03** — Full build P0→P12 completed in one pass. Next.js 16.2.12 (App Router, TS, Turbopack), plain CSS with §2 tokens, Plus Jakarta Sans via `next/font`, Phosphor duotone via CDN.
- **P0**: `create-next-app` refuses capitalised dir names ("Reseller-UI"), so scaffolded into `D:\reseller-tmp` and merged into `D:\Reseller-UI`; restored `Workflow.md`/`dash2.yml`/`hist2.yml`. Renamed package to `reseller-ui`.
- **P1–P3**: tokens/component classes in `app/globals.css`; navy `#0a1f44` sidebar shell in `components/Shell.tsx`; typed seeds in `lib/mock-data.ts` (6 users, 3 voice plans, 2 TTS plans, 12 campaigns across live/prompt/history + all statuses, 6 ledger rows, 5 activity logs, 2 plan-change logs, 5 voice files). Mutable state via React context in `lib/store.tsx`. Shared UI primitives (PageHead, StatusPill, Modal, Popover, Toast, ListCell, EmptyRow) in `components/ui.tsx`.
- **Routes (19)**: `/`, `/create-user`, `/user-list`, `/update-user/[id]`, `/credits-history`, `/reseller-summary`, `/activity-logs`, `/voice-plan-logs`, `/campaigns/live`, `/campaigns/prompt`, `/campaigns/history`, `/campaigns/[id]`, `/voice-plans`, `/voice-plans/add`, `/tts-plans`, `/tts-plans/add`, `/voice-files`, `/profile` (+ auto `/_not-found`).
- **P12 verification (Playwright @ localhost:3001)**: screenshotted dashboard + user list; confirmed Add Recharge modal moved acme_calls 340→840 and header Voice pill 95→−405 (reseller debited); Take Action menu shows all 6 actions; CLI + Switch-User + list-cell popovers present; empty states + Validity-Expired red pill render; breakpoints 1240 (KPIs→2col), 1080 (`data-split`→1col), 720 (KPIs→1col) all behave; app console clean. `npm run build` passes clean (final run green). Dev server killed after verification.
- **Known limits (mock)**: recharge can drive the reseller header balance negative (low seed balance, no floor — intentional for the mock); hard page navigations reset in-memory store state (SPA nav within the app preserves it); reset-password/switch-user/CLI/report actions are mock (toast feedback, no backend); Export CSV / search inputs in header / bell are cosmetic. No live-panel contact — built entirely from spec + design file.

- **2026-08-03 — Logic rework pass (reseller LOGIC gaps).** Visuals were approved; this pass fixed the functional gaps flagged in user feedback.
  - **Plan assignment (biggest gap):** User List → Take Action now has **Assign Voice Plan** and **Assign TTS Plan**. Each modal shows the current plan and a select of the reseller's *enabled* plans (with rate details per option). Confirm mutates the user's plan in the store; voice-plan changes also append a **Plan Logs** entry (old → new, user, date). Create User gained a **TTS Plan** select beside Voice Plan; Update User now has both selects (disabled plans hidden except the one currently assigned). New plans appear immediately in every select; disabled ones are filtered out. `assignVoicePlan`/`assignTtsPlan` added to `lib/store.tsx`.
  - **Searchable CLI allocation:** rewrote the Allocate-CLI modal into a picker — search box filters a pool of **15 seeded CLIs** (`CLI_POOL` in `mock-data.ts`), checkboxes toggle allocation, already-allocated CLIs shown checked and sorted to top, Apply commits via `setUserClis`. A new **CLIs** column on the User List shows allocated numbers via the existing ListCell popover.
  - **Wallet logic:** recharges now behave like real transfers. Add Recharge **debits the reseller's header balance** and credits the user; Remove returns it; same for TTS vs the TTS balance. Store helpers now **return an error string** so the modal shows an inline error and blocks over-limit moves (recharge > reseller balance, removal > user balance) with no negative balances. Every move appends a **Credits History** ledger entry (from/to user, action addition/deduction/tts_addition, amount, date). `ledger` is now mutable store state. Seed reseller balances raised (Voice ₹5000 / TTS ₹2000) so transfers have headroom.
  - **Minimal sidebar:** replaced the grouped legacy nav with flat items — **Dashboard · Users · Campaigns · Plans · Reports · Voice Files**. Add User is a button on the Users page (Create User removed from nav). Consolidated pages carry in-page tabs: **Campaigns** (Live / Prompt-wise / Historical), **Plans** (Voice / TTS, with inline Add-plan forms), **Reports** (Credits History / Reseller Summary / Activity Logs / Plan Logs). New `Tabs` primitive in `components/ui.tsx` + `.tabs`/`.tab` CSS.
  - **Routes:** deleted the 9 obsolete routes (`/campaigns/{live,prompt,history}`, `/voice-plans{,/add}`, `/tts-plans{,/add}`, `/credits-history`, `/reseller-summary`, `/activity-logs`, `/voice-plan-logs`); added `/campaigns`, `/plans`, `/reports`. Now **11 routes** (was 19). Internal links (dashboard, campaign detail, account menu) repointed.
  - **General logic pass:** Switch User → visible **"Viewing as {user}"** banner with an **Exit** button (`setViewingAs(null)`). Expiry date in the past **auto-derives "Validity Expired"** via `effectiveStatus()`. Reseller Summary margins now **computed from actual plan data** — Reseller Pulse = pulses × reseller pulse price (15p), User Pulse = pulses × the user's assigned plan price, Margin = the difference; a Total Margin figure sums the view. Activity Logs augmented with recharge activity derived from the live ledger. Dashboard KPIs already store-derived.
  - **Verify (Playwright @ 3001):** created plan → appears in Users table + assign select + Plan Logs; assigned Economy 60s to acme_calls (table + Plan Logs updated); recharge ₹500 moved reseller 5000→4500 and acme_calls 340→840 and logged ledger #7007; over-limit ₹99999 blocked with inline error, balances untouched; new sidebar + all tabs navigate; CLI picker search/checkbox/apply works; Validity-Expired auto-status renders. `npm run build` passes clean (11 routes). Dev server killed after verification.
