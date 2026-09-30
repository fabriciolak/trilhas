terraform {
  required_version = ">= 1.6"

  required_providers {
    docker = {
      source  = "kreuzwerker/dokcer"
      version = "~> 4.6"
    }
  }
}

provider "docker" {}
