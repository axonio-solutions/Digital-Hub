# Integrations

## Backend Services
- **Database:** PostgreSQL (using `pg` and `postgres` drivers via Drizzle ORM). Database hosting/sync configured with Supabase.
- **Authentication:** Better Auth (`better-auth`) and Supabase Auth (`@supabase/supabase-js`, `@supabase/ssr`).

## Third-Party APIs
- **Email & Communications:** Resend (`resend`, `@react-email/components`)
- **Hosting & Deployment:** Netlify (legacy/current, via `@netlify/vite-plugin-tanstack-start`), migrating to Cloudflare as per recent session goals.

## Telemetry / Analytics
- *Core system metrics:* `web-vitals`
