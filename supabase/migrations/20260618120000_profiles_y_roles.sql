-- Perfiles del equipo interno del estudio (1:1 con auth.users) y roles de acceso.
-- No hay portal de empleados/clientes: todo usuario de auth.users es alguien del estudio.

create type rol_usuario as enum ('administrador', 'liquidador', 'consulta');

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  rol rol_usuario not null default 'consulta',
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Alta automática de perfil al crear un usuario en Supabase Auth. Rol por
-- defecto: consulta; un administrador lo asciende manualmente desde la UI.
create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, rol)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', new.email), 'consulta');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Rol del usuario autenticado actual. security definer + bypass de RLS sobre
-- profiles para evitar la recursión obvia (una policy que llama a esta función
-- para decidir si puede leer profiles, y esta función necesita leer profiles).
create function current_rol()
returns rol_usuario
language sql
security definer
stable
set search_path = public
as $$
  select rol from public.profiles where id = auth.uid();
$$;

-- Utilidad compartida: mantener updated_at al día en tablas que lo usan
-- (empleados, novedades).
create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
