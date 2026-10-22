# ZAYKAA — Premium Restaurant Marketplace

A mobile-first, subscription-based restaurant ordering platform for India. The storefront uses a light luxury palette: Warm Ivory, Champagne, Royal Burgundy, Antique Gold and Espresso.

## Roles and sign-in

- **Customers:** Google sign-in through Supabase Auth.
- **Administrator:** email/password for `anantbps@gmail.com`, plus an explicit `admin` row in `user_roles`. Email alone never grants admin access.
- **Restaurant owners:** admin-issued unique Owner ID + preset password; Owner ID lookup is server-side. No MFA, OTP or second factor is included.
- **Security:** role checks use database rows, RLS protects tenant data, service-role keys remain server-only, and passwords are never stored in plaintext.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS.
- Supabase Auth, PostgreSQL, RLS and Storage.
- Vercel for deployment and GitHub for source control.
- Currency and pricing values are stored as integer paise (INR).

## Implemented foundation

- Luxury customer landing page and verified restaurant discovery.
- Customer Google sign-in entry point and OAuth callback.
- Administrator email/password sign-in with explicit role verification.
- Restaurant Owner ID/password sign-in through a server-only identity lookup.
- Role-protected admin and restaurant dashboards, including order/subscription overview placeholders.
- Additive schema migrations for role assignments, subscription plans/lifecycle, orders, order item snapshots, payments and status history.
- Hardened commerce migration keeps order-item/payment/history writes server-only until trusted checkout and payment workflows are implemented.

## Setup

1. Copy `.env.example` to `.env.local`; set the Supabase URL and publishable key.
2. Add `SUPABASE_SERVICE_ROLE_KEY` only as a server-side secret in local environment and Vercel. Never use a `NEXT_PUBLIC_` prefix for it.
3. Configure Google OAuth under Supabase Dashboard → Authentication → Providers, then allow the app's `/auth/callback` URL under Auth URL Configuration.
4. Create the admin Auth user and explicitly assign the admin role using the SQL instructions in [the auth/order/subscription setup guide](docs/AUTH-ORDERS-SUBSCRIPTIONS.md).
5. Provision owner Auth identities, link them to `restaurant_owner_accounts`, set a unique Owner ID, and assign the `restaurant_owner` role. Only approved accounts should be marked active.
6. Apply the migrations in `supabase/migrations` in order, review policies and run Supabase advisors.
7. Run `npm install`, `npm run typecheck`, `npm run lint`, and `npm run build`.

## Important production boundary

This pull request establishes the auth entry points, role checks, dashboards and commerce schema. Google credentials, owner accounts, admin role assignment and live deployment still require configuration. Checkout must be implemented as a trusted transaction that validates current menu/variant prices; UPI payment state must be updated only by verified, idempotent provider webhooks. Subscription billing, renewal collection and expiry enforcement require a provider-specific scheduled job. Existing policies on the pre-existing catalogue and profile tables should be audited independently.
