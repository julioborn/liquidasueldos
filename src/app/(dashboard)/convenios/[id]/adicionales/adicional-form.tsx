"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdicionalConvenio } from "@/lib/repos/adicionales-convenio";
import type { AdicionalFormState } from "./actions";

interface AdicionalFormProps {
  action: (prevState: AdicionalFormState, formData: FormData) => Promise<AdicionalFormState>;
  adicional?: AdicionalConvenio;
  submitLabel: string;
}

const initialState: AdicionalFormState = {};

export function AdicionalForm({ action, adicional, submitLabel }: AdicionalFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const v = state.values ?? {};

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="codigo">Código</Label>
        <Input
          id="codigo"
          name="codigo"
          defaultValue={v.codigo ?? adicional?.codigo}
          required
          placeholder="ASISTENCIA_PERFECTA"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="descripcion">Descripción</Label>
        <Input
          id="descripcion"
          name="descripcion"
          defaultValue={v.descripcion ?? adicional?.descripcion}
          required
          placeholder="Adicional asistencia perfecta (art. 25)"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vigenciaDesde">Vigencia desde</Label>
          <Input
            id="vigenciaDesde"
            name="vigenciaDesde"
            type="date"
            defaultValue={v.vigenciaDesde ?? adicional?.vigenciaDesde}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vigenciaHasta">Vigencia hasta</Label>
          <Input
            id="vigenciaHasta"
            name="vigenciaHasta"
            type="date"
            defaultValue={v.vigenciaHasta ?? adicional?.vigenciaHasta ?? ""}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="importe">Importe ($)</Label>
        <Input
          id="importe"
          name="importe"
          type="number"
          step="0.01"
          defaultValue={v.importe ?? adicional?.importe}
          required
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
