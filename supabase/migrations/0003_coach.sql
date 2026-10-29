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
