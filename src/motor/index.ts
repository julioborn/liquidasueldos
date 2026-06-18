/** API pública del motor. Sin imports de Next.js ni de Supabase: testeable de forma aislada. */

export * from "./core/tabla-parametrica";
export * from "./core/conceptos";
export * from "./legal/aportes";
export { registrarConvenio, obtenerFabricaConvenio, conveniosRegistrados } from "./convenios/registro";

import "./convenios/cct-345-2002"; // se registra al importar el motor
export * as Cct345_2002 from "./convenios/cct-345-2002";
