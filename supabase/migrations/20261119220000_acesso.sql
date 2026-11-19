-- Parte 1: Acesso
-- Perfis das sócias, regra "só membros veem" e histórico de quem fez cada alteração.

-- Perfis: uma linha para cada pessoa com acesso ao programa.
create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  criado_em timestamptz not null default now()
);

alter table public.perfis enable row level security;

-- Verdadeiro só para quem está logada E tem perfil cadastrado.
create or replace function public.eh_membro()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.perfis where id = (select auth.uid()));
$$;

revoke all on function public.eh_membro() from public, anon;
grant execute on function public.eh_membro() to authenticated;

create policy "membros veem os perfis"
  on public.perfis for select to authenticated
  using (public.eh_membro());

create policy "cada uma altera o próprio nome"
  on public.perfis for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Ninguém de fora acessa nada.
revoke all on public.perfis from anon;

-- Histórico: registro automático de toda criação, alteração ou exclusão.
create table public.historico (
  id bigint generated always as identity primary key,
  quando timestamptz not null default now(),
  quem uuid references auth.users (id) on delete set null,
  tabela text not null,
  registro_id text,
  acao text not null check (acao in ('INSERT', 'UPDATE', 'DELETE')),
  antes jsonb,
  depois jsonb
);

create index historico_quando_idx on public.historico (quando desc);

alter table public.historico enable row level security;

create policy "membros veem o histórico"
  on public.historico for select to authenticated
  using (public.eh_membro());

-- O histórico não pode ser editado nem apagado pelo programa.
revoke all on public.historico from anon;
revoke insert, update, delete on public.historico from authenticated;

create or replace function public.registrar_historico()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  linha jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  insert into public.historico (quem, tabela, registro_id, acao, antes, depois)
  values (
    (select auth.uid()),
    tg_table_name,
    linha ->> 'id',
    tg_op,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;

revoke all on function public.registrar_historico() from public, anon, authenticated;

create trigger perfis_historico
  after insert or update or delete on public.perfis
  for each row execute function public.registrar_historico();
