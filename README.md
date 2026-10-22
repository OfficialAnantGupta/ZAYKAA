# ZAYKAA — Premium Restaurant Marketplace

A mobile-first, subscription-based food ordering platform for restaurants in India. The interface uses a light, luxury palette: Warm Ivory `#FAF6EF`, Champagne `#F1E6D4`, Royal Burgundy `#7B1E2B`, Deep Wine `#8E2B3A`, Antique Gold `#B98A3C`, Espresso Brown `#3A2E25`, Sage Green `#4F7A5B`, and Muted Slate Blue `#4A5A6A`.

## Product roles

- **Admin:** Approves, manages and suspends restaurants; reviews subscriptions, orders, categories, settings and reports.
- **Restaurant owner:** Uses an assigned Owner ID and password to manage only their restaurant's menu, availability, pricing and orders.
- **Customer:** Signs in with Google, completes their delivery profile, discovers approved restaurants, orders by COD or UPI, tracks orders and reorders.

## Implementation direction

- Next.js App Router + TypeScript + Tailwind CSS.
- Supabase Auth, PostgreSQL with Row Level Security, and Storage for restaurant/menu media.
- Vercel for previews and production deployment.
- Server-side authorization; never trust a role supplied by browser state or user-editable metadata.
- Store money as integer paise, validate order prices on the server, and enforce restaurant ownership in database policies.

## Planned modules

1. Customer storefront and shared luxury design system.
2. Authentication flows and role-safe routing.
3. Customer profile and saved delivery addresses.
4. Restaurant discovery and menu browsing.
5. Cart, checkout, COD/UPI payment states, orders and tracking.
6. Restaurant-owner workspace and order management.
7. Admin console and restaurant onboarding.
8. Subscription lifecycle, reporting and operational hardening.

## Environment

Copy `.env.example` to `.env.local` and set the Supabase project URL and publishable key. Never commit local environment files, service-role keys, OAuth secrets or payment credentials.

## Local development

Install dependencies, then run `npm run dev`. The initial app setup and scripts will be added with the first application module.

## Current backend

The connected Supabase project is `ZYKAA` and already contains restaurant/menu catalogue, owner account, customer profile/address, category and variant tables with RLS enabled. Before implementing authenticated ordering and subscriptions, add and verify those schemas in isolated migrations and review all access policies.
