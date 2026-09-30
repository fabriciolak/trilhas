"""Cálculo de frete da Pinguim Store."""


def calcular_frete(peso_kg: float, regiao: str) -> float:
    """Frete em reais: base por região + R$ 2,50 por kg. Acima de R$ 300 em compras é grátis
    (isso fica no carrinho, não aqui)."""
    bases = {"sudeste": 12.0, "sul": 15.0, "centro-oeste": 18.0, "nordeste": 20.0, "norte": 25.0}
    if regiao not in bases:
        raise ValueError(f"região desconhecida: {regiao}")
    if peso_kg <= 0:
        raise ValueError("peso precisa ser positivo")
    return round(bases[regiao] + 2.5 * peso_kg, 2)
