"""Cálculos da loja."""


def parcela(total: float, vezes: int) -> float:
    """Valor de cada parcela, arredondado para centavos."""
    if vezes < 1:
        raise ValueError("vezes precisa ser pelo menos 1")
    return round(total / vezes, 2)
