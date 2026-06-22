"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategoriaConvenio } from "@/lib/repos/categorias-convenio";
import type { CategoriaFormState } from "./actions";

interface CategoriaFormProps {
  action: (prevState: CategoriaFormState, formData: FormData) => Promise<CategoriaFormState>;
  categoria?: CategoriaConvenio;
  ordenSugerido?: number;
  submitLabel: string;
}

const initialState: CategoriaFormState = {};

export function CategoriaForm({ action, categoria, ordenSugerido, submitLabel }: CategoriaFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const v = state.values ?? {};

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="codigo">Código</Label>
        <Input
          id="codigo"
          name="codigo"
          defaultValue={v.codigo ?? categoria?.codigo}
          required
          placeholder="OPERARIO"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          name="nombre"
          defaultValue={v.nombre ?? categoria?.nombre}
          required
          placeholder="Operario de playa"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="orden">Orden</Label>
        <Input
          id="orden"
          name="orden"
          type="number"
          defaultValue={v.orden ?? categoria?.orden ?? ordenSugerido ?? 0}
        />
        <p className="text-xs text-muted-foreground">Determina el orden de aparición en listados y escalas.</p>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
