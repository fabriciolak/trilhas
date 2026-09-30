#!/usr/bin/env python3
"""Testa os tickets de ponta a ponta. É para quem escreve tickets, não para quem treina.

Para cada ticket, num ambiente limpo, o verificar precisa REPROVAR antes da solução e
APROVAR depois dela (solucao.sh roda como aluno no laboratório, ou na oficina no host).

Uso, dentro de devops_gym/:
  python3 lab/testar.py                   todos os tickets
  python3 lab/testar.py disco log-em      só os que combinam com algum dos textos
  python3 lab/testar.py --sem-build ...   não reconstrói a imagem do laboratório
"""

from __future__ import annotations

import contextlib
import io
import os
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import gym  # noqa: E402


def verificar_lab(m: str, t: gym.Ticket) -> tuple[int, str]:
    r = subprocess.run([m, "exec", "-i", "-u", "root", gym.CONTAINER, "bash", "-s"],
                       input=gym.script_de_verificacao(t), capture_output=True)
    return r.returncode, (r.stdout + r.stderr).decode("utf-8", "replace")


def solucao_lab(m: str, t: gym.Ticket) -> tuple[int, str]:
    script = (t.dir / "solucao.sh").read_bytes().replace(b"\r\n", b"\n")
    subprocess.run([m, "exec", "-i", gym.CONTAINER, "sh", "-c", "cat > /tmp/.solucao.sh"],
                   input=script, check=True)
    r = subprocess.run([m, "exec", "-u", "aluno", "-w", "/home/aluno", "-e", "HOME=/home/aluno",
                        gym.CONTAINER, "bash", "/tmp/.solucao.sh"], capture_output=True, text=True)
    return r.returncode, r.stdout + r.stderr


def verificar_host(t: gym.Ticket) -> tuple[int, str]:
    saida = io.StringIO()
    with contextlib.redirect_stdout(saida):
        rc = gym.verificar_no_host(t)
    return rc, saida.getvalue()


def solucao_host(t: gym.Ticket) -> tuple[int, str]:
    # As soluções chamam "gym kubectl", "gym terraform"...: o gym precisa estar no PATH.
    env = {**os.environ, "PATH": f"{gym.RAIZ}{os.pathsep}{os.environ.get('PATH', '')}"}
    r = subprocess.run(["bash", str(t.dir / "solucao.sh")], cwd=gym.oficina_de(t),
                       capture_output=True, text=True, env=env)
    return r.returncode, r.stdout + r.stderr


def testar(m: str, t: gym.Ticket) -> bool:
    inicio = time.monotonic()
    if t.palco == "lab":
        with contextlib.redirect_stdout(io.StringIO()):
            if not gym.ligar(m):
                print(f"  ✘ {t.chave}: o laboratório não ligou")
                return False
        verificar, solucao = (lambda: verificar_lab(m, t)), (lambda: solucao_lab(m, t))
    else:
        gym.preparar_oficina(t, recomecar=True)
        verificar, solucao = (lambda: verificar_host(t)), (lambda: solucao_host(t))

    rc, saida = verificar()
    if rc != 10:
        print(f"  ✘ {t.chave}: antes da solução o verificar deveria reprovar (10), deu {rc}\n{saida}")
        return False
    rc, saida_sol = solucao()
    if rc != 0:
        print(f"  ✘ {t.chave}: a solução falhou ({rc})\n{saida_sol}")
        return False
    rc, saida = verificar()
    if rc != 0:
        print(f"  ✘ {t.chave}: depois da solução o verificar deveria aprovar, deu {rc}\n{saida}"
              f"\n--- saída da solução ---\n{saida_sol}")
        return False
    print(f"  ✔ {t.chave} ({time.monotonic() - inicio:.0f}s)")
    return True


def main(argv: list[str]) -> int:
    gym.utf8()
    filtros = [a for a in argv if not a.startswith("--")]
    tickets = [t for t in gym.carregar() if not filtros or any(f in t.chave for f in filtros)]
    m = gym.motor_pronto()
    if m is None or not tickets:
        return 2
    if any(t.palco == "lab" for t in tickets) and "--sem-build" not in argv:
        if not gym.construir(m):
            return 1
    print(f"\nTestando {len(tickets)} ticket(s)")
    falhas = [t.chave for t in tickets if not testar(m, t)]
    subprocess.run([m, "rm", "-f", gym.CONTAINER], capture_output=True)
    print(f"\n{len(tickets) - len(falhas)} de {len(tickets)} passaram." + (f" Falharam: {', '.join(falhas)}" if falhas else ""))
    return 1 if falhas else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
