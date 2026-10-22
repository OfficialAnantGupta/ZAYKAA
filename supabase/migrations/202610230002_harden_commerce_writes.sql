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

comment on table public.orders is 'Commerce reads are RLS-protected. Writes remain server-only until a trusted checkout/workflow RPC validates prices and state transitions.';
