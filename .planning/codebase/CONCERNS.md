# Concerns & Technical Debt

## Ongoing Restructuring / Context
- **Infrastructure Shift:** Exploring a migration from Netlify hosting/Supabase storage to Cloudflare Pages/R2. This impacts SSR hydration maps and asset delivery edges, requiring careful validation to prevent breakage.
- **Auth Overlap:** Dual existence of `better-auth` and `@supabase/supabase-js`. Multiple sources of truth for authentication handling can cause state mismatch bugs if not firmly bounded.

## Fragile Areas
- **SSR Re-hydration:** Relying extensively on complex interactive UIs combined with TanStack Start's evolving SSR implementations may result in React hydration mismatch errors.
- **Performance Thresholds:** A densely packed UI with intense animations (Framer Motion, generic DOM tracking, floating components) might degrade unthrottled performance on lower-tier mobile environments without rigorous memoization (`useMemo`, `useCallback`).

## Specific Technical Debt
- **Type Duplications:** Migrating to Drizzle ORM may produce divergence between frontend assumed states and Drizzle's direct TypeScript shapes if not utilizing derived schemas fully. Need to establish a single truth repository for database typing.
- **Monolithic Components:** Tendency to cram extensive rendering logic in top-level feature components. Consistent refactoring into smaller, single-responsibility sub-components is advised (especially with complex `CategoryBar` or `PartCard` elements recently mapped).
