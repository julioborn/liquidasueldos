"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fraccionAPorcentaje } from "@/lib/porcentaje";
import type { ContribucionPatronal } from "@/lib/repos/contribuciones-patronales";
import type { ParametroFormState } from "./actions";

interface ContribucionesPatronalesFormProps {
  action: (prevState: ParametroFormState, formData: FormData) => Promise<ParametroFormState>;
  contribucion?: ContribucionPatronal;
  submitLabel: string;
}

const initialState: ParametroFormState = {};

export function ContribucionesPatronalesForm({
  action,
  contribucion,
  submitLabel,
}: ContribucionesPatronalesFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const v = state.values ?? {};

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tipoEmpleador">Tipo de empleador</Label>
        <Input
          id="tipoEmpleador"
          name="tipoEmpleador"
          defaultValue={v.tipoEmpleador ?? contribucion?.tipoEmpleador}
          required
          placeholder="GENERAL"
        />
        <p className="text-xs text-muted-foreground">
          Debe coincidir con el valor de &quot;Tipo de empleador&quot; cargado en cada Empresa.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vigenciaDesde">Vigencia desde</Label>
          <Input
            id="vigenciaDesde"
            name="vigenciaDesde"
            type="date"
            defaultValue={v.vigenciaDesde ?? contribucion?.vigenciaDesde}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vigenciaHasta">Vigencia hasta</Label>
          <Input
            id="vigenciaHasta"
            name="vigenciaHasta"
            type="date"
            defaultValue={v.vigenciaHasta ?? contribucion?.vigenciaHasta ?? ""}
          />
          <p className="text-xs text-muted-foreground">Vacío = sin fecha de corte.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="alicuotaPct">Alícuota (Dec. 814/01) %</Label>
          <Input
            id="alicuotaPct"
            name="alicuotaPct"
            type="number"
            step="0.01"
            defaultValue={v.alicuotaPct ?? (contribucion ? fraccionAPorcentaje(contribucion.alicuotaPct) : undefined)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="detraccionMinimoNoImponible">Detracción mín. no imponible ($)</Label>
          <Input
            id="detraccionMinimoNoImponible"
            name="detraccionMinimoNoImponible"
            type="number"
            step="0.01"
            defaultValue={v.detraccionMinimoNoImponible ?? contribucion?.detraccionMinimoNoImponible}
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
