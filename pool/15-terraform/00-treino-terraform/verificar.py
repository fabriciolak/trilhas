# Treino de Terraform: provider, recursos por referência, variável e output, plano salvo,
# for_each, tfvars e state.
# Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina, terraform.
import json
import re

tf = oficina / "tf"


def ler(nome: str) -> str:
    arquivo = tf / nome
    return arquivo.read_text(encoding="utf-8", errors="replace") if arquivo.exists() else ""


checar("1. versions.tf pede kreuzwerker/docker ~> 4.6", "kreuzwerker/docker" in ler("versions.tf") and "4.6" in ler("versions.tf"),
       'required_providers { docker = { source = "kreuzwerker/docker", version = "~> 4.6" } }')
checar("1. o init rodou (existe o .terraform.lock.hcl)", "kreuzwerker/docker" in ler(".terraform.lock.hcl"), "gym terraform init")
main = ler("main.tf")
checar("2. o container usa a imagem pela referência", bool(re.search(r"image\s*=\s*docker_image\.\w+\.image_id", main)),
       "image = docker_image.nginx.image_id")
checar("2. a imagem fica no seu Docker depois do destroy", bool(re.search(r"keep_locally\s*=\s*true", main)), "keep_locally = true")
checar("3. a variável porta é um número com padrão 8989",
       bool(re.search(r'variable\s+"porta"', ler("variables.tf"))) and "8989" in ler("variables.tf") and "number" in ler("variables.tf"),
       'variable "porta" { type = number, default = 8989 }')
checar("3. o output url usa a porta", bool(re.search(r'output\s+"url"', ler("outputs.tf"))) and "var.porta" in ler("outputs.tf"),
       'output "url" { value = "http://localhost:${var.porta}" }')
estado = json.loads(ler("terraform.tfstate") or "{}")
recursos = []
for r in estado.get("resources", []):
    for inst in r.get("instances", []):
        chave = inst.get("index_key")
        recursos.append(f'{r["type"]}.{r["name"]}' + (f'["{chave}"]' if chave is not None else ""))
checar("4. o state tem a imagem e o container web", any(r.startswith("docker_container.") and "worker" not in r for r in recursos)
       and any(r.startswith("docker_image.") for r in recursos), "gym terraform plan -out plano.tfplan; gym terraform apply plano.tfplan")
checar("4. o plano foi salvo num arquivo", any(p.suffix == ".tfplan" for p in tf.glob("*.tfplan")), "plan -out plano.tfplan")
checar("4. url.txt tem a URL", ler("url.txt").strip().startswith("http://localhost:"), "gym terraform output -raw url > url.txt")
for letra in "abc":
    rc, saida = docker("inspect", f"treino-tf-worker-{letra}")
    checar(f"5. treino-tf-worker-{letra} existe e está rodando", rc == 0 and json.loads(saida)[0]["State"]["Running"],
           'for_each = toset(["a", "b", "c"]) e name = "treino-tf-worker-${each.key}"')
checar("5. os workers estão no state com for_each", sum('"]' in r and r.startswith("docker_container.") for r in recursos) >= 3,
       "com for_each, o state tem docker_container.nome[\"a\"]...")
checar("6. terraform.tfvars define porta = 9090", bool(re.search(r"porta\s*=\s*9090", ler("terraform.tfvars"))), "porta = 9090")
status, corpo = http("http://localhost:9090/")
checar("6. o site responde na 9090", status == 200 and "nginx" in corpo.lower(), f"resposta: {status}; gym terraform apply")
rc, saida = docker("inspect", "treino-tf-web")
portas = (json.loads(saida)[0]["HostConfig"].get("PortBindings") or {}).get("80/tcp") or [] if rc == 0 else []
checar("6. o treino-tf-web publica a 9090", any(p.get("HostPort") == "9090" for p in portas), "o apply troca o container")
checar("7. estado.txt tem a lista do state", "docker_container" in ler("estado.txt") and "worker" in ler("estado.txt"),
       "gym terraform state list > estado.txt")
