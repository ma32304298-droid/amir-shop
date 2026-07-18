# Amir Shop — Gaming Top-Up Website

A professional gaming top-up platform supporting Arabic and English, with a dark gaming aesthetic. Players can browse games, purchase top-up packages, upload payment proofs, and track their orders. Admins manage the entire catalog and order pipeline.

## Run & Operate

- `pnpm --filter @workspace/amir-shop run dev` — run the frontend (port from $PORT)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, shadcn/ui, Framer Motion
- Backend: Supabase (database + storage)
- i18n: i18next with Arabic (RTL) and English
- Routing: Wouter

## Where Things Live

- `artifacts/amir-shop/src/pages/` — all page components
- `artifacts/amir-shop/src/components/` — shared components
- `artifacts/amir-shop/src/lib/supabase.ts` — Supabase client
- `artifacts/amir-shop/src/lib/database.types.ts` — TypeScript types for DB tables
- `artifacts/amir-shop/src/lib/i18n.ts` — all translation strings (EN + AR)
- `artifacts/amir-shop/supabase-setup.sql` — SQL to run in Supabase dashboard

## Supabase Setup (one-time)

1. Open your Supabase project → SQL Editor
2. Run the contents of `artifacts/amir-shop/supabase-setup.sql`
3. This creates: `games`, `packages`, `orders` tables + storage bucket `payment-proofs` + seed data

## Environment Variables

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase publishable/anon key

## Admin Access

- URL: `/admin`
- Password: `admin123`
- Routes: `/admin/dashboard`, `/admin/games`, `/admin/packages`, `/admin/orders`

## Architecture Decisions

- Supabase client is used directly from the frontend (no Express API needed for data)
- Arabic RTL is applied via `document.documentElement.dir = 'rtl'` on language switch
- Admin auth is a simple localStorage flag (`amir_admin_auth = "true"`) — upgrade to Supabase Auth for production
- Payment proof files go to Supabase Storage bucket `payment-proofs`
- Order lookup works by email OR player ID via Supabase `.or()` query

## User Preferences

- Dark professional gaming theme
- Arabic and English support (RTL/LTR)
- Supabase as the sole data backend
