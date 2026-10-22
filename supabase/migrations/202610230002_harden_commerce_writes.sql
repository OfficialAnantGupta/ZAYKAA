-- Keep commerce writes server-controlled until trusted checkout and workflow RPCs are deployed.
-- The earlier schema migration creates the tables and read policies; this migration removes unsafe direct client mutation paths.
drop policy if exists "Customers create their own orders" on public.orders;
drop policy if exists "Owners and admins update orders" on public.orders;
revoke insert, update, delete on public.orders from anon, authenticated;
grant select on public.orders to authenticated;

revoke insert, update, delete on public.order_items from anon, authenticated;
grant select on public.order_items to authenticated;

revoke insert, update, delete on public.payments from anon, authenticated;
grant select on public.payments to authenticated;

revoke insert, update, delete on public.order_status_history from anon, authenticated;
grant select on public.order_status_history to authenticated;

-- Keep the public plan policy independent of the private role-check function.
drop policy if exists "Active plans are public" on public.subscription_plans;
drop policy if exists "Active plans are readable by everyone" on public.subscription_plans;
drop policy if exists "Authenticated users read active plans and admins read all" on public.subscription_plans;
create policy "Active plans are readable by everyone" on public.subscription_plans
  for select to anon using (is_active);
create policy "Authenticated users read active plans and admins read all" on public.subscription_plans
  for select to authenticated using (is_active or private.has_role('admin'));

comment on table public.orders is 'Commerce reads are RLS-protected. Writes remain server-only until a trusted checkout/workflow RPC validates prices and state transitions.';
