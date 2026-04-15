# Architecture

## High-Level Pattern
- **Full-Stack Application:** Built with TanStack Start, handling Server-Side Rendering (SSR) and seamless API interactions natively.
- **Data Flow:** TanStack Query handles client data fetching, mutation, and caching. It pairs with TanStack Router loaders and TanStack Start's `$server` functions for end-to-end type safety.
- **Data Persistence:** Drizzle ORM ensures type-safe SQL queries directly tying into the application logic, acting on a Postgres database.
- **Design System:** Utility-first CSS using Tailwind CSS v4, heavily employing Headless UI composition via Radix UI primitives.

## Abstractions & Layers
- `src/features/`: Encapsulates domain-bound logic. By scoping components and hooks tightly to a feature (like `marketplace`), coupling across disparate areas is minimized.
- `src/components/ui/`: Dumb, reusable layout primitives (e.g., generic buttons, inputs, dialogs) derived directly from Radix or built generically for the app.
- `src/routes/`: Route declarations and layout components mapped to URL segments utilizing TanStack Router's file-based system.
- `src/db/`: The Data Access Layer. Contains schema definitions, database connection providers, and migrations structure.
- `src/hooks/` & `src/utils/`: Shared utilities and cross-cutting React behavioral logic.

## Entry Points
- Server boundary: `src/ssr.tsx`
- Client boundary (Hydration): `src/client.tsx`
- Routing mechanism: `src/router.tsx` and dynamically handled `routeTree.gen.ts`.
