import unittest

from calculo import parcela


class TestParcela(unittest.TestCase):
    def test_divide(self):
        self.assertEqual(parcela(100.0, 4), 25.0)

    def test_arredonda(self):
        self.assertEqual(parcela(100.0, 3), 33.33)

    def test_zero_vezes(self):
        with self.assertRaises(ValueError):
            parcela(100.0, 0)
