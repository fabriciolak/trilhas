---
mes: 5
semana: 20
palco: host
tipo: ticket
nivel: 2
conceitos: terraform, provider, init, validate, plan, apply, state, variáveis, drift
---
# Terraform no Docker

## TICKET
A Carla quer parar de subir containers na mão: a vitrine de testes tem que nascer de
código. O Beto começou a infraestrutura em Terraform, em `infra/` na oficina, usando o
provider que controla o **Docker do seu próprio computador** (sem nuvem, sem custo),
mas nunca conseguiu rodar.

Use `gym terraform ...` (o Terraform em container, com acesso ao seu Docker) **dentro
de `infra/`**. Se preferir, instale o Terraform ou o OpenTofu de verdade.

1. Inicialize o projeto. A primeira falha é antes de qualquer código rodar.
2. Valide a configuração e conserte os erros que aparecerem. Um deles vem de uma
   mudança de versão do provider: a documentação dele diz o nome atual.
3. Veja o plano, entenda o que vai ser criado e aplique. A vitrine precisa responder
   em `http://localhost:8484`.
4. Alguém apaga o container na mão (faça isso: `docker rm -f gym-tf-vitrine`). Veja o
   que o Terraform percebe no próximo plano e deixe tudo como o código manda.
5. O marketing quer o título `Pinguim Store: Black Friday`. Mude **sem editar**
   `variables.tf`: use o arquivo que o Terraform lê sozinho para valores de variáveis.
   Aplique.

## COMANDOS
gym terraform init validate fmt plan apply show state docker rm

## PERGUNTAS
1. O que é o state do Terraform, por que ele existe e por que ele não vai para o Git (e onde ele fica num time)?
2. `plan` e `apply`: por que revisar o plano é o passo mais importante?
3. O que é drift, e como o Terraform o detecta?
4. Terraform e Ansible: qual a diferença entre provisionar e configurar?
5. Por que fixar a versão do provider (`version = "~> 4.6"`)? O que o `.terraform.lock.hcl` garante?

## ESTUDE
- Google Cloud, "Getting Started with Terraform" (versão em português, no Coursera): https://www.coursera.org/learn/getting-started-with-terraform-for-google-cloud---portugus
- GIRUS, labs `terraform_fundamentos` e `terraform_estado-remoto`: https://github.com/badtuxx/girus-cli
- Documentação do provider Docker (inglês): https://registry.terraform.io/providers/kreuzwerker/docker/latest/docs
- OpenTofu, a alternativa aberta e compatível (inglês): https://opentofu.org/docs/
