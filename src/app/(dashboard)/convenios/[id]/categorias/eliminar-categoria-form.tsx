"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { CategoriaFormState } from "./actions";

interface EliminarCategoriaFormProps {
  action: (prevState: CategoriaFormState, formData: FormData) => Promise<CategoriaFormState>;
}

const initialState: CategoriaFormState = {};

export function EliminarCategoriaForm({ action }: EliminarCategoriaFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("¿Eliminar esta categoría? Esta acción no se puede deshacer.")) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        Eliminar
      </Button>
      {state.error && <p className="mt-1 text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
