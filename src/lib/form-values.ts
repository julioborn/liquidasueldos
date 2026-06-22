/**
 * React resetea los inputs no controlados (defaultValue) de un <form> después
 * de que su Server Action termina, aunque la acción devuelva un error. Para
 * que el usuario no pierda lo que tipeó, cada acción "ecoa" el FormData
 * recibido en el state de error, y el form lo usa como defaultValue.
 */
export function valoresDeFormulario(formData: FormData): Record<string, string> {
  return Object.fromEntries(formData) as Record<string, string>;
}
