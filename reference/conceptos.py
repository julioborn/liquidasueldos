"""
Modelo de conceptos de liquidación y acumuladores.

Un CONCEPTO es una línea del recibo. Cada concepto sabe:
- su tipo (remunerativo, no remunerativo, deducción, informativo)
- cómo se calcula (función de cálculo)
- a qué ACUMULADORES aporta su resultado

Los acumuladores son los totales sobre los que después operan otros
conceptos (ej: aportes se calculan sobre el acumulador REMUNERATIVO).
Esta abstracción es lo que hace al motor parametrizable y mantenible:
agregar un concepto nuevo no requiere tocar la lógica de los demás.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Callable


class TipoConcepto(Enum):
    REMUNERATIVO = "Remunerativo"
    NO_REMUNERATIVO = "No remunerativo"
    DEDUCCION = "Deducción"
    INFORMATIVO = "Informativo"


# Acumuladores estándar. Se pueden agregar más sin tocar el motor.
class Acum:
    REMUNERATIVO = "REMUNERATIVO"          # base de aportes
    NO_REMUNERATIVO = "NO_REMUNERATIVO"
    BASE_ANTIGUEDAD = "BASE_ANTIGUEDAD"    # sobre qué se calcula antigüedad
    BASE_HORAS_EXTRA = "BASE_HORAS_EXTRA"  # básico + antigüedad
    DESCUENTOS = "DESCUENTOS"
    NETO = "NETO"


@dataclass
class LineaRecibo:
    codigo: str
    descripcion: str
    tipo: TipoConcepto
    cantidad: float        # ej: cantidad de horas, % aplicado, o 1
    valor_unitario: float  # base sobre la que se aplica
    importe: float         # resultado final con signo (deducción negativa)


@dataclass
class Concepto:
    codigo: str
    descripcion: str
    tipo: TipoConcepto
    # calcular(contexto, acumuladores) -> (cantidad, valor_unitario, importe)
    calcular: Callable
    aporta_a: list = field(default_factory=list)
    # condicion(contexto) -> bool : si el concepto aplica este período
    condicion: Callable = lambda ctx: True


class Liquidacion:
    """Ejecuta una lista ordenada de conceptos acumulando resultados."""

    def __init__(self):
        self.acumuladores: dict[str, float] = {}
        self.lineas: list[LineaRecibo] = []

    def _acumular(self, nombre: str, monto: float):
        self.acumuladores[nombre] = self.acumuladores.get(nombre, 0.0) + monto

    def get(self, nombre: str) -> float:
        return self.acumuladores.get(nombre, 0.0)

    def ejecutar(self, conceptos: list[Concepto], contexto: dict):
        for c in conceptos:
            if not c.condicion(contexto):
                continue
            cantidad, valor_unit, importe = c.calcular(contexto, self.acumuladores)
            if importe == 0 and cantidad == 0:
                continue
            self.lineas.append(LineaRecibo(
                codigo=c.codigo, descripcion=c.descripcion, tipo=c.tipo,
                cantidad=round(cantidad, 2), valor_unitario=round(valor_unit, 2),
                importe=round(importe, 2),
            ))
            for acum in c.aporta_a:
                self._acumular(acum, importe)
        return self
