import unittest

from frete import calcular_frete


class TestFrete(unittest.TestCase):
    def test_sudeste(self):
        self.assertEqual(calcular_frete(2, "sudeste"), 17.0)

    def test_norte(self):
        self.assertEqual(calcular_frete(1, "norte"), 27.5)

    def test_regiao_invalida(self):
        with self.assertRaises(ValueError):
            calcular_frete(1, "marte")


if __name__ == "__main__":
    unittest.main()
