# Project: Marketplace V2 Redesign & Hardening

## Context
**What This Is:** A V2 redesign and architectural hardening phase for the MLILA Automotive Spare Parts Marketplace. The focus is to transform the UI into a highly modern, premium experience, enforce strict role-based security, clean up technical debt, and ensure high performance with TanStack Start SSR capabilities.

**Why Needs Action:** The current platform lacks a cohesive premium aesthetic, needs strict enforcement of buyer/seller roles on the public feed, and requires aggressive cleanup of redundant code and potential performance bottlenecks.

## Core Value
The single most important outcome is a **Performant, Premium, and Secure Marketplace Feed** — delivering an "instant load" experience where role permissions are strictly guarded (Sellers can quote, Buyers/Admins cannot).

## Requirements

### Validated (Existing Codebase Capabilities)
- ✓ Full-Stack SSR setup with TanStack Start and TanStack Router
- ✓ Database ORM operations via Drizzle ORM to Postgres
- ✓ Utility-first Tailwind CSS v4 and Radix UI composition
- ✓ Marketplace Explore feed that iteratively displays part request cards
- ✓ Supabase and Better Auth integration for sessions

### Active (To Build)
- [ ] **Codebase Cleanup:** Audit and purge all unnecessary, redundant, or unused files project-wide.
- [ ] **Strict Architecture Enforcement:** Validate and lock directory structure usage, preventing creation of new root-level folders.
- [ ] **Route Guarding & Security:** Enforce strict role-based access control across routes.
- [ ] **Role-Based UI (Explore Page):** Conditionally render the "Send Quote" button exclusively for authenticated 'Seller' roles; block 'Buyers' and 'Admins'.
- [ ] **Premium Theming:** Architect a highly modern, premium color theme and unified design system affecting all UI elements.
- [ ] **Dynamic Navbar:** Implement a global Navigation Bar that responds to authentication state and displays the current user's profile.
- [ ] **Explore Page Redesign:** Overhaul the public Explore feed with a focus on immersive, premium UX (e.g., glassmorphism, structured hierarchies).
- [ ] **Dynamic Status UI:** Update Request Cards to visually adapt to real-time status changes (Open, Quoted, Closed).
- [ ] **Performance Optimization:** Maximize TTFB and rendering speed using robust TanStack Query cache management, SSR optimization, and lightweight DOM footprints.

### Out of Scope
- [Mobile App deployment] — Focus is restricted to web frontend optimization using TanStack Start.
- [Database Schema Overhauls] — Changes restricted to UI layer, authentication mapping, and API routing unless blocking a requirement.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Retain TanStack Start | Ensures consistent data hydration, fast routing, and server-side safety layers for RBAC. | — Pending |
| YOLO & Coarse Planning | Selected via Auto-defaults to ensure rapid forward progress. | Configured |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-14 after initialization*
