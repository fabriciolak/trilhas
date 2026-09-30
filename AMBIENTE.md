# Preparando o ambiente

O gym precisa de três coisas: **Git**, **Python 3.9+** e **Docker**. O laboratório em
si é um Ubuntu 24.04 dentro do Docker, então funciona igual no Windows, no Linux e
no macOS. Nada do que você fizer lá dentro mexe no seu computador.

Requisitos da máquina: 64 bits, **8 GB de RAM** (4 GB funcionam, apertado), **10 GB
livres** em disco e virtualização ligada na BIOS/UEFI (no Windows e no macOS o Docker
roda numa máquina virtual leve).

## Windows 10/11 (recomendado: WSL 2 + Docker Desktop)

1. **WSL 2.** Abra o PowerShell **como administrador** e rode:

   ```powershell
   wsl --install
   ```

   Reinicie quando pedir. Na volta, o Ubuntu abre e pede um usuário e uma senha para
   o Linux (podem ser diferentes dos do Windows). Isso já é Linux de verdade: use-o
   como o seu terminal de estudo do dia a dia.
   Documentação oficial em português: <https://learn.microsoft.com/pt-br/windows/wsl/install>

2. **Docker Desktop.** Instale de <https://www.docker.com/products/docker-desktop/>.
   Na instalação, deixe marcado *Use WSL 2 instead of Hyper-V*. Depois, em
   *Settings → Resources → WSL integration*, ligue a integração com o Ubuntu.
   Referência: <https://docs.docker.com/desktop/features/wsl/>

3. **Windows Terminal** (já vem no Windows 11; no 10, pela Microsoft Store). Use-o no
   lugar do Prompt de Comando antigo e do Git Bash.

4. **VS Code** (opcional, recomendado) com a extensão **WSL**: você edita arquivos do
   Linux com uma interface do Windows.

5. Clone e rode **dentro do Ubuntu (WSL)**, na sua pasta pessoal do Linux (não em
   `/mnt/c/...`, que é bem mais lento):

   ```bash
   sudo apt update && sudo apt install -y git python3
   git clone https://github.com/fabriciolak/labs.git ~/labs
   cd ~/labs/devops_gym
   ./gym doctor
   ```

### Alternativa: sem WSL no terminal, só PowerShell

Também funciona com o Docker Desktop instalado:
[Python para Windows](https://www.python.org/downloads/) (marque **"Add python.exe
to PATH"**) e [Git para Windows](https://git-scm.com/download/win).

```powershell
git clone https://github.com/fabriciolak/labs.git
cd labs\devops_gym
.\gym doctor
.\gym lab
```

Use o **Windows Terminal/PowerShell**. No Git Bash (mintty), o `gym lab` falha com
"the input device is not a TTY", porque o terminal dele não conversa bem com programas
interativos do Windows.

## Linux (Ubuntu, Debian, Fedora...)

1. Docker Engine pelo guia oficial da sua distribuição:
   <https://docs.docker.com/engine/install/>. No Ubuntu, o atalho
   `sudo apt install docker.io docker-compose-v2` também serve.
2. Deixe seu usuário usar o Docker sem sudo, e **abra um terminal novo** depois:

   ```bash
   sudo usermod -aG docker $USER
   ```

3. Git e Python costumam já estar lá (`sudo apt install -y git python3`).

```bash
git clone https://github.com/fabriciolak/labs.git ~/labs
cd ~/labs/devops_gym
./gym doctor
```

Podman no lugar do Docker: o gym detecta e usa (`--systemd=always`), mas esse caminho é
experimental. Se der problema, use o Docker.

## macOS

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Apple Silicon ou
   Intel). Alternativas leves, como Colima e OrbStack, também funcionam.
2. Git: `xcode-select --install`. Python: `brew install python` (ou o do python.org).

```bash
git clone https://github.com/fabriciolak/labs.git ~/labs
cd ~/labs/devops_gym
./gym doctor
```

## Conferindo

```text
$ ./gym doctor
  ✔ Python 3.12.3
  ✔ docker encontrado
  ✔ docker ligado: servidor 28.x, cgroup v2
  • imagem do laboratório ainda não construída (o primeiro gym lab constrói)
```

O primeiro `gym lab` baixa o Ubuntu e constrói o laboratório: alguns minutos e cerca
de 500 MB. Os seguintes levam segundos.

## Problemas comuns

| Sintoma | Causa e saída |
|---|---|
| `Cannot connect to the Docker daemon` | O Docker não está ligado. Windows/macOS: abra o Docker Desktop e espere ficar verde. Linux: `sudo systemctl start docker`. |
| `permission denied ... /var/run/docker.sock` | Seu usuário não está no grupo docker (Linux). `sudo usermod -aG docker $USER` e abra um terminal novo. |
| `the input device is not a TTY` | Terminal que não é interativo de verdade (Git Bash/mintty no Windows). Use Windows Terminal, PowerShell ou o terminal do WSL. |
| O laboratório "não terminou de ligar" | O systemd do container não subiu. Veja `docker logs devops-gym-lab`. Atualize o Docker Desktop ou o Docker Engine (é preciso suporte a cgroup v2) e tente `./gym lab --new`. |
| `\r: command not found` ou `bad interpreter` | Arquivos com fim de linha do Windows. O `.gitattributes` evita isso; se você copiou arquivos à mão, clone de novo. No Windows, prefira clonar dentro do WSL. |
| A porta 8181, 8282 ou 18383 já está em uso | Algum programa seu usa a porta. Veja com `docker ps` ou pare o que estiver usando. |
| Proxy de empresa | Configure o proxy no Docker (Docker Desktop: *Settings → Resources → Proxies*; Linux: `~/.docker/config.json`). Argumentos extras para o build e o run: variáveis `GYM_BUILD_ARGS` e `GYM_RUN_ARGS` (veja [AGENTS.md](AGENTS.md)). |
| O ticket `ferramenta-sumida` não baixa pacotes | Ele precisa de internet dentro do laboratório. Confira se o seu Docker tem saída para a internet. |

## Seu progresso entre computadores

O progresso (caixas e histórico) fica em `devops_gym/progresso/`, fora do git por
padrão. Para levar o progresso entre computadores, tire a linha `progresso/` do
`devops_gym/.gitignore` e faça commit dessa pasta.
