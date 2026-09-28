# Boom Escalation Desk

A working prototype of a proposed operational process for handling client problems that become
stuck — built for an Operations Manager interview at Boom.

This is **not** a replacement helpdesk, CRM, engineering tracker, or production incident-management
platform. It exists to make the *process* visible: who owns a client issue, what happens next, when
something is overdue, when Engineering or an external partner needs to get involved, when the client
needs an update, how responsibility moves across time zones, what automation can safely do, and how a
case is verified before it closes.

Two principles run through every screen:

> Escalation changes who helps solve the problem. It does not remove ownership of the client outcome.

> Every active escalation must have an owner, a next action, a deadline, and a next client update.

## 1. What this prototype demonstrates

- A persistent **Escalation Queue** — client issues with visible owners, deadlines, and stuck
  conditions (never a generic "Stuck" status; it's always derived from a missing owner, an overdue
  next action, a missed client update, an overdue partner follow-up, or missing technical acceptance).
- A **Case Workspace** that walks a case through acknowledge → classify → next action → optional
  Engineering escalation → optional partner dependency → technical outcome → **mandatory
  verification** → close, with validation that blocks the invalid states listed in the assessment
  (no owner, no next action, no deadline, unowned "Waiting on Partner", unaccepted handovers,
  closing without verification, etc).
- A **Process View** — a single presentation-friendly diagram of the whole escalation path.
- A **simulated stall/overdue monitor** that runs on a simulated 5-minute cadence, raises deduplicated
  internal alerts, and never resolves anything on its own.
- An **Automation Health** page showing that the health check is a logically separate process from
  the monitor it watches — so Operations would notice if monitoring quietly stopped working.
- A **Guided Demo** that drives the flagship P1 case through the entire lifecycle with one click per
  step, for live presentation.

## 2. How to install

```bash
npm install
```

## 3. How to run

```bash
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

## 4. How to reset demo data

Click the **⋯** menu in the top right and choose **Reset Demo**. This restores the seeded starting
state (one P1 case plus three smaller P2/P3 examples) and clears everything held in
`localStorage`. Demo state persists across a page refresh but never leaves your browser.

## 5. Recommended live-demo sequence

1. Land on the **Queue** — point out the two principles banner, the counters, and the internal
   escalation alerts already present on the seeded P2 cases.
2. Click **Run Guided Demo**. It drops you straight into the P1 "Demo Property Group" case and drives
   one click per step: acknowledge → next action + escalate to Engineering → Engineering accepts and
   identifies a partner dependency → advance the demo clock → watch the automated overdue alert
   appear → record a new partner checkpoint → return the technical outcome → **verify** the client
   outcome (this gate cannot be skipped) → record the final client update and close → optionally
   create a debrief.
3. Open **Automation Health**, click **Simulate Automation Failure**, advance time past 10 simulated
   minutes, and show the independent health check catching it — then **Restore Monitor**.
4. Open **Process** for the single-screen view of the whole flow.
5. Open **About This Demo** for what was deliberately left out and how the prototype maps to the
   assessment brief.
6. Optionally toggle **Presentation Mode** before screen-sharing, and use **View As** to talk through
   how the same case looks to Support, Engineering, or Integrations.

## 6. What is simulated

Everything labelled **SIMULATED INTEGRATION** in the app — Slack, the support ticketing system, the
engineering issue tracker, and the external partner queue — is demo data only. Nothing is sent
anywhere. Client updates, engineering issues, and partner references are recorded in the case, not
transmitted. Time is a simulated demo clock (top left), not your computer's clock, and the automated
monitor only evaluates cases when you advance that clock.

## 7. What would be required for production

- Authentication / authorization
- A persistent database (this prototype uses browser `localStorage` and in-memory state)
- Real support-ticket integration
- Real engineering tracker integration
- Real Slack integration
- External partner integration where available
- A server-side scheduler for the deadline monitor (today it only runs when you advance the demo clock)
- Independent monitoring infrastructure
- An audit and security review
- An agreed coverage model and real SLAs — the timings shown throughout this prototype are labelled
  **proposed operating targets**, not existing Boom commitments
