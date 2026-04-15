# Coding Conventions

## Code Style & Organization
- **Language Features:** TypeScript strict mode is encouraged. Modern React features (Hooks, React 19 concurrent features) are heavily leveraged.
- **Formating & Linting:** Code formatting is automatically handled by Prettier (`prettier.config.js`), while static analysis/linting is defined by `eslint.config.js`. Ensure passing status prior to commits.
- **Styling:** Tailwind CSS class-name merging is handled efficiently to avoid conflicts (commonly using mechanisms like `cn` with `clsx` and `tailwind-merge`).

## Architectural Patterns
- **Feature-Sliced Folders:** Instead of placing all components in `src/components`, feature-specific components are kept alongside their relevant logic in `src/features/*`.
- **UI Interaction:** High preference for "Glassmorphic" and aesthetically engaging components. Use interactive primitives (e.g., hover states, animations via Framer Motion, transition scales) without sacrificing accessibility (using Radix bounds).
- **Date/Time:** Formatting and manipulation handled via `date-fns`.

## Data Management
- **Queries:** All server fetches should utilize TanStack Query (`@tanstack/react-query`) with proper key abstraction and invalidation strategies.
- **Environment config:** Configuration should be safe-parsed, usually handled via Zod schemas, keeping app-level type safety robust.
