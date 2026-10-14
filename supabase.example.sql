/*
-- DumpWatch SA / Expo later backend. Do not run from the app.

-- create type public.sa_province as enum (
--   'Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo',
--   'Mpumalanga','Northern Cape','North West','Western Cape'
-- );
-- create type public.report_status as enum (
--   'open','under_review','ai_flagged','proven','prosecuted','deletion_requested','removed'
-- );
-- create type public.media_type as enum ('image','audio');
-- create type public.plate_source as enum ('ai','user','ai_confirmed_by_user');
-- create type public.delete_request_status as enum ('pending','approved','denied');

-- create table public.profiles (
--   id uuid primary key references auth.users(id) on delete cascade,
--   display_name text not null default 'Resident',
--   home_province public.sa_province,
--   balance_cents integer not null default 0,
--   created_at timestamptz not null default now(),
--   updated_at timestamptz not null default now()
-- );

-- create table public.reports (
--   id uuid primary key default gen_random_uuid(),
--   author_id uuid not null references public.profiles(id),
--   title text not null,
--   description text,
--   province public.sa_province not null,
--   location_text text,
--   lat double precision,
--   lng double precision,
--   occurred_at timestamptz not null default now(),
--   status public.report_status not null default 'open',
--   number_plate text,
--   plate_normalized text,
--   plate_confidence numeric(5,2),
--   plate_source public.plate_source,
--   plate_verified boolean not null default false,
--   deletion_requested boolean not null default false,
--   deletion_reason text,
--   created_at timestamptz not null default now()
-- );

-- create table public.report_media (
--   id uuid primary key default gen_random_uuid(),
--   report_id uuid not null references public.reports(id) on delete cascade,
--   type public.media_type not null,
--   storage_path text not null,
--   public_url text,
--   sort_order integer not null default 0,
--   is_cover boolean not null default false
-- );

-- create table public.plate_detections (
--   id uuid primary key default gen_random_uuid(),
--   report_id uuid not null references public.reports(id) on delete cascade,
--   media_id uuid references public.report_media(id) on delete set null,
--   raw_text text not null,
--   normalized text not null,
--   confidence numeric(5,2) not null,
--   bounding_box jsonb,
--   accepted boolean not null default false
-- );

-- create table public.delete_requests (
--   id uuid primary key default gen_random_uuid(),
--   report_id uuid not null references public.reports(id) on delete cascade,
--   requester_id uuid not null references public.profiles(id),
--   reason text not null,
--   status public.delete_request_status not null default 'pending'
-- );

-- create table public.reward_ledger (
--   id uuid primary key default gen_random_uuid(),
--   profile_id uuid not null references public.profiles(id),
--   report_id uuid references public.reports(id),
--   amount_cents integer not null,
--   reason text not null
-- );

-- insert into storage.buckets (id, name, public) values
--   ('report-photos','report-photos', true),
--   ('report-audio','report-audio', false);

-- RLS: public read where status <> 'removed'.
-- Authors insert their own rows. No client DELETE on reports.
*/
