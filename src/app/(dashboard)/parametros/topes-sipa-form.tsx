"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TopeSipa } from "@/lib/repos/topes-sipa";
import type { ParametroFormState } from "./actions";

interface TopesSipaFormProps {
  action: (prevState: ParametroFormState, formData: FormData) => Promise<ParametroFormState>;
  tope?: TopeSipa;
  submitLabel: string;
}

const initialState: ParametroFormState = {};

export function TopesSipaForm({ action, tope, submitLabel }: TopesSipaFormProps) {
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
            defaultValue={v.vigenciaDesde ?? tope?.vigenciaDesde}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vigenciaHasta">Vigencia hasta</Label>
          <Input
            id="vigenciaHasta"
            name="vigenciaHasta"
            type="date"
            defaultValue={v.vigenciaHasta ?? tope?.vigenciaHasta ?? ""}
          />
          <p className="text-xs text-muted-foreground">Vacío = sin fecha de corte (vigente hasta la próxima alta).</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="baseMin">Base mínima ($)</Label>
          <Input
            id="baseMin"
            name="baseMin"
            type="number"
            step="0.01"
            defaultValue={v.baseMin ?? tope?.baseMin}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="baseMax">Base máxima ($)</Label>
          <Input
            id="baseMax"
            name="baseMax"
            type="number"
            step="0.01"
            defaultValue={v.baseMax ?? tope?.baseMax}
            required
          />
          <p className="text-xs text-muted-foreground">0 = sin tope aplicado.</p>
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
