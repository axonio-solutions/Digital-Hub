# Directory Structure

## Repository Root
- `.planning/`: Context storage for the Get Shit Done (GSD) planning framework.
- `drizzle/`: Database migration definitions managed by `drizzle-kit`.
- `public/`: Static assets exposed at the application root (e.g., favicons, public images).
- `scripts/`: Operational utility scripts.
- `src/`: The core application source code.
- `supabase/`: Context mapping for local Supabase instance, configurations, and edge functions.

## Source Code (`src/`)
- `components/`: Pure, presentational UI components and core layout modules.
- `data-access/`: Dedicated abstract access APIs for database or remote data interactions.
- `db/`: ORM schemas and DB client instantiation.
- `features/`: The primary organizational logic split by domain (e.g., `src/features/marketplace/`). Contains components, local states, and local specific APIs.
- `functions/` & `fn/`: Potential lambda/server locations or general utility functions mapping to the backend.
- `hooks/`: Custom generic React hooks mapped across multiple features.
- `lib/`: Facades or abstractions over external 3rd-party libraries.
- `routes/`: File-system routing components matching URL hierarchy.
- `server/`: Dedicated server-only functionality (guards, middleware, context setup).
- `services/` & `use-cases/`: Deep business logic and service/connector patterns isolated from the direct UI.
- `types/`: Global and shared TypeScript definitions.
- `utils/`: Small helper utility methods.
