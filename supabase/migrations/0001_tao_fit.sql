-- Tao Fit. Puede ir en el mismo proyecto de Supabase que las otras apps TAOS: todas sus tablas empiezan con "fit_".
-- Cada fila solo la ve su dueño (Row Level Security).

create table if not exists public.fit_profiles (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  nombre text not null,
  genero text not null check (genero in ('hombre', 'mujer')),
  nacimiento date not null,
  altura_cm numeric(5, 1) not null check (altura_cm between 100 and 250),
  objetivo text not null check (objetivo in ('hipertrofia', 'fuerza', 'resistencia', 'grasa')),
  nivel text not null check (nivel in ('principiante', 'intermedio', 'avanzado')),
  dias_semana int not null check (dias_semana between 2 and 6),
  minutos_sesion int not null check (minutos_sesion between 20 and 180),
  lugar text not null check (lugar in ('gimnasio', 'casa_mancuernas', 'casa_sin_equipo')),
  barra_dominadas boolean not null default false,
  lesiones text[] not null default '{}',
  enfasis text[] not null default '{}',
  hora_entreno text,
  avatar jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.fit_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  fecha date not null default current_date,
  peso_kg numeric(5, 1) not null check (peso_kg between 25 and 350),
  cintura_cm numeric(5, 1),
  cadera_cm numeric(5, 1),
  pecho_cm numeric(5, 1),
  brazo_cm numeric(5, 1),
  muslo_cm numeric(5, 1),
  cuello_cm numeric(5, 1),
  created_at timestamptz not null default now()
);
create index if not exists fit_measurements_user_fecha on public.fit_measurements (user_id, fecha);

create table if not exists public.fit_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  creado timestamptz not null default now(),
  activo boolean not null default true,
  dias jsonb not null,
  notas jsonb not null default '[]'
);
create index if not exists fit_plans_user on public.fit_plans (user_id, activo);

create table if not exists public.fit_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  fecha date not null default current_date,
  plan_id uuid references public.fit_plans (id) on delete set null,
  dia int not null default 0,
  ejercicio text not null,
  serie int not null check (serie between 1 and 20),
  peso_kg numeric(6, 2) not null default 0 check (peso_kg >= 0),
  reps int not null check (reps between 0 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists fit_sets_user_ejercicio on public.fit_sets (user_id, ejercicio, fecha);

do $$
declare t text;
begin
  foreach t in array array['fit_profiles', 'fit_measurements', 'fit_plans', 'fit_sets'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Solo el dueño" on public.%I', t);
    execute format('create policy "Solo el dueño" on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated, service_role', t);
  end loop;
end $$;
