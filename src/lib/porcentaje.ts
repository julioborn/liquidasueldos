/**
 * El motor y la DB trabajan con alícuotas como fracción (0.11 = 11%), pero
 * tipear "0.11" en un formulario es propenso a error. Estas funciones son
 * solo de presentación: convierten en el borde UI/Server Action, nunca
 * dentro del motor ni de los repos.
 */

/** Fracción (0.11) -> porcentaje para mostrar en un input (11). */
export function fraccionAPorcentaje(fraccion: number): number {
  return Math.round(fraccion * 100 * 100) / 100;
}

/** Porcentaje ingresado por el usuario (11.5) -> fracción para guardar (0.115). */
export function porcentajeAFraccion(porcentaje: number): number {
  return Math.round((porcentaje / 100) * 10000) / 10000;
}
