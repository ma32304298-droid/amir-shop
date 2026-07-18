---
name: Amir Shop — Real Supabase Schema
description: Actual column names discovered by probing the live Supabase project. Use this whenever writing queries.
---

## games
| Column | Type | Notes |
|--------|------|-------|
| id | int | PK |
| name | text | |
| active | bool | NOT is_active |
| image | text\|null | NOT image_url |
| created_at | timestamptz | |

No slug, no name_ar, no description, no description_ar.

## packages
| Column | Type | Notes |
|--------|------|-------|
| id | int | PK |
| game_id | int | FK → games.id |
| name | text | |
| amount | text | e.g. "60+3" |
| price | numeric | |
| currency | text | |
| active | bool | NOT is_active |
| description | text\|null | |
| created_at | timestamptz | |

No name_ar.

## orders
| Column | Type | Notes |
|--------|------|-------|
| id | int | PK |
| user_id | text | player's in-game ID (NOT auth UUID) |
| game_id | int | FK → games.id |
| package_id | int | FK → packages.id |
| status | text | pending/processing/completed/cancelled |
| currency | text | |
| notes | text\|null | NOT admin_notes |
| whatsapp | text\|null | customer contact |
| created_at | timestamptz | |
| updated_at | timestamptz | |

No player_email, no player_username, no total_price, no payment_proof_url.

**Why:** The user's pre-existing Supabase project used simpler, shorter column names without Arabic bilingual columns and without a price field on orders (price is on the packages table).

**How to apply:** Always use these exact column names. Routing uses game.id not game.slug. Order search uses user_id or whatsapp, not player_id/player_email.
