---
name: laws-of-ux
description: Collection of 30 psychology-based design principles for building intuitive, human-centered products and interfaces
---

# Laws of UX

Collection of 30 psychology-based design principles (originally 21, expanded in the 2024 2nd edition) created by designer Jon Yablonski. These principles explain how humans perceive and process digital interfaces, organized into five categories: Heuristics, Gestalt Principles, Cognitive Biases, Memory & Attention, and General Principles. Backed by decades of psychological research, they provide a scientific foundation for design decisions.

**Latest updates (2024–2026):** The 2nd edition (March 2024, O'Reilly) added deeper psychological connections, UX methods, and updated examples. The website (lawsofux.com) now covers 30 principles. Jon Yablonski launched [Cognitive Bias Index](https://cognitivebiasindex.com/) (April 2026) as a companion resource.

## When to Use

- Making design decisions backed by psychological research rather than subjective preferences
- Reducing cognitive load and decision fatigue in complex interfaces
- Optimizing interaction patterns for speed and accuracy (buttons, navigation, forms)
- Explaining design choices to stakeholders with evidence-based reasoning
- Conducting heuristic evaluations of existing interfaces against known psychological principles
- Training designers on fundamental human-computer interaction patterns
- Prioritizing UX improvements with predictable impact on user behavior
- Auditing AI/LLM interfaces where cognitive biases significantly impact user trust

## The 30 Principles

### Heuristics (Predictive Models)

| #   | Law                               | Principle                                                                       | Application                                                                                    |
| --- | --------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1   | **Fitts's Law**                   | Time to acquire a target = distance ÷ size                                      | Make important targets large and close; minimum 44×44pt (iOS) / 48×48dp (Material)             |
| 2   | **Hick's Law**                    | Decision time increases logarithmically with choices                            | Limit options (5-7 max); use progressive disclosure for complex flows                          |
| 3   | **Jakob's Law**                   | Users prefer your site to work like other sites                                 | Follow platform conventions; innovate cautiously within mental models                          |
| 4   | **Miller's Law**                  | Working memory holds 7±2 items                                                  | Chunk information into groups of 5-9; phone numbers, navigation, form sections                 |
| 5   | **Postel's Law**                  | Be liberal in what you accept, conservative in what you send                    | Forgiving input handling (auto-format phone numbers, tolerate typos); strict output validation |
| 6   | **Tesler's Law**                  | Conservation of Complexity — inherent complexity can't be removed, only shifted | Automate complexity for novices; expose controls for power users                               |
| 7   | **Doherty Threshold**             | Productivity soars when system responds <400ms                                  | Target sub-400ms response for interactive tasks; show spinners only for longer operations      |
| 8   | **Pareto Principle** (80/20 Rule) | 80% of effects come from 20% of causes                                          | Focus on the 20% of features that drive 80% of user value; prioritize ruthlessly               |

### Gestalt Principles (Visual Perception)

| #   | Law                                      | Principle                                                     | Application                                                                                 |
| --- | ---------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 9   | **Law of Proximity**                     | Objects near each other are perceived as related              | Group related UI elements with spacing; use whitespace to create visual separation          |
| 10  | **Law of Similarity**                    | Similar visual characteristics imply related function         | Consistent styling for same-type elements (all links blue, all buttons styled by hierarchy) |
| 11  | **Law of Common Region**                 | Elements in a bounded area are perceived as a group           | Use cards, borders, background tints to group related content                               |
| 12  | **Law of Uniform Connectedness**         | Visually connected elements are more related than unconnected | Use lines, arrows, connecting paths to show relationships between elements                  |
| 13  | **Law of Prägnanz** (Law of Good Figure) | People perceive ambiguous shapes as the simplest form         | Keep icons, logos, and layouts simple; avoid unnecessary complexity                         |

### Cognitive Biases (Decision-Making)

| #   | Law                                        | Principle                                                    | Application                                                                                     |
| --- | ------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| 14  | **Cognitive Bias**                         | Systematic errors in thinking affect decisions and judgments | Design for known biases (confirmation, anchoring, framing) to guide users toward better choices |
| 15  | **Choice Overload** (Paradox of Choice)    | Too many options overwhelm and reduce satisfaction           | Limit choices; curate recommendations; use defaults to reduce decision effort                   |
| 16  | **Peak-End Rule**                          | Experiences judged by peak intensity and end, not average    | Design memorable peak moments and ensure positive endings (confirmation screens, celebrations)  |
| 17  | **Serial Position Effect**                 | Users best remember first and last items in a series         | Place critical actions/CTAs at start and end of lists; frontload key info                       |
| 18  | **Von Restorff Effect** (Isolation Effect) | The unique item stands out and is remembered most            | Make the primary CTA visually distinct; use contrast strategically                              |
| 19  | **Goal-Gradient Effect**                   | People accelerate effort as they approach a goal             | Show progress bars; provide milestones; create artificial progress to motivate completion       |
| 20  | **Zeigarnik Effect**                       | People remember uncompleted tasks better than completed      | Use progress indicators, save-in-progress states to encourage task completion                   |
| 21  | **Paradox of the Active User**             | Users don't read manuals — they start using immediately      | Design for learn-by-doing; onboarding tooltips; just-in-time guidance over documentation        |

### Memory & Attention

| #   | Law                     | Principle                                                                  | Application                                                                                |
| --- | ----------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 22  | **Cognitive Load**      | Mental resources needed to understand and interact with an interface       | Reduce extraneous load; use familiar patterns; chunk information                           |
| 23  | **Selective Attention** | People focus on a subset of stimuli relevant to their goals                | Prioritize visual hierarchy; minimize distractions; use contrast to guide attention        |
| 24  | **Working Memory**      | Temporary system that holds and manipulates information for tasks          | Never require users to hold info across screens; provide persistent context                |
| 25  | **Chunking**            | Breaking information into meaningful groups aids memory                    | Group related data; use progressive disclosure; format long strings (credit cards, phones) |
| 26  | **Mental Model**        | Users have preconceived ideas of how systems work based on past experience | Match system behavior to user expectations; test mental models before building             |

### General Principles

| #   | Law                            | Principle                                               | Application                                                                                  |
| --- | ------------------------------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 27  | **Aesthetic-Usability Effect** | Aesthetic designs are perceived as more usable          | Invest in visual polish; it creates a halo effect that increases forgiveness of minor issues |
| 28  | **Occam's Razor**              | Simpler solutions with fewer assumptions are preferred  | Remove unnecessary elements; if it doesn't serve a clear purpose, cut it                     |
| 29  | **Parkinson's Law**            | Tasks expand to fill available time                     | Set realistic time constraints in workflows; use deadlines to drive action                   |
| 30  | **Flow**                       | Optimal state of immersion and enjoyment in an activity | Design for clear goals, immediate feedback, and balanced challenge/skill ratio               |

## The Process

### Step 1: Identify the UX Challenge

Analyze the user-facing problem and determine which category of laws applies:

- **Speed/accuracy issues** → Fitts's Law, Hick's Law, Doherty Threshold
- **Confusion/navigation problems** → Jakob's Law, Gestalt principles, Mental Models
- **Decision paralysis** → Hick's Law, Choice Overload, Occam's Razor
- **Low engagement/abandonment** → Goal-Gradient Effect, Peak-End Rule, Zeigarnik Effect, Flow
- **Information overwhelm** → Miller's Law, Chunking, Cognitive Load, Selective Attention

### Step 2: Select Applicable Laws

Choose 2-3 laws most relevant to the specific problem. Avoid applying too many at once as they can conflict (e.g., Fitts's large targets vs. Occam's minimalism).

### Step 3: Assess Current Baseline

Before implementing changes, establish measurable metrics:

- Task completion time (seconds)
- Error/click accuracy rate (%)
- Decision time (seconds)
- Abandonment rate (%)
- Cognitive load score (NASA TLX or similar)

### Step 4: Apply the Laws

**For Fitts's Law:**

- Ensure touch targets minimum 44×44pt (Apple HIG), 48×48dp (Material), 44×44px (WCAG)
- Place primary actions in thumb-reach zones on mobile (bottom third of screen)
- Add 8dp minimum spacing between touch targets (Material guideline)
- Use `cursor-pointer` on all clickable elements
- Consider edge/corner positioning (infinite edges make targets effectively larger)

**For Hick's Law:**

- Limit top-level navigation to 5-7 items
- Break complex forms into multi-step flows (3-5 steps max)
- Use smart defaults and pre-selected options
- Progressive disclosure: reveal advanced options on demand
- Search + filter for large data sets over navigation

**For Jakob's Law:**

- Audit 3-5 competitor/similar products before designing your pattern
- Follow platform conventions (iOS HIG, Material Design, platform-specific patterns)
- Test mental model alignment with users before launch
- Only break conventions when the new pattern is significantly better (test to validate)

**For Gestalt Principles:**

- Proximity: use `gap-4` to `gap-8` between groups, `gap-2` within groups
- Similarity: one color for all primary links, one for all headings
- Common Region: card-based layouts with `rounded-lg border bg-card p-4`
- Prägnanz: prefer simple geometric icons over detailed illustrations

**For Peak-End Rule:**

- Identify the peak moment (delight/critical interaction) and design a memorable experience
- Ensure the end state of every flow is positive (confirmation, next steps, value delivered)
- Avoid ending on error screens — if errors occur, provide clear recovery paths
- Example: signup → celebration animation → immediate value (not just "thanks")

**For Decision Biases:**

- Goal-Gradient: show progress bars with percentage; create artificial progress (e.g., "Step 1 of 5" when starting at step 1 makes 20% progress feel like a head start)
- Von Restorff: make primary CTA the most visually distinct element on the page
- Serial Position: most important action goes first or last in navigation

### Step 5: Measure Impact

Compare post-change metrics against baseline:

- Task completion time ↓ 20-50% (Fitts's + Hick's combined)
- Error rate ↓ 30-50% (larger targets + conventions)
- Decision time ↓ 30% per option eliminated (Hick's Law logarithmic curve)
- Abandonment rate ↓ 15-30% (progressive disclosure + chunking)
- NPS/satisfaction ↑ 10-15% (Aesthetic-Usability Effect)

### Step 6: Iterate

Revisit as technology evolves. LLMs, spatial computing, and AI interfaces introduce new contexts where these principles apply differently. The 2nd edition (2024) added guidance for AI interfaces — selective attention and cognitive bias are particularly critical for AI/LLM UX.

## Common Pitfalls

| Pitfall                              | Law Violated               | Impact                                       |
| ------------------------------------ | -------------------------- | -------------------------------------------- |
| Tiny touch targets (<44px)           | Fitts's Law                | 30-50% more mis-taps, accessibility failures |
| Novel navigation patterns            | Jakob's Law                | Higher cognitive load, bounce rates increase |
| Mega-menus with 20+ options          | Hick's Law                 | Decision paralysis, task abandonment         |
| Long unformatted data dumps          | Miller's Law, Chunking     | Information missed, forms skipped            |
| Inconsistent visual styling          | Law of Similarity          | Users misinterpret relationships             |
| No feedback on actions               | Doherty Threshold          | Perception of slowness, double-clicks        |
| Ending on error screens              | Peak-End Rule              | Negative experience lingers in memory        |
| Uniform CTA styling                  | Von Restorff Effect        | Primary action blends with secondary         |
| No progress indication               | Goal-Gradient Effect       | Users abandon multi-step flows               |
| Dense documentation-first onboarding | Paradox of the Active User | Users skip onboarding, miss key features     |

## Real-World Examples

| Product               | Laws Applied                           | Implementation                                                                             |
| --------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Stripe Checkout**   | Fitts's + Aesthetic-Usability + Hick's | Large "Pay" button, single-column layout, polished typography, minimal options             |
| **Amazon Navigation** | Jakob's + Hick's + Serial Position     | Standard e-commerce patterns, ~10 nav items, most important first                          |
| **Google Search**     | Miller's + Serial Position             | 10 results per page, most relevant at top, pagination at end                               |
| **Slack Sidebar**     | Proximity + Similarity + Common Region | Channels grouped by category, consistent styling, visual dividers                          |
| **Headspace**         | Peak-End Rule + Goal-Gradient          | Celebration animation after sessions, positive onboarding end state, progress streaks      |
| **Duolingo**          | Goal-Gradient + Zeigarnik + Flow       | Streak counts, progress bars, incomplete lesson reminders, gamified learning flow          |
| **TurboTax**          | Hick's + Miller's + Choice Overload    | Step-by-step interview format (not one giant form), smart defaults, progressive disclosure |
| **Apple Settings**    | Fitts's + Proximity + Similarity       | Large tap targets, grouped by category with section headers, consistent row styling        |

## Key Insights from the 2nd Edition (2024)

The 2nd edition of Laws of UX added connections to underlying psychological concepts and UX research methods:

- **Paradox of Choice** (Choice Overload) — linked to the work of Barry Schwartz; more options decrease satisfaction even if users pick a good option
- **Complexity Bias** — people prefer simple, easy-to-understand options over complex ones, even when complex yields better results
- **Flow** (Csikszentmihályi) — optimal experience requires clear goals, immediate feedback, and balance between challenge and skill
- **The Human Factor** — understanding human limitations (vigilance, fatigue, attention) is critical for safety-critical interfaces
- **Accessibility** — inclusive design principles connect to psychological concepts of ability diversity
- **Paradox of the Active User** (Carroll & Rosson) — users are action-oriented; they'd rather do than learn, even if learning would make them more efficient
- **UX Methods** — contextual inquiry, user interviews, and eye-tracking as complementary research approaches

## Additional Resources

- **Book:** "Laws of UX: Using Psychology to Design Better Products & Services" 2nd Edition by Jon Yablonski (March 2024, O'Reilly) — ISBN 978-1098146962
- **Website:** [lawsofux.com](https://lawsofux.com) — Interactive reference with 30 principles, examples, and citations
- **Cognitive Bias Index:** [cognitivebiasindex.com](https://cognitivebiasindex.com/) — Companion resource by Jon Yablonski (launched April 2026)
- **Humane by Design:** [humanebydesign.com](https://humanebydesign.com/) — Design patterns for humane digital experiences
- **Research Papers:** Fitts (1954), Hick & Hyman (1952), Miller (1956), Nielsen (Jakob's Law), Kahneman & Tversky (cognitive biases)
- **Related Books:** "Thinking, Fast and Slow" by Daniel Kahneman, "100 Things Every Designer Needs to Know About People" by Susan Weinschenk, "Universal Principles of Design" by Lidwell/Holden/Butler, "The Design of Everyday Things" by Don Norman
