-- Ciclo operativo de liquidación (secciones 4.2, 4.3 y 4.4 de la especificación):
-- período -> novedades por empleado -> liquidación (cabecera) -> líneas de recibo.

create table periodos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas (id) on delete restrict,
  anio int not null,
  mes int not null check (mes between 1 and 12),
  tipo text not null default 'MENSUAL'
    check (tipo in ('MENSUAL', 'SAC_1', 'SAC_2', 'VACACIONES', 'FINAL', 'RETROACTIVO')),
  estado text not null default 'ABIERTO'
    check (estado in ('ABIERTO', 'CALCULADO', 'CONFIRMADO', 'CERRADO')),
  fecha_pago date,
  cerrado_en timestamptz,
  cerrado_por uuid references profiles (id),
  created_at timestamptz not null default now(),
  unique (empresa_id, anio, mes, tipo)
);

-- Variables del mes que hoy consume el motor (src/motor/convenios/cct-345-2002).
-- Premios/adelantos/embargos quedan para cuando el motor los procese.
create table novedades (
  id uuid primary key default gen_random_uuid(),
  periodo_id uuid not null references periodos (id) on delete cascade,
  empleado_id uuid not null references empleados (id) on delete cascade,
  dias_trabajados numeric(5, 2) not null default 30,
  horas_extra_50 numeric(6, 2) not null default 0,
  horas_extra_100 numeric(6, 2) not null default 0,
  asistencia_perfecta boolean not null default false,
  manejo_fondos boolean not null default false,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (periodo_id, empleado_id)
);

create trigger novedades_set_updated_at
  before update on novedades
  for each row execute function set_updated_at();

-- Cabecera de liquidación: una por empleado y período. convenio_id/categoria_id
-- son la foto de lo que se usó para calcular (independiente de que después
-- el empleado cambie de categoría).
create table liquidaciones (
  id uuid primary key default gen_random_uuid(),
  periodo_id uuid not null references periodos (id) on delete cascade,
  empleado_id uuid not null references empleados (id) on delete cascade,
  convenio_id uuid references convenios (id),
  categoria_id uuid references categorias_convenio (id),
  total_remunerativo numeric(14, 2) not null default 0,
  total_no_remunerativo numeric(14, 2) not null default 0,
  total_descuentos numeric(14, 2) not null default 0,
  neto numeric(14, 2) not null default 0,
  estado text not null default 'BORRADOR' check (estado in ('BORRADOR', 'CONFIRMADA')),
  calculado_en timestamptz not null default now(),
  calculado_por uuid references profiles (id),
  unique (periodo_id, empleado_id)
);

-- Detalle: mapea 1 a 1 con el LineaRecibo[] que devuelve Liquidacion.ejecutar().
create table lineas_recibo (
  id uuid primary key default gen_random_uuid(),
  liquidacion_id uuid not null references liquidaciones (id) on delete cascade,
  concepto_codigo text not null,
  descripcion text not null,
  tipo text not null check (tipo in ('REMUNERATIVO', 'NO_REMUNERATIVO', 'DEDUCCION', 'INFORMATIVO')),
  cantidad numeric(10, 2) not null default 0,
  valor_unitario numeric(14, 2) not null default 0,
  importe numeric(14, 2) not null default 0,
  orden int not null default 0
);
create index lineas_recibo_liquidacion_idx on lineas_recibo (liquidacion_id, orden);
