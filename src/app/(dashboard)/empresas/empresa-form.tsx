"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Empresa } from "@/lib/repos/empresas";
import type { EmpresaFormState } from "./actions";

interface EmpresaFormProps {
  action: (prevState: EmpresaFormState, formData: FormData) => Promise<EmpresaFormState>;
  empresa?: Empresa;
  submitLabel: string;
}

const initialState: EmpresaFormState = {};

export function EmpresaForm({ action, empresa, submitLabel }: EmpresaFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const v = state.values ?? {};

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <Campo id="razonSocial" label="Razón social" defaultValue={v.razonSocial ?? empresa?.razonSocial} required />
      <Campo
        id="cuit"
        label="CUIT"
        defaultValue={v.cuit ?? empresa?.cuit}
        required
        placeholder="20-12345678-3"
      />
      <Campo id="domicilio" label="Domicilio" defaultValue={v.domicilio ?? empresa?.domicilio ?? ""} />
      <Campo id="actividad" label="Actividad" defaultValue={v.actividad ?? empresa?.actividad ?? ""} />
      <Campo
        id="artCompania"
        label="ART — Compañía"
        defaultValue={v.artCompania ?? empresa?.artCompania ?? ""}
      />
      <Campo
        id="artNumeroContrato"
        label="ART — N° de contrato"
        defaultValue={v.artNumeroContrato ?? empresa?.artNumeroContrato ?? ""}
      />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tipoEmpleador">Tipo de empleador</Label>
        <Input
          id="tipoEmpleador"
          name="tipoEmpleador"
          defaultValue={v.tipoEmpleador ?? empresa?.tipoEmpleador ?? "GENERAL"}
        />
        <p className="text-xs text-muted-foreground">
          Clave para resolver la alícuota de contribuciones patronales (Dec. 814/01) — los valores posibles se
          confirman junto con el estudio en el módulo de Parámetros.
        </p>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}

function Campo({
  id,
  label,
  defaultValue,
  required,
  placeholder,
}: {
  id: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} defaultValue={defaultValue} required={required} placeholder={placeholder} />
    </div>
  );
}
