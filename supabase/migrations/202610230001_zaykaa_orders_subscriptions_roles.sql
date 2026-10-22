-- Additive ZAYKAA ordering, role and subscription schema. Existing catalogue tables are preserved.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','restaurant_owner','customer')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  primary key (user_id, role)
);
alter table public.user_roles enable row level security;
drop policy if exists "Users can read their own roles" on public.user_roles;
create policy "Users can read their own roles" on public.user_roles for select to authenticated using ((select auth.uid()) = user_id);

create or replace function private.has_role(target_role text)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = target_role); $$;
revoke all on function private.has_role(text) from public, anon;
grant execute on function private.has_role(text) to authenticated;

create table if not exists public.subscription_plans (
 id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
 description text, price_paise bigint not null check (price_paise >= 0),
 billing_interval text not null default 'month' check (billing_interval in ('month','year')),
 features jsonb not null default '[]'::jsonb, is_active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.subscription_plans enable row level security;
drop policy if exists "Active plans are public" on public.subscription_plans;
create policy "Active plans are public" on public.subscription_plans for select to anon, authenticated using (is_active or private.has_role('admin'));
drop policy if exists "Admins manage subscription plans" on public.subscription_plans;
create policy "Admins manage subscription plans" on public.subscription_plans for all to authenticated using (private.has_role('admin')) with check (private.has_role('admin'));

create table if not exists public.restaurant_subscriptions (
 id uuid primary key default gen_random_uuid(),
 restaurant_id uuid not null references public.restaurants(id) on delete cascade,
 plan_id uuid not null references public.subscription_plans(id) on delete restrict,
 status text not null default 'trialing' check (status in ('trialing','active','past_due','expired','cancelled','suspended')),
 starts_at timestamptz not null default now(), expires_at timestamptz, cancelled_at timestamptz,
 grace_period_ends_at timestamptz, auto_renew boolean not null default false,
 amount_paid_paise bigint not null default 0 check (amount_paid_paise >= 0),
 currency text not null default 'INR' check (currency = 'INR'), payment_reference text,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check (expires_at is null or expires_at > starts_at)
);
create index if not exists restaurant_subscriptions_restaurant_status_idx on public.restaurant_subscriptions (restaurant_id,status,expires_at desc);
alter table public.restaurant_subscriptions enable row level security;
drop policy if exists "Owners and admins view restaurant subscriptions" on public.restaurant_subscriptions;
create policy "Owners and admins view restaurant subscriptions" on public.restaurant_subscriptions for select to authenticated using (
 private.has_role('admin') or exists (select 1 from public.restaurant_owner_accounts roa where roa.restaurant_id=restaurant_subscriptions.restaurant_id and roa.user_id=(select auth.uid()) and roa.status='active')
);
drop policy if exists "Admins manage restaurant subscriptions" on public.restaurant_subscriptions;
create policy "Admins manage restaurant subscriptions" on public.restaurant_subscriptions for all to authenticated using (private.has_role('admin')) with check (private.has_role('admin'));

create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(),
 order_number text not null unique default ('ZYK-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
 customer_id uuid not null references auth.users(id) on delete restrict,
 restaurant_id uuid not null references public.restaurants(id) on delete restrict,
 address_id uuid references public.customer_addresses(id) on delete set null,
 address_snapshot jsonb not null,
 status text not null default 'placed' check (status in ('placed','accepted','preparing','ready','out_for_delivery','delivered','cancelled','rejected')),
 payment_method text not null check (payment_method in ('cod','upi')),
 payment_status text not null default 'pending' check (payment_status in ('pending','initiated','paid','failed','refunded','partially_refunded')),
 currency text not null default 'INR' check (currency='INR'),
 subtotal_paise bigint not null check (subtotal_paise>=0), discount_paise bigint not null default 0 check (discount_paise>=0),
 delivery_fee_paise bigint not null default 0 check (delivery_fee_paise>=0), tax_paise bigint not null default 0 check (tax_paise>=0),
 total_paise bigint not null check (total_paise>=0), customer_notes text,
 accepted_at timestamptz, preparing_at timestamptz, ready_at timestamptz, out_for_delivery_at timestamptz,
 delivered_at timestamptz, cancelled_at timestamptz, cancellation_reason text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check (total_paise = subtotal_paise - discount_paise + delivery_fee_paise + tax_paise),
 check (discount_paise <= subtotal_paise)
);
create index if not exists orders_customer_created_idx on public.orders(customer_id,created_at desc);
create index if not exists orders_restaurant_status_created_idx on public.orders(restaurant_id,status,created_at desc);
create index if not exists orders_payment_status_idx on public.orders(payment_status,created_at desc);
alter table public.orders enable row level security;
drop policy if exists "Participants view orders" on public.orders;
create policy "Participants view orders" on public.orders for select to authenticated using (
 customer_id=(select auth.uid()) or private.has_role('admin') or exists (
  select 1 from public.restaurant_owner_accounts roa where roa.restaurant_id=orders.restaurant_id and roa.user_id=(select auth.uid()) and roa.status='active'
 )
);
drop policy if exists "Customers create their own orders" on public.orders;
create policy "Customers create their own orders" on public.orders for insert to authenticated with check (customer_id=(select auth.uid()));
drop policy if exists "Owners and admins update orders" on public.orders;
create policy "Owners and admins update orders" on public.orders for update to authenticated using (
 private.has_role('admin') or exists (select 1 from public.restaurant_owner_accounts roa where roa.restaurant_id=orders.restaurant_id and roa.user_id=(select auth.uid()) and roa.status='active')
) with check (
 private.has_role('admin') or exists (select 1 from public.restaurant_owner_accounts roa where roa.restaurant_id=orders.restaurant_id and roa.user_id=(select auth.uid()) and roa.status='active')
);

create table if not exists public.order_items (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
 menu_item_id uuid references public.menu_items(id) on delete set null,
 variant_id uuid references public.menu_item_variants(id) on delete set null,
 item_name_snapshot text not null, variant_name_snapshot text,
 unit_price_paise bigint not null check (unit_price_paise>=0), quantity integer not null check (quantity between 1 and 50),
 line_total_paise bigint generated always as (unit_price_paise*quantity) stored,
 special_instructions text, created_at timestamptz not null default now()
);
create index if not exists order_items_order_idx on public.order_items(order_id);
alter table public.order_items enable row level security;
drop policy if exists "Participants view order items" on public.order_items;
create policy "Participants view order items" on public.order_items for select to authenticated using (
 exists (select 1 from public.orders o where o.id=order_items.order_id and (
  o.customer_id=(select auth.uid()) or private.has_role('admin') or exists (
   select 1 from public.restaurant_owner_accounts roa where roa.restaurant_id=o.restaurant_id and roa.user_id=(select auth.uid()) and roa.status='active'
  )
 ))
);
-- No client write policy: trusted checkout must validate live menu prices before writing item snapshots.

create table if not exists public.payments (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete restrict,
 method text not null check (method in ('cod','upi')),
 status text not null default 'pending' check (status in ('pending','initiated','paid','failed','refunded','partially_refunded')),
 amount_paise bigint not null check (amount_paise>=0), currency text not null default 'INR' check (currency='INR'),
 provider text, provider_payment_id text, upi_transaction_reference text, failure_reason text,
 initiated_at timestamptz, paid_at timestamptz, refunded_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique (provider,provider_payment_id)
);
create index if not exists payments_order_created_idx on public.payments(order_id,created_at desc);
alter table public.payments enable row level security;
drop policy if exists "Participants view payments" on public.payments;
create policy "Participants view payments" on public.payments for select to authenticated using (
 exists (select 1 from public.orders o where o.id=payments.order_id and (
  o.customer_id=(select auth.uid()) or private.has_role('admin') or exists (
   select 1 from public.restaurant_owner_accounts roa where roa.restaurant_id=o.restaurant_id and roa.user_id=(select auth.uid()) and roa.status='active'
  )
 ))
);
-- Payment writes remain server-only; provider webhooks must verify signatures and be idempotent.

create table if not exists public.order_status_history (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
 from_status text check (from_status is null or from_status in ('placed','accepted','preparing','ready','out_for_delivery','delivered','cancelled','rejected')),
 to_status text not null check (to_status in ('placed','accepted','preparing','ready','out_for_delivery','delivered','cancelled','rejected')),
 changed_by uuid references auth.users(id) on delete set null,
 actor_role text check (actor_role is null or actor_role in ('admin','restaurant_owner','customer','system')),
 note text, created_at timestamptz not null default now()
);
create index if not exists order_status_history_order_created_idx on public.order_status_history(order_id,created_at desc);
alter table public.order_status_history enable row level security;
drop policy if exists "Participants view status history" on public.order_status_history;
create policy "Participants view status history" on public.order_status_history for select to authenticated using (
 exists (select 1 from public.orders o where o.id=order_status_history.order_id and (
  o.customer_id=(select auth.uid()) or private.has_role('admin') or exists (
   select 1 from public.restaurant_owner_accounts roa where roa.restaurant_id=o.restaurant_id and roa.user_id=(select auth.uid()) and roa.status='active'
  )
 ))
);

grant select on public.subscription_plans to anon, authenticated;
grant select on public.restaurant_subscriptions,public.orders,public.order_items,public.payments,public.order_status_history,public.user_roles to authenticated;
grant insert,update on public.orders to authenticated;
comment on table public.orders is 'Money is stored in integer paise. Checkout must calculate totals from current menu prices on a trusted server.';
comment on table public.order_items is 'Historical item labels and prices are snapshots; direct client writes are intentionally not enabled.';
comment on table public.payments is 'Payment state writes are server-only and must be idempotent.';
comment on table public.user_roles is 'Role assignment is administrative; users can read only their own roles.';
