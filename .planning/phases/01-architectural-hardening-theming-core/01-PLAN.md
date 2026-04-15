<read_first>
This plan maps directly against the 01-CONTEXT.md file for Phase 1. It details the structural implementation of the dead code cleanup, the Stripe-inspired OKLCH theming system, and the dynamic Navbar RBAC routing.

If you are executing this plan:
1. Process all `delete_file` tasks first.
2. Inject the OKLCH tokens next.
3. Update specific route structures last.
</read_first>

<acceptance_criteria>
- [x] No `src/components/ui/components` fallback folder exists.
- [x] The `src/styles.css` root applies the blurple Stripe aesthetic `oklch(45% 0.25 260)`.
- [x] `Header.tsx` accurately leverages Router User Context instead of static placeholder avatars.
- [x] `MarketplaceFeed` explicitly limits DOM rendering of "Quote Now" action buttons exclusively to 'Seller' accounts via RBAC validation.
</acceptance_criteria>

<action>
wave: 1
depends_on: []
files_modified: []
description: "Audit Context & Cleanup"
instructions: |-
  1. Identify the duplicate nested `components/ui/components` structure.
  2. Permanently delete the redundant `src/components/ui/components` footprint keeping the main UI primitives intact.
</action>

<action>
wave: 2
depends_on: [1]
files_modified:
  - "src/styles.css"
description: "Inject Premium Theming"
instructions: |-
  1. Update `:root` to map `--primary`, `--ring`, `--sidebar-primary`, and accent/secondary colors to the precise brand hex: `oklch(45% 0.25 260)`.
  2. Verify dark mode overrides respect the styling baseline.
</action>

<action>
wave: 3
depends_on: [2]
files_modified:
  - "src/components/layout/Header.tsx"
  - "src/features/marketplace/components/explore/marketplace-feed.tsx"
  - "src/features/marketplace/components/public-marketplace.tsx"
description: "Enable Dynamic Authentication Awareness"
instructions: |-
  1. Replace static gradient components in `Header.tsx` with `{user ? <Dynamic Profile /> : <Static Placeholder>}` relying on `useRouteContext()`.
  2. Map `userRole` property structurally into `MarketplaceFeed` from `public-marketplace.tsx`.
  3. Shield the "Send Quote" CTAs securely matching the user identity exclusively to "Seller" roles, dropping the target HTML node entirely for admins or unauthenticated visitors.
</action>
