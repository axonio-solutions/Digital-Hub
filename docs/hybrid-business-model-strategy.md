# Digital Hub: Hybrid Business Model Strategy

**Platform context:** Algerian B2B spare parts marketplace. Sellers spend credits to submit quotes on buyer requests. The platform's core value to sellers is _deal flow_ — visibility into requests and the ability to bid. That single insight drives every recommendation below.

> **Stage note:** The app is currently in active development — deployed and under testing, but pre-revenue and pre-scale. No historical transaction data exists yet. All validation steps in Section 5 are therefore structured as _instrumentation targets_ to build from day one, not retrospective queries. Pricing figures are hypotheses to be tested, not locked decisions. The tier structure is deliberately simplified for this stage.

---

## Stage-Adjusted Guiding Principles

Because the platform has no production usage data yet, three constraints apply to every decision below:

1. **Launch with one paid tier, not two.** A Free + Pro structure is enough. Adding Elite before you understand your power-user segment is premature complexity that splits conversion focus. Introduce Elite only once you can see the usage ceiling of Pro sellers in real data (target: 3 months post-launch).

2. **Competitor intelligence requires a data cold-start plan.** This feature is only credible once you have a statistically meaningful number of accepted quotes per category (target: 30+ per category). At launch, gate the feature as "coming soon" with a progress indicator — it builds anticipation and signals transparency rather than launching a feature that shows blank charts.

3. **Instrument everything from day one.** The 60-day window after launch is the most valuable data you will ever collect. Every action — quote submitted, request viewed, credit purchased, notification clicked — must be timestamped and queryable. Build the analytics schema now, not after you need it.

---

## 1. Hybrid Architecture Strategy

The core tension in a credit + subscription hybrid is confusion: users don't know what they're paying for and why. The solution is a clean separation of concerns with a deliberate overlap point.

```
┌─────────────────────────────────────────────────────┐
│              SUBSCRIPTION LAYER                      │
│  "What you can SEE and KNOW" — intelligence, reach  │
│  Billed monthly. Features, not consumption.          │
└───────────────────────┬─────────────────────────────┘
                        │ subscribers get a monthly
                        │ credit top-up (a bridge)
┌───────────────────────▼─────────────────────────────┐
│                CREDIT LAYER                          │
│  "What you can DO" — submitting quotes              │
│  Consumed per action. Pure pay-as-you-go.           │
└─────────────────────────────────────────────────────┘
```

**The bridge rule:** Each subscription tier includes a monthly credit allotment. This makes the subscription immediately tangible, reduces the "what did I just pay for?" objection, and creates a floor of activity even for light users.

**At this stage, launch with two tiers only:**

| Tier    | Monthly Credits Included | Access                                  |
| ------- | ------------------------ | --------------------------------------- |
| Free    | 0 (buy only)             | Open marketplace, delayed notifications |
| **Pro** | 15 credits/mo            | All premium features                    |

> Elite tier is designed and documented below, but should not be built or marketed until you have 3 months of Pro user behavior data. Introducing it prematurely splits your conversion funnel and creates support overhead you don't need yet.

**Why not credits-only?** Credits are transactional and feel like a cost. Subscriptions create identity — a seller thinks of themselves as a "Pro member," not someone who "bought credits." That identity shift reduces churn dramatically.

**Hard rule:** Credits never gate features. Subscriptions never gate transactions. A subscriber with 0 credits can see everything but cannot submit a quote. A credit-rich free user can bid but is flying blind.

---

## 2. Feature-Gate Mapping

### Competitor Intelligence — High value, defensible

This is the highest-conversion feature you can build for sellers. In a spare parts marketplace, sellers' single biggest anxiety is: _"Am I pricing myself out of deals? Are other shops undercutting me?"_ The platform already holds all the data — accepted quote prices, rejection rates by seller, average winning price per part category.

**What to surface:**

- Average accepted quote price for a given part/brand combination (anonymized aggregate)
- Your win rate vs. category average (seller sees their own % vs. market %)
- Price trend for a category over the last 30/90 days
- "Your last 5 quotes were X% above the category average winning price"

**Gate at Pro and above.** Free users see a blurred/locked panel with a teaser: _"3 sellers quoted this part. Avg accepted price: [locked]. Upgrade to see."_

> **Cold-start plan:** At launch, this feature will have sparse or no data. Do not show empty charts — show a "Building data for this category" state with a progress bar (e.g., "12/30 quotes collected"). This turns a data gap into a transparency signal and creates anticipation. Unlock the feature per-category once the threshold is reached, not all at once.

---

### Priority Specialization Notifications — High value, urgency-driven

When a buyer posts a request matching a seller's specialty (vehicle brand + part category), the seller gets an instant push/email notification. Free users get batched email digests (2×/day). Pro users get real-time.

**Framing matters:** Don't call it "notifications." Call it **First Responder Access.** The value proposition is: _the first 2–3 sellers to submit a quote on a fresh request get disproportionately more accepts._ Once you accumulate real data on this (target: 200+ fulfilled requests), make the acceptance-rate-by-quote-rank stat the centerpiece of the upgrade page. Until then, frame it as a logical advantage and let early users validate or refute it.

---

### Additional Premium Features

**Quote Performance Dashboard**
Sellers currently submit quotes with no feedback loop when rejected. Give Pro users analytics: win rate by part category, by vehicle brand, by price range bracket. Surfaces patterns like "you win 60% on Toyota parts, 20% on BMW parts" — actionable intelligence that feels like a coach, not just a report.

**Request Full Preview Before Spending Credits**
Free users must spend a credit to see full request details (buyer contact info, OEM numbers, images). Pro users get full preview access before spending. This removes the risk of "wasting" a credit on a low-quality request and converts fence-sitters reliably. It also reduces buyer ghosting because sellers who preview are more qualified.

**Verified Pro Badge**
Pro sellers get a visible badge on their quotes and appear higher in the buyer's quote list. Buyers see a trust signal; sellers get higher conversion. This costs nothing to build (a DB flag + UI indicator) but has enormous perceived value because it's social proof at the point of decision.

**Bulk Quote Templates** _(reserve for Elite — do not build at launch)_
Sellers who quote similar parts repeatedly can save templates: description, condition, warranty terms. They fill in the price and submit in seconds. Targets high-volume sellers who are the most profitable users — retains them by making their workflow dramatically faster. Build this only after you can identify who your high-volume sellers actually are from real usage data.

**Buyer Loyalty Signals**
Show Pro sellers data on the buyer behind a request: how many fulfilled requests they have, their average acceptance speed, whether they have a history of ghosting after receiving quotes. "Buyer reputation" data already exists in the database — surfacing it makes sellers' credit spend feel safer.

---

## 3. Competitive Edge & Pricing Framework

### Market Dynamics

In a competitive bidding marketplace, time and information are the two monetizable asymmetries:

- **Time advantage** → Priority notifications
- **Information advantage** → Competitor intelligence, buyer reputation

Pricing must reflect these asymmetries, not just features.

### Pricing Principle

Price against the value of a single deal, not the cost of credits.

If a typical spare part quote, when won, generates 3,000–8,000 DZD in margin for a seller, then a subscription priced at 1,200–2,000 DZD/month should be positioned as: _"Win one extra deal per month and this pays for itself."_

### Suggested Tier Structure _(launch phase: Free + Pro only)_

|                               | Free        | Pro                              | _(Future) Elite_ |
| ----------------------------- | ----------- | -------------------------------- | ---------------- |
| **Price**                     | 0 DZD       | ~1,500 DZD/mo                    | ~3,500 DZD/mo    |
| **Credits included**          | 0           | 15/mo                            | 40/mo            |
| **Real-time notifications**   | No (digest) | Yes                              | Yes + SMS        |
| **Competitor intelligence**   | Locked      | Full _(when data threshold met)_ | Full             |
| **Request full preview**      | No          | Yes                              | Yes              |
| **Quote analytics dashboard** | No          | Basic                            | Advanced         |
| **Verified badge**            | No          | Yes                              | Elite badge      |
| **Bulk templates**            | No          | No                               | Yes              |
| **Buyer reputation scores**   | No          | Basic                            | Full             |

> Prices in DZD are hypotheses. Validate by offering the Pro tier at two price points to your first 50 users via split onboarding paths. The willingness-to-pay signal from test users is more reliable than any external benchmark at this stage.

### Quantifying First-Mover Value

**At launch you won't have this data** — and that's fine. The plan is:

1. From day one, record `quote_rank` (submission order per request) on every quote row
2. After 200 fulfilled requests, run the analysis: what % of wins came from the 1st, 2nd, 3rd quote?
3. If quote #1 wins 45%+ of the time vs. 15% for quote #4, you have a concrete stat: _"Being first increases your win rate by 3×."_ That becomes the upgrade page headline.

Do not fabricate or estimate this number before you have it. Early users will test the claim themselves.

### Annual Plan

Offer 2 months free on annual billing (~17% discount). Annual subscribers have dramatically lower churn. Prioritize getting Pro users to commit to annual within the first 30 days via an onboarding offer.

---

## 4. Churn & Risk Mitigation

### The Early Adopter Risk

Because the platform is pre-revenue, you currently have **no user expectations to protect** — which is an advantage. You can design the tier structure correctly from the start rather than retrofitting it. The risk isn't churn from existing paying users; it's setting a precedent during the test phase that becomes hard to walk back.

**Design rules to establish now, before any monetization goes live:**

1. **Decide the free tier ceiling clearly, then don't move it.** Whatever free users can do at launch, they should be able to do forever. If you later tighten the free tier, you create animosity. Loosen it freely; tighten it never.
2. **Never launch a feature as free and then gate it.** All gated features must launch gated. If real-time notifications launch free during testing, they cannot be moved behind a paywall without uproar.
3. **Test users are not early adopters — do not give them permanent free Pro access** unless it's a deliberate, time-bounded beta offer. Casual free access during dev creates entitlement, not loyalty.

### Launch Playbook _(pre-revenue → monetization)_

| Milestone                       | Action                                                                                                                                                                           |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Now (dev/test phase)**        | Instrument all events. Decide and freeze the free tier ceiling. Ship gated UI as "locked" from day one — no features available free that will later be paid.                     |
| **Soft launch**                 | Open to real users, credits only. No subscription yet. Collect baseline behavioral data.                                                                                         |
| **T+60 days**                   | Review data against the instrumentation targets in Section 5. Adjust Pro pricing hypothesis based on willingness-to-pay signals from early users.                                |
| **Subscription launch**         | Introduce Pro tier. All premium features gate cleanly because they were never available for free. Offer founding-member pricing (e.g., locked-in rate for first 50 subscribers). |
| **T+90 days post-subscription** | Analyze Pro user behavior. If a segment is hitting the ceiling of the included credits consistently, introduce Elite.                                                            |

### Churn Signal to Monitor

If credit purchase volume drops in the 60 days after subscription launch, free users are disengaging rather than converting. That's a danger signal requiring immediate tier re-evaluation.

---

## 5. Instrumentation Targets — Build These Now

Because there is no historical data yet, Section 5 is reframed: these are not queries to run today, they are **events and columns to instrument before soft launch**. The goal is to have 60 days of clean data when you need to make the subscription pricing decision.

### Schema-Level Instrumentation

Add these fields/tables to the database before real users arrive:

- [ ] `quotes.submitted_at` timestamp with timezone _(already likely exists — verify it's indexed)_
- [ ] `quotes.rank_in_request` integer — computed or stored rank of this quote among all quotes for the same request, by submission time
- [ ] `spare_part_requests.first_quote_at` timestamp — denormalized for fast analytics
- [ ] `spare_part_requests.fulfilled_at` timestamp — time from creation to acceptance
- [ ] `credit_transactions.trigger_event` enum — what caused this transaction (`quote_submit`, `admin_grant`, `package_purchase`, `subscription_topup`)
- [ ] `seller_sessions` or equivalent event log — track when sellers view a request without quoting (helps distinguish "saw it but didn't bid" from "never saw it")

### Events to Log (analytics layer)

These are queryable events that don't need to live in the main schema — a separate `events` table or an external analytics sink works:

- [ ] `request.viewed` — seller viewed a request detail page
- [ ] `request.quoted` — seller submitted a quote (link to request + seller + timestamp)
- [ ] `notification.sent` / `notification.clicked` — measures notification-to-action conversion
- [ ] `upgrade_prompt.shown` / `upgrade_prompt.clicked` — measures upgrade funnel
- [ ] `credit_package.viewed` / `credit_package.purchased` — measures purchase funnel

### The 60-Day Report

After soft launch, these are the five queries that will answer whether the subscription model is viable as designed:

1. **First-mover signal:** `SELECT rank_in_request, COUNT(*) as wins FROM quotes WHERE status = 'accepted' GROUP BY rank_in_request` — does rank 1 win disproportionately?
2. **Credit consumption distribution:** `SELECT seller_id, SUM(credits_spent) FROM credit_transactions GROUP BY seller_id ORDER BY 2 DESC` — where is the power-user ceiling?
3. **Request view-to-quote ratio:** what % of request views result in a quote? High drop-off = preview friction = preview unlock is high-value.
4. **Notification click-through rate:** what % of notification emails result in a quote submission? Below 10% = notifications need richer context. Above 30% = strong signal for priority notification value.
5. **Price variance per category:** `SELECT category, STDDEV(price) / AVG(price) as cv FROM quotes WHERE status = 'accepted' GROUP BY category` — categories with CV > 0.3 are where competitor intelligence matters most.

---

## Open Questions

Before finalizing tier pricing and feature priority, these need answers:

1. **Payment rails:** In Algeria, Stripe subscription billing is currently blocked. Is the plan CIB/BaridiMob integration, manual invoice, or an offshore payment stack? This is the single biggest technical blocker for the subscription launch and should be resolved before any subscription UI is built.

2. **Buyer monetization:** Is buyer usage planned to stay free permanently? If yes, the seller subscription must carry the full monetization weight. If buyers will eventually pay (e.g., priority request visibility, verified buyer badge), design the schema with a `plan` field on both `buyers` and `sellers` from the start — retrofitting it later is painful.

3. **Notification channel:** Email digests are easy. Real-time push requires either a PWA service worker, a native app, or an SMS gateway. Clarify the target device (mobile/desktop) for the Pro seller experience before building the notification priority system.

---

_Generated: 2026-05-22 — Pre-revenue, development/testing stage_
