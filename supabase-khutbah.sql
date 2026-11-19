-- Uitvoeren in de Supabase SQL Editor. Toegang verlenen staat in ADMIN-GUIDE.md.
begin;

create schema if not exists khutbah_private;
revoke all on schema khutbah_private from public, anon, authenticated;

create table if not exists khutbah_private.operators (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- Eén gedeeld tv-schermbeeld. Alleen de laatst gepubliceerde regel wordt bijgehouden.
create table if not exists khutbah_private.screen (
  id boolean primary key default true check (id),
  session_id uuid,
  operator_id uuid,
  heartbeat_at timestamptz,
  last_claimed integer not null default 0,
  last_published integer not null default 0,
  caption text not null default '',
  caption_at timestamptz
);
insert into khutbah_private.screen (id) values (true) on conflict do nothing;
revoke all on all tables in schema khutbah_private from public, anon, authenticated;

create or replace function public.khutbah_display()
returns jsonb
language sql stable security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'live', live,
    'caption', case when live and age_ms < 30000 then caption else '' end,
    'age_ms', case when live and age_ms < 30000 then age_ms end
  )
  from (
    select session_id is not null and heartbeat_at > statement_timestamp() - interval '60 seconds' as live,
           caption, floor(extract(epoch from (statement_timestamp() - caption_at)) * 1000) as age_ms
    from khutbah_private.screen where id
  ) screen;
$$;

create or replace function public.khutbah_control(
  p_action text, p_session uuid, p_seq integer default 0, p_caption text default null
)
returns boolean
language plpgsql security definer
set search_path = ''
as $$
declare
  operator uuid := auth.uid();
  current_screen khutbah_private.screen%rowtype;
  checked_at timestamptz;
  live boolean;
  owns_session boolean;
begin
  if operator is null or not exists (
    select 1 from khutbah_private.operators where user_id = operator
  ) then
    raise exception using errcode = '42501', message = 'Dit account heeft geen toegang tot de live khutbah.';
  end if;
  if p_session is null or p_action is null or p_action not in ('start', 'heartbeat', 'stop', 'claim', 'publish') then
    raise exception using errcode = '22023', message = 'Ongeldige khutbah-opdracht.';
  end if;

  -- Serialiseer ook twee gelijktijdige starts en late antwoorden van de vertaaldienst.
  select * into strict current_screen from khutbah_private.screen where id for update;
  checked_at := clock_timestamp();
  live := current_screen.session_id is not null and current_screen.heartbeat_at > checked_at - interval '60 seconds';
  owns_session := current_screen.session_id is not distinct from p_session and current_screen.operator_id is not distinct from operator;

  if p_action = 'start' then
    if live then
      if owns_session then return true; end if;
      raise exception using errcode = 'PT409', message = 'Er is al een live khutbah actief op een ander tabblad of toestel.';
    end if;
    update khutbah_private.screen set session_id = p_session, operator_id = operator, heartbeat_at = checked_at,
      last_claimed = 0, last_published = 0, caption = '', caption_at = null where id;
    return true;
  end if;

  if p_action = 'stop' then
    if owns_session then
      update khutbah_private.screen set session_id = null, operator_id = null, heartbeat_at = null,
        last_claimed = 0, last_published = 0, caption = '', caption_at = null where id;
    end if;
    return true;
  end if;

  if not live or not owns_session then
    raise exception using errcode = 'PT409', message = 'Deze live sessie is afgelopen. Start een nieuwe sessie.';
  end if;
  if p_action = 'heartbeat' then
    update khutbah_private.screen set heartbeat_at = checked_at where id;
    return true;
  end if;
  if p_seq is null or p_seq < 1 then
    raise exception using errcode = '22023', message = 'Ongeldig fragmentnummer.';
  end if;

  if p_action = 'claim' then
    if p_seq <= current_screen.last_claimed then return false; end if;
    update khutbah_private.screen set last_claimed = p_seq where id;
    return true;
  end if;

  if p_seq <> current_screen.last_claimed or p_seq <= current_screen.last_published then return false; end if;
  if p_caption is null or length(trim(p_caption)) not between 1 and 480 then
    raise exception using errcode = '22023', message = 'Ongeldige ondertiteling.';
  end if;
  update khutbah_private.screen set caption = trim(p_caption), caption_at = checked_at, last_published = p_seq where id;
  return true;
end;
$$;

revoke all on function public.khutbah_display() from public, anon, authenticated;
grant execute on function public.khutbah_display() to anon, authenticated;
revoke all on function public.khutbah_control(text, uuid, integer, text) from public, anon, authenticated;
grant execute on function public.khutbah_control(text, uuid, integer, text) to authenticated;

notify pgrst, 'reload schema';
commit;
