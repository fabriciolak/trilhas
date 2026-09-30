#!/usr/bin/env bash
# Terraform no Docker: a solução em bash (usada pelo lab/testar.py). Roda na oficina.
set -euo pipefail
cd infra
gym terraform init -input=false -no-color || true
sed -i 's#kreuzwerker/dokcer#kreuzwerker/docker#' versions.tf
gym terraform init -input=false -no-color
gym terraform validate -no-color || true
sed -i 's#docker_image.nginx.latest#docker_image.nginx.image_id#; s#var.porta_externa#var.porta#' main.tf
gym terraform validate -no-color
gym terraform apply -auto-approve -input=false -no-color
docker rm -f gym-tf-vitrine
gym terraform plan -input=false -no-color | tail -n 3
printf 'titulo = "Pinguim Store: Black Friday"\n' > terraform.tfvars
gym terraform apply -auto-approve -input=false -no-color
sleep 2
curl -s http://localhost:8484/ | grep '<h1>'
