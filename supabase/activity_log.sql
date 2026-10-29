-- Applied to the Supabase project as migration "activity_log".
create table public.activity_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  email text not null,
  name text,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  ip text,
  city text,
  user_agent text
);
create index activity_log_at_idx on public.activity_log (at desc);
create index activity_log_email_idx on public.activity_log (email, at desc);
alter table public.activity_log enable row level security;

-- Shared token the app server must present; only readable by definer functions.
create schema if not exists private;
create table private.app_token (token text not null);
insert into private.app_token (token) values (encode(gen_random_bytes(32), 'hex'));
revoke all on schema private from anon, authenticated;

create or replace function public.log_activity(p_token text, p_email text, p_name text, p_action text, p_detail jsonb, p_ip text, p_city text, p_user_agent text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from private.app_token where token = p_token) then
    raise exception 'forbidden';
  end if;
  insert into public.activity_log (email, name, action, detail, ip, city, user_agent)
  values (lower(p_email), p_name, left(p_action, 50), coalesce(p_detail, '{}'::jsonb), p_ip, p_city, left(p_user_agent, 300));
end $$;

create or replace function public.read_activity(p_token text, p_email text default null, p_limit int default 500)
returns setof public.activity_log language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from private.app_token where token = p_token) then
    raise exception 'forbidden';
  end if;
  return query select * from public.activity_log
    where p_email is null or email = lower(p_email)
    order by at desc limit least(greatest(p_limit, 1), 5000);
end $$;

create or replace function public.activity_users(p_token text)
returns table (email text, name text, first_seen timestamptz, last_seen timestamptz, events bigint, sign_ins bigint, people_viewed bigint)
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from private.app_token where token = p_token) then
    raise exception 'forbidden';
  end if;
  return query select l.email, max(l.name), min(l.at), max(l.at), count(*),
    count(*) filter (where l.action = 'sign_in'),
    count(*) filter (where l.action = 'view_person')
  from public.activity_log l group by l.email order by max(l.at) desc;
end $$;

revoke all on function public.log_activity, public.read_activity, public.activity_users from public;
grant execute on function public.log_activity, public.read_activity, public.activity_users to anon, authenticated;
