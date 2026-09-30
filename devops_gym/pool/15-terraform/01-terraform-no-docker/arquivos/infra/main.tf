# A vitrine de testes: um nginx servindo uma página gerada a partir de um template.

resource "docker_image" "nginx" {
  name         = "nginx:1.30-alpine"
  keep_locally = true
}

resource "docker_container" "vitrine" {
  name  = "gym-tf-vitrine"
  image = docker_image.nginx.latest

  ports {
    internal = 80
    external = var.porta_externa
  }

  upload {
    content = templatefile("${path.module}/index.html.tftpl", { titulo = var.titulo })
    file    = "/usr/share/nginx/html/index.html"
  }
}
