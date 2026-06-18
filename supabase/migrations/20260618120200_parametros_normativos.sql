-- Tablas paramétricas con vigencia por fecha (sección 5.2 de la especificación).
-- Mismo principio que motor/core/tabla-parametrica.ts: toda fila tiene
-- vigencia_desde/vigencia_hasta y se resuelve por la fecha del período
-- liquidado. lib/repos hace esa resolución contra estas tablas.
--
-- IMPORTANTE: esta migración crea la ESTRUCTURA. No carga ningún valor real
-- (escalas, alícuotas, topes) — eso se completa desde la UI de "Parámetros"
-- con los valores oficiales vigentes que confirme el estudio.

-- Específicas del convenio --------------------------------------------------

create table escalas_convenio (
  id uuid primary key default gen_random_uuid(),
  convenio_id uuid not null references convenios (id) on delete cascade,
  categoria_id uuid not null references categorias_convenio (id) on delete cascade,
  vigencia_desde date not null,
  vigencia_hasta date,
  basico numeric(14, 2) not null,
  created_at timestamptz not null default now()
);
create index escalas_convenio_categoria_vigencia_idx on escalas_convenio (categoria_id, vigencia_desde);

create table adicionales_convenio (
  id uuid primary key default gen_random_uuid(),
  convenio_id uuid not null references convenios (id) on delete cascade,
  codigo text not null, -- ej. "ASISTENCIA_PERFECTA", "MANEJO_DE_FONDOS"
  descripcion text not null,
  vigencia_desde date not null,
  vigencia_hasta date,
  importe numeric(14, 2) not null,
  created_at timestamptz not null default now()
);
create index adicionales_convenio_vigencia_idx on adicionales_convenio (convenio_id, codigo, vigencia_desde);

create table reglas_convenio (
  id uuid primary key default gen_random_uuid(),
  convenio_id uuid not null references convenios (id) on delete cascade,
  vigencia_desde date not null,
  vigencia_hasta date,
  horas_mensuales int not null,
  antiguedad_pct_anio numeric(6, 4) not null,
  antiguedad_base text not null check (antiguedad_base in ('BASICO', 'BRUTO')),
  he_50_factor numeric(5, 4) not null,
  he_100_factor numeric(5, 4) not null,
  cuota_solidaria_pct numeric(6, 4) not null,
  created_at timestamptz not null default now()
);
create index reglas_convenio_vigencia_idx on reglas_convenio (convenio_id, vigencia_desde);

-- Nacionales (no dependen del convenio) --------------------------------------

create table aportes_trabajador (
  id uuid primary key default gen_random_uuid(),
  vigencia_desde date not null,
  vigencia_hasta date,
  jubilacion_pct numeric(6, 4) not null,
  ley19032_pct numeric(6, 4) not null,
  obra_social_pct numeric(6, 4) not null,
  created_at timestamptz not null default now()
);
create index aportes_trabajador_vigencia_idx on aportes_trabajador (vigencia_desde);

create table topes_sipa (
  id uuid primary key default gen_random_uuid(),
  vigencia_desde date not null,
  vigencia_hasta date,
  base_min numeric(14, 2) not null default 0,
  base_max numeric(14, 2) not null default 0, -- 0 = sin tope aplicado
  created_at timestamptz not null default now()
);
create index topes_sipa_vigencia_idx on topes_sipa (vigencia_desde);

create table contribuciones_patronales (
  id uuid primary key default gen_random_uuid(),
  tipo_empleador text not null, -- debe coincidir con empresas.tipo_empleador
  vigencia_desde date not null,
  vigencia_hasta date,
  alicuota_pct numeric(6, 4) not null,
  detraccion_minimo_no_imponible numeric(14, 2) not null default 0,
  created_at timestamptz not null default now()
);
create index contribuciones_patronales_tipo_vigencia_idx on contribuciones_patronales (tipo_empleador, vigencia_desde);

-- Por empresa (depende del contrato con la aseguradora) ----------------------

create table art_seguro_empresa (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas (id) on delete cascade,
  vigencia_desde date not null,
  vigencia_hasta date,
  art_alicuota_pct numeric(6, 4) not null,
  art_suma_fija numeric(14, 2) not null default 0,
  seguro_vida_importe numeric(14, 2) not null default 0,
  created_at timestamptz not null default now()
);
create index art_seguro_empresa_vigencia_idx on art_seguro_empresa (empresa_id, vigencia_desde);
