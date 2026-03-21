---
name: Axis Architecture
description: Instructions for building applications using the Axis Layered Architecture model (Data Access -> Use Case -> Server Function -> UI).
---

# Axis Architecture Skill

This skill defines the core principles and layered structure for developing applications based on the Axis model. All development in this repository must strictly adhere to these patterns.

## 1. Summary of Layers

The architecture is divided into clear layers with a strict top-down dependency flow:

1.  **UI / Routes** (`src/routes`, `src/features/*/components`): Responsible for rendering, client-side state, and user interaction. Calls **Server Functions**.
2.  **Server Functions** (`src/fn`): The bridge between client and server. Only handles transport-level logic (sessions, cookies, headers). Calls **Use Cases**.
3.  **Use Cases** (`src/use-cases`): The **Business Logic** layer. Validates input, checks authorization, and orchestrates domain logic. Calls **Data Access**.
4.  **Data Access** (`src/data-access`): Low-level persistence operations. Performs direct Database queries. **NO business logic** allowed here.
5.  **Database / Schema** (`src/db`): Infrastructure layer for DB connection and Drizzle schemas.

## 2. Strict Rules

- **No DB in UI**: Components must never import from `@/db` or performing raw SQL/Drizzle queries directly.
- **Top-Down Only**: 
  - `UI` -> `fn` -> `use-cases` -> `data-access` -> `db`
  - Layers MUST NOT be skipped (e.g., `fn` calling `data-access` directly is discouraged).
- **Result Objects**: Use Cases must return a standard result object:
  ```typescript
  type Result<T> = { success: true; data: T } | { success: false; error: string };
  ```

## 3. Reference Implementation

Check `axis/src/use-cases/cafes.ts` and `axis/src/data-access/cafes.ts` for the gold standard implementation.

## 4. Key Concepts

- **Feature-First**: Organize UI and domain logic into features within `src/features`.
- **Zod for Everything**: Use Zod for validation at the Use Case layer to ensure data integrity.
- **Better Auth Integration**: Use `authClient` for client sessions and `auth` (from `@/lib/auth`) for server-side session checks in Use Cases or Server Functions.
