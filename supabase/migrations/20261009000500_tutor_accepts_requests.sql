-- Student swipes right = request (pending). Tutor accepts = match, then chat opens.

alter table public.likes
  add column status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  add column responded_at timestamptz;

-- Likes that already have a chat were effectively matched before this change.
update public.likes l set status = 'accepted', responded_at = now()
where exists (
  select 1 from public.conversations c
  where c.student_id = l.student_id and c.tutor_id = l.tutor_id
);

create index likes_tutor_status_idx on public.likes(tutor_id, status, created_at desc);

grant update (status, responded_at) on public.likes to authenticated;

-- Students can only create pending requests.
drop policy "students can like active tutors" on public.likes;
create policy "students can like active tutors" on public.likes
  for insert to authenticated with check (
    student_id = auth.uid()
    and (auth.jwt() ->> 'app_role') = 'student'
    and status = 'pending'
    and responded_at is null
    and public.is_active_tutor(tutor_id)
  );

create policy "tutors can view requests sent to them" on public.likes
  for select to authenticated using (
    tutor_id = auth.uid() and (auth.jwt() ->> 'app_role') = 'tutor'
  );

create policy "tutors can answer pending requests" on public.likes
  for update to authenticated using (
    tutor_id = auth.uid() and (auth.jwt() ->> 'app_role') = 'tutor' and status = 'pending'
  ) with check (
    tutor_id = auth.uid() and (auth.jwt() ->> 'app_role') = 'tutor' and status in ('accepted', 'declined')
  );

create policy "tutors can see students who sent them requests" on public.profiles
  for select to authenticated using (
    (auth.jwt() ->> 'app_role') = 'tutor'
    and exists (
      select 1 from public.likes l
      where l.tutor_id = auth.uid() and l.student_id = profiles.user_id
    )
  );

-- A conversation can only start after the tutor accepted, and either side may open it.
drop policy "students can start conversations with liked tutors" on public.conversations;
create policy "matched students and tutors can start conversations" on public.conversations
  for insert to authenticated with check (
    (
      (student_id = auth.uid() and (auth.jwt() ->> 'app_role') = 'student')
      or (tutor_id = auth.uid() and (auth.jwt() ->> 'app_role') = 'tutor')
    )
    and exists (
      select 1 from public.likes l
      where l.student_id = conversations.student_id
        and l.tutor_id = conversations.tutor_id
        and l.status = 'accepted'
    )
  );
