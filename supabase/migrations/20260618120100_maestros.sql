-- Maestros: empresas clientes, empleados, convenios y catálogo de conceptos.
-- (sección 4.1 de la especificación funcional)

create table empresas (
  id uuid primary key default gen_random_uuid(),
  razon_social text not null,
  cuit text not null unique,
  domicilio text,
  actividad text,
  art_compania text,
  art_numero_contrato text,
  -- Clave para resolver la alícuota de contribuciones patronales (Dec. 814/01)
  -- en la tabla contribuciones_patronales. Valores a confirmar por el estudio.
  tipo_empleador text not null default 'GENERAL',
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

create table convenios (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique, -- ej. "345/2002"
  nombre text not null,
  jurisdiccion text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table categorias_convenio (
  id uuid primary key default gen_random_uuid(),
  convenio_id uuid not null references convenios (id) on delete cascade,
  codigo text not null, -- ej. "OPERARIO"
  nombre text not null,
  orden int not null default 0,
  unique (convenio_id, codigo)
);

create table empleados (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas (id) on delete restrict,
  legajo text not null,
  apellido text not null,
  nombre text not null,
  cuil text not null,
  fecha_nacimiento date,
  fecha_ingreso date not null,
  fecha_egreso date,
  -- Convenio/categoría "actuales": cada liquidación guarda además su propia
  -- foto de cuál usó, así que reasignar acá no reescribe el historial.
  convenio_id uuid references convenios (id),
  categoria_id uuid references categorias_convenio (id),
  modalidad_contratacion text not null default 'TIEMPO_INDETERMINADO',
  cbu text,
  banco text,
  domicilio text,
  estado text not null default 'ACTIVO' check (estado in ('ACTIVO', 'INACTIVO')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (empresa_id, legajo)
);

create trigger empleados_set_updated_at
  before update on empleados
  for each row execute function set_updated_at();

create table empleados_cargas_familia (
  id uuid primary key default gen_random_uuid(),
  empleado_id uuid not null references empleados (id) on delete cascade,
  tipo text not null check (tipo in ('CONYUGE', 'HIJO', 'HIJO_DISCAPACITADO')),
  nombre text not null,
  fecha_nacimiento date,
  created_at timestamptz not null default now()
);

-- Catálogo de conceptos: metadata para reportes/recibo (código, descripción,
-- tipo, orden). La FÓRMULA de cada concepto sigue viviendo en código TS
-- (src/motor/convenios/*); esta tabla no la reemplaza, solo la documenta y
-- le da una FK estable a lineas_recibo. convenio_id es null para los
-- conceptos nacionales (jubilación, PAMI, obra social) que aplican a
-- cualquier convenio.
create table conceptos (
  id uuid primary key default gen_random_uuid(),
  convenio_id uuid references convenios (id) on delete cascade,
  codigo text not null,
  descripcion text not null,
  tipo text not null check (tipo in ('REMUNERATIVO', 'NO_REMUNERATIVO', 'DEDUCCION', 'INFORMATIVO')),
  orden_recibo int not null default 0,
  activo boolean not null default true
);

-- unique(convenio_id, codigo) no alcanza cuando convenio_id es null (NULL no
-- es igual a NULL para una unique constraint), así que se separa en dos
-- índices parciales.
create unique index conceptos_codigo_nacional_uk on conceptos (codigo) where convenio_id is null;
create unique index conceptos_convenio_codigo_uk on conceptos (convenio_id, codigo) where convenio_id is not null;
