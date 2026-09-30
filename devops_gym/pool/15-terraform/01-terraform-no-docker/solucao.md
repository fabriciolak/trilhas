# Terraform no Docker: uma solução possível

Dentro de `infra/`, na oficina.

## 1. init

```
gym terraform init
```

`Failed to query available provider packages ... kreuzwerker/dokcer`. O `init` baixa os
providers declarados em `required_providers`, e o nome tem um erro de digitação. O certo
é `source = "kreuzwerker/docker"`. O `init` cria a pasta `.terraform/` e o
`.terraform.lock.hcl`, que trava a versão exata e as assinaturas.

## 2. validate

```
gym terraform validate
```

- `Unsupported attribute ... "latest"`: nas versões novas do provider, o atributo se
  chama `image_id`. Troque para `image = docker_image.nginx.image_id`.
- `Reference to undeclared input variable ... "porta_externa"`: a variável declarada é
  `porta`. Use `external = var.porta`.

`gym terraform fmt` deixa a formatação no padrão.

## 3. plan e apply

```
gym terraform plan
gym terraform apply
```

O plano mostra `2 to add`: a imagem e o container. Confira, aplique e abra
`http://localhost:8484`. O `terraform.tfstate` agora registra o que o Terraform criou.

## 4. Drift

```
docker rm -f gym-tf-vitrine
gym terraform plan
```

No refresh, o Terraform compara o state com o mundo real: o container sumiu, então o
plano é recriá-lo (`1 to add`). `gym terraform apply` põe tudo de volta. Mudança feita na
mão é o que chamam de *drift*, e o `plan` é o detector.

## 5. Valores por arquivo

`infra/terraform.tfvars` (o Terraform lê esse arquivo sozinho):

```hcl
titulo = "Pinguim Store: Black Friday"
```

```
gym terraform apply
```

O `upload` do container mudou, então o provider recria o container com a página nova.
`variables.tf` guarda o tipo e o padrão; o `.tfvars` guarda os valores de cada ambiente.
