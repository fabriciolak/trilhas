#!/usr/bin/env bash
# Treino de Terraform: a solução em bash (usada pelo lab/testar.py). Roda na oficina.
set -euo pipefail
cd tf
cat > versions.tf <<'HCL'
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 4.6"
    }
  }
}

provider "docker" {}
HCL
gym terraform init -input=false -no-color
cat > main.tf <<'HCL'
resource "docker_image" "nginx" {
  name         = "nginx:1.30-alpine"
  keep_locally = true
}

resource "docker_container" "web" {
  name  = "treino-tf-web"
  image = docker_image.nginx.image_id
  ports {
    internal = 80
    external = var.porta
  }
}
HCL
cat > variables.tf <<'HCL'
variable "porta" {
  type    = number
  default = 8989
}
HCL
cat > outputs.tf <<'HCL'
output "url" {
  value = "http://localhost:${var.porta}"
}
HCL
gym terraform fmt
gym terraform validate -no-color
gym terraform plan -out plano.tfplan -input=false -no-color
gym terraform apply -input=false -no-color plano.tfplan
gym terraform output -raw url > url.txt
cat >> main.tf <<'HCL'

resource "docker_image" "alpine" {
  name         = "alpine:3.24"
  keep_locally = true
}

resource "docker_container" "worker" {
  for_each = toset(["a", "b", "c"])
  name     = "treino-tf-worker-${each.key}"
  image    = docker_image.alpine.image_id
  command  = ["sleep", "infinity"]
}
HCL
gym terraform apply -auto-approve -input=false -no-color
echo 'porta = 9090' > terraform.tfvars
gym terraform apply -auto-approve -input=false -no-color
gym terraform state list > estado.txt
sleep 2
curl -s http://localhost:9090/ | grep -o '<title>.*</title>'
