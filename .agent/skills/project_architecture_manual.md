# Project Architecture & Organization Manual: Digital-Hub (axonio-solutions)

This document serves as the comprehensive guide for developers to understand the structural patterns, tech stack, and internal "skills" of the Digital-Hub repository. This is a high-performance, full-stack application built with the **TanStack Start** ecosystem.

---

## 1. Repository Meta-Info & High-Level Architecture

### Tech Stack
*   **Meta-Framework:** [TanStack Start](https://tanstack.com/start) (Full-stack React framework).
*   **Routing:** [TanStack Router](https://tanstack.com/router) (Type-safe, file-based routing).
*   **State & Data Fetching:** [TanStack Query](https://tanstack.com/query) (React Query).
*   **Form Management:** [TanStack Form](https://tanstack.com/form) and [React Hook Form](https://react-hook-form.com/).
*   **Database & ORM:** [Drizzle ORM](https://orm.drizzle.team/) with **PostgreSQL**.
*   **Authentication:** [Better Auth](https://better-auth.com/) (Self-hosted authentication library).
*   **Styling:** **Tailwind CSS v4** with [Shadcn UI](https://ui.shadcn.com/) (Radix UI primitives).
*   **Animations:** [Framer Motion](https://www.framer.com/motion/).
*   **Validation:** [Zod](https://zod.dev/).
*   **Emails:** [Resend](https://resend.com/) with [React Email](https://react.email/).

### Design Patterns
*   **Axis Tiered Architecture (Layered Design):**
    *   **Layer 3: UI & Server Functions (`src/fn`):** The public entry points for the application. Uses `createServerFn` to handle RPC-style communication between client and server.
    *   **Layer 2: Use Cases (`src/use-cases`):** Orchestrates domain logic and business rules. This layer is framework-agnostic.
    *   **Layer 1: Data Access Layer (DAL) (`src/data-access`):** Contains Drizzle-powered queries. Specialized DAL files (like `vendors.ts`) may also handle complex ranking algorithms and transactions.
*   **Service Layer (`src/services`):** Handles cross-cutting concerns and external integrations (e.g., `NotificationService` for Email/SSE orchestration) that don't fit into pure Use Cases.
*   **Feature-Based Modularization:** Code is organized by domain in `src/features/`. Each feature typically contains its own `components/`, `hooks/`, and `validations/`.
*   **SSR/CSR Hybrid:** leveraged via TanStack Start for optimal performance and SEO.

### Data Flow
1.  **UI Trigger:** A user interaction (e.g., submitting a form) calls a **Server Function** in `src/fn/`.
2.  **Validation:** Input is validated using **Zod** within the server function or use case.
3.  **Command Execution:** The server function calls a **Use Case** in `src/use-cases/`.
4.  **Database Interaction:** The use case calls the **Data Access Layer** (`src/data-access/`), which executes a Drizzle query.
5.  **Revalidation:** Upon success, **TanStack Query** or **Router Loaders** are typically used to refetch and update the UI.

---

## 2. Directory Structure & File Organization Strategy

### Folder Mapping
| Directory | Description |
| :--- | :--- |
| `/axis` | **Template/Boilerplate:** A standalone project structure used as a reference or starting point for sub-modules. |
| `/src/routes` | **File-Based Routes:** Defines the application's URL structure and layouts. |
| `/src/features` | **Domain Logic:** Feature-specific components, hooks, constants, and utilities. |
| `/src/fn` | **Server Functions:** Public-facing server-side logic invoked by the client. |
| `/src/data-access`| **Database Queries:** Pure Drizzle functions for fetching/mutating data. |
| `/src/use-cases` | **Application Services:** Orchestrates data access and business rules. |
| `/src/components` | **Shared UI:** Global components (buttons, cards, etc.), including Shadcn primitives. |
| `/src/db` | **Database Schema:** Drizzle schema definitions and migrations. |
| `/src/lib` | **Instantiations:** Shared library configurations (auth, drizzle, supabase). |

### Placement Rules
*   **Where do shared UI components go?** Generic components (e.g., `Button.tsx`) live in `src/components/ui`.
*   **Where do feature-specific components live?** Inside `src/features/[featureName]/components/`.
*   **Where do validations live?** Zod schemas are placed in `src/features/[featureName]/validations/` or `src/types/`.
*   **Where do business logic/use cases live?** Inside `src/use-cases/[domain]/`.
*   **Where do utility functions live?** Global utilities in `src/utils/`, domain utilities in `src/features/[featureName]/utils/`.
*   **Where do hooks live?** Global hooks in `src/hooks/`, feature-specific hooks in `src/features/[featureName]/hooks/`.

### Naming Conventions
*   **Files & Folders:** kebab-case (e.g., `new-request-form.tsx`, `data-access`).
*   **React Components:** PascalCase (e.g., `AuthLayout`).
*   **Server Functions:** camelCase (e.g., `getUser`, `loginFn`).
*   **Routes:** TanStack Router conventions (`_authed.tsx` for layout groups, `index.tsx` for main routes).

---

## 3. Dependency Linking & Configuration

### Library Integration
*   **Vite Configuration:** `vite.config.ts` manages the build pipeline, including `tanstackStart()` and `@tailwindcss/vite`.
*   **Path Aliases:** `@` is mapped to `src/` via `tsconfig.json` and `vite.config.ts`, allowing for clean imports like `@/components/...`.
*   **Framework Linking:** Third-party libraries are often initialized in `src/lib/` (e.g., `auth.ts`, `auth-client.ts`) and exported as singletons or utility objects.

### Config Files
*   **`package.json`:** Defines scripts and dependencies. Note the use of `vinxi` for server-side bundling.
*   **`drizzle.config.ts`:** configures database connection strings and schema paths for Drizzle Kit.
*   **`tsconfig.json`:** strictly type-checked with support for JSX and path mapping.
*   **`.env`:** Stores sensitive keys like `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `RESEND_API_KEY`.

### Global Providers
*   **Entry Point:** `src/client.tsx` and `src/ssr.tsx` handle hydration and server rendering.
*   **Root Layout:** `src/routes/__root.tsx` provides global context, including:
    *   **QueryClientProvider** (implicit via TanStack Start).
    *   **Auth Data:** Fetched in `beforeLoad` and provided to the route context.
    *   **Notifications:** `useNotifications` hook initialized globally.
    *   **Toaster:** Shadcn/Sonner toast provider.

---

## 4. Authentication & Middleware Organization

### Auth Flow
*   **Implementation:** Powered by **Better Auth**.
*   **State Management:** The auth session is fetched server-side in `__root.tsx`'s `beforeLoad` and made available to all child routes via TanStack Router's `context`.
*   **Client vs Server:**
    *   **Server Logic:** `src/lib/auth.ts` configures the adapter (Drizzle) and plugins (admin, phone number).
    *   **Client Logic:** `src/lib/auth-client.ts` provides the API for client-side login/logout.
*   **API Routes:** `src/routes/api/auth/$.ts` is the catch-all handler for auth-related requests (callback, login, session).

### Middleware Pipeline
*   **Routing Middleware:** TanStack Router's `beforeLoad` executes logic before rendering a route.
*   **Interception Logic:**
    1.  **Root Check:** `__root.tsx` attempts to fetch the user session.
    2.  **Protected Group:** `_authed.tsx` intercepts calls to any route under its hierarchy.
    3.  **Status Guard:** `_authed.tsx` checks `user.account_status`. If `new`, it redirects to `complete-registration`; if `waitlisted`, it redirects to the waitlist page.

---

## 5. Routing & Route Protection

### Route Structure
*   **File-Based:** `src/routes/` uses directory-based segments.
*   **Path Notation:**
    *   `_authed/`: A pathless route group used for layout sharing and protection.
    *   `dashboard/`: Admin and user modules.
    *   `api/`: Dedicated backend-only endpoints (e.g., email webhooks, notification streams).

### Protection Mechanisms
*   **The Auth Guard:** `src/routes/_authed.tsx` is the primary security gate.
    ```typescript
    // Example logic from _authed.tsx
    beforeLoad: async ({ context, location }) => {
      const { user } = context
      if (!user) {
        throw redirect({ to: '/login', search: { redirect: location.href } })
      }
    }
    ```
*   **Context Propagation:** The `MyRouterContext` interface (defined in `src/types/router.ts`) ensures that the `user` object is type-safely available in every protected component via `Route.useRouteContext()`.
