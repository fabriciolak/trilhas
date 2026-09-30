# Pipeline quebrado: actionlint limpo e as regras de negócio (publicar só na main, permissões
# mínimas, actions atuais). Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina.
import re

repo = oficina / "loja-ci"
wf = (repo / ".github" / "workflows" / "ci.yml").read_text(encoding="utf-8")

rc, saida = docker("run", "--rm", "-v", f"{repo}:/repo", "-w", "/repo", "rhysd/actionlint:1.7.12", "-no-color",
                    ".github/workflows/ci.yml")
primeira = saida.strip().splitlines()[0] if saida.strip() else ""
checar("o actionlint não reclama de nada", rc == 0, f"rode o actionlint na pasta loja-ci. Primeiro erro: {primeira}")

checar("dispara em push na main", re.search(r"push:\s*\n\s+branches:\s*(\[\s*['\"]?main|\n\s+-\s*['\"]?main)", wf),
       "on: push: branches: [main]")
checar("dispara em pull request", "pull_request" in wf, "on: pull_request:")
versoes = [int(v) for v in re.findall(r"actions/checkout@v(\d+)", wf)]
checar("nenhuma action de checkout abandonada (v4 ou mais nova)", versoes and min(versoes) >= 4,
       "o actionlint avisa: o runner do actions/checkout@v2 é velho demais")
checar("nenhum dado do PR interpolado direto num run:",
       not re.search(r"run:[^\n]*\$\{\{\s*github\.event\.", wf),
       "passe por env: (TITULO: ${{ ... }}) e use \"$TITULO\" no run")
checar("o job da imagem espera os testes", re.search(r"needs:\s*\[?\s*testes", wf), "needs: testes (o nome do job)")
checar("a imagem só é publicada em push na main",
       re.search(r"if:\s*.*(github\.ref\s*==\s*'refs/heads/main'|github\.event_name\s*==\s*'push')", wf),
       "if: github.event_name == 'push' && github.ref == 'refs/heads/main' no job da imagem")
checar("permissão de escrita em pacotes para publicar no GHCR", re.search(r"packages:\s*write", wf),
       "permissions: packages: write (no job da imagem)")
checar("o resto só lê o código", re.search(r"contents:\s*read", wf), "permissions: contents: read")
checar("a tag usa a saída certa do passo meta", "steps.meta.outputs.tag" in wf, "o id do passo é meta")
