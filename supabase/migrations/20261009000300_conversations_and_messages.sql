create table public.conversations (
  id uuid primary key default extensions.gen_random_uuid(),
  student_id uuid not null references public.accounts(id) on delete cascade,
  tutor_id uuid not null references public.accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (student_id, tutor_id),
  check (student_id <> tutor_id)
);
create index conversations_student_idx on public.conversations(student_id, created_at desc);
create index conversations_tutor_idx on public.conversations(tutor_id, created_at desc);

create table public.messages (
  id uuid primary key default extensions.gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.accounts(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index messages_conversation_idx on public.messages(conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;
revoke all on public.conversations, public.messages from anon, authenticated;
grant select, insert on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;

create policy "participants can read their conversations" on public.conversations
  for select to authenticated using (
    auth.uid() in (student_id, tutor_id)
  );
create policy "chat participants can see each other's display profiles" on public.profiles
  for select to authenticated using (
    exists (
      select 1 from public.conversations c
      where auth.uid() in (c.student_id, c.tutor_id)
        and user_id in (c.student_id, c.tutor_id)
    )
  );
create policy "students can start conversations with liked tutors" on public.conversations
  for insert to authenticated with check (
    student_id = auth.uid()
    and (auth.jwt() ->> 'app_role') = 'student'
    and exists (
      select 1 from public.likes l
      where l.student_id = auth.uid() and l.tutor_id = conversations.tutor_id
    )
  );

create policy "participants can read conversation messages" on public.messages
  for select to authenticated using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and auth.uid() in (c.student_id, c.tutor_id)
    )
  );
create policy "participants can send their own messages" on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and auth.uid() in (c.student_id, c.tutor_id)
    )
  );

create or replace function public.broadcast_new_message()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  perform realtime.broadcast_changes(
    'conversation:' || new.conversation_id::text,
    'new_message',
    tg_op,
    tg_table_name,
    tg_table_schema,
    new,
    old
  );
  return new;
end;
$$;
revoke all on function public.broadcast_new_message() from public, anon, authenticated;
create trigger messages_broadcast_insert
  after insert on public.messages
  for each row execute function public.broadcast_new_message();

create policy "conversation participants can receive private broadcasts"
  on realtime.messages for select to authenticated using (
    extension = 'broadcast'
    and exists (
      select 1 from public.conversations c
      where realtime.topic() = 'conversation:' || c.id::text
        and auth.uid() in (c.student_id, c.tutor_id)
    )
  );
