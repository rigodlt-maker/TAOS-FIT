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

-- ===== 0020_nube_duenos.sql =====
-- Nube F1 · Una fila solo puede apuntar a filas del MISMO dueño.
-- Antes, una llave foránea como transactions.account_id → accounts.id solo pedía que la cuenta existiera: con la llave
-- secreta (o con un error de código) un usuario podía quedar ligado a la cuenta de otro. Ahora, junto a cada llave foránea
-- entre tablas con user_id, se agrega otra de dos columnas (columna, user_id) → (id, user_id) del padre.
-- Solo agrega (no borra ni cambia nada) y se puede correr dos veces. Las llaves de antes se quedan igual.
-- Al borrar se porta igual que la llave original (en cascada, o deja la columna vacía).
create table if not exists public.taos_migraciones (nombre text primary key, aplicada timestamptz not null default now());
alter table public.taos_migraciones enable row level security;
do $$ begin
  -- Solo la usa el servidor: los roles públicos de Supabase no la ven (en una base sin esos roles no hace falta)
  if exists (select 1 from pg_roles where rolname = 'anon') then revoke all on public.taos_migraciones from anon; end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then revoke all on public.taos_migraciones from authenticated; end if;
end $$;

do $$
declare
  f record;
  indice text;
  nombre text;
  al_borrar text;
begin
  for f in
    select c.relname hijo, a.attname columna, r.relname padre, k.confdeltype borrar
      from pg_constraint k
      join pg_class c on c.oid = k.conrelid
      join pg_class r on r.oid = k.confrelid
      join pg_attribute a on a.attrelid = c.oid and a.attnum = k.conkey[1]
      join pg_attribute ra on ra.attrelid = r.oid and ra.attnum = k.confkey[1]
     where k.contype = 'f'
       and c.relnamespace = 'public'::regnamespace
       and r.relnamespace = 'public'::regnamespace
       and array_length(k.conkey, 1) = 1
       and ra.attname = 'id'
       and a.attname <> 'user_id'
       and exists (select 1 from pg_attribute x where x.attrelid = c.oid and x.attname = 'user_id' and not x.attisdropped)
       and exists (select 1 from pg_attribute x where x.attrelid = r.oid and x.attname = 'user_id' and not x.attisdropped)
  loop
    indice := left(f.padre || '_id_dueno', 63);
    execute format('create unique index if not exists %I on public.%I (id, user_id)', indice, f.padre);
    nombre := left(f.hijo || '_' || f.columna || '_dueno', 63);
    if not exists (select 1 from pg_constraint where conname = nombre and conrelid = ('public.' || quote_ident(f.hijo))::regclass) then
      al_borrar := case f.borrar when 'c' then 'on delete cascade' when 'n' then format('on delete set null (%I)', f.columna) else '' end;
      execute format('alter table public.%I add constraint %I foreign key (%I, user_id) references public.%I (id, user_id) %s not valid',
        f.hijo, nombre, f.columna, f.padre, al_borrar);
      begin
        execute format('alter table public.%I validate constraint %I', f.hijo, nombre);
      exception when foreign_key_violation then
        -- Hay filas viejas ligadas a otro dueño: la regla ya vale para todo lo nuevo; las viejas se revisan aparte
        raise notice 'TAOS: % tiene filas ligadas a otro dueño; revisar con soporte', nombre;
      end;
    end if;
  end loop;
end $$;

insert into public.taos_migraciones (nombre) values ('0020_nube_duenos') on conflict do nothing;
