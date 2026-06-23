/** Años completos de antigüedad entre fechaIngreso y fechaReferencia (ambas YYYY-MM-DD), por aniversario. */
export function calcularAntiguedadAnios(fechaIngreso: string, fechaReferencia: string): number {
  const [anioIngreso, mesIngreso, diaIngreso] = fechaIngreso.split("-").map(Number);
  const [anioRef, mesRef, diaRef] = fechaReferencia.split("-").map(Number);

  let anios = anioRef - anioIngreso;
  const aunNoLlegoAniversario = mesRef < mesIngreso || (mesRef === mesIngreso && diaRef < diaIngreso);
  if (aunNoLlegoAniversario) anios -= 1;

  return Math.max(0, anios);
}
