# Design — MLILA Digital Hub

<!-- Hallmark · genre: modern-minimal · macrostructure family: Workbench (home) + Long Document (content)
     theme: brand blue hue 260° · nav: N5 floating pill · footer: Ft1 mast-headed
     designed-as-app: true · date: 2026-05-21 -->

A locked design system for the public-facing pages of the MLILA marketplace.
Every page redesign reads this file first. Do not regenerate per page — amend here
when the system needs to grow.

---

## Genre

`modern-minimal` — B2B marketplace platform. Declarative, confident, restrained.
Stripe / Linear / ElevenLabs school: Geist sans, large tight displays, generous
whitespace, pill CTAs. Minimalism with conviction, not the absence of choice.

---

## Macrostructure family

| Page type                    | Family            | Variation knobs                      |
| ---------------------------- | ----------------- | ------------------------------------ |
| Home (marketing)             | **Workbench**     | Sticky-scroll product tour, 3 frames |
| About, Contact, FAQ, Pricing | **Long Document** | Inline section heads, prose flow     |

Pages within a family share the family's shape; they vary only in section-head
style and component archetypes. Variety comes from archetype choice, not
from re-theming per page.

---

## Theme

```
--color-paper:       oklch(100% 0 0)           /* pure white */
--color-paper-2:     oklch(97% 0.005 260)      /* near-white, subtle tint */
--color-ink:         oklch(12% 0.01 280)       /* near-black */
--color-ink-2:       oklch(40% 0.01 280)       /* secondary text */
--color-rule:        oklch(89% 0.005 280)      /* border */
--color-accent:      oklch(50% 0.14 260)       /* brand blue */
--color-accent-ink:  oklch(100% 0 0)           /* white on accent */
--color-focus:       oklch(64% 0.13 260)       /* focus ring */
```

Dark mode mirrors the existing `.dark` token values in `src/styles.css`.

---

## Typography

- **Display:** Geist, weight 600, normal. Tracking −0.025em.
  Scale: `clamp(2.5rem, 4.5vw + 0.5rem, 4.25rem)` → `--text-display`
- **Display-s:** `clamp(1.75rem, 3vw + 0.25rem, 2.75rem)` → `--text-display-s`
- **Body:** Noto Sans Arabic Variable 400 (RTL-aware); Geist 400 as Latin fallback
- **Mono:** Geist Mono 400
- **Never use `font-black` (900)** on body copy or section headings.
  Reserve bold weight for one-word labels and table numerals.

---

## Spacing

4-point named scale via CSS custom properties. Pages must use named tokens.

```
--space-3xs: 0.25rem   --space-2xs: 0.5rem   --space-xs:  0.75rem
--space-sm:  1rem      --space-md:  1.5rem   --space-lg:  2.5rem
--space-xl:  4rem      --space-2xl: 6rem     --space-3xl: 9rem
```

Between major sections: `--space-3xl` minimum. No sub-rules dividing sections
into rows — the section break is the visual rhythm.

---

## Motion

- **Library:** Framer Motion (already installed)
- **Reveal:** fade + `translateY(8px → 0)` on `whileInView`, `once: true`
- **Duration:** 360ms · **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` → `--ease-out`
- **Reduced-motion:** opacity-only crossfade, ≤ 150ms
- **Page-load animations:** none — scroll-triggered only
- **Max:** 2 concurrent reveals per section
- **Micro:** `transform` and `opacity` only. Never layout properties.

---

## Microinteractions stance

- **Silent success** (no celebratory toasts for non-critical actions)
- **Hover:** color/opacity shifts only. No `whileHover={{ scale: ... }}` on cards.
- **Focus:** `:focus-visible` ring in `--color-focus`, appears instantly (no animation).
- **No `animate-ping`** pulsing dots anywhere.
- **Buttons:** `active:scale-[0.97]` press feedback, `transition-all duration-150`.

---

## CTA voice

- **Primary:** filled pill · `bg-primary text-primary-foreground rounded-full px-6 py-2.5 font-semibold`
- **Secondary:** outlined pill · `border border-border text-foreground rounded-full px-6 py-2.5 font-semibold`

---

## Navigation — N5 Floating pill

`fixed inset-x-0 top-0`, centered, max-width 768px, blur backdrop.

- **Public pages** (/, /about, /pricing, /faq, /contact, /explore): floating pill
- **App pages** (dashboard, auth, etc.): sticky header — existing behavior, unchanged

Pill collapses on mobile: wordmark left + hamburger right only. Links appear in
slide-out sheet (existing Sheet/SheetContent component, unchanged).

---

## Footer — Ft1 Mast-headed

Wordmark + tagline anchor a single horizontal band. Essential links inline beside.
Copyright beneath in muted small type.

Replace the previous 3-column index footer with this single-band structure.

---

## Per-page allowances

- **Home (Workbench):** May use UI mockup frames (honest representations, no fabricated live data).
- **Content pages:** Typography only. No decorative icon + card grids.
- **All pages:** No dot-grid backgrounds, no glow blobs, no pulsing badges,
  no `transform rotate` tilt-on-hover cards, no `box-shadow: shadow-primary/20`.

---

## What pages MUST share

- Brand blue accent (hue 260°, `--color-accent` / `--primary`)
- Geist display + Noto Sans Arabic body
- Pill CTA shape (`rounded-full`)
- N5 floating pill nav (public) / sticky nav (app)
- Ft1 mast-headed footer (public pages)
- Section spacing rhythm

---

## What pages MAY differ on

- Section-head style within Long Document family
  (S2 Hanging for about · S4 Inline for FAQ · S3 Sticky-pinned for pricing)
- Hero enrichment (Workbench frames on home only)

---

## Exports

### tokens.css

```css
/* Hallmark · genre: modern-minimal · macrostructure family: Workbench + Long Document
 * theme: brand blue hue 260° · nav: N5 · footer: Ft1
 * P5 H4 E4 S4 R5 V4 · date: 2026-05-21
 */
:root {
  --color-paper: oklch(100% 0 0);
  --color-paper-2: oklch(97% 0.005 260);
  --color-ink: oklch(12% 0.01 280);
  --color-ink-2: oklch(40% 0.01 280);
  --color-rule: oklch(89% 0.005 280);
  --color-accent: oklch(50% 0.14 260);
  --color-accent-ink: oklch(100% 0 0);
  --color-focus: oklch(64% 0.13 260);

  --font-display: 'Geist', ui-sans-serif, system-ui, sans-serif;
  --font-body: 'Noto Sans Arabic Variable', 'Geist', ui-sans-serif, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, SFMono-Regular, monospace;

  --space-3xs: 0.25rem;
  --space-2xs: 0.5rem;
  --space-xs: 0.75rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2.5rem;
  --space-xl: 4rem;
  --space-2xl: 6rem;
  --space-3xl: 9rem;

  --text-display: clamp(2.5rem, 4.5vw + 0.5rem, 4.25rem);
  --text-display-s: clamp(1.75rem, 3vw + 0.25rem, 2.75rem);

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-short: 220ms;
  --dur-med: 360ms;

  --rule-hair: 1px;
  --radius-card: 12px;
  --radius-pill: 9999px;
  --radius-input: 8px;
}
.dark {
  --color-paper: oklch(12% 0.01 280);
  --color-paper-2: oklch(15% 0.01 280);
  --color-ink: oklch(95% 0.005 280);
  --color-ink-2: oklch(65% 0.005 280);
  --color-rule: oklch(100% 0 0 / 8%);
  --color-accent: oklch(64% 0.13 260);
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper: oklch(100% 0 0);
  --color-ink: oklch(12% 0.01 280);
  --color-accent: oklch(50% 0.14 260);
  --font-display: 'Geist', sans-serif;
  --font-body: 'Noto Sans Arabic Variable', 'Geist', sans-serif;
  --spacing-md: 1.5rem;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```
