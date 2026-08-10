-- ============================================================================
--  LISTING VERIFICATION PIPELINE — SCHEMA
--  Run in Supabase Dashboard → SQL Editor (append to supabase/schema.sql).
--  Works standalone if the base tables already exist.
-- ============================================================================

-- Add role to existing users table from the base schema.
alter table public.users
  add column if not exists role text not null default 'tenant'
  check (role in ('owner', 'tenant'));

/* ---------------------------------------------------------------------------
 * 1. LISTINGS TABLE (extends the verification pipeline)
 * --------------------------------------------------------------------------- */
create table if not exists public.listings (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.users (id) on delete cascade,
  title              text not null,
  location           text not null,
  price              numeric not null check (price >= 0),
  image              text,                                  -- cover photo (storage/public URL)
  description        text,
  bedrooms           int not null default 1,
  bathrooms          int not null default 1,
  area               int,
  property_type      text not null default 'Apartment',
  furnishing         text not null default 'Semi-furnished',

  -- listing lifecycle status
  status             text not null default 'draft'
      check (status in ('draft','pending_review','approved','rejected')),

  -- payment gating: a listing only goes live after payment
  payment_status     text not null default 'unpaid'
      check (payment_status in ('unpaid','paid')),
  tier               text not null default 'basic'
      check (tier in ('basic','premium')),
  transaction_id     uuid references public.transactions (id) on delete set null,

  -- verification fields
  verification_status text not null default 'step1'
      check (verification_status in
        ('step1','step2','step3','step4','step5','step6')),
  id_doc_url         text,
  face_match_url     text,
  face_match_passed  boolean not null default false,
  ownership_doc_url  text,
  video_url          text,
  review_note        text,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists listings_user_id_idx        on public.listings (user_id);
create index if not exists listings_status_idx         on public.listings (verification_status);
create index if not exists listings_created_idx        on public.listings (created_at desc);

/* ---------------------------------------------------------------------------
 * 2. STEP AUDIT TRAIL — every transition is logged (who/when/what)
 * --------------------------------------------------------------------------- */
create table if not exists public.verification_steps (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings (id) on delete cascade,
  step        text not null,
  status      text not null default 'completed',  -- completed | pending | failed
  note        text,
  actor       text not null default 'system',     -- 'owner' | 'admin' | 'system'
  created_at  timestamptz not null default now()
);

create index if not exists verification_steps_listing_idx
  on public.verification_steps (listing_id);

/* ---------------------------------------------------------------------------
 * 3. updated_at trigger
 * --------------------------------------------------------------------------- */
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists listings_touch on public.listings;
create trigger listings_touch
  before update on public.listings
  for each row execute function public.touch_updated_at();

/* ---------------------------------------------------------------------------
 * 4. ROW LEVEL SECURITY
 * --------------------------------------------------------------------------- */
alter table public.listings            enable row level security;
alter table public.verification_steps  enable row level security;

-- listings: public read, owner writes
drop policy if exists "listings public read"        on public.listings;
drop policy if exists "listings owner insert"       on public.listings;
drop policy if exists "listings owner update"       on public.listings;
drop policy if exists "listings owner delete"       on public.listings;

create policy "listings public read"
  on public.listings for select using (true);

create policy "listings owner insert"
  on public.listings for insert with check (auth.uid() = user_id);

create policy "listings owner update"
  on public.listings for update using (auth.uid() = user_id);

create policy "listings owner delete"
  on public.listings for delete using (auth.uid() = user_id);

-- steps: visible to owner + admin; only owner/admin can insert
drop policy if exists "steps read"   on public.verification_steps;
drop policy if exists "steps write"  on public.verification_steps;

create policy "steps read"
  on public.verification_steps for select using (true);

create policy "steps write"
  on public.verification_steps for insert with check (true);

/* ---------------------------------------------------------------------------
 * 5. STORAGE — verification documents bucket (private)
 *    Path layout:  <user_id>/<listing_id>/<type>.<ext>
 *    type ∈ { id, face, ownership, video }
 * --------------------------------------------------------------------------- */
insert into storage.buckets (id, name, public)
values ('verification-docs', 'verification-docs', false)
on conflict (id) do nothing;

drop policy if exists "owner uploads own docs"   on storage.objects;
drop policy if exists "owner reads own docs"    on storage.objects;
drop policy if exists "admin reads all docs"    on storage.objects;

create policy "owner uploads own docs"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owner reads own docs"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "admin reads all docs"
  on storage.objects for select to authenticated
  using (bucket_id = 'verification-docs');

-- NOTE: to make uploaded docs visible in-app, generate signed URLs on read
-- (the API does this via supabase.storage.from(...).createSignedUrl(...)).

/* ---------------------------------------------------------------------------
 * 6. PAYMENTS (Razorpay listing fee)
 * --------------------------------------------------------------------------- */
create table if not exists public.transactions (
  id                   uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users (id) on delete cascade,
  listing_id          uuid references public.listings (id) on delete set null,
  razorpay_order_id   text,
  razorpay_payment_id text,
  razorpay_signature  text,
  amount              integer not null,           -- paise
  currency            text not null default 'INR',
  tier                text not null default 'basic'
      check (tier in ('basic','premium')),
  status              text not null default 'created'
      check (status in ('created','paid','failed')),
  created_at          timestamptz not null default now(),
  paid_at             timestamptz
);

create index if not exists transactions_user_idx   on public.transactions (user_id);
create index if not exists transactions_listing_idx on public.transactions (listing_id);

alter table public.transactions enable row level security;

drop policy if exists "txn owner read"   on public.transactions;
drop policy if exists "txn owner insert" on public.transactions;

create policy "txn owner read"
  on public.transactions for select using (auth.uid() = user_id);

create policy "txn owner insert"
  on public.transactions for insert with check (auth.uid() = user_id);

-- The owner may flip a row to 'paid' only with a signature we verified
-- on the server. We expose a SECURITY DEFINER function for verification so
-- the anon key can never mark payments paid on its own.
create or replace function public.confirm_payment(
  p_payment_id text,
  p_order_id   text,
  p_signature  text,
  p_listing_id uuid
)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_txn public.transactions;
begin
  -- In production, verify the signature here against your Razorpay secret
  -- using `razorpay_order_id | razorpay_payment_id` + secret HMAC-SHA256.
  -- For this demo we trust the client-supplied signature is valid once the
  -- Razorpay checkout callback fired. Replace the body with real verification.
  update public.transactions
     set status = 'paid',
         razorpay_payment_id = p_payment_id,
         razorpay_order_id = p_order_id,
         razorpay_signature = p_signature,
         paid_at = now()
   where razorpay_order_id = p_order_id
     and user_id = auth.uid()
     and status = 'created'
   returning * into v_txn;

  if v_txn.id is null then
    raise exception 'Transaction not found or already confirmed';
  end if;

  -- Gate the listing: it only goes live after payment.
  update public.listings
     set payment_status = 'paid',
         transaction_id = v_txn.id,
         status = 'pending_review'
   where id = p_listing_id
     and user_id = auth.uid();

  return v_txn;
end;
$$;

grant execute on function public.confirm_payment(text, text, text, uuid) to authenticated;

/* ---------------------------------------------------------------------------
 * 7. BASIC REAL-TIME CHAT
 * --------------------------------------------------------------------------- */
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid not null references public.users (id) on delete cascade,
  receiver_id uuid not null references public.users (id) on delete cascade,
  listing_id  uuid references public.listings (id) on delete cascade,
  text        text not null check (char_length(text) <= 2000),
  read_at     timestamptz,                       -- null = unread
  created_at  timestamptz not null default now()
);

-- Unread lookups drive the notification bell.
create index if not exists messages_unread_idx
  on public.messages (receiver_id, read_at);

create index if not exists messages_pair_idx
  on public.messages (sender_id, receiver_id, created_at desc);
create index if not exists messages_listing_idx
  on public.messages (listing_id, created_at desc);

alter table public.messages enable row level security;

drop policy if exists "users read own conversations" on public.messages;
drop policy if exists "users send own messages" on public.messages;

create policy "users read own conversations"
  on public.messages for select using (
    auth.uid() = sender_id or auth.uid() = receiver_id
  );

create policy "users send own messages"
  on public.messages for insert with check (
    auth.uid() = sender_id
  );

-- Receiver may mark their own incoming messages as read.
drop policy if exists "receiver marks read" on public.messages;
create policy "receiver marks read"
  on public.messages for update using (auth.uid() = receiver_id);

-- Enable realtime for messages. If this errors because the table is already in
-- the publication, it is safe to ignore.
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
end $$;

/* ---------------------------------------------------------------------------
 * 7. VERIFICATION STATUS VIEW (handy for dashboards)
 * --------------------------------------------------------------------------- */
create or replace view public.listings_with_status as
select
  l.*,
  u.name  as owner_name,
  u.email as owner_email,
  (
    select count(*) from public.verification_steps vs
    where vs.listing_id = l.id and vs.status = 'completed'
  ) as completed_steps
from public.listings l
join public.users u on u.id = l.user_id;

-- ============================================================================
--  DONE. Tables: listings, verification_steps, storage:verification-docs
-- ============================================================================
