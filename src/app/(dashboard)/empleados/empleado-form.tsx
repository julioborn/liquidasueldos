"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type { Empresa } from "@/lib/repos/empresas";
import type { Convenio } from "@/lib/repos/convenios";
import type { CategoriaConvenio } from "@/lib/repos/categorias-convenio";
import type { Empleado } from "@/lib/repos/empleados";
import type { EmpleadoFormState } from "./actions";

const MODALIDADES = [
  { value: "TIEMPO_INDETERMINADO", label: "Tiempo indeterminado" },
  { value: "PLAZO_FIJO", label: "Plazo fijo" },
  { value: "EVENTUAL", label: "Eventual" },
  { value: "TEMPORADA", label: "Temporada" },
];

interface EmpleadoFormProps {
  action: (prevState: EmpleadoFormState, formData: FormData) => Promise<EmpleadoFormState>;
  empresas: Empresa[];
  convenios: Convenio[];
  categorias: CategoriaConvenio[];
  empleado?: Empleado;
  submitLabel: string;
}

const initialState: EmpleadoFormState = {};

export function EmpleadoForm({
  action,
  empresas,
  convenios,
  categorias,
  empleado,
  submitLabel,
}: EmpleadoFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const v = state.values ?? {};
  const [convenioId, setConvenioId] = useState(v.convenioId ?? empleado?.convenioId ?? "");
  const categoriasDelConvenio = categorias.filter((c) => c.convenioId === convenioId);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="empresaId">Empresa</Label>
          <NativeSelect
            id="empresaId"
            name="empresaId"
            defaultValue={v.empresaId ?? empleado?.empresaId ?? ""}
            required
          >
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="legajo">Legajo</Label>
          <Input id="legajo" name="legajo" defaultValue={v.legajo ?? empleado?.legajo} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="apellido">Apellido</Label>
          <Input id="apellido" name="apellido" defaultValue={v.apellido ?? empleado?.apellido} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" name="nombre" defaultValue={v.nombre ?? empleado?.nombre} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cuil">CUIL</Label>
          <Input
            id="cuil"
            name="cuil"
            defaultValue={v.cuil ?? empleado?.cuil}
            required
            placeholder="20-12345678-3"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
          <Input
            id="fechaNacimiento"
            name="fechaNacimiento"
            type="date"
            defaultValue={v.fechaNacimiento ?? empleado?.fechaNacimiento ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fechaIngreso">Fecha de ingreso</Label>
          <Input
            id="fechaIngreso"
            name="fechaIngreso"
            type="date"
            defaultValue={v.fechaIngreso ?? empleado?.fechaIngreso}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fechaEgreso">Fecha de egreso</Label>
          <Input
            id="fechaEgreso"
            name="fechaEgreso"
            type="date"
            defaultValue={v.fechaEgreso ?? empleado?.fechaEgreso ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="convenioId">Convenio</Label>
          <NativeSelect
            id="convenioId"
            name="convenioId"
            value={convenioId}
            onChange={(e) => setConvenioId(e.target.value)}
          >
            <option value="">Sin asignar</option>
            {convenios.map((convenio) => (
              <option key={convenio.id} value={convenio.id}>
                {convenio.codigo} — {convenio.nombre}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="categoriaId">Categoría</Label>
          <NativeSelect
            id="categoriaId"
            name="categoriaId"
            defaultValue={v.categoriaId ?? empleado?.categoriaId ?? ""}
            disabled={!convenioId}
          >
            <option value="">{convenioId ? "Sin asignar" : "Elegí un convenio primero"}</option>
            {categoriasDelConvenio.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.codigo} — {categoria.nombre}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="modalidadContratacion">Modalidad de contratación</Label>
        <NativeSelect
          id="modalidadContratacion"
          name="modalidadContratacion"
          defaultValue={v.modalidadContratacion ?? empleado?.modalidadContratacion ?? "TIEMPO_INDETERMINADO"}
        >
          {MODALIDADES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="banco">Banco</Label>
          <Input id="banco" name="banco" defaultValue={v.banco ?? empleado?.banco ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cbu">CBU</Label>
          <Input id="cbu" name="cbu" defaultValue={v.cbu ?? empleado?.cbu ?? ""} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="domicilio">Domicilio</Label>
        <Input id="domicilio" name="domicilio" defaultValue={v.domicilio ?? empleado?.domicilio ?? ""} />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
