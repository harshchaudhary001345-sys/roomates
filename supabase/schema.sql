-- ============================================================================
--  NISHU OS / KEYLESS — SUPABASE SCHEMA
--  Run this ONCE in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";


-- ---------------------------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------------------------

-- 1.1  users  (public profile mirror of auth.users)
create table if not exists public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text,
  email      text unique,
  role       text not null default 'tenant' check (role in ('owner', 'tenant')),
  avatar_url text,
  phone      text,
  created_at timestamptz not null default now()
);

-- 1.2  properties
create table if not exists public.properties (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  price       numeric     not null check (price >= 0),
  location    text        not null,
  image       text,                       -- public URL from Supabase Storage
  description text,
  bedrooms    int         not null default 1,
  bathrooms   int         not null default 1,
  area        int,                        -- sq ft
  property_type text      not null default 'Apartment',
  furnishing  text        not null default 'Semi-furnished',
  available   boolean     not null default true,
  verified    boolean     not null default false,
  user_id     uuid        not null references public.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists properties_user_id_idx  on public.properties (user_id);
create index if not exists properties_created_idx  on public.properties (created_at desc);

-- 1.3  bookings
create table if not exists public.bookings (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid        not null references public.properties (id) on delete cascade,
  user_id     uuid        not null references public.users (id) on delete cascade,
  date        date        not null,
  message     text,
  status      text        not null default 'pending'
              check (status in ('pending', 'confirmed', 'cancelled')),
  created_at  timestamptz not null default now()
);

create index if not exists bookings_user_id_idx     on public.bookings (user_id);
create index if not exists bookings_property_id_idx on public.bookings (property_id);


-- ---------------------------------------------------------------------------
-- 2. AUTO-CREATE A PROFILE ROW WHENEVER SOMEONE SIGNS UP
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'tenant')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.users      enable row level security;
alter table public.properties enable row level security;
alter table public.bookings   enable row level security;

-- 3.1  users -----------------------------------------------------------------
drop policy if exists "profiles are public"        on public.users;
drop policy if exists "users update own profile"   on public.users;
drop policy if exists "users insert own profile"   on public.users;

create policy "profiles are public"
  on public.users for select using (true);

create policy "users insert own profile"
  on public.users for insert with check (auth.uid() = id);

create policy "users update own profile"
  on public.users for update using (auth.uid() = id);

-- 3.2  properties ------------------------------------------------------------
drop policy if exists "properties are public"      on public.properties;
drop policy if exists "owners insert properties"   on public.properties;
drop policy if exists "owners update properties"   on public.properties;
drop policy if exists "owners delete properties"   on public.properties;

create policy "properties are public"
  on public.properties for select using (true);

create policy "owners insert properties"
  on public.properties for insert with check (auth.uid() = user_id);

create policy "owners update properties"
  on public.properties for update using (auth.uid() = user_id);

create policy "owners delete properties"
  on public.properties for delete using (auth.uid() = user_id);

-- 3.3  bookings --------------------------------------------------------------
-- A booking is visible to the tenant who made it AND to the property owner.
drop policy if exists "tenant or owner reads booking" on public.bookings;
drop policy if exists "tenant creates booking"        on public.bookings;
drop policy if exists "tenant or owner updates"       on public.bookings;
drop policy if exists "tenant deletes own booking"    on public.bookings;

create policy "tenant or owner reads booking"
  on public.bookings for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.properties p
      where p.id = bookings.property_id and p.user_id = auth.uid()
    )
  );

create policy "tenant creates booking"
  on public.bookings for insert with check (auth.uid() = user_id);

create policy "tenant or owner updates"
  on public.bookings for update using (
    auth.uid() = user_id
    or exists (
      select 1 from public.properties p
      where p.id = bookings.property_id and p.user_id = auth.uid()
    )
  );

create policy "tenant deletes own booking"
  on public.bookings for delete using (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- 4. STORAGE BUCKET FOR PROPERTY IMAGES
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

drop policy if exists "property images are public"    on storage.objects;
drop policy if exists "authenticated can upload"      on storage.objects;
drop policy if exists "owners can update own images"  on storage.objects;
drop policy if exists "owners can delete own images"  on storage.objects;

create policy "property images are public"
  on storage.objects for select
  using (bucket_id = 'property-images');

-- files are stored at:  property-images/<auth.uid()>/<filename>
create policy "authenticated can upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owners can update own images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owners can delete own images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ---------------------------------------------------------------------------
-- 5. HANDY VIEW (properties joined with owner name) — optional
-- ---------------------------------------------------------------------------
create or replace view public.properties_with_owner as
select
  p.*,
  u.name  as owner_name,
  u.email as owner_email
from public.properties p
join public.users u on u.id = p.user_id;

-- ============================================================================
--  DONE. Your database is ready.
-- ============================================================================
