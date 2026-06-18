import { registrarConvenio } from "../registro";
import { construirConceptos } from "./conceptos";

export * from "./parametros";
export * from "./conceptos";

registrarConvenio("345/2002", construirConceptos);
