# Requirements

## Epic 1: Codebase Cleanup & Architecture
- `[ ]` Audit and remove all unused code and loose files across root and `src`.
- `[ ]` Lock and strictly document folder hierarchy constraints (no new root folders).

## Epic 2: Security & Route Guarding
- `[ ]` Implement robust client-side and server-side route guards validating session constraints.
- `[ ]` Apply role-based visibility to "Send Quote" CTAs on Explore page (enabled solely for 'Sellers').
- `[ ]` Explicitly block 'Buyers' and 'Admins' from quote submission APIs/actions.

## Epic 3: UI/UX Theming & Dynamic Navbar
- `[ ]` Define a unified design token system scaling a premium modern color palette.
- `[ ]` Build top-level global responsive Navigation Bar.
- `[ ]` Ensure Navbar adapts link structure based on active session authentication.
- `[ ]` Connect User Profile info (Avatar, Name, Role) actively into Navbar state.

## Epic 4: Explore Page Redesign
- `[ ]` Overhaul the public Explore grid architecture focusing on premium styling.
- `[ ]` Connect Drizzle query fetching efficiently via TanStack Query avoiding client side waterfalls.
- `[ ]` Request Card: Implement UI variations correlating with active DB `status` (Open, Quoted, Closed).
- `[ ]` Improve Core Web Vitals heavily restricting excessive DOM recalculations.
