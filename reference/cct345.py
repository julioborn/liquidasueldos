"""
Conceptos concretos del CCT 345/2002 y armado de la liquidación mensual.

Las REGLAS aplicadas (confirmadas de fuentes oficiales del convenio):
- Jornada: régimen de 200 hs mensuales (art. 11) -> valor hora = básico / 200
- Antigüedad: 2% por año (art. 25). Base configurable (básico o bruto).
- Horas extra: 50% (días 06-21 hs) y 100% (21-06 hs, sáb. post 13 hs y dom.).
  Base de horas extra: básico + antigüedad (texto del convenio).
- Adicionales de convenio: asistencia perfecta (art. 25) y manejo de
  fondos (art. 26), montos fijos de escala.
- Cuota solidaria: 2% (art. 31) a todo el personal.
- Aportes de ley: jubilación 11%, PAMI 3%, obra social 3%.
"""

from motor.conceptos import Concepto, TipoConcepto, Acum, Liquidacion
from motor import parametros as P


def construir_conceptos(fecha):
    escala = P.escala_convenio.en_fecha(fecha)
    reglas = P.reglas_convenio.en_fecha(fecha)
    aportes = P.aportes_trabajador.en_fecha(fecha)

    basicos = escala["basicos"]
    adic = escala["adicionales_fijos"]
    horas_mes = reglas["horas_mensuales"]
    antig_pct = reglas["antiguedad_pct_por_anio"]
    antig_base = reglas["antiguedad_base"]
    f50 = reglas["he_50_factor"]
    f100 = reglas["he_100_factor"]
    solidaria_pct = reglas["cuota_solidaria_pct"]

    conceptos = []

    # 1) SUELDO BÁSICO (proporcional a días/horas trabajadas si corresponde)
    def calc_basico(ctx, acum):
        basico = basicos[ctx["categoria"]]
        # proporcional por días trabajados sobre 30
        prop = ctx.get("dias_trabajados", 30) / 30.0
        importe = basico * prop
        return prop * 30, basico, importe

    conceptos.append(Concepto(
        "100", "Sueldo básico", TipoConcepto.REMUNERATIVO, calc_basico,
        aporta_a=[Acum.REMUNERATIVO, Acum.BASE_ANTIGUEDAD, Acum.BASE_HORAS_EXTRA],
    ))

    # 2) ANTIGÜEDAD: 2% por año sobre la base configurada
    def calc_antiguedad(ctx, acum):
        anios = ctx.get("antiguedad_anios", 0)
        if anios <= 0:
            return 0, 0, 0
        if antig_base == "BASICO":
            base = acum.get(Acum.BASE_ANTIGUEDAD, 0.0)
        else:  # BRUTO: se aproxima con el remunerativo acumulado hasta acá
            base = acum.get(Acum.REMUNERATIVO, 0.0)
        pct = antig_pct * anios
        importe = base * pct
        return anios, base * antig_pct, importe

    conceptos.append(Concepto(
        "110", "Antigüedad", TipoConcepto.REMUNERATIVO, calc_antiguedad,
        aporta_a=[Acum.REMUNERATIVO, Acum.BASE_HORAS_EXTRA],
        condicion=lambda ctx: ctx.get("antiguedad_anios", 0) > 0,
    ))

    # 3) HORAS EXTRA AL 50%  (base: básico + antigüedad / 200)
    def calc_he50(ctx, acum):
        cant = ctx.get("he_50", 0)
        if cant <= 0:
            return 0, 0, 0
        valor_hora = acum.get(Acum.BASE_HORAS_EXTRA, 0.0) / horas_mes
        vu = valor_hora * f50
        return cant, vu, cant * vu

    conceptos.append(Concepto(
        "120", "Horas extra 50%", TipoConcepto.REMUNERATIVO, calc_he50,
        aporta_a=[Acum.REMUNERATIVO],
        condicion=lambda ctx: ctx.get("he_50", 0) > 0,
    ))

    # 4) HORAS EXTRA AL 100%
    def calc_he100(ctx, acum):
        cant = ctx.get("he_100", 0)
        if cant <= 0:
            return 0, 0, 0
        valor_hora = acum.get(Acum.BASE_HORAS_EXTRA, 0.0) / horas_mes
        vu = valor_hora * f100
        return cant, vu, cant * vu

    conceptos.append(Concepto(
        "121", "Horas extra 100%", TipoConcepto.REMUNERATIVO, calc_he100,
        aporta_a=[Acum.REMUNERATIVO],
        condicion=lambda ctx: ctx.get("he_100", 0) > 0,
    ))

    # 5) ASISTENCIA PERFECTA (art. 25) — monto fijo, si aplica
    def calc_asist(ctx, acum):
        m = adic["ASISTENCIA_PERFECTA"]
        return 1, m, m

    conceptos.append(Concepto(
        "130", "Adic. asistencia perfecta", TipoConcepto.REMUNERATIVO, calc_asist,
        aporta_a=[Acum.REMUNERATIVO],
        condicion=lambda ctx: ctx.get("asistencia_perfecta", False),
    ))

    # 6) MANEJO DE FONDOS (art. 26) — monto fijo, si aplica
    def calc_fondos(ctx, acum):
        m = adic["MANEJO_DE_FONDOS"]
        return 1, m, m

    conceptos.append(Concepto(
        "131", "Adic. manejo de fondos", TipoConcepto.REMUNERATIVO, calc_fondos,
        aporta_a=[Acum.REMUNERATIVO],
        condicion=lambda ctx: ctx.get("manejo_fondos", False),
    ))

    # ---- DEDUCCIONES (sobre el acumulado REMUNERATIVO) ----
    def deduccion(pct):
        def _calc(ctx, acum):
            base = acum.get(Acum.REMUNERATIVO, 0.0)
            imp = -base * pct
            return pct * 100, base, imp
        return _calc

    conceptos.append(Concepto(
        "200", "Jubilación 11%", TipoConcepto.DEDUCCION, deduccion(aportes["jubilacion"]),
        aporta_a=[Acum.DESCUENTOS],
    ))
    conceptos.append(Concepto(
        "201", "Ley 19.032 (PAMI) 3%", TipoConcepto.DEDUCCION, deduccion(aportes["ley_19032"]),
        aporta_a=[Acum.DESCUENTOS],
    ))
    conceptos.append(Concepto(
        "202", "Obra social 3%", TipoConcepto.DEDUCCION, deduccion(aportes["obra_social"]),
        aporta_a=[Acum.DESCUENTOS],
    ))
    conceptos.append(Concepto(
        "210", "Cuota solidaria 2% (art. 31)", TipoConcepto.DEDUCCION, deduccion(solidaria_pct),
        aporta_a=[Acum.DESCUENTOS],
    ))

    return conceptos


def liquidar_mensual(legajo: dict, fecha) -> Liquidacion:
    """legajo: dict con datos del empleado y novedades del período."""
    conceptos = construir_conceptos(fecha)
    liq = Liquidacion()
    liq.ejecutar(conceptos, legajo)
    # neto = remunerativo + no remunerativo - descuentos
    neto = (liq.get(Acum.REMUNERATIVO)
            + liq.get(Acum.NO_REMUNERATIVO)
            + liq.get(Acum.DESCUENTOS))  # descuentos ya es negativo
    liq.acumuladores[Acum.NETO] = round(neto, 2)
    return liq
