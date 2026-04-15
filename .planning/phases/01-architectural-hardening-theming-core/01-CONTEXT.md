# Phase 1: Architectural Hardening & Theming Core - Context

**Status:** Ready for planning

<domain>
## Phase Boundary

Establish clean foundations, implement the premium aesthetics tokens, and enforce strictly structured routing rules before touching feature code. Includes codebase audit, color palette generation, and auth-aware dynamic Navbar.

</domain>

<decisions>
## Implementation Decisions

### Dead Code & Audit Approach
- **D-01:** Aggressively delete absolutely unused and redundant files to reduce bloat (no quarantining).
- **D-02:** Strictly follow and preserve the existing `axsis` folder architecture. Do not create any new root folders.

### Color Palette & Theming Strategy
- **D-03:** High-end, modern B2B marketplace aesthetic (similar to Stripe/Airbnb).
- **D-04:** Use a clean, high-contrast OKLCH palette with a deep primary brand color.
- **D-05:** Stark white backgrounds, ample whitespace, and very subtle soft shadows/borders.
- **D-06:** Keep the theme lightweight and blazing fast.

### Dynamic Navbar Architecture & Security
- **D-07:** Navbar must dynamically show the authenticated user's profile information and avatar.
- **D-08:** Hide restricted UI elements entirely from the DOM (e.g., "Send Quote" button ONLY rendered for active 'Sellers'). Buyers/Admins should not even see a disabled button.
- **D-09:** Enforce these route guards natively in TanStack Router.

### the agent's Discretion
- Exact OKLCH values for the "deep primary brand color".
- Exact sizing and blur values for the soft shadows and borders.
- Specific implementation mechanism for extracting authentication context into TanStack router guards (e.g., Zustand vs React Context).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specs
- `.planning/ROADMAP.md` — Phase 1 goals and dependencies.
- `.planning/REQUIREMENTS.md` — Epic 1, 2, 3 defining codebase cleanup, route guarding and theming constraints.
- `PRDS/epic-redesign.md` — Master PRD for redesign requirements.

</canonical_refs>

<specifics>
## Specific Ideas
- Style inspiration: Stripe, Airbnb (clean, high-contrast, ample whitespace).
</specifics>

<deferred>
## Deferred Ideas
None — discussion stayed completely within phase scope.
</deferred>
