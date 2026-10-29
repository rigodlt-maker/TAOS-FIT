-- Instalación completa de la base de datos. Pega todo en Supabase › SQL Editor y toca Run.

-- ===== 0001_tao_fit.sql =====
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

-- ===== 0002_push.sql =====
-- Notificaciones push: tabla compartida por las apps TAOS (si ya existe, no pasa nada).
-- Notificaciones push (Web Push). Una fila por celular o navegador donde activaste los avisos.
-- La tabla la comparten las apps TAOS del mismo proyecto de Supabase; "app" dice de cuál es cada suscripción.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  app text not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  dispositivo text,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_app on public.push_subscriptions (user_id, app);

alter table public.push_subscriptions enable row level security;
drop policy if exists "Solo el dueño" on public.push_subscriptions;
create policy "Solo el dueño" on public.push_subscriptions for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.push_subscriptions to authenticated, service_role;

-- ===== 0003_coach.sql =====
-- Tao Fit, versión "Coach": géneros, meta y comida en el perfil, RIR en las series, registro semanal,
-- historial de ajustes y menú semanal. Se puede correr más de una vez sin problema.

-- Más opciones de género (la base para las fórmulas va en datos.cuerpo)
alter table public.fit_profiles drop constraint if exists fit_profiles_genero_check;
alter table public.fit_profiles add constraint fit_profiles_genero_check check (genero in ('hombre', 'mujer', 'no_binario', 'prefiero_no_decir'));
-- Meta, comida, días y ajustes automáticos: en un solo campo flexible para no necesitar más SQL después
alter table public.fit_profiles add column if not exists datos jsonb not null default '{}';

alter table public.fit_sets add column if not exists rir int check (rir between 0 and 10);
alter table public.fit_sets add column if not exists nota text;

create table if not exists public.fit_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  fecha date not null default current_date,
  peso_kg numeric(5, 1) not null check (peso_kg between 25 and 350),
  cintura_cm numeric(5, 1),
  cadera_cm numeric(5, 1),
  brazo_cm numeric(5, 1),
  adherencia int not null check (adherencia between 0 and 100),
  energia int not null check (energia between 1 and 10),
  sueno int not null check (sueno between 1 and 10),
  hambre int not null check (hambre between 1 and 10),
  notas text,
  created_at timestamptz not null default now()
);
create index if not exists fit_checkins_user_fecha on public.fit_checkins (user_id, fecha);

create table if not exists public.fit_adjustments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  fecha date not null default current_date,
  tipo text not null check (tipo in ('calorias', 'volumen', 'ejercicio', 'salud', 'rutina')),
  detalle text not null,
  motivo text not null,
  created_at timestamptz not null default now()
);
create index if not exists fit_adjustments_user_fecha on public.fit_adjustments (user_id, fecha);

create table if not exists public.fit_meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  creado timestamptz not null default now(),
  activo boolean not null default true,
  menu jsonb not null
);
create index if not exists fit_meal_plans_user on public.fit_meal_plans (user_id, activo);

do $$
declare t text;
begin
  foreach t in array array['fit_checkins', 'fit_adjustments', 'fit_meal_plans'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Solo el dueño" on public.%I', t);
    execute format('create policy "Solo el dueño" on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated, service_role', t);
  end loop;
end $$;
