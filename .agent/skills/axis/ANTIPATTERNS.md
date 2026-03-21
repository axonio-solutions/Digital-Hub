# Axis Anti-Patterns & Files to Avoid

To maintain the integrity of the Layered Architecture, avoid the following anti-patterns:

## 1. Forbidden Patterns

- **Direct DB Access in UI**: NEVER import `db` or `eq` (from drizzle) in a `.tsx` component file or a route file.
- **Business Logic in Data Access**: Data access functions should be "dumb". If you are checking permissions or calculating values based on business rules, move it to a **Use Case**.
- **UI Code in Use Cases**: Use cases should be pure logic and data orchestration. They must not depend on React, browser APIs (like `localStorage`), or UI libraries.
- **Skipping Layers**: Avoid calling `data-access` directly from the UI. Always go through a `Server Function` and a `Use Case`.

## 2. Files to Delete / Avoid

- **`App.tsx`**: In TanStack Start, the entry point is typically `router.tsx` and `routes/__root.tsx`. Delete boilerplate `App.tsx` files.
- **`demo-*` files**: Delete any files prefixed with `demo` once the real implementation starts.
- **Duplicate Schemas**: Do not create local schemas; always use the centralized ones in `src/db/schema`.

## 3. Mandatory Deletions

If you see any of the following, refactor or delete them:
- Inline SQL queries in components.
- Large components (>300 lines) that mix state, logic, and rendering.
- Files that don't follow the `kebab-case` naming convention.
