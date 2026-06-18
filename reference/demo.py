"""
Demo del motor de liquidación CCT 345/2002.

NOTA: carga básicos de DEMOSTRACIÓN (no oficiales) solo para verificar que
el motor calcula correctamente. Reemplazar por la escala real del estudio.
"""

from datetime import date
from motor import parametros as P
from motor.conceptos import Acum, TipoConcepto
from motor.cct345 import liquidar_mensual

# --- Cargar básicos de DEMO en la tabla paramétrica (valores ilustrativos) ---
# Reemplazar estos números por la escala oficial vigente.
P.escala_convenio._filas.clear()
P.escala_convenio.agregar(
    desde=date(2026, 3, 1), hasta=None,
    valores={
        "basicos": {
            "ENCARGADO": 1_450_000.0,      # DEMO — no oficial
            "ADMINISTRATIVO": 1_370_000.0, # DEMO — no oficial
            "OPERARIO": 1_360_000.0,       # DEMO — no oficial
        },
        "adicionales_fijos": {
            "ASISTENCIA_PERFECTA": 110_000.0,  # DEMO
            "MANEJO_DE_FONDOS": 110_000.0,     # DEMO
        },
    },
)

# --- Caso de prueba: operario de playa, 5 años de antigüedad ---
legajo = {
    "nombre": "Juan Pérez",
    "categoria": "OPERARIO",
    "antiguedad_anios": 5,
    "dias_trabajados": 30,
    "he_50": 10,      # 10 horas extra al 50%
    "he_100": 4,      # 4 horas extra al 100%
    "asistencia_perfecta": True,
    "manejo_fondos": False,
}

fecha = date(2026, 5, 1)
liq = liquidar_mensual(legajo, fecha)

# --- Imprimir recibo en consola ---
print("=" * 64)
print(f"  LIQUIDACIÓN — {legajo['nombre']} ({legajo['categoria']})")
print(f"  CCT 345/2002 — Período {fecha.strftime('%m/%Y')}")
print(f"  Antigüedad: {legajo['antiguedad_anios']} años")
print("=" * 64)
print(f"{'Cód':<5}{'Concepto':<30}{'Cant':>7}{'Haberes':>12}{'Desc.':>12}")
print("-" * 64)
for l in liq.lineas:
    hab = f"{l.importe:,.2f}" if l.tipo != TipoConcepto.DEDUCCION else ""
    des = f"{-l.importe:,.2f}" if l.tipo == TipoConcepto.DEDUCCION else ""
    print(f"{l.codigo:<5}{l.descripcion:<30}{l.cantidad:>7.2f}{hab:>12}{des:>12}")
print("-" * 64)
print(f"{'Total remunerativo:':<42}{liq.get(Acum.REMUNERATIVO):>22,.2f}")
print(f"{'Total descuentos:':<42}{-liq.get(Acum.DESCUENTOS):>22,.2f}")
print(f"{'NETO A COBRAR:':<42}{liq.get(Acum.NETO):>22,.2f}")
print("=" * 64)
print("\n[!] Básicos y adicionales usados son de DEMOSTRACIÓN, no oficiales.")
print("    Reemplazar por la escala vigente del CCT 345/2002 del estudio.")
