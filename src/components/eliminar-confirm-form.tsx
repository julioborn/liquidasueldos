"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";

interface EliminarConfirmFormState {
  error?: string;
}

interface EliminarConfirmFormProps {
  action: (prevState: EliminarConfirmFormState, formData: FormData) => Promise<EliminarConfirmFormState>;
  confirmMessage: string;
}

const initialState: EliminarConfirmFormState = {};

/** Botón "Eliminar" con confirmación nativa y feedback de error vía useActionState. */
export function EliminarConfirmForm({ action, confirmMessage }: EliminarConfirmFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        Eliminar
      </Button>
      {state.error && <p className="mt-1 text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
