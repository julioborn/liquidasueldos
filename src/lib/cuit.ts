/**
 * Utilidades de CUIT: no son un valor normativo a confirmar (como sí lo son
 * escalas o alícuotas) sino un algoritmo de checksum público de ARCA/AFIP
 * (módulo 11), seguro de implementar directamente.
 */

const PESOS_VERIFICADOR = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

/** Deja solo los 11 dígitos, sin guiones ni espacios. */
export function normalizarCuit(input: string): string {
  return input.replace(/\D/g, "");
}

/** Formatea 11 dígitos como XX-XXXXXXXX-X. Si no son exactamente 11, devuelve el input sin tocar. */
export function formatearCuit(input: string): string {
  const digitos = normalizarCuit(input);
  if (digitos.length !== 11) return input;
  return `${digitos.slice(0, 2)}-${digitos.slice(2, 10)}-${digitos.slice(10)}`;
}

/** Valida el dígito verificador de un CUIT (algoritmo módulo 11). */
export function esCuitValido(input: string): boolean {
  const digitos = normalizarCuit(input);
  if (!/^\d{11}$/.test(digitos)) return false;

  const suma = PESOS_VERIFICADOR.reduce((acc, peso, i) => acc + peso * Number(digitos[i]), 0);
  const resto = suma % 11;
  const verificador = resto === 0 ? 0 : 11 - resto;
  if (verificador === 10) return false; // combinación de los primeros 10 dígitos sin dígito verificador posible

  return verificador === Number(digitos[10]);
}
