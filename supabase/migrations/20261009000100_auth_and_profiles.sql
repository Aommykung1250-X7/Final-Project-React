create extension if not exists pgcrypto with schema extensions;

create table public.accounts (
  id uuid primary key default extensions.gen_random_uuid(),
  email text not null unique check (email = lower(trim(email))),
  password_hash text not null,
  role text not null check (role in ('student', 'tutor')),
  created_at timestamptz not null default now()
);

create table public.profiles (
  user_id uuid primary key references public.accounts(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 80),
  avatar_url text,
  updated_at timestamptz not null default now()
);

create table public.tutor_profiles (
  user_id uuid primary key references public.accounts(id) on delete cascade,
  bio text not null check (char_length(trim(bio)) between 1 and 2000),
  subjects text[] not null check (cardinality(subjects) > 0),
  levels text[] not null check (cardinality(levels) > 0),
  price_per_hour integer not null check (price_per_hour between 0 and 100000),
  teaching_mode text not null check (char_length(trim(teaching_mode)) between 1 and 80),
  province text not null check (char_length(trim(province)) between 1 and 100),
  photo_url text,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  token_hash text not null unique check (length(token_hash) = 64),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index sessions_account_active_idx on public.sessions(account_id, expires_at) where revoked_at is null;

create table public.login_attempts (
  email_key text not null,
  ip_key text not null,
  attempts integer not null default 0,
  window_started_at timestamptz not null default now(),
  locked_until timestamptz,
  primary key(email_key, ip_key)
);

create or replace function public.is_active_tutor(p_user_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.tutor_profiles tp
    where tp.user_id = p_user_id and tp.is_active = true
  );
$$;

create or replace function public.register_account(
  p_email text,
  p_password_hash text,
  p_role text,
  p_display_name text,
  p_tutor_profile jsonb default null
)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  new_user_id uuid;
  tutor_subjects text[];
  tutor_levels text[];
begin
  if p_role not in ('student', 'tutor') then
    raise exception using errcode = '22023', message = 'Invalid account role';
  end if;

  if p_role = 'tutor' and p_tutor_profile is null then
    raise exception using errcode = '22023', message = 'Tutor profile is required';
  end if;

  insert into public.accounts(email, password_hash, role)
  values (lower(trim(p_email)), p_password_hash, p_role)
  returning id into new_user_id;

  insert into public.profiles(user_id, display_name)
  values (new_user_id, trim(p_display_name));

  if p_role = 'tutor' then
    select array_agg(value) into tutor_subjects
    from jsonb_array_elements_text(coalesce(p_tutor_profile -> 'subjects', '[]'::jsonb)) as e(value);
    select array_agg(value) into tutor_levels
    from jsonb_array_elements_text(coalesce(p_tutor_profile -> 'levels', '[]'::jsonb)) as e(value);

    insert into public.tutor_profiles(
      user_id, bio, subjects, levels, price_per_hour, teaching_mode, province, photo_url
    ) values (
      new_user_id,
      trim(p_tutor_profile ->> 'bio'),
      coalesce(tutor_subjects, '{}'::text[]),
      coalesce(tutor_levels, '{}'::text[]),
      (p_tutor_profile ->> 'pricePerHour')::integer,
      trim(p_tutor_profile ->> 'mode'),
      trim(p_tutor_profile ->> 'province'),
      nullif(trim(p_tutor_profile ->> 'photo'), '')
    );
  end if;

  return new_user_id;
end;
$$;

create or replace function public.record_login_failure(p_email_key text, p_ip_key text)
returns timestamptz
language plpgsql security definer
set search_path = ''
as $$
declare
  new_attempts integer;
  new_window timestamptz;
  lock_until timestamptz;
begin
  insert into public.login_attempts(email_key, ip_key, attempts, window_started_at)
  values (p_email_key, p_ip_key, 1, now())
  on conflict (email_key, ip_key) do update
    set attempts = case
          when public.login_attempts.window_started_at < now() - interval '15 minutes' then 1
          else public.login_attempts.attempts + 1
        end,
        window_started_at = case
          when public.login_attempts.window_started_at < now() - interval '15 minutes' then now()
          else public.login_attempts.window_started_at
        end,
        locked_until = case
          when public.login_attempts.window_started_at < now() - interval '15 minutes' then null
          when public.login_attempts.attempts + 1 >= 5 then now() + interval '15 minutes'
          else public.login_attempts.locked_until
        end
  returning attempts, window_started_at, locked_until into new_attempts, new_window, lock_until;

  if new_attempts >= 5 and (lock_until is null or lock_until < now()) then
    lock_until := now() + interval '15 minutes';
    update public.login_attempts
      set locked_until = lock_until
      where email_key = p_email_key and ip_key = p_ip_key;
  end if;

  return lock_until;
end;
$$;

revoke all on function public.register_account(text, text, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.record_login_failure(text, text) from public, anon, authenticated;
revoke all on function public.is_active_tutor(uuid) from public, anon;
grant execute on function public.register_account(text, text, text, text, jsonb) to service_role;
grant execute on function public.record_login_failure(text, text) to service_role;
grant execute on function public.is_active_tutor(uuid) to authenticated;

alter table public.accounts enable row level security;
alter table public.sessions enable row level security;
alter table public.login_attempts enable row level security;
alter table public.profiles enable row level security;
alter table public.tutor_profiles enable row level security;

revoke all on public.accounts, public.sessions, public.login_attempts from anon, authenticated;
revoke all on public.profiles, public.tutor_profiles from anon, authenticated;
grant select on public.profiles, public.tutor_profiles to authenticated;
grant update (display_name, avatar_url, updated_at) on public.profiles to authenticated;
grant update (bio, subjects, levels, price_per_hour, teaching_mode, province, photo_url, updated_at) on public.tutor_profiles to authenticated;

create policy "users can view their own profile" on public.profiles
  for select to authenticated using (user_id = auth.uid());
create policy "students can view active tutor profiles" on public.profiles
  for select to authenticated using (
    (auth.jwt() ->> 'app_role') = 'student' and public.is_active_tutor(user_id)
  );
create policy "users can update their own profile" on public.profiles
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "students and tutors can view permitted tutor profiles" on public.tutor_profiles
  for select to authenticated using (
    user_id = auth.uid()
    or ((auth.jwt() ->> 'app_role') = 'student' and is_active = true)
  );
create policy "tutors can update their own listing" on public.tutor_profiles
  for update to authenticated using (
    user_id = auth.uid() and (auth.jwt() ->> 'app_role') = 'tutor'
  ) with check (
    user_id = auth.uid() and (auth.jwt() ->> 'app_role') = 'tutor'
  );
