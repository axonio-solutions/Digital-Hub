# Axis Organization & Conventions

## 1. Folder Structure

Follow this standard folder structure for the `src` directory:

- `src/db`: Database connection client and Drizzle schema files.
- `src/data-access`: Generic, low-level database operations (Queries & Mutations).
- `src/use-cases`: High-level business logic, authorization, and orchestration.
- `src/fn`: TanStack Start server functions.
- `src/features`: Feature-based organization for UI logic.
  - `src/features/[feature-name]/components`: Feature-specific UI components.
  - `src/features/[feature-name]/hooks`: Feature-specific hooks.
  - `src/features/[feature-name]/queries`: Feature-specific TanStack Query definitions.
- `src/routes`: TanStack Router file-based routes.

## 2. Naming Conventions

- **Folders**: `kebab-case`.
- **Files**: `kebab-case.ts` or `kebab-case.tsx`.
- **Components**: `PascalCase.tsx`.
- **Functions/Hooks**: `camelCase`.
- **Schemas**: `[name]-schema.ts` (inside `src/db/schema`).

## 3. Communication Patterns

### The Axis Flow:
`UI Component` -> `Server Function (@/fn)` -> `Use Case (@/use-cases)` -> `Data Access (@/data-access)` -> `Database (@/db)`

### Example:
- UI: `src/features/cafes/components/CafeCard.tsx`
- FN: `src/fn/cafes.ts` -> `getCafeFn`
- Use Case: `src/use-cases/cafes.ts` -> `getCafeUseCase`
- Data Access: `src/data-access/cafes.ts` -> `fetchCafeById`
