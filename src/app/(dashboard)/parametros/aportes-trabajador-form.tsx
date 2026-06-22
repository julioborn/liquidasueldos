"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fraccionAPorcentaje } from "@/lib/porcentaje";
import type { AporteTrabajador } from "@/lib/repos/aportes-trabajador";
import type { ParametroFormState } from "./actions";

interface AportesTrabajadorFormProps {
  action: (prevState: ParametroFormState, formData: FormData) => Promise<ParametroFormState>;
  aporte?: AporteTrabajador;
  submitLabel: string;
}

const initialState: ParametroFormState = {};

export function AportesTrabajadorForm({ action, aporte, submitLabel }: AportesTrabajadorFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const v = state.values ?? {};

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vigenciaDesde">Vigencia desde</Label>
          <Input
            id="vigenciaDesde"
            name="vigenciaDesde"
            type="date"
            defaultValue={v.vigenciaDesde ?? aporte?.vigenciaDesde}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vigenciaHasta">Vigencia hasta</Label>
          <Input
            id="vigenciaHasta"
            name="vigenciaHasta"
            type="date"
            defaultValue={v.vigenciaHasta ?? aporte?.vigenciaHasta ?? ""}
          />
          <p className="text-xs text-muted-foreground">Vacío = sin fecha de corte (vigente hasta la próxima alta).</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="jubilacionPct">Jubilación (Ley 24.241) %</Label>
          <Input
            id="jubilacionPct"
            name="jubilacionPct"
            type="number"
            step="0.01"
            defaultValue={v.jubilacionPct ?? (aporte ? fraccionAPorcentaje(aporte.jubilacionPct) : undefined)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ley19032Pct">PAMI (Ley 19.032) %</Label>
          <Input
            id="ley19032Pct"
            name="ley19032Pct"
            type="number"
            step="0.01"
            defaultValue={v.ley19032Pct ?? (aporte ? fraccionAPorcentaje(aporte.ley19032Pct) : undefined)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="obraSocialPct">Obra social %</Label>
          <Input
            id="obraSocialPct"
            name="obraSocialPct"
            type="number"
            step="0.01"
            defaultValue={v.obraSocialPct ?? (aporte ? fraccionAPorcentaje(aporte.obraSocialPct) : undefined)}
            required
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
