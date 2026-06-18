# Liquidasueldos

Aplicación interna de estudio contable para liquidar sueldos y cargas sociales de
empresas clientes bajo legislación laboral y previsional argentina.

Ver `especificacion_funcional claude.docx` en `reference/` para el alcance funcional completo.

## Stack

- Next.js (App Router) + TypeScript
- Supabase (Postgres + Auth + RLS)
- Tailwind + shadcn/ui

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run test     # tests del motor de cálculo (Vitest)
npm run lint
```

## Motor de cálculo

`src/motor/` es el núcleo de cálculo: tablas paramétricas con vigencia por fecha,
un motor genérico de conceptos/acumuladores, y la definición concreta de cada
convenio (hoy, CCT 345/2002). No depende de Next.js ni de Supabase — se testea de
forma aislada (`src/motor/__tests__`). El prototipo original en Python que define
este patrón queda en `reference/` a modo de referencia histórica.

Ningún valor normativo (escalas, alícuotas, topes) está hardcodeado en el motor:
se resuelven en runtime por fecha desde tablas paramétricas. Los valores que hoy
aparecen en `src/motor/convenios/cct-345-2002/parametros.ts` son placeholders en
0 marcados explícitamente para completar — no son oficiales.
