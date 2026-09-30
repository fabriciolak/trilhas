# Compose de produção: sobe, versões fixas, só a frente publica, redes separadas, senha
# fora do arquivo, nada como root, restart, healthcheck, limite de memória e de log.
# Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina.
import json

pasta = oficina / "producao"
arquivo = pasta / "compose.yaml"
PROJETO = "label=com.docker.compose.project=gym-producao"
SERVICOS = ("web", "api", "cache")

rc, saida = docker("compose", "-f", str(arquivo), "config", "--format", "json")
checar("o compose.yaml é válido", rc == 0, f"docker compose config: {saida[:200]}")
servicos = json.loads(saida).get("services", {}) if rc == 0 else {}


def conteiner(servico):
    rc, ids = docker("ps", "-q", "--filter", PROJETO, "--filter", f"label=com.docker.compose.service={servico}")
    if rc != 0 or not ids:
        return {}
    rc, info = docker("inspect", ids.split()[0])
    return json.loads(info)[0] if rc == 0 else {}


c = {s: conteiner(s) for s in SERVICOS}
for s in SERVICOS:
    checar(f"o serviço {s} está rodando", bool(c[s]), f"docker compose ps -a; docker compose logs {s}")

# 1. No ar.
status, corpo = http("http://localhost:8383/")
checar("http://localhost:8383/ abre a página da loja", status == 200 and "Pinguim Store" in corpo,
       f"resposta: {status} {corpo[:120]}; docker compose logs web")
status, corpo = http("http://localhost:8383/api/saude")
checar("/api/saude responde ok pelo nginx", status == 200 and '"ok"' in corpo,
       f"resposta: {status} {corpo[:120]}; docker compose logs api")


# 2. Versões fixas.
def versao_fixa(imagem: str) -> bool:
    if "@sha256:" in imagem:
        return True
    nome = imagem.rsplit("/", 1)[-1]
    return ":" in nome and not nome.endswith(":latest")


for s in SERVICOS:
    imagem = servicos.get(s, {}).get("image", "")
    checar(f"a imagem do {s} tem versão fixa ({imagem or 'sem image'})", versao_fixa(imagem),
           "nome:versão, nunca latest; a api construída também (image: ...:1.0)")

# 3. Só a porta da frente, e redes separadas.
checar("o web publica a porta 8383", any(str(p.get("published")) == "8383"
                                         for p in servicos.get("web", {}).get("ports", [])), "ports: - \"8383:80\"")
for s in ("api", "cache"):
    publicadas = c[s].get("HostConfig", {}).get("PortBindings") or {}
    checar(f"o {s} não publica porta no servidor", bool(c[s]) and not publicadas and not servicos.get(s, {}).get("ports"),
           "tire o ports: dele; entre containers, basta estar na mesma rede")


def redes(info: dict) -> set:
    return set(info.get("NetworkSettings", {}).get("Networks") or {})


rw, ra, rc_ = redes(c["web"]), redes(c["api"]), redes(c["cache"])
checar("o web e o cache não dividem nenhuma rede", bool(rw) and bool(rc_) and not (rw & rc_),
       "networks: frente (web, api) e fundos (api, cache)")
checar("a api está nas duas redes", bool(ra & rw) and bool(ra & rc_), "a api precisa falar com o web e com o cache")

# 4. Senha fora do arquivo.
texto = arquivo.read_text(encoding="utf-8") if arquivo.exists() else ""
env_api = dict(e.split("=", 1) for e in c["api"].get("Config", {}).get("Env") or [] if "=" in e)
senha = env_api.get("SENHA_ADMIN", "")
checar("o compose.yaml não tem mais a senha vazada", "pinguim123" not in texto, "a senha vazada tem de sair do arquivo")
checar("a api recebeu uma senha nova, com 12 caracteres ou mais", len(senha) >= 12 and senha != "pinguim123",
       "SENHA_ADMIN=... no .env; no compose, SENHA_ADMIN: ${SENHA_ADMIN}")
checar("a senha nova não está escrita no compose.yaml", bool(senha) and senha not in texto,
       "o compose referencia a variável; o valor fica no .env")
env = pasta / ".env"
checar("producao/.env guarda a senha", bool(senha) and env.exists() and senha in env.read_text(encoding="utf-8"),
       "o Compose lê o .env da pasta do projeto sozinho")
gi = pasta / ".gitignore"
linhas = gi.read_text(encoding="utf-8").splitlines() if gi.exists() else []
checar("o .env está no .gitignore", any(l.strip() in (".env", "/.env", "*.env") for l in linhas), "uma linha: .env")
status, _ = http("http://localhost:8383/api/admin", cabecalhos={"X-Senha": senha} if senha else {})
checar("/api/admin aceita a senha nova", bool(senha) and status == 200, f"resposta: {status}")
status, _ = http("http://localhost:8383/api/admin", cabecalhos={"X-Senha": "pinguim123"})
checar("/api/admin recusa a senha vazada", status == 401, f"resposta: {status}")

# 5. Nada como root.
usuario = c["api"].get("Config", {}).get("User", "")
checar("a api não roda como root", bool(c["api"]) and usuario not in ("", "root", "0", "0:0"),
       "USER no Dockerfile (um usuário que já existe na imagem, como nobody)")

# 6. Aguentar o tranco.
for s in SERVICOS:
    politica = c[s].get("HostConfig", {}).get("RestartPolicy", {}).get("Name", "")
    checar(f"o {s} volta sozinho se cair", politica in ("unless-stopped", "always"), "restart: unless-stopped")
hc = servicos.get("cache", {}).get("healthcheck", {})
teste = hc.get("test", "")
teste = " ".join(teste) if isinstance(teste, list) else str(teste)
checar("o cache tem healthcheck com redis-cli ping", "redis-cli" in teste and "ping" in teste.lower(),
       'healthcheck: test: ["CMD", "redis-cli", "ping"]')
saude = c["cache"].get("State", {}).get("Health", {}).get("Status")
checar("o cache está saudável", saude == "healthy", f"estado: {saude}; docker compose ps mostra (healthy)")
dep = servicos.get("api", {}).get("depends_on", {})
checar("a api espera o cache ficar saudável",
       isinstance(dep, dict) and dep.get("cache", {}).get("condition") == "service_healthy",
       "depends_on: cache: condition: service_healthy")
memoria = c["api"].get("HostConfig", {}).get("Memory", 0)
checar("a api tem limite de memória de até 256 MB", 0 < memoria <= 256 * 1024 * 1024,
       "mem_limit: 128m (ou deploy.resources.limits.memory)")
for s in SERVICOS:
    log = c[s].get("HostConfig", {}).get("LogConfig", {})
    limitado = log.get("Type") == "local" or "max-size" in (log.get("Config") or {})
    checar(f"o log do {s} tem tamanho máximo", bool(c[s]) and limitado,
           "logging: driver: json-file, options: max-size: 10m (uma âncora YAML evita repetir)")
