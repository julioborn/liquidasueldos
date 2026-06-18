"""
Tablas paramétricas con vigencia por fecha.

PRINCIPIO CLAVE: el motor NO tiene valores fijos. Todo importe, alícuota,
tope o escala se consulta acá pasando una fecha, y se devuelve el valor
vigente a esa fecha. Un cambio de paritaria o de alícuota se resuelve
agregando una fila nueva, sin tocar el motor de cálculo.

IMPORTANTE: los valores de la ESCALA DEL CONVENIO (básicos y adicionales)
que figuran abajo son PLACEHOLDERS de estructura. Deben reemplazarse por la
escala oficial vigente del CCT 345/2002 (SOESGPyLA / FAENI) que maneje el
estudio. Las alícuotas previsionales y topes también deben confirmarse
contra la normativa vigente al período liquidado.
"""

from datetime import date
from dataclasses import dataclass
from typing import Optional


@dataclass
class FilaVigencia:
    desde: date
    hasta: Optional[date]  # None = sin fecha de corte
    valores: dict

    def vigente_en(self, f: date) -> bool:
        if f < self.desde:
            return False
        if self.hasta is not None and f > self.hasta:
            return False
        return True


class TablaParametrica:
    """Tabla genérica con resolución por fecha de vigencia."""

    def __init__(self, nombre: str):
        self.nombre = nombre
        self._filas: list[FilaVigencia] = []

    def agregar(self, desde: date, hasta: Optional[date], valores: dict):
        self._filas.append(FilaVigencia(desde, hasta, valores))
        return self

    def en_fecha(self, f: date) -> dict:
        candidatas = [fila for fila in self._filas if fila.vigente_en(f)]
        if not candidatas:
            raise ValueError(
                f"Tabla '{self.nombre}': no hay valores vigentes al {f.isoformat()}"
            )
        # la de inicio más reciente gana (por si hay solapamientos)
        candidatas.sort(key=lambda x: x.desde, reverse=True)
        return candidatas[0].valores


# ---------------------------------------------------------------------------
# ESCALA DEL CONVENIO CCT 345/2002  (PLACEHOLDERS — reemplazar por escala real)
# ---------------------------------------------------------------------------
# Categorías típicas del convenio: Encargado, Administrativo, Operario.
# Estructura: básico por categoría + adicionales de convenio (montos fijos).

escala_convenio = TablaParametrica("escala_cct_345")
escala_convenio.agregar(
    desde=date(2026, 3, 1), hasta=None,
    valores={
        "basicos": {
            # categoria : sueldo básico mensual (200 hs)
            "ENCARGADO":     0.0,   # <-- completar con escala oficial vigente
            "ADMINISTRATIVO": 0.0,  # <-- completar
            "OPERARIO":      0.0,   # <-- completar
        },
        "adicionales_fijos": {
            "ASISTENCIA_PERFECTA": 0.0,  # art. 25 — <-- completar
            "MANEJO_DE_FONDOS":    0.0,  # art. 26 — <-- completar
        },
    },
)

# ---------------------------------------------------------------------------
# PARÁMETROS DEL CONVENIO (reglas estructurales confirmadas)
# ---------------------------------------------------------------------------
reglas_convenio = TablaParametrica("reglas_cct_345")
reglas_convenio.agregar(
    desde=date(2002, 1, 1), hasta=None,
    valores={
        "horas_mensuales": 200,            # art. 11: régimen de 200 hs
        "antiguedad_pct_por_anio": 0.02,   # art. 25: 2% por año
        # base de cálculo de antigüedad: "BRUTO" (texto del art. 25) o "BASICO".
        # Configurable porque hay práctica liquidatoria de ambas formas.
        "antiguedad_base": "BASICO",
        "he_50_factor": 1.5,
        "he_100_factor": 2.0,
        "cuota_solidaria_pct": 0.02,       # art. 31: 2% s/ remuneraciones
    },
)

# ---------------------------------------------------------------------------
# APORTES DEL TRABAJADOR (confirmar alícuotas y topes vigentes)
# ---------------------------------------------------------------------------
aportes_trabajador = TablaParametrica("aportes_trabajador")
aportes_trabajador.agregar(
    desde=date(2024, 1, 1), hasta=None,
    valores={
        "jubilacion": 0.11,     # Ley 24.241
        "ley_19032": 0.03,      # INSSJP/PAMI
        "obra_social": 0.03,    # Ley 23.660
    },
)

# Tope (base imponible máxima) para aportes con tope SIPA. Placeholder.
topes_sipa = TablaParametrica("topes_sipa")
topes_sipa.agregar(
    desde=date(2026, 3, 1), hasta=None,
    valores={
        "base_min": 0.0,   # <-- completar con base mínima vigente
        "base_max": 0.0,   # <-- completar con base máxima vigente (0 = sin tope aplicado)
    },
)
