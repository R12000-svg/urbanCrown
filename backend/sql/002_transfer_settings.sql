create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  payment_method text not null default 'transfer',
  bank_name text not null default '',
  account_holder text not null default '',
  account_rut text not null default '',
  account_type text not null default 'Cuenta corriente',
  account_number text not null default '',
  payment_email text not null default '',
  payment_instructions text not null default 'Transfiere el total de tu pedido e indica el numero de pedido en el mensaje.',
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.orders
  add column if not exists payment_method text not null default 'transfer';

alter table public.store_settings enable row level security;

drop policy if exists "Public can read store payment settings" on public.store_settings;
create policy "Public can read store payment settings"
  on public.store_settings for select
  using (true);

create or replace function public.set_store_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists store_settings_updated_at on public.store_settings;
create trigger store_settings_updated_at
before update on public.store_settings
for each row execute function public.set_store_settings_updated_at();
