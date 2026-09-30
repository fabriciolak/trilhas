#!/usr/bin/env python3
"""gym: treine Linux e DevOps resolvendo incidentes num laboratório descartável.

Uso:
  gym                    treino de hoje: revisões que venceram + o próximo ticket novo
  gym <ticket>           abre um ticket (ex.: gym log-em-chamas)
  gym list               todos os tickets, na ordem do roadmap, com o seu progresso
  gym lab [--new]        entra no laboratório (liga se preciso; --new recria do zero)
  gym check [ticket]     confere a sua solução (sem ticket: o último aberto)
  gym stop               desliga o laboratório
  gym doctor             confere se este computador está pronto (Python e Docker)

Dentro de um ticket:
  t ticket  c comandos  p perguntas  e estude  v verificar  s solução  x dar nota  q voltar
"""

from __future__ import annotations

import datetime as dt
import os
import runpy
import shlex
import shutil
import subprocess
import sys
import textwrap
import time
import urllib.error
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
POOL = RAIZ / "pool"
LAB = RAIZ / "lab"
OFICINA = RAIZ / "oficina"                # arquivos dos tickets que rodam no seu computador
PROGRESSO = RAIZ / "progresso"
LEDGER = PROGRESSO / "ledger.tsv"         # chave  caixa  próxima_revisão
HISTORICO = PROGRESSO / "historico.tsv"   # data  chave  nota  caixa_antiga  caixa_nova
ULTIMO = PROGRESSO / "ultimo"
WINDOWS = sys.platform == "win32"

IMAGEM = "devops-gym/lab"
CONTAINER = "devops-gym-lab"
INTERVALOS = [0, 1, 2, 4, 8, 16]          # dias até a próxima revisão, por caixa (1 a 5)
NOTAS = {"1": "travei", "2": "sofri", "3": "tranquilo"}
MESES = {
    1: "Linux: terminal, arquivos e texto",
    2: "Linux: usuários, processos, pacotes e shell script",
    3: "Serviços, redes e SSH",
    4: "Containers: Docker e Compose",
    5: "Automação: Ansible, CI/CD e Terraform",
    6: "Kubernetes, observabilidade e projeto final",
}
ABAS = {"t": "TICKET", "c": "COMANDOS", "p": "PERGUNTAS", "e": "ESTUDE"}


# ---------------------------------------------------------------- terminal

def utf8() -> None:
    for fluxo in (sys.stdout, sys.stderr):
        try:
            fluxo.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass


def ativar_ansi() -> bool:
    if not sys.stdout.isatty() or "NO_COLOR" in os.environ:
        return False
    if WINDOWS:  # o console do Windows só entende cores depois de ligar o modo VT
        import ctypes

        k32 = ctypes.windll.kernel32
        saida = k32.GetStdHandle(-11)
        modo = ctypes.c_uint32()
        if not k32.GetConsoleMode(saida, ctypes.byref(modo)):
            return False
        k32.SetConsoleMode(saida, modo.value | 0x0004)
    return True


COR = ativar_ansi()
N, D, C, G, Y, V, R = (f"\033[{c}m" if COR else "" for c in ("1", "2", "36", "32", "33", "31", "0"))


def limpar() -> None:
    if COR:
        print("\033[2J\033[H", end="")
    else:
        print("\n" * 2)


def tecla() -> str:
    """Lê uma tecla sem precisar de Enter (cai para input() fora de um terminal)."""
    if not sys.stdin.isatty():
        linha = sys.stdin.readline()
        return linha.strip()[:1].lower() if linha else "q"
    if WINDOWS:
        import msvcrt

        c = msvcrt.getwch()
        if c in ("\x00", "\xe0"):  # setas e teclas de função mandam dois códigos
            msvcrt.getwch()
            return ""
        if c == "\x03":
            raise KeyboardInterrupt
        return c.lower()
    import termios
    import tty

    fd = sys.stdin.fileno()
    antes = termios.tcgetattr(fd)
    try:
        tty.setcbreak(fd)
        return sys.stdin.read(1).lower()
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, antes)


def esperar_tecla(texto: str = "pressione uma tecla para voltar") -> None:
    print(f"\n{D}{texto}{R}", end="", flush=True)
    tecla()


def perguntar(texto: str) -> bool:
    print(f"{texto} [s/N] ", end="", flush=True)
    resp = tecla()
    print(resp)
    return resp == "s"


# ---------------------------------------------------------------- tickets

class Ticket:
    def __init__(self, arquivo: Path):
        self.dir = arquivo.parent
        self.chave = self.dir.relative_to(POOL).as_posix()
        self.nome = self.dir.name.split("-", 1)[-1]  # "01-log-em-chamas" → "log-em-chamas"
        meta, corpo = ler_meta(arquivo.read_text(encoding="utf-8"))
        self.mes = int(meta.get("mes", 0))
        self.semana = int(meta.get("semana", 0))
        self.palco = meta.get("palco", "lab")
        self.titulo = next((l[2:].strip() for l in corpo.splitlines() if l.startswith("# ")), self.nome)
        self.secoes = ler_secoes(corpo)

    @property
    def onde(self) -> str:
        return "laboratório" if self.palco == "lab" else "seu computador (Docker)"


def ler_meta(texto: str) -> tuple[dict[str, str], str]:
    linhas = texto.splitlines()
    if not linhas or linhas[0].strip() != "---":
        return {}, texto
    meta = {}
    for i, linha in enumerate(linhas[1:], 1):
        if linha.strip() == "---":
            return meta, "\n".join(linhas[i + 1:])
        chave, _, valor = linha.partition(":")
        meta[chave.strip()] = valor.strip()
    return {}, texto


def ler_secoes(texto: str) -> dict[str, str]:
    secoes: dict[str, list[str]] = {}
    atual = None
    for linha in texto.splitlines():
        if linha.startswith("## "):
            atual = linha[3:].strip().upper()
            secoes[atual] = []
        elif atual:
            secoes[atual].append(linha)
    return {k: "\n".join(v).strip() for k, v in secoes.items()}


def carregar() -> list[Ticket]:
    tickets = [Ticket(a) for a in POOL.glob("*/*/ticket.md")]
    return sorted(tickets, key=lambda t: (t.mes, t.semana, t.chave))


def achar(tickets: list[Ticket], texto: str) -> Ticket | None:
    texto = texto.strip().strip("/").replace("\\", "/")
    if texto.startswith("pool/"):
        texto = texto[5:]
    for teste in (lambda t: t.chave == texto, lambda t: t.nome == texto, lambda t: texto in t.chave):
        achados = [t for t in tickets if teste(t)]
        if len(achados) == 1:
            return achados[0]
        if len(achados) > 1:
            print(f"Mais de um ticket combina com '{texto}':", file=sys.stderr)
            for t in achados:
                print(f"  {t.chave}", file=sys.stderr)
            return None
    print(f"Ticket não encontrado: {texto}  (veja: gym list)", file=sys.stderr)
    return None


# ---------------------------------------------------------------- progresso (Leitner)

def hoje() -> dt.date:
    return dt.date.today()


def ler_ledger() -> dict[str, tuple[int, str]]:
    dados = {}
    if LEDGER.exists():
        for linha in LEDGER.read_text(encoding="utf-8").splitlines():
            partes = linha.split("\t")
            if len(partes) == 3 and partes[1].isdigit():
                dados[partes[0]] = (int(partes[1]), partes[2])
    return dados


def gravar_nota(chave: str, nota: str) -> tuple[int, str]:
    ledger = ler_ledger()
    caixa = ledger.get(chave, (1, ""))[0]
    nova = {"travei": 1, "sofri": caixa, "tranquilo": min(caixa + 1, 5)}[nota]
    proxima = (hoje() + dt.timedelta(days=INTERVALOS[nova])).isoformat()
    ledger[chave] = (nova, proxima)
    PROGRESSO.mkdir(exist_ok=True)
    LEDGER.write_text("".join(f"{k}\t{c}\t{d}\n" for k, (c, d) in sorted(ledger.items())), encoding="utf-8")
    with open(HISTORICO, "a", encoding="utf-8") as f:
        f.write(f"{hoje().isoformat()}\t{chave}\t{nota}\t{caixa}\t{nova}\n")
    return nova, proxima


def situacao(t: Ticket, ledger: dict[str, tuple[int, str]]) -> str:
    if t.chave not in ledger:
        return f"{D}novo{R}"
    caixa, proxima = ledger[t.chave]
    if proxima <= hoje().isoformat():
        return f"{Y}caixa {caixa} · revisar hoje{R}"
    return f"{G}caixa {caixa}{R} {D}· revisar em {proxima}{R}"


# ---------------------------------------------------------------- telas

def treino(tickets: list[Ticket]) -> int:
    while True:
        ledger = ler_ledger()
        hoje_iso = hoje().isoformat()
        revisoes = [t for t in tickets if t.chave in ledger and ledger[t.chave][1] <= hoje_iso]
        novo = next((t for t in tickets if t.chave not in ledger), None)
        opcoes = revisoes + ([novo] if novo else [])
        limpar()
        print(f"{N}DevOps Gym{R} {D}· treino de {hoje_iso}{R}\n")
        if not opcoes:
            futuras = sorted(d for _, d in ledger.values())
            quando = f" A próxima revisão é em {futuras[0]}." if futuras else ""
            print(f"{G}Nada para hoje.{R}{quando} Quer adiantar? Veja {N}gym list{R}.")
            return 0
        n = 1
        if revisoes:
            print(f"{N}Revisões{R}")
            for t in revisoes:
                print(f"  {C}{n:>2}{R}  {t.titulo:<32} {D}{t.chave}  caixa {ledger[t.chave][0]}{R}")
                n += 1
        if novo:
            print(f"{N}Próximo ticket novo{R}")
            print(f"  {C}{n:>2}{R}  {novo.titulo:<32} {D}{novo.chave}  mês {novo.mes}, semana {novo.semana}{R}")
        print(f"\n  {C} l{R}  todos os tickets    {C}0{R}  sair")
        try:
            resp = input("\n> ").strip().lower()
        except EOFError:
            return 0
        if resp in ("0", "q", ""):
            return 0
        if resp == "l":
            listar(tickets)
            esperar_tecla()
        elif resp.isdigit() and 1 <= int(resp) <= len(opcoes):
            abrir(opcoes[int(resp) - 1])


def listar(tickets: list[Ticket]) -> None:
    ledger = ler_ledger()
    mes = None
    for t in tickets:
        if t.mes != mes:
            mes = t.mes
            print(f"\n{N}Mês {mes} · {MESES.get(mes, '')}{R}")
        onde = "" if t.palco == "lab" else f" {D}[seu computador]{R}"
        print(f"  {D}sem {t.semana:>2}{R}  {t.nome:<26} {t.titulo:<30} {situacao(t, ledger)}{onde}")
    feitos = sum(1 for t in tickets if t.chave in ledger)
    print(f"\n{feitos} de {len(tickets)} tickets já treinados. Abra um com: gym <nome>")


def cabecalho(t: Ticket, aba: str) -> None:
    limpar()
    print(f"{N}{t.titulo}{R}  {D}{t.chave} · mês {t.mes}, semana {t.semana} · onde: {t.onde}{R}")
    print(f"{D}{'─' * 72}{R}\n")
    if aba == "t":
        print(t.secoes.get("TICKET", "(sem texto)"))
        print()
        if t.palco == "lab":
            print(f"{D}Resolva no laboratório: rode {R}gym lab{D} em outro terminal.{R}")
        else:
            print(f"{D}Resolva no seu computador, na pasta {R}{oficina_de(t)}{D}.{R}")
        ledger = ler_ledger()
        if t.chave in ledger:
            print(f"{D}Agenda: caixa {ledger[t.chave][0]}, próxima revisão em {ledger[t.chave][1]}.{R}")
    elif aba == "c":
        print(f"{N}Comandos em jogo{R} {D}(sem dizer onde usar cada um){R}\n")
        print(textwrap.fill(t.secoes.get("COMANDOS", ""), 72, initial_indent="  ", subsequent_indent="  "))
    elif aba == "p":
        print(f"{N}Perguntas de entrevista{R} {D}(responda em voz alta ou por escrito){R}\n")
        print(t.secoes.get("PERGUNTAS", "(sem perguntas)"))
    elif aba == "e":
        print(f"{N}Para estudar{R} {D}(antes ou depois do ticket){R}\n")
        print(t.secoes.get("ESTUDE", "Veja CONTEUDOS.md."))
    rotulos = [("t", "ticket"), ("c", "comandos"), ("p", "perguntas"), ("e", "estude"),
               ("v", "verificar"), ("s", "solução"), ("x", "dar nota"), ("q", "voltar")]
    if t.palco != "lab":
        rotulos.insert(6, ("r", "recomeçar"))
    partes = [f"{C}{N}[{k}]{nome}{R}" if k == aba else f"{D}[{k}]{nome}{R}" for k, nome in rotulos]
    print(f"\n{D}─{R} " + "  ".join(partes))


def abrir(t: Ticket) -> None:
    PROGRESSO.mkdir(exist_ok=True)
    ULTIMO.write_text(t.chave, encoding="utf-8")
    if t.palco != "lab":
        preparar_oficina(t)
    aba = "t"
    while True:
        cabecalho(t, aba)
        k = tecla()
        if k in ABAS:
            aba = k
        elif k == "v":
            print(f"\n{N}Verificando {t.titulo}...{R}\n")
            verificar(t)
            esperar_tecla()
        elif k == "s":
            mostrar_solucao(t)
        elif k == "r" and t.palco != "lab":
            print()
            if perguntar(f"Apagar {oficina_de(t)} e recomeçar do zero?"):
                preparar_oficina(t, recomecar=True)
        elif k == "x":
            if dar_nota(t):
                return
        elif k in ("q", "\x1b"):
            return


def mostrar_solucao(t: Ticket) -> None:
    arquivo = next((a for a in (t.dir / "solucao.md", t.dir / "solucao.sh") if a.exists()), None)
    print()
    if arquivo is None:
        print("Este ticket ainda não tem solução escrita.")
        esperar_tecla()
        return
    if not perguntar("Você já tentou de verdade? Ver a solução antes tira metade do aprendizado."):
        return
    limpar()
    print(f"{N}Uma solução possível para {t.titulo}{R} {D}({arquivo.name}; existem outras){R}\n")
    print(arquivo.read_text(encoding="utf-8"))
    esperar_tecla()


def dar_nota(t: Ticket) -> bool:
    limpar()
    print(f"{N}Como foi {t.titulo}?{R} {D}(conta o pior entre a prática e as perguntas){R}\n")
    print(f"  {V}1{R}  travei       não resolvi ou não soube responder as perguntas")
    print(f"  {Y}2{R}  sofri        resolvi, mas devagar ou inseguro na teoria")
    print(f"  {G}3{R}  tranquilo    resolvi e responderia as perguntas numa entrevista")
    print(f"\n  {D}qualquer outra tecla: voltar sem nota{R}")
    k = tecla()
    if k not in NOTAS:
        return False
    caixa, proxima = gravar_nota(t.chave, NOTAS[k])
    print(f"\n{G}✓ {NOTAS[k]}: caixa {caixa}, próxima revisão em {proxima}.{R}")
    if t.palco == "lab":
        print(f"{D}Para o próximo ticket começar limpo: gym lab --new{R}")
    esperar_tecla("pressione uma tecla para continuar")
    return True


# ---------------------------------------------------------------- Docker / laboratório

def motor() -> str | None:
    for nome in ("docker", "podman"):
        if shutil.which(nome):
            return nome
    return None


def extras(variavel: str) -> list[str]:
    # Argumentos a mais para o build/run (ex.: proxy de empresa). Veja AGENTS.md.
    return shlex.split(os.environ.get(variavel, ""), posix=not WINDOWS)


def motor_pronto() -> str | None:
    m = motor()
    if m is None:
        print(f"{V}Docker não encontrado.{R}", file=sys.stderr)
        print("  Instale seguindo AMBIENTE.md (Windows e macOS: Docker Desktop; Linux: Docker Engine).",
              file=sys.stderr)
        return None
    r = subprocess.run([m, "info"], capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode == 0:
        return m
    erro = (r.stderr or r.stdout).strip().splitlines()
    print(f"{V}O {m} está instalado, mas não respondeu.{R}", file=sys.stderr)
    if erro:
        print(f"  {D}{erro[-1]}{R}", file=sys.stderr)
    if "permission denied" in r.stderr.lower():
        print("  Seu usuário não pode usar o Docker. Rode: sudo usermod -aG docker $USER"
              " e abra um terminal novo.", file=sys.stderr)
    elif WINDOWS or sys.platform == "darwin":
        print("  Abra o Docker Desktop e espere ele dizer que está rodando.", file=sys.stderr)
    else:
        print("  Ligue o serviço: sudo systemctl start docker", file=sys.stderr)
    return None


def estado_lab(m: str) -> str:
    r = subprocess.run([m, "inspect", "-f", "{{.State.Running}}", CONTAINER],
                       capture_output=True, text=True)
    if r.returncode != 0:
        return "ausente"
    return "ligado" if r.stdout.strip() == "true" else "parado"


def construir(m: str) -> bool:
    print(f"{N}==> Construindo a imagem do laboratório{R} {D}(a primeira vez leva alguns minutos){R}")
    cmd = [m, "build", "-t", IMAGEM, "-f", str(LAB / "Dockerfile"), *extras("GYM_BUILD_ARGS"), str(RAIZ)]
    return subprocess.run(cmd).returncode == 0


def esperar_boot(m: str) -> bool:
    # systemd é o PID 1 do laboratório; "degraded" é normal: há serviços quebrados de propósito.
    limite = time.monotonic() + 90
    while time.monotonic() < limite:
        try:
            r = subprocess.run([m, "exec", CONTAINER, "systemctl", "is-system-running", "--wait"],
                               capture_output=True, text=True, timeout=90)
        except subprocess.TimeoutExpired:
            break
        if r.stdout.strip() in ("running", "degraded"):
            return True
        time.sleep(0.5)
    print(f"{V}O laboratório não terminou de ligar.{R} Veja o que aconteceu com: {m} logs {CONTAINER}",
          file=sys.stderr)
    return False


def ligar(m: str) -> bool:
    print(f"{N}==> Ligando o laboratório{R}")
    subprocess.run([m, "rm", "-f", CONTAINER], capture_output=True)
    if m == "podman":
        flags = ["--systemd=always"]
    else:  # systemd precisa de um cgroup próprio e de /run em memória
        flags = ["--cgroupns=private", "--tmpfs", "/run", "--tmpfs", "/run/lock"]
    cmd = [m, "run", "-d", "--name", CONTAINER, "--hostname", "devops-lab", "--privileged",
           "--label", "devops-gym=lab", *flags, *extras("GYM_RUN_ARGS"), IMAGEM]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"{V}Não consegui ligar o laboratório:{R} {r.stderr.strip()}", file=sys.stderr)
        return False
    return esperar_boot(m)


def entrar(m: str) -> int:
    # login registra a sessão (who, w e last funcionam) e mostra a mensagem do dia.
    return subprocess.call([m, "exec", "-it", "-u", "root", CONTAINER, "login", "-f", "aluno"])


def comando_lab(args: list[str]) -> int:
    m = motor_pronto()
    if m is None:
        return 2
    estado = estado_lab(m)
    if "--new" in args or estado == "ausente":
        if not (construir(m) and ligar(m)):
            return 1
    elif estado == "parado":
        print(f"{N}==> Religando o laboratório{R} {D}(o que você fez nele continua lá){R}")
        subprocess.run([m, "start", CONTAINER], capture_output=True)
        if not esperar_boot(m):
            return 1
    else:
        print(f"{D}O laboratório já está ligado: abrindo mais um terminal nele. "
              f"Para recomeçar do zero: gym lab --new{R}")
    if not sys.stdin.isatty():
        print(f"{Y}Este terminal não é interativo.{R} No Windows, use o Windows Terminal ou o PowerShell.")
    entrar(m)
    print(f"\n{D}Você saiu, mas o laboratório continua ligado.{R}")
    print(f"  {N}gym check{R}      confere a solução do ticket")
    print(f"  {N}gym lab{R}        volta para ele      {N}gym lab --new{R}  recomeça do zero")
    print(f"  {N}gym stop{R}       desliga")
    return 0


def comando_stop() -> int:
    m = motor_pronto()
    if m is None:
        return 2
    if estado_lab(m) == "ausente":
        print("O laboratório já está desligado.")
        return 0
    subprocess.run([m, "rm", "-f", CONTAINER], capture_output=True)
    print("Laboratório desligado (e apagado: o próximo gym lab começa do zero).")
    return 0


# ---------------------------------------------------------------- verificação

def verificar(t: Ticket) -> int:
    if t.palco == "lab":
        return verificar_no_lab(t)
    return verificar_no_host(t)


def script_de_verificacao(t: Ticket) -> bytes:
    partes = [LAB / "verificar-lib.sh", t.dir / "verificar.sh"]
    script = "\n".join(p.read_text(encoding="utf-8") for p in partes) + "\n_resumo\n"
    return script.replace("\r\n", "\n").encode("utf-8")


def verificar_no_lab(t: Ticket) -> int:
    m = motor_pronto()
    if m is None:
        return 2
    if estado_lab(m) != "ligado":
        print(f"{Y}O laboratório está desligado.{R} Resolva o ticket nele (gym lab) e verifique antes de desligar.")
        return 2
    r = subprocess.run([m, "exec", "-i", "-u", "root", CONTAINER, "bash", "-s"], input=script_de_verificacao(t))
    if r.returncode not in (0, 10):
        print(f"\n{Y}O verificador deste ticket parou no meio (código {r.returncode}).{R} "
              "Isso é um problema do gym, não da sua solução.")
    return r.returncode


def oficina_de(t: Ticket) -> Path:
    return OFICINA / t.nome


def api_host(oficina: Path, placar: dict[str, int]) -> dict:
    """Funções que os preparar.py e verificar.py dos tickets do seu computador recebem prontas."""
    sem_proxy = urllib.request.build_opener(urllib.request.ProxyHandler({}))

    def ok(msg: str) -> None:
        print(f"  {G}✔{R} {msg}")
        placar["ok"] += 1

    def falha(msg: str, dica: str = "") -> None:
        print(f"  {V}✘{R} {msg}")
        if dica:
            print(f"      {D}{dica}{R}")
        placar["falhas"] += 1

    def checar(msg: str, condicao: object, dica: str = "") -> None:
        ok(msg) if condicao else falha(msg, dica)

    def docker(*args: str) -> tuple[int, str]:
        r = subprocess.run([motor() or "docker", *args], capture_output=True, text=True,
                           encoding="utf-8", errors="replace")
        return r.returncode, (r.stdout if r.returncode == 0 else r.stderr).strip()

    def http(url: str, timeout: float = 5) -> tuple[int, str]:
        try:
            with sem_proxy.open(url, timeout=timeout) as resp:
                return resp.status, resp.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            return e.code, e.read().decode("utf-8", "replace")
        except (urllib.error.URLError, OSError) as e:
            return 0, str(e)

    return {"ok": ok, "falha": falha, "checar": checar, "docker": docker, "http": http,
            "oficina": oficina}


def preparar_oficina(t: Ticket, recomecar: bool = False) -> Path:
    destino = oficina_de(t)
    if recomecar and destino.exists():
        shutil.rmtree(destino)
    if destino.exists():
        return destino
    origem = t.dir / "arquivos"
    if origem.is_dir():
        shutil.copytree(origem, destino)
    else:
        destino.mkdir(parents=True)
    script = t.dir / "preparar.py"
    if script.exists():
        runpy.run_path(str(script), init_globals=api_host(destino, {"ok": 0, "falhas": 0}))
    return destino


def verificar_no_host(t: Ticket) -> int:
    if motor_pronto() is None:
        return 2
    placar = {"ok": 0, "falhas": 0}
    try:
        runpy.run_path(str(t.dir / "verificar.py"), init_globals=api_host(oficina_de(t), placar))
    except Exception as e:  # noqa: BLE001 — erro no verificador, não na solução
        print(f"\n{Y}O verificador deste ticket parou no meio ({e!r}).{R} Isso é um problema do gym.")
        return 2
    total = placar["ok"] + placar["falhas"]
    if placar["falhas"] == 0:
        print(f"\n{G}✅ Tudo certo: {placar['ok']} de {total} verificações passaram.{R}")
        return 0
    print(f"\n{V}❌ {placar['falhas']} de {total} verificações falharam.{R}")
    return 10


# ---------------------------------------------------------------- doctor

def doctor(tickets: list[Ticket]) -> int:
    def linha(bom: bool | None, texto: str) -> None:
        marca = f"{G}✔{R}" if bom else (f"{D}•{R}" if bom is None else f"{V}✘{R}")
        print(f"  {marca} {texto}")

    print(f"{N}DevOps Gym · diagnóstico{R}\n")
    versao = ".".join(map(str, sys.version_info[:3]))
    linha(sys.version_info >= (3, 9), f"Python {versao} ({sys.executable})")
    m = motor()
    if m is None:
        linha(False, "Docker não encontrado: siga AMBIENTE.md")
        return 1
    linha(True, f"{m} encontrado: {shutil.which(m)}")
    info = subprocess.run([m, "info", "--format", "{{.ServerVersion}} {{.CgroupVersion}} {{.OperatingSystem}}"],
                          capture_output=True, text=True, encoding="utf-8", errors="replace")
    if info.returncode != 0:
        linha(False, f"{m} não está respondendo: {(info.stderr.strip().splitlines() or ['?'])[-1]}")
        return 1
    partes = info.stdout.split(maxsplit=2) + ["?", "?", "?"]
    linha(True, f"{m} ligado: servidor {partes[0]}, cgroup v{partes[1]}, {partes[2].strip()}")
    imagem = subprocess.run([m, "image", "inspect", IMAGEM], capture_output=True).returncode == 0
    linha(True if imagem else None, "imagem do laboratório construída" if imagem
          else "imagem do laboratório ainda não construída (o primeiro gym lab constrói)")
    estado = {"ausente": "desligado", "parado": "parado (o gym lab religa)"}.get(estado_lab(m), "ligado")
    linha(None, f"laboratório: {estado}")
    ledger = ler_ledger()
    linha(None, f"progresso: {sum(1 for t in tickets if t.chave in ledger)} de {len(tickets)} tickets treinados")
    return 0


# ---------------------------------------------------------------- main

def main(argv: list[str]) -> int:
    utf8()
    tickets = carregar()
    if not argv:
        return treino(tickets)
    cmd, resto = argv[0], argv[1:]
    if cmd in ("-h", "--help", "help"):
        print(__doc__)
        return 0
    if cmd in ("list", "ls"):
        listar(tickets)
        return 0
    if cmd == "lab":
        return comando_lab(resto)
    if cmd == "stop":
        return comando_stop()
    if cmd == "doctor":
        return doctor(tickets)
    if cmd == "check":
        alvo = resto[0] if resto else (ULTIMO.read_text(encoding="utf-8").strip() if ULTIMO.exists() else "")
        if not alvo:
            print("Qual ticket? Ex.: gym check log-em-chamas", file=sys.stderr)
            return 2
        t = achar(tickets, alvo)
        if t is None:
            return 2
        print(f"{N}Verificando {t.titulo}{R} {D}({t.chave}){R}\n")
        return 0 if verificar(t) == 0 else 1
    t = achar(tickets, cmd)
    if t is None:
        print(__doc__, file=sys.stderr)
        return 2
    abrir(t)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv[1:]))
    except KeyboardInterrupt:
        print()
        sys.exit(130)
