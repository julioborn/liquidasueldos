"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategoriaConvenio } from "@/lib/repos/categorias-convenio";
import type { EscalaConvenioFila } from "@/lib/repos/escalas-convenio";
import type { EscalaFormState } from "./actions";

interface EscalaFormProps {
  action: (prevState: EscalaFormState, formData: FormData) => Promise<EscalaFormState>;
  categorias: CategoriaConvenio[];
  /** Filas existentes de la vigencia (modo edición); vacío en alta. */
  filasExistentes?: EscalaConvenioFila[];
  vigenciaDesdeFija?: string;
  submitLabel: string;
}

const initialState: EscalaFormState = {};

export function EscalaForm({
  action,
  categorias,
  filasExistentes,
  vigenciaDesdeFija,
  submitLabel,
}: EscalaFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const v = state.values ?? {};
  const basicoPorCategoriaId = new Map(filasExistentes?.map((f) => [f.categoriaId, f.basico]));
  const vigenciaHastaExistente = filasExistentes?.[0]?.vigenciaHasta ?? "";

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vigenciaDesde">Vigencia desde</Label>
          <Input
            id="vigenciaDesde"
            name="vigenciaDesde"
            type="date"
            defaultValue={v.vigenciaDesde ?? vigenciaDesdeFija}
            readOnly={Boolean(vigenciaDesdeFija)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vigenciaHasta">Vigencia hasta</Label>
          <Input
            id="vigenciaHasta"
            name="vigenciaHasta"
            type="date"
            defaultValue={v.vigenciaHasta ?? vigenciaHastaExistente}
          />
          <p className="text-xs text-muted-foreground">Vacío = sin fecha de corte (vigente hasta la próxima alta).</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Básico mensual por categoría (régimen 200 hs)</p>
        {categorias.map((categoria) => (
          <div key={categoria.id} className="flex flex-col gap-1.5">
            <Label htmlFor={`basico_${categoria.id}`}>
              {categoria.codigo} — {categoria.nombre}
            </Label>
            <Input
              id={`basico_${categoria.id}`}
              name={`basico_${categoria.id}`}
              type="number"
              step="0.01"
              defaultValue={v[`basico_${categoria.id}`] ?? basicoPorCategoriaId.get(categoria.id)}
              required
            />
          </div>
        ))}
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
