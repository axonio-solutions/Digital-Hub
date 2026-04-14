# Roadmap: Marketplace V2 Redesign & Hardening

## Phase 1: Architectural Hardening & Theming Core
**Goal:** Establish clean foundations, implement the premium aesthetics tokens, and enforce strictly structured routing rules before touching feature code.

- **Dependencies:** None

- `[ ]` Plan 1.1: Comprehensive codebase audit & dead code removal.
- `[ ]` Plan 1.2: Establish high-level Premium Color Palettes & UI theme tokens.
- `[ ]` Plan 1.3: Implemented generic auth-aware dynamic Navigation Bar.

## Phase 2: Role-Based Access Control (RBAC)
**Goal:** Secure the application borders and explicitly prevent undesired actions based on active roles.

- **Dependencies:** Needs solid theming from Phase 1.

- `[ ]` Plan 2.1: Establish solid route-level guards for TanStack Router matching Auth schemas.
- `[ ]` Plan 2.2: Abstract authentication capability to extract roles actively into front-end context.

## Phase 3: Explore Interface & Card Redesign
**Goal:** Deliver the final premium Marketplace feature view ensuring heavy performance and reactive states.

- **Dependencies:** Requires RBAC state logic (Phase 2) for component conditional rendering.

- `[ ]` Plan 3.1: Redesign `PartCard` integrating adaptive status UIs natively.
- `[ ]` Plan 3.2: Rebuild the Explore Grid fetching pipeline implementing performant TanStack Query caching.
- `[ ]` Plan 3.3: Conditional rendering configuration securing the "Send Quote" button exclusive to active Sellers.

---
*Created via gsd-new-project*
