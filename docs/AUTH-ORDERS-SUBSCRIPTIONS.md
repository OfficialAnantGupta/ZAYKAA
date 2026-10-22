# ZAYKAA auth, ordering and subscriptions

This additive migration preserves the existing `restaurants`, `menu_items`, `menu_categories`, `menu_item_variants`, `restaurant_owner_accounts`, `customer_profiles` and `customer_addresses` tables.

## Login rules

- **Customers:** Google OAuth through Supabase Auth; no ZAYKAA password.
- **Admin:** Supabase Auth email/password for `anantbps@gmail.com`. The email alone does not confer admin rights; an administrator must explicitly assign the `admin` row in `user_roles`.
- **Restaurant owners:** unique Owner ID + preset password. Server-side lookup resolves the Owner ID to the existing `restaurant_owner_accounts.contact_email` identity. Owners never see or enter that email. The account must be `active`.
- **No MFA, OTP, or second factor.** Do not store preset passwords in database columns; Supabase Auth stores password hashes.

## Environment

Browser-safe:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Server-only for Owner ID resolution and trusted provisioning:
- `SUPABASE_SERVICE_ROLE_KEY` (or the current project secret key). Never use a `NEXT_PUBLIC_` prefix and never commit the value.

## Supabase setup before testing

1. Enable Google in Supabase Dashboard → Authentication → Providers. Add Google OAuth client ID/secret and configure the Supabase callback URL in Google Cloud.
2. In Auth → URL Configuration, set Site URL and allow the deployed `/auth/callback` URL plus local development URL.
3. Ensure the admin Auth user exists for `anantbps@gmail.com` and set its password through Supabase Auth/dashboard.
4. Assign the admin role from the trusted SQL editor after verifying the user's Auth record:
   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'admin' from auth.users
   where lower(email) = lower('anantbps@gmail.com')
   on conflict (user_id, role) do nothing;
   ```
5. For each approved owner, create a Supabase Auth user whose email matches `restaurant_owner_accounts.contact_email`, issue a strong preset password out-of-band, link `restaurant_owner_accounts.user_id` to that Auth user, set a unique `owner_login_id`, and set status to `active`. Grant `restaurant_owner` in `user_roles` only after verifying the relationship. Do not create a public owner signup route.
6. Apply `supabase/migrations/202610230001_zaykaa_orders_subscriptions_roles.sql` using your migration workflow. Review RLS and run Supabase advisors.

## Data model and security

- Prices and totals use integer paise; currency is INR.
- Orders retain address and item-name/price snapshots.
- The migration intentionally does not grant direct client writes to `order_items`, `payments` or `order_status_history`. Production checkout must validate current menu and variant prices on a trusted server/RPC and write the order transactionally. Payment updates must come from verified, idempotent provider webhooks.
- Subscription lifecycle records are represented, but automatic billing/renewals/expiry enforcement require a provider-specific scheduled job before paid subscriptions are production-ready.
- Existing policies on catalogue/customer tables are not replaced by this migration; audit them independently.

## Validation boundary

The PR adds the schema migration and sign-in entry points. It does not claim Google OAuth credentials, owner Auth users, admin role assignment, payment-provider integration, subscription billing, or production deployment have been configured. Configure the secrets and provider settings, apply the migration, then run build/typecheck and end-to-end checks.
