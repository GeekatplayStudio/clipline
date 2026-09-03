# Product Requirements Document

## AI Workflow Registry — interview prototype

**Author:** Vladimir Chopine
**Purpose:** Demonstration artifact for the AI Training and Standards Lead role, Upbound Group
**Status:** Prototype. Not production software.
**Deploy target:** vladimirchopine.com subdomain or path, publicly reachable, no login

---

## 1. What this is and what it is deliberately not

This is a working prototype of a **citizen developer registry** — one of the four named deliverables in the job description. It exists to make an abstract conversation concrete: instead of describing how a registry would work, the interviewer clicks through one.

**The framing you use out loud, and it should also appear on the app itself:**

> I built this to think through the data model, not to sell you software. Your version lives in ServiceNow.

That line matters. A candidate who shows up with polished software reads as someone who will build shadow systems instead of using the enterprise stack. A candidate who shows up with a deliberate prototype and says "the thinking is the deliverable, the platform is yours" reads as someone who understands enterprise IT. **Build the second thing.**

Practical consequences of that positioning:

- Ship it with a visible banner: _Prototype — data model exploration. Production implementation would live in ServiceNow._
- Do **not** build authentication, user management, email, or audit logging. Those are ServiceNow's job and building them muddies the message.
- Do build the parts that show _thinking_: the risk-tiering logic, the field design, the coverage view.

### Non-goals

- Not multi-tenant, not authenticated, not persistent across users
- Not a real ServiceNow integration
- Not a training platform (that's the paired app in Section 8)
- Not styled as a product launch page

---

## 2. The argument the app makes

Every screen should advance one of these three claims. If a feature advances none of them, cut it.

1. **The right unit of registration is the workflow, not the tool.** Knowing that 400 people use a chatbot tells you nothing. Knowing that someone built a workflow that drafts collections messages tells you everything.
2. **Risk tier should be derived, not self-declared.** Ask people what they're doing; let the system classify. If you ask a merchandising analyst to pick their own data sensitivity level, you get garbage.
3. **Coverage is the executive artifact.** Leadership doesn't want a list. They want to know which lines of business are exposed and which are covered.

---

## 3. Users

| User                                                      | What they do here                                | Screens                       |
| --------------------------------------------------------- | ------------------------------------------------ | ----------------------------- |
| **Citizen developer** (analyst, ops specialist, marketer) | Registers a workflow they built or want to build | Register, My workflows        |
| **Program lead** (the role you're interviewing for)       | Reviews the queue, approves, sets review dates   | Review queue, Workflow detail |
| **Executive / LOB leader**                                | Sees coverage and exposure                       | Coverage dashboard            |

Since there's no auth, use a **role switcher in the header** — a simple dropdown that changes which view you're in. This is actually a _feature_ for a demo: you can walk the interviewer through all three perspectives in ninety seconds without logging in and out. Label it plainly: "Viewing as: Citizen developer / Program lead / Executive."

---

## 4. Data model

This is the heart of the deliverable. Get this right and the UI is easy.

### Workflow (primary record)

| Field                | Type         | Notes                                                                                                                  |
| -------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `id`                 | string       | `AIW-0001` style. Human-quotable IDs matter in governance conversations.                                               |
| `title`              | string       | Plain-language name. "Weekly store performance summary."                                                               |
| `description`        | text         | What it does, in the builder's own words                                                                               |
| `owner_name`         | string       |                                                                                                                        |
| `owner_role`         | string       |                                                                                                                        |
| `lob`                | enum         | Acima, Rent-A-Center, Brigit, Mexico, Corporate                                                                        |
| `department`         | string       |                                                                                                                        |
| `tools_used`         | multi-select | See tool list below                                                                                                    |
| `build_type`         | enum         | Prompt/chat workflow · Automation (Power Automate, Zapier, n8n) · Custom script · Vendor AI feature · Agent/multi-step |
| `data_categories`    | multi-select | See below — **this drives the risk tier**                                                                              |
| `decision_influence` | enum         | See below — **this drives the risk tier**                                                                              |
| `output_audience`    | enum         | Just me · My team · Internal broad · Customer-facing                                                                   |
| `data_leaves_tenant` | boolean      | Does data go to a service outside our approved environment                                                             |
| `human_review`       | enum         | Every output reviewed · Sampled · None                                                                                 |
| `risk_tier`          | derived enum | Tier 1 Low · Tier 2 Moderate · Tier 3 High · Tier 4 Prohibited                                                         |
| `status`             | enum         | Draft · Submitted · In review · Approved · Approved with conditions · Declined · Retired                               |
| `conditions`         | text         | Populated when Approved with conditions                                                                                |
| `registered_date`    | date         |                                                                                                                        |
| `review_due`         | date         | Auto-set by tier: T1 +12mo, T2 +6mo, T3 +3mo                                                                           |
| `last_attested`      | date         |                                                                                                                        |
| `builder_tier`       | enum         | Tier 1 Aware · Tier 2 Fluent · Tier 3 Builder — from the literacy standard                                             |
| `training_current`   | boolean      | Has the owner completed required training                                                                              |

### Reference lists

**Tools** (make these realistic, not generic): ChatGPT / OpenAI · Claude · Microsoft Copilot · Google Gemini · Power Automate · Power BI Copilot · Zapier · n8n · Salesforce Einstein · ServiceNow Now Assist · Custom API integration · Other (specify)

**Data categories** — ordered by sensitivity, and this ordering is the point:

- No company data (general knowledge questions only)
- Public company information
- Internal non-sensitive (process docs, internal comms)
- Internal confidential (financials, strategy, unreleased plans)
- Employee data (HR, performance, compensation)
- **Customer PII** (name, address, contact, SSN, DOB)
- **Customer financial data** (lease terms, payment history, balances, bank details)
- **Credit or underwriting data** (credit reports, scores, decisioning inputs)

**Decision influence** — this is the field most registries miss and the one that matters most in consumer finance:

- No decision — informational only
- Internal operational decision (staffing, inventory, scheduling)
- Employee-affecting decision (hiring, evaluation, scheduling)
- **Customer-affecting decision — communications** (what we say to a customer)
- **Customer-affecting decision — service or account** (account changes, collections actions)
- **Customer-affecting decision — credit or underwriting** (approve, deny, terms, limits)

### Risk tier derivation

Implement as a transparent rule cascade. Evaluate top to bottom; first match wins.

```
Tier 4 — Prohibited pending review
  IF decision_influence = "credit or underwriting"
     AND build_type != vendor AI feature
  OR data_categories includes "credit or underwriting data"
     AND data_leaves_tenant = true

Tier 3 — High
  IF data_categories includes any of
     [Customer PII, Customer financial data, Credit/underwriting data]
  OR decision_influence starts with "Customer-affecting"
  OR (data_leaves_tenant = true AND data_categories includes Internal confidential or Employee data)

Tier 2 — Moderate
  IF data_categories includes any of [Internal confidential, Employee data]
  OR output_audience = "Internal broad"
  OR human_review = "None"

Tier 1 — Low
  Everything else
```

**Show the derivation in the UI.** When a tier is assigned, display the reason: _"Tier 3 — High. This workflow touches customer financial data and influences customer communications."_ A registry that explains its own reasoning is a training tool, not just an intake form. Make this visible; it's the thing that will get commented on in the interview.

### Approval routing (display only — no real routing)

| Tier | Route to                                                      | Review cadence |
| ---- | ------------------------------------------------------------- | -------------- |
| 1    | Auto-approved, logged                                         | 12 months      |
| 2    | Program lead review                                           | 6 months       |
| 3    | Program lead + Security + Legal/GC                            | 3 months       |
| 4    | AI Working Group; presumed declined absent explicit exception | 3 months       |

---

## 5. Screens

### 5.1 Register a workflow

A progressive form. Four short steps beat one long form — and the step structure itself teaches the risk model.

```
┌──────────────────────────────────────────────┐
│  Register an AI workflow            Step 2/4 │
│  ──────────────────────────────────────────  │
│                                              │
│  What data does this workflow touch?         │
│  Select everything that applies.             │
│                                              │
│  ☐ No company data                           │
│  ☐ Public company information                │
│  ☑ Internal non-sensitive                    │
│  ☐ Internal confidential                     │
│  ☐ Employee data                             │
│  ☑ Customer financial data                   │
│  ☐ Credit or underwriting data               │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Heads up: customer financial data      │  │
│  │ means this will need security and      │  │
│  │ legal review before you use it.        │  │
│  └────────────────────────────────────────┘  │
│                                              │
│              [ Back ]      [ Continue ]      │
└──────────────────────────────────────────────┘
```

**Step 1** — What is it? Title, description, owner, LOB, department
**Step 2** — What data does it touch?
**Step 3** — What does it do with the output? Decision influence, audience, human review, does data leave our environment
**Step 4** — How is it built? Tools, build type. Then: **derived tier, explained, with the routing that follows**

The live tier callout in step 2 and 3 is the single best feature in this app. It turns the form into a teaching moment: the person learns the risk model while filling it in. **Say that out loud in the interview** — "the intake form is the third-most-used piece of training material in the program, so it should teach."

### 5.2 Registry list

Sortable, filterable table. Columns: ID, Title, Owner, LOB, Tier, Status, Review due.

Filters: LOB, tier, status, "review overdue," "owner training not current."

Not cards. A governance inventory is a table; anyone who has used ServiceNow expects a table. Use density, not whitespace.

### 5.3 Workflow detail

Everything about one record, the derived tier with its reasoning, the routing chain, review history, and — for the program lead view — approve / approve with conditions / decline actions.

Include an **"Ask the program lead"** panel with a couple of canned Q&A entries. The posting says _"You are the resource they come to when they have a question."_ Showing that the registry is also the support channel is a nice touch that costs you twenty minutes.

### 5.4 Coverage dashboard

This is the screen the executive sees, and the one that closes the interview.

Four things, no more:

1. **Registered workflows by LOB and tier** — stacked bar. Shows exposure at a glance.
2. **Two numbers side by side:** registered workflows, and estimated unregistered. The second number is a placeholder with a footnote: _"Estimated from tool license counts vs. registrations. In production this is the number leadership should actually care about."_ That footnote is a whole point of view compressed into one line.
3. **Literacy coverage by LOB** — % of employees current on required training, by tier. Horizontal bars with the target line marked.
4. **Review status** — how many workflows are overdue for reattestation.

Deliberately leave out: trend lines over time, sparklines, anything implying real historical data. Fake history undermines the honesty of the prototype.

---

## 6. Seed data

Ship with ~24 pre-populated workflows so the dashboard has shape. Make them plausible for this company specifically. Suggested spread: Acima 8, Rent-A-Center 7, Brigit 4, Corporate 4, Mexico 1.

Examples worth including, because each makes a point:

- _"Weekly store performance summary"_ — Rent-A-Center, Power BI Copilot, internal non-sensitive → Tier 1. Shows the low-friction path exists.
- _"Draft responses to customer payment inquiries"_ — Acima, ChatGPT, customer financial data, customer-facing communications, no human review → **Tier 3**, and flag that human review is "None." This is your talking-point record.
- _"Summarize competitor lease-to-own pricing"_ — Corporate, public data → Tier 1.
- _"Score applications for likelihood of default"_ — Acima, custom script, credit/underwriting → **Tier 4**. Include one. When the interviewer clicks it and sees "presumed declined absent explicit exception," that's the moment the tool stops looking like a form.
- _"Translate store signage copy to Spanish"_ — Mexico, internal non-sensitive → Tier 1. Shows you thought about their non-US footprint.
- _"Summarize employee exit interview themes"_ — Corporate HR, employee data → Tier 2.
- One record with **status: Retired** and one **overdue for review**, so those states are visible.

Give two or three records `training_current: false` so the "owner training not current" filter returns something. That filter is the link between the registry and your training program, and it should not be empty.

---

## 7. Build direction

### Stack

Whatever you'll finish in an evening. Suggested: **Next.js + Tailwind, deployed to Vercel**, since you've already shipped TripCraft on that stack. Data in a JSON file or SQLite; no ORM ceremony needed. Client-side state is fine — if a refresh clears an added record, that's acceptable for a prototype and you can say so.

Keep the whole thing under ~1,500 lines. Scope creep here costs you the video, which is the higher-value artifact.

### Design direction

The instinct to make this look like a modern SaaS product is wrong. It should look like **a serious internal system built by someone with taste** — closer to a well-designed compliance tool than a startup landing page.

- **Density over whitespace.** Governance tools are read by people scanning for exceptions. Tight rows, real tables, no card grids.
- **Palette:** one restrained neutral base with a single functional accent, plus a four-step tier scale that reads as severity without being a traffic light. Tier colors should be muted — desaturated slate → amber → rust → deep red. Avoid pure green for Tier 1; "low risk" isn't "safe."
- **Type:** one family, two weights. A humanist sans set at 14px body for the tables. Numbers in a tabular figure setting so columns align.
- **No hero section.** The landing view _is_ the registry list or the dashboard. Enterprise tools open into work.
- **The prototype banner is part of the design**, not an afterthought — a thin persistent strip at the top, neutral, not alarming.
- Skip animation entirely except where it shows a state change (a tier recalculating when you tick a box).

Do not reach for: rounded cards with soft shadows, gradient accents, all-caps eyebrow labels, or a marketing-style intro. Every one of those undercuts "this is a data model, not a product."

### Copy

Write the interface copy in the same voice you'll write the training in — plain, direct, second person. This is deliberate: the interviewer should notice that the registry sounds like the training, and the training sounds like the policy. **Consistent vocabulary across policy, training, and tooling is the actual product.** Mention that once.

Empty states should teach: _"No workflows registered for Brigit yet. That's either good news or a discovery problem."_

---

## 8. Companion app — Acceptable Use knowledge check

Small second app, or a route within the first. Pairs with the six-minute video.

- 6–8 scenario questions, multiple choice, one screen each
- Every question is a **situation**, not a definition. "You're finishing a customer's lease modification and want help drafting the confirmation message. Which of these can you paste into an approved AI tool?"
- Feedback on every answer, right or wrong, explaining _why_ — that's where the learning happens
- Final screen: score, plus a plain-language summary of what to remember
- Include the one question people get wrong: the difference between _approved tool with internal data_ and _approved tool with customer financial data_. Tool approval is not data approval. That distinction is the whole course.

Deploy alongside the registry so the demo flows: watch the lesson → take the check → register a workflow. **That sequence is the program in miniature**, and being able to click through it end-to-end in four minutes is worth more than any slide.

---

## 9. Acceptance criteria

The prototype is done when:

- [ ] You can register a workflow through all four steps and see it appear in the list
- [ ] Tier derives automatically and **displays its reasoning in plain language**
- [ ] Selecting customer financial data visibly changes the guidance mid-form
- [ ] Role switcher moves between citizen developer, program lead, and executive views
- [ ] Program lead can approve, approve with conditions, or decline from the detail view
- [ ] Coverage dashboard renders with seed data and includes the "estimated unregistered" number with its footnote
- [ ] At least one Tier 4 record exists and shows the prohibition clearly
- [ ] Prototype banner is visible on every screen
- [ ] Works on a phone, because someone will open it on a phone
- [ ] Total demo path takes under four minutes

Stop when these are met. Resist adding: search, bulk edit, exports, comments, notifications, dark mode.

---

## 10. The interview demo script — 3 minutes

Rehearse this. The app is only as good as the walkthrough.

**0:00 — Frame it before you show it.**

> "I built a prototype of the citizen developer registry. Not to sell you software — your version lives in ServiceNow. I built it because I wanted to work out the data model, and I think faster when I build."

**0:20 — Start with the register flow, as a citizen developer.**
Fill in a real-sounding workflow. When you tick "customer financial data," pause on the guidance that appears.

> "This is the part I care about. The form isn't collecting a risk rating from the user — it's deriving one and explaining it back. Most intake forms ask people to self-classify their data sensitivity, and you get garbage, because the person filling it in genuinely doesn't know. So the form teaches while it collects. Realistically it's the third-most-read piece of training material in the program."

**1:10 — Switch to program lead, show the queue and the Tier 4 record.**

> "The field most registries don't have is this one — what decision does this workflow influence. In consumer lending that's not a nice-to-have. If something touches a credit decision, we've inherited an adverse action explainability obligation under Reg B, and the analyst who built it has no idea. That's why it's a separate field from the data field. Tool and data alone don't tell you your exposure."

**2:00 — Switch to executive, land on coverage.**

> "This is the view I'd expect to take to the ELT quarterly. Registered workflows by LOB and tier, literacy coverage against the standard, and this number here — estimated unregistered. It's a placeholder in the prototype. In production it's the only number on this screen that actually matters, because everything else measures what we already know about."

**2:40 — Close by giving it away.**

> "The data model is the deliverable. If I'm in this seat, week two is sitting with whoever owns ServiceNow and getting this into a record producer with real approval routing. I'd rather have three fields that route correctly in your system than thirty in mine."

That last line is the one that gets you hired. It says: I build, and I know when not to.
