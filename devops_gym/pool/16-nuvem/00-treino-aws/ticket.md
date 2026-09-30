---
mes: 5
semana: 21
palco: host
tipo: treino
nivel: 1
conceitos: conta, região, AWS CLI, sts, S3 (bucket, objeto, prefixo, versionamento), IAM (usuário, grupo, política), EC2 security group, --query, --output
---
# Treino: AWS pela linha de comando

## AULA
**A nuvem é uma API.** Tudo o que o console da AWS faz com cliques é uma chamada de API,
e a **AWS CLI** faz a mesma chamada da linha de comando, no formato
`aws <serviço> <operação> [opções]`. Aqui a conta é **simulada** (Moto, no seu Docker):
`gym aws ...` nunca toca numa AWS real, então não há custo nem risco.

**Os serviços que aparecem em toda vaga:**

- **IAM**: quem pode fazer o quê. Usuários (pessoas e sistemas), grupos (juntam
  usuários), **políticas** (JSON com `Effect`, `Action`, `Resource`) e *roles*
  (permissões que um serviço assume). Regra de ouro: **menor privilégio**.
- **S3**: armazenamento de objetos. Um **bucket** (nome único no mundo) guarda
  **objetos**, identificados por uma chave (`relatorios/2026/set.txt`: a "pasta" é só
  um prefixo do nome). Versionamento guarda o histórico de cada objeto.
- **EC2**: máquinas virtuais. O **security group** é o firewall delas: regras de
  entrada por protocolo, porta e origem (CIDR).

    gym aws sts get-caller-identity                  # quem sou eu nesta conta?
    gym aws s3 mb s3://meu-bucket                    # cria bucket (comandos "s3" são os de alto nível)
    gym aws s3 cp arquivo.txt s3://meu-bucket/pasta/arquivo.txt
    gym aws s3 ls s3://meu-bucket --recursive
    gym aws s3api put-bucket-versioning --bucket meu-bucket --versioning-configuration Status=Enabled
    gym aws s3api list-object-versions --bucket meu-bucket
    gym aws iam create-user --user-name ana
    gym aws iam create-group --group-name leitores
    gym aws iam add-user-to-group --user-name ana --group-name leitores
    gym aws iam attach-group-policy --group-name leitores --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
    gym aws ec2 create-security-group --group-name web --description "site"
    gym aws ec2 authorize-security-group-ingress --group-name web --protocol tcp --port 443 --cidr 0.0.0.0/0

**Filtrar a resposta:** `--query` (JMESPath) escolhe os campos e `--output`
(`json`, `table`, `text`) o formato:

    gym aws s3api list-buckets --query 'Buckets[].Name' --output text

Rode o `gym aws` de dentro da pasta da oficina: ela é montada no container, e os
caminhos relativos (`relatorio.txt`, `file://politica.json`) funcionam.

**Na AWS de verdade:** crie um alerta de orçamento no primeiro dia, nunca use o usuário
raiz no dia a dia, ligue MFA e apague o que criou ao terminar.

## TICKET
A conta simulada começa vazia. Respostas na pasta da oficina.

1. Salve a identidade da conta em `identidade.txt`.
2. Crie o bucket `treino-arquivos`.
3. Envie `relatorio.txt` para `s3://treino-arquivos/relatorios/2026/relatorio.txt`.
4. Salve a listagem recursiva do bucket em `lista.txt`.
5. Ligue o versionamento do bucket. Mude o `relatorio.txt` na sua pasta e envie de novo
   para a mesma chave: o bucket tem de guardar **as duas** versões.
6. Crie o grupo `leitores` com a política gerenciada `AmazonS3ReadOnlyAccess`, crie a
   usuária `ana` e coloque-a no grupo.
7. Crie o security group `treino-web` ("site do treino") liberando a porta 80 para o
   mundo (`0.0.0.0/0`) e a 22 só para a rede interna `10.0.0.0/8`.
8. Salve em `buckets.txt` só os nomes dos buckets, em texto puro (`--query` e `--output`).

## COMANDOS
gym aws sts s3 mb cp ls s3api put-bucket-versioning list-object-versions iam create-user create-group add-user-to-group attach-group-policy ec2 create-security-group authorize-security-group-ingress --query --output

## PERGUNTAS
1. Por que dar permissões a grupos, e não direto a cada usuário?
2. Por que liberar a porta 22 para `0.0.0.0/0` é uma má ideia? Qual a alternativa?
3. O que o versionamento do S3 protege, e o que ele não protege?

## ESTUDE
- AWS Cloud Practitioner Essentials (em português): https://aws.amazon.com/pt/training/course-descriptions/cloud-practitioner-essentials/
- Documentação da AWS CLI: https://docs.aws.amazon.com/cli/
