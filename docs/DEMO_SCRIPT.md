# The 3-Minute Interview Walkthrough Demo Script
## Role: AI Training & Standards Lead, Upbound Group

**Artifact:** Citizen Developer Registry & Risk Tiering Prototype  
**Audience:** Executive Interviewers (Head of Emerging Technology, Chief Risk Officer, VP Enterprise Applications)  
**Total Target Time:** Under 3 Minutes

---

## 0:00 — Frame it before you show it (The Hook)

> *"I built a prototype of the citizen developer registry. Not to sell you software — your version lives in ServiceNow. I built it because I wanted to work out the data model, and I think faster when I build.*
>
> *The line I'd give anyone in this seat is: 'The thinking is the deliverable; the platform is yours.' A candidate who brings a standalone SaaS tool reads as someone who will build shadow systems. I want this in your existing governance stack on day one."*

---

## 0:20 — The Citizen Developer Perspective (Register Flow)

1. Click **"Register Workflow"** tab in header (Viewing as: *Citizen developer*).
2. Type in a real-sounding title: *"Acima Collections Payment Restructuring Drafter"*.
3. Click Continue to **Step 2 (What data does it touch?)**:
   - Point to the data list:
   > *"Notice how the data categories are ordered by sensitivity. If you ask a merchandising analyst to pick a risk rating, you get garbage. They genuinely don't know what high risk means."*
4. Tick **Customer financial data**:
   - Pause as the yellow educational alert appears immediately:
   > *"Look at what just happened. The form didn't collect a risk score — it derived one and explained it back in real time. The form teaches while it collects. Realistically, an intake form is the third-most-read piece of training material in an enterprise program, so it must educate the moment high-risk options are chosen."*
5. Click Continue through **Step 3 (Decision influence)** and **Step 4 (Tools & Derived Tier)**:
   > *"Here's the result: Tier 3 High. It explains why: 'Touches customer financial data and customer communications.' It shows the exact routing chain: Program Lead + Security + Legal. In two clicks, the builder knows the policy."*
6. Submit the workflow.

---

## 1:10 — The Program Lead Perspective (Review & Governance)

1. Use the **Header Role Switcher** dropdown: Select **"Program lead"**.
2. Show the dense **Registry Inventory** table:
   > *"Notice this isn't a modern SaaS card grid with pretty pictures. Governance professionals scan for exceptions. It's a dense table with tabular numbers, exactly what someone expects in ServiceNow."*
3. Point to **AIW-0009** (`Score applications for likelihood of default`):
   > *"Here is the field most registries miss: 'Decision Influence'. In consumer finance, that's not a nice-to-have. If an analyst builds a workflow that touches credit underwriting, we've inherited an adverse action explainability obligation under Reg B. When you open this record, the tier is Tier 4 Prohibited: 'Presumed declined absent explicit AI Working Group exception.' That's the moment this stops looking like a simple form and starts acting like enterprise compliance."*
4. Click into **AIW-0008** (`Draft responses to customer payment inquiries`):
   - Click **"Approve with conditions"**:
   > *"As Program Lead, I can stipulate: 'Requires mandatory human review before customer dispatch.' The registry enforces human-in-the-loop guardrails."*
5. Open the **"Ask the Program Lead"** tab:
   > *"The job posting says: 'You are the resource they come to when they have a question.' Showing that the registry doubles as our support and advisory channel bridges policy into empathy."*

---

## 2:00 — The Executive Perspective (Coverage Dashboard)

1. Switch Header Role Switcher to **"Executive / LOB leader"** (auto-routes to **Coverage Dashboard**).
2. Point to the top two KPI cards:
   > *"This is the view I'd take to the quarterly Executive Leadership Team (ELT). Look at these two numbers side-by-side:*
   > - *24 Registered Workflows*
   > - *142 Estimated Unregistered Workflows*
   > *Read the footnote underneath: 'Estimated from tool license counts vs. registrations. In production this is the number leadership should actually care about.'*
   > *Everything else on this screen measures what we already know. That second number measures our shadow IT exposure, and closing that gap is my mandate."*
3. Point to the **LOB Stacked Bar Exposure Chart**:
   > *"At a glance, leadership sees where risk is concentrated. Acima and Rent-A-Center carry our consumer customer exposure; Corporate and Mexico are largely low-risk operational paths."*
4. Point to the **Literacy Coverage horizontal bars**:
   > *"Training tracked against our 80% enterprise standard, with review reattestations keeping records fresh."*

---

## 2:40 — Close by giving it away (The Handoff)

> *"The data model is the deliverable. If I'm fortunate enough to step into this seat, week two is sitting with whoever owns ServiceNow at Upbound and getting this schema into a catalog record producer with Flow Designer approval chains.*
>
> *I'd rather have three fields that route correctly in your ServiceNow instance than thirty in a custom app of mine."*
