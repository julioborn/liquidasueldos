"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { fraccionAPorcentaje } from "@/lib/porcentaje";
import type { ReglaConvenio } from "@/lib/repos/reglas-convenio";
import type { ReglaFormState } from "./actions";

interface ReglaFormProps {
  action: (prevState: ReglaFormState, formData: FormData) => Promise<ReglaFormState>;
  regla?: ReglaConvenio;
  submitLabel: string;
}

const initialState: ReglaFormState = {};

export function ReglaForm({ action, regla, submitLabel }: ReglaFormProps) {
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
            defaultValue={v.vigenciaDesde ?? regla?.vigenciaDesde}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vigenciaHasta">Vigencia hasta</Label>
          <Input
            id="vigenciaHasta"
            name="vigenciaHasta"
            type="date"
            defaultValue={v.vigenciaHasta ?? regla?.vigenciaHasta ?? ""}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="horasMensuales">Horas mensuales (art. 11)</Label>
        <Input
          id="horasMensuales"
          name="horasMensuales"
          type="number"
          defaultValue={v.horasMensuales ?? regla?.horasMensuales ?? 200}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="antiguedadPctAnio">Antigüedad % por año (art. 25)</Label>
          <Input
            id="antiguedadPctAnio"
            name="antiguedadPctAnio"
            type="number"
            step="0.01"
            defaultValue={v.antiguedadPctAnio ?? (regla ? fraccionAPorcentaje(regla.antiguedadPctAnio) : 2)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="antiguedadBase">Base de antigüedad</Label>
          <NativeSelect
            id="antiguedadBase"
            name="antiguedadBase"
            defaultValue={v.antiguedadBase ?? regla?.antiguedadBase ?? "BRUTO"}
          >
            <option value="BRUTO">BRUTO (texto literal art. 25)</option>
            <option value="BASICO">BASICO (práctica liquidatoria)</option>
          </NativeSelect>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="he50Factor">Factor HE 50%</Label>
          <Input
            id="he50Factor"
            name="he50Factor"
            type="number"
            step="0.01"
            defaultValue={v.he50Factor ?? regla?.he50Factor ?? 1.5}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="he100Factor">Factor HE 100%</Label>
          <Input
            id="he100Factor"
            name="he100Factor"
            type="number"
            step="0.01"
            defaultValue={v.he100Factor ?? regla?.he100Factor ?? 2}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cuotaSolidariaPct">Cuota solidaria % (art. 31)</Label>
        <Input
          id="cuotaSolidariaPct"
          name="cuotaSolidariaPct"
          type="number"
          step="0.01"
          defaultValue={v.cuotaSolidariaPct ?? (regla ? fraccionAPorcentaje(regla.cuotaSolidariaPct) : 2)}
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
