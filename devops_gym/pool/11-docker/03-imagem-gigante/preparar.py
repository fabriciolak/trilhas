# Imagem gigante: gera o "backup do banco" de ~120 MB que alguém esqueceu na pasta
# (grande demais para morar no git) e some com sobras de tentativas anteriores.
linha = "INSERT INTO produtos (id, nome, preco) VALUES (4242, 'Pelúcia de pinguim edição limitada', 59.90);\n"
dados = oficina / "catalogo" / "dados"
dados.mkdir(parents=True, exist_ok=True)
with open(dados / "backup-catalogo.sql", "w", encoding="utf-8", newline="\n") as f:
    bloco = linha * 10_000
    for _ in range(120 * 1024 * 1024 // len(bloco.encode()) + 1):
        f.write(bloco)
docker("rm", "-f", "gym-catalogo-verificacao")
