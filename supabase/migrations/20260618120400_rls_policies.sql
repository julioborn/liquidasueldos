-- RLS por rol (sección 3 de la especificación):
--   administrador: usuarios, parámetros globales, tablas normativas, empresas,
--                  empleados, y cierre de períodos.
--   liquidador:    novedades, ejecución de liquidaciones, emisión de recibos.
--   consulta:      solo lectura en todo.
--
-- Herramienta interna de un solo estudio: no hay aislamiento por "tenant",
-- todo el equipo ve todas las empresas clientes. Lo que varía es quién puede
-- escribir qué.

alter table profiles enable row level security;

create policy "profiles_lectura" on profiles for select using (auth.uid() is not null);
create policy "profiles_admin_write" on profiles for all
  using (current_rol() = 'administrador')
  with check (current_rol() = 'administrador');

-- Maestros y parámetros normativos: lectura para cualquier autenticado,
-- escritura (insert/update/delete) solo para administrador. Se aplica el
-- mismo par de policies a todas estas tablas vía un loop para no repetir
-- 13 veces el mismo bloque.
do $$
declare
  tabla text;
  tablas_admin_only text[] := array[
    'empresas', 'convenios', 'categorias_convenio', 'empleados',
    'empleados_cargas_familia', 'conceptos', 'escalas_convenio',
    'adicionales_convenio', 'reglas_convenio', 'aportes_trabajador',
    'topes_sipa', 'contribuciones_patronales', 'art_seguro_empresa'
  ];
begin
  foreach tabla in array tablas_admin_only loop
    execute format('alter table %I enable row level security', tabla);
    execute format(
      'create policy "%s_lectura" on %I for select using (auth.uid() is not null)',
      tabla, tabla
    );
    execute format(
      'create policy "%s_admin_write" on %I for all using (current_rol() = ''administrador'') with check (current_rol() = ''administrador'')',
      tabla, tabla
    );
  end loop;
end;
$$;

-- Operativo: administrador y liquidador escriben. El cierre de un período
-- (estado -> CERRADO) queda reservado a administrador, igual que cualquier
-- cambio sobre un período ya cerrado.
alter table periodos enable row level security;
alter table novedades enable row level security;
alter table liquidaciones enable row level security;
alter table lineas_recibo enable row level security;

create policy "periodos_lectura" on periodos for select using (auth.uid() is not null);
create policy "periodos_insert" on periodos for insert
  with check (current_rol() in ('administrador', 'liquidador'));
create policy "periodos_update" on periodos for update
  using (current_rol() in ('administrador', 'liquidador'))
  with check (estado <> 'CERRADO' or current_rol() = 'administrador');

create policy "novedades_lectura" on novedades for select using (auth.uid() is not null);
create policy "novedades_write" on novedades for all
  using (current_rol() in ('administrador', 'liquidador'))
  with check (current_rol() in ('administrador', 'liquidador'));

create policy "liquidaciones_lectura" on liquidaciones for select using (auth.uid() is not null);
create policy "liquidaciones_write" on liquidaciones for all
  using (current_rol() in ('administrador', 'liquidador'))
  with check (current_rol() in ('administrador', 'liquidador'));

create policy "lineas_recibo_lectura" on lineas_recibo for select using (auth.uid() is not null);
create policy "lineas_recibo_write" on lineas_recibo for all
  using (current_rol() in ('administrador', 'liquidador'))
  with check (current_rol() in ('administrador', 'liquidador'));
