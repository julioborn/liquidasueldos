-- Seed de datos para desarrollo local.
-- Valores normativos confirmados por el estudio (junio 2026).
--
-- Cómo usarlo:
--   supabase db reset          (local — aplica migraciones + este seed)
--
-- Usuario de prueba: admin@estudio.com / Test1234!
-- Convenio cargado: CCT 345/2002 (SOESGPyLA / FAENI — estaciones de servicio, Santa Fe)

-- ===========================================================================
-- USUARIO DE PRUEBA
-- ===========================================================================
insert into auth.users (
  id, instance_id, aud, role,
  email, encrypted_password,
  email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'admin@estudio.com',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Admin"}',
  now(), now()
);

-- El trigger on_auth_user_created crea el perfil automáticamente; ascendemos a admin.
update profiles
set rol = 'administrador'
where id = '00000000-0000-0000-0000-000000000001';

-- ===========================================================================
-- CCT 345/2002
-- ===========================================================================
insert into convenios (id, codigo, nombre, jurisdiccion) values (
  '00000000-0000-0000-0000-000000000010',
  '345/2002',
  'SOESGPyLA / FAENI - Estaciones de servicio',
  'Santa Fe'
);

insert into categorias_convenio (id, convenio_id, codigo, nombre, orden) values
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', 'ENCARGADO',      'Encargado',      1),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000010', 'ADMINISTRATIVO', 'Administrativo', 2),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000010', 'OPERARIO',       'Operario',       3);

-- Reglas estructurales: art. 11 (200 hs), art. 25 (2% / año sobre BRUTO),
-- art. 31 (cuota solidaria 2%), HE 1,5x / 2x — vigentes desde el origen del CCT.
insert into reglas_convenio (
  convenio_id, vigencia_desde, vigencia_hasta,
  horas_mensuales, antiguedad_pct_anio, antiguedad_base,
  he_50_factor, he_100_factor, cuota_solidaria_pct
) values (
  '00000000-0000-0000-0000-000000000010',
  '2002-01-01', null,
  200, 0.0200, 'BRUTO',
  1.5000, 2.0000, 0.0200
);

-- ---- Escala mayo 2026 (cerrada) -------------------------------------------
insert into escalas_convenio (convenio_id, categoria_id, vigencia_desde, vigencia_hasta, basico) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000020', '2026-05-01', '2026-05-31', 1503017.00),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000021', '2026-05-01', '2026-05-31', 1448206.00),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000022', '2026-05-01', '2026-05-31', 1430904.00);

-- ---- Escala junio 2026 (vigente) ------------------------------------------
insert into escalas_convenio (convenio_id, categoria_id, vigencia_desde, vigencia_hasta, basico) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000020', '2026-06-01', null, 1540592.00),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000021', '2026-06-01', null, 1484411.00),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000022', '2026-06-01', null, 1446677.00);

-- ---- Adicionales mayo 2026 (cerrados) -------------------------------------
insert into adicionales_convenio (convenio_id, codigo, descripcion, vigencia_desde, vigencia_hasta, importe) values
  ('00000000-0000-0000-0000-000000000010', 'ASISTENCIA_PERFECTA', 'Premio asistencia perfecta (art. 25)', '2026-05-01', '2026-05-31', 90842.00),
  ('00000000-0000-0000-0000-000000000010', 'MANEJO_DE_FONDOS',    'Premio manejo de fondos (art. 26)',    '2026-05-01', '2026-05-31', 90842.00);

-- ---- Adicionales junio 2026 — confirmar importe con el estudio si hubo actualización
insert into adicionales_convenio (convenio_id, codigo, descripcion, vigencia_desde, vigencia_hasta, importe) values
  ('00000000-0000-0000-0000-000000000010', 'ASISTENCIA_PERFECTA', 'Premio asistencia perfecta (art. 25)', '2026-06-01', null, 90842.00),
  ('00000000-0000-0000-0000-000000000010', 'MANEJO_DE_FONDOS',    'Premio manejo de fondos (art. 26)',    '2026-06-01', null, 90842.00);

-- ===========================================================================
-- PARÁMETROS NACIONALES
-- ===========================================================================

-- Aportes del trabajador: jubilación 11% (Ley 24.241) + PAMI 3% (Ley 19.032)
-- + obra social 3% (Ley 23.660) — vigentes desde 2024.
insert into aportes_trabajador (vigencia_desde, vigencia_hasta, jubilacion_pct, ley19032_pct, obra_social_pct) values
  ('2024-01-01', null, 0.1100, 0.0300, 0.0300);

-- Topes SIPA — junio 2026.
insert into topes_sipa (vigencia_desde, vigencia_hasta, base_min, base_max) values
  ('2026-06-01', null, 135837.40, 4414652.38);

-- Contribuciones patronales Decreto 814/01 — empleador tipo GENERAL, junio 2026.
insert into contribuciones_patronales (tipo_empleador, vigencia_desde, vigencia_hasta, alicuota_pct, detraccion_minimo_no_imponible) values
  ('GENERAL', '2026-06-01', null, 0.1800, 18000.00);

-- ===========================================================================
-- EMPRESA Y EMPLEADO DE PRUEBA
-- ===========================================================================
insert into empresas (id, razon_social, cuit, tipo_empleador) values (
  '00000000-0000-0000-0000-000000000030',
  'Estación de Servicio El Cruce S.A.',
  '30-12345678-9',
  'GENERAL'
);

-- Empleado de prueba: OPERARIO con ingreso marzo 2021 (≈ 5 años de antigüedad en junio 2026).
insert into empleados (
  id, empresa_id, legajo, apellido, nombre, cuil,
  fecha_ingreso, convenio_id, categoria_id, estado
) values (
  '00000000-0000-0000-0000-000000000040',
  '00000000-0000-0000-0000-000000000030',
  '001',
  'García', 'Juan Carlos', '20-12345678-3',
  '2021-03-01',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000022',
  'ACTIVO'
);
