create table public.likes (
  student_id uuid not null references public.accounts(id) on delete cascade,
  tutor_id uuid not null references public.accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (student_id, tutor_id),
  check (student_id <> tutor_id)
);
create index likes_tutor_idx on public.likes(tutor_id, created_at desc);

alter table public.likes enable row level security;
revoke all on public.likes from anon, authenticated;
grant select, insert, delete on public.likes to authenticated;

create policy "students can view their own likes" on public.likes
  for select to authenticated using (
    student_id = auth.uid() and (auth.jwt() ->> 'app_role') = 'student'
  );
create policy "students can like active tutors" on public.likes
  for insert to authenticated with check (
    student_id = auth.uid()
    and (auth.jwt() ->> 'app_role') = 'student'
    and public.is_active_tutor(tutor_id)
  );
create policy "students can remove their own likes" on public.likes
  for delete to authenticated using (
    student_id = auth.uid() and (auth.jwt() ->> 'app_role') = 'student'
  );
