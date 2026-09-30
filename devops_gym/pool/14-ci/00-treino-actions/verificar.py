# Treino de GitHub Actions: actionlint limpo e a estrutura pedida (gatilhos, permissões,
# concorrência, matriz, needs, if, segredo por env).
# Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina.
import re

repo = oficina / "projeto"
arquivo = repo / ".github" / "workflows" / "ci.yml"
wf = arquivo.read_text(encoding="utf-8") if arquivo.exists() else ""
checar("o workflow existe em projeto/.github/workflows/ci.yml", bool(wf), "crie as pastas .github/workflows dentro de projeto/")
rc, saida = docker("run", "--rm", "-v", f"{repo}:/repo", "-w", "/repo", "rhysd/actionlint:1.7.12", "-no-color",
                    ".github/workflows/ci.yml")
primeira = saida.strip().splitlines()[0] if saida.strip() else ""
checar("7. o actionlint não reclama de nada", bool(wf) and rc == 0, f"rode o actionlint. Primeiro erro: {primeira}")


def job(nome: str) -> str:
    """O trecho do job (da linha '  nome:' até o próximo job de mesmo recuo)."""
    m = re.search(rf"^  {nome}:\s*\n(.*?)(?=^  [\w-]+:\s*$|\Z)", wf, re.M | re.S)
    return m.group(1) if m else ""


checar("1. nome CI", bool(re.search(r"^name:\s*['\"]?CI['\"]?\s*$", wf, re.M)), "name: CI")
checar("1. push na main", bool(re.search(r"push:\s*\n\s+branches:\s*(\[\s*['\"]?main|\n\s+-\s*['\"]?main)", wf)), "on: push: branches: [main]")
checar("1. pull request e botão manual", "pull_request" in wf and "workflow_dispatch" in wf, "on: pull_request: e workflow_dispatch:")
checar("2. o token só lê o código", bool(re.search(r"^permissions:\s*\n\s+contents:\s*read", wf, re.M)), "permissions: contents: read (no topo)")
checar("2. push novo cancela o anterior", "concurrency:" in wf and bool(re.search(r"cancel-in-progress:\s*true", wf)),
       "concurrency: group: ${{ github.workflow }}-${{ github.ref }} / cancel-in-progress: true")
testes, lint, imagem = job("testes"), job("lint"), job("imagem")
checar("3. job testes no Ubuntu 24.04", "ubuntu-24.04" in testes, "runs-on: ubuntu-24.04")
checar("3. matriz com 3.13 e 3.14", "matrix:" in testes and "3.13" in testes and "3.14" in testes, 'matrix: python: ["3.13", "3.14"]')
checar("3. checkout e setup-python atuais (v4 ou mais nova)",
       all(int(v) >= 4 for v in re.findall(r"actions/(?:checkout|setup-python)@v(\d+)", testes))
       and "actions/checkout@" in testes and "actions/setup-python@" in testes, "uses: actions/checkout@v7 e actions/setup-python@v7")
checar("3. o Python vem da matriz", bool(re.search(r"python-version:\s*\$\{\{\s*matrix\.\w+\s*\}\}", testes)),
       "with: python-version: ${{ matrix.python }}")
checar("3. roda os testes", "unittest discover -s app" in testes, "run: python -m unittest discover -s app")
checar("4. job lint com shellcheck", "shellcheck" in lint and "scripts/" in lint, "run: shellcheck scripts/*.sh")
checar("5. imagem espera testes e lint", bool(re.search(r"needs:\s*\[\s*['\"]?(testes|lint)['\"]?\s*,\s*['\"]?(testes|lint)['\"]?\s*\]", imagem))
       or (re.search(r"needs:\s*\n\s+-\s*testes", imagem) and re.search(r"-\s*lint", imagem)), "needs: [testes, lint]")
checar("5. imagem só em push na main", "refs/heads/main" in imagem and "push" in imagem,
       "if: github.event_name == 'push' && github.ref == 'refs/heads/main'")
checar("5. docker build com a tag do SHA", bool(re.search(r"docker build .*loja:\$\{\{\s*github\.sha\s*\}\}", imagem)),
       "run: docker build -t loja:${{ github.sha }} .")
checar("6. o segredo chega por env (TOKEN)", bool(re.search(r"TOKEN:\s*\$\{\{\s*secrets\.AVISO_TOKEN\s*\}\}", imagem)),
       "env: TOKEN: ${{ secrets.AVISO_TOKEN }}")
checar("6. nenhum segredo ou dado do evento interpolado direto num run:",
       not re.search(r"run:[^\n]*\$\{\{\s*(secrets|github\.event)\.", wf), 'use "$TOKEN" no run, não ${{ secrets... }}')
