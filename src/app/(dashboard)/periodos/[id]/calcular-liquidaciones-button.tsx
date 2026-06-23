"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { ResumenFormState } from "./liquidaciones-actions";

interface CalcularLiquidacionesButtonProps {
  action: (prevState: ResumenFormState, formData: FormData) => Promise<ResumenFormState>;
}

const initialState: ResumenFormState = {};

export function CalcularLiquidacionesButton({ action }: CalcularLiquidacionesButtonProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <div className="flex flex-col gap-2">
      <form action={formAction}>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Calculando..." : "Calcular liquidaciones"}
        </Button>
      </form>
      {state.mensaje && <p className="text-sm">{state.mensaje}</p>}
      {state.errores && state.errores.length > 0 && (
        <ul className="text-sm text-destructive">
          {state.errores.map((e) => (
            <li key={e.empleadoId}>
              {e.nombre}: {e.error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
