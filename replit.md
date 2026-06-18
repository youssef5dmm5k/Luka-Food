# Luka Food — مطعم لوكا فود

A production-ready bilingual restaurant web application for "Luka Food" with a customer-facing digital menu and a kitchen/admin dashboard. Full UI in Modern Standard Arabic (RTL), dark mode, Tunisian Dinar pricing.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, React Query, Wouter

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for API contracts
- `lib/db/src/schema/` — Drizzle table definitions (categories, menuItems, orders, orderItems)
- `artifacts/api-server/src/routes/` — Express route handlers (categories, menuItems, orders, health)
- `artifacts/luka-food/src/pages/` — customer-menu.tsx (digital menu), kitchen-dashboard.tsx (admin)
- `artifacts/luka-food/src/hooks/use-cart.tsx` — client-side cart state
- `artifacts/luka-food/src/lib/helpers.ts` — price formatter, status label map

## Architecture decisions

- Arabic-first RTL UI: `lang="ar"` and `dir="rtl"` on `<html>`, Cairo font from Google Fonts.
- Dark mode forced by default: `class="dark"` on `<html>` from the start.
- All prices stored as `numeric(10,3)` in Postgres (Tunisian Dinar uses 3 decimal places) and formatted as "X.XXX د.ت".
- Kitchen dashboard polls orders and stats every 5 seconds via React Query `refetchInterval`.
- Order total is computed server-side from live menu item prices at the time of order creation.

## Product

- **Customer menu** (`/`): Browse food by category, add to cart, set table number, confirm order — payment is cash on delivery.
- **Kitchen dashboard** (`/kitchen`): Live order monitor (pending → preparing → completed), order stats bar, and menu management (add/edit/delete items and categories).

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any change to `lib/api-spec/openapi.yaml`, run codegen (`pnpm --filter @workspace/api-spec run codegen`) before touching route files.
- `numeric` columns from Drizzle return strings — always `parseFloat()` before arithmetic.
- The design subagent may write escaped backticks (`\``) in template literals inside JSX — run `sed -i 's/\\`/`/g' <file>` to fix.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
