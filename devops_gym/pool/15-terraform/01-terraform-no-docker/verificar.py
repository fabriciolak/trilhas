# Terraform no Docker: a vitrine criada pelo Terraform, sem drift, com o título via tfvars.
# Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina, terraform.
import json

infra = oficina / "infra"
checar("o provider certo (kreuzwerker/docker)", "kreuzwerker/docker\"" in (infra / "versions.tf").read_text(encoding="utf-8"),
       "o init diz que não acha o provider: confira o source")
estado = infra / "terraform.tfstate"
recursos = []
if estado.exists():
    recursos = [f'{r["type"]}.{r["name"]}' for r in json.loads(estado.read_text(encoding="utf-8")).get("resources", [])]
checar("o state tem a imagem e o container", {"docker_image.nginx", "docker_container.vitrine"} <= set(recursos),
       "gym terraform apply (dentro de infra/)")
rc, _ = docker("inspect", "gym-tf-vitrine")
checar("o container gym-tf-vitrine existe", rc == 0, "depois de apagar na mão, o apply recria")
status, corpo = http("http://localhost:8484/")
checar("a vitrine responde em http://localhost:8484", status == 200, f"resposta: {status} {corpo[:80]}")
checar("o título é o da Black Friday", "Pinguim Store: Black Friday" in corpo, "o Terraform lê terraform.tfvars sozinho")
tfvars = infra / "terraform.tfvars"
checar("o título veio de terraform.tfvars", tfvars.exists() and "Black Friday" in tfvars.read_text(encoding="utf-8"),
       'titulo = "Pinguim Store: Black Friday" em infra/terraform.tfvars')
checar("variables.tf continua com o padrão original", "Pinguim Store (Terraform)" in (infra / "variables.tf").read_text(encoding="utf-8"),
       "valores de ambiente vão no tfvars; o padrão fica no variables.tf")
if estado.exists():
    rc, saida = terraform(infra, "plan", "-detailed-exitcode", "-input=false", "-no-color")
    checar("nada a mudar: o mundo real é igual ao código (plan sem mudanças)", rc == 0,
           "rode gym terraform plan: código 2 = há mudanças pendentes. " + saida.splitlines()[-1][:120] if saida else "")
