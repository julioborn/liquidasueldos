"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Convenio } from "@/lib/repos/convenios";
import type { ConvenioFormState } from "./actions";

interface ConvenioFormProps {
  action: (prevState: ConvenioFormState, formData: FormData) => Promise<ConvenioFormState>;
  convenio?: Convenio;
  submitLabel: string;
}

const initialState: ConvenioFormState = {};

export function ConvenioForm({ action, convenio, submitLabel }: ConvenioFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="codigo">Código</Label>
        <Input id="codigo" name="codigo" defaultValue={convenio?.codigo} required placeholder="345/2002" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          name="nombre"
          defaultValue={convenio?.nombre}
          required
          placeholder="Ej: Estaciones de servicio (SOESGPyLA / FAENI)"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="jurisdiccion">Jurisdicción</Label>
        <Input
          id="jurisdiccion"
          name="jurisdiccion"
          defaultValue={convenio?.jurisdiccion ?? ""}
          placeholder="Santa Fe"
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
