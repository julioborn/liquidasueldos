"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type { Empresa } from "@/lib/repos/empresas";
import type { PeriodoFormState } from "./actions";

const TIPOS = [
  { value: "MENSUAL", label: "Mensual" },
  { value: "SAC_1", label: "SAC 1er semestre" },
  { value: "SAC_2", label: "SAC 2do semestre" },
  { value: "VACACIONES", label: "Vacaciones" },
  { value: "FINAL", label: "Liquidación final" },
  { value: "RETROACTIVO", label: "Ajuste retroactivo" },
];

interface PeriodoFormProps {
  action: (prevState: PeriodoFormState, formData: FormData) => Promise<PeriodoFormState>;
  empresas: Empresa[];
  submitLabel: string;
}

const initialState: PeriodoFormState = {};

export function PeriodoForm({ action, empresas, submitLabel }: PeriodoFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const v = state.values ?? {};
  const hoy = new Date();

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="empresaId">Empresa</Label>
        <NativeSelect id="empresaId" name="empresaId" defaultValue={v.empresaId ?? ""} required>
          <option value="" disabled>
            Seleccionar...
          </option>
          {empresas.map((empresa) => (
            <option key={empresa.id} value={empresa.id}>
              {empresa.razonSocial}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="anio">Año</Label>
          <Input
            id="anio"
            name="anio"
            type="number"
            defaultValue={v.anio ?? hoy.getFullYear()}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="mes">Mes</Label>
          <Input
            id="mes"
            name="mes"
            type="number"
            min={1}
            max={12}
            defaultValue={v.mes ?? hoy.getMonth() + 1}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tipo">Tipo</Label>
        <NativeSelect id="tipo" name="tipo" defaultValue={v.tipo ?? "MENSUAL"}>
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fechaPago">Fecha de pago (opcional)</Label>
        <Input id="fechaPago" name="fechaPago" type="date" defaultValue={v.fechaPago ?? ""} />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
