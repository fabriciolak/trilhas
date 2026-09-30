---
mes: 5
semana: 20
palco: host
tipo: treino
nivel: 1
conceitos: terraform, HCL, provider, init, lock file, recurso, referência, variável, output, plan -out, apply, state, for_each, tfvars
---
# Treino: Terraform do zero

## AULA
**Infraestrutura como código:** você descreve **o que** quer (este container, esta rede,
este bucket) em arquivos `.tf`, e o Terraform descobre **como** chegar lá, comparando o
código com o que existe. O que ele criou fica anotado no **state** (`terraform.tfstate`).

Aqui o "provedor de nuvem" é o seu Docker (provider `kreuzwerker/docker`): os mesmos
conceitos valem para AWS, Azure e GCP, só mudam os tipos de recurso. O `gym terraform ...`
roda o Terraform num container, enxergando a pasta atual e o seu Docker.

    # versions.tf: quais providers e versões
    terraform {
      required_providers {
        docker = {
          source  = "kreuzwerker/docker"
          version = "~> 4.6"
        }
      }
    }
    provider "docker" {}

    # main.tf: recursos. tipo "nome_local" { argumentos }
    resource "docker_image" "nginx" {
      name         = "nginx:1.30-alpine"
      keep_locally = true                        # o destroy não apaga a imagem do seu Docker
    }
    resource "docker_container" "web" {
      name  = "meu-web"
      image = docker_image.nginx.image_id        # REFERÊNCIA: cria a dependência sozinho
      ports {
        internal = 80
        external = var.porta
      }
    }

    # variables.tf e outputs.tf
    variable "porta" {
      type    = number
      default = 8080
    }
    output "url" {
      value = "http://localhost:${var.porta}"
    }

**O ciclo.**

    gym terraform init                  # baixa os providers; grava o .terraform.lock.hcl
    gym terraform fmt                   # formata o código
    gym terraform validate              # confere a sintaxe e as referências
    gym terraform plan -out plano.tfplan   # mostra o que vai mudar (+ criar, ~ mudar, - apagar)
    gym terraform apply plano.tfplan    # aplica exatamente o que o plano mostrou
    gym terraform output -raw url       # lê um output
    gym terraform state list            # o que está no state
    gym terraform destroy               # apaga tudo o que ele criou

**Vários iguais:** `for_each = toset(["a", "b"])` cria um recurso por item, e `each.key`
é o item da vez (`docker_container.worker["a"]`).

**Valores por ambiente** vão em `terraform.tfvars` (lido sozinho): `porta = 9090`. O
padrão continua no `variables.tf`.

Nunca edite o state na mão, e nunca o coloque no Git (ele guarda segredos em texto claro).

## TICKET
Trabalhe na pasta `tf/` da oficina. Tudo pelo Terraform (nada de `docker run`).

1. Escreva `versions.tf` com o provider `kreuzwerker/docker` (versão `~> 4.6`) e rode o
   `init`.
2. Escreva `main.tf` com a imagem `nginx:1.30-alpine` (sem apagar a imagem no destroy)
   e o container `treino-tf-web`, que usa essa imagem pela referência e publica a 80 na
   porta da variável `porta`.
3. Escreva `variables.tf` (`porta`, número, padrão `8989`) e `outputs.tf` (`url`, com a
   porta).
4. Gere o plano num arquivo e aplique esse plano. Salve a URL do output em `url.txt`.
5. Com `for_each`, crie três containers `treino-tf-worker-a`, `-b` e `-c`, da imagem
   `alpine:3.24` (outro recurso de imagem), rodando `sleep infinity`.
6. Mude a porta para `9090` num `terraform.tfvars` e aplique. Confira que o site passou
   para a 9090.
7. Salve a lista de recursos do state em `estado.txt`.

## COMANDOS
gym terraform init fmt validate plan -out apply output state list destroy

## PERGUNTAS
1. O que é o state e por que ele existe? O que acontece se duas pessoas aplicarem ao mesmo tempo com states diferentes?
2. Por que usar `docker_image.nginx.image_id` em vez de escrever o nome da imagem de novo?
3. Para que serve o `.terraform.lock.hcl`, e ele vai para o Git?

## ESTUDE
- Google Cloud, "Getting Started with Terraform" (versão em português): https://www.coursera.org/learn/getting-started-with-terraform-for-google-cloud---portugus
- Documentação do provider Docker: https://registry.terraform.io/providers/kreuzwerker/docker/latest/docs
- OpenTofu (mesmos comandos, com `tofu`): https://opentofu.org/docs/
