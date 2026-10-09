-- Adds an optional district (อำเภอ/เขต) to tutor listings.
-- Existing tutors keep district = null and the card falls back to province.

alter table public.tutor_profiles
  add column district text check (district is null or char_length(trim(district)) between 1 and 100);

grant update (district) on public.tutor_profiles to authenticated;

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
      user_id, bio, subjects, levels, price_per_hour, teaching_mode, province, district, photo_url
    ) values (
      new_user_id,
      trim(p_tutor_profile ->> 'bio'),
      coalesce(tutor_subjects, '{}'::text[]),
      coalesce(tutor_levels, '{}'::text[]),
      (p_tutor_profile ->> 'pricePerHour')::integer,
      trim(p_tutor_profile ->> 'mode'),
      trim(p_tutor_profile ->> 'province'),
      nullif(trim(p_tutor_profile ->> 'district'), ''),
      nullif(trim(p_tutor_profile ->> 'photo'), '')
    );
  end if;

  return new_user_id;
end;
$$;
