---
mes: 5
semana: 21
palco: host
tipo: ticket
nivel: 2
conceitos: s3, bucket policy, public access block, versionamento, iam, menor privilégio, aws cli
---
# Bucket exposto

## TICKET
Um pesquisador de segurança mandou um e-mail educado: os **backups do banco** da loja
estão abertos para a internet. A conta AWS da loja aqui é simulada (Moto, rodando no seu
Docker), mas os comandos são os da AWS de verdade.

Use `gym aws ...` (a AWS CLI em container, apontada para a conta simulada; ela nunca toca
numa AWS real). Rode de dentro da pasta da oficina para os arquivos que você criar
(`file://...`) serem vistos.

1. Faça o inventário: quais buckets existem e quais políticas cada um tem. Salve as
   evidências em `auditoria.txt`, na oficina.
2. O bucket de backups não pode ser público de jeito nenhum: tire a política pública,
   **bloqueie o acesso público** no próprio bucket (as quatro opções) e ligue o
   **versionamento** (um backup apagado ou sobrescrito por engano precisa ser recuperável).
3. O bucket do site **precisa** continuar público para leitura: é o site da loja. Não
   quebre ele.
4. O usuário `ci-deploy`, usado pelo pipeline, tem permissão de administrador da conta
   inteira. Ele só precisa enviar arquivos para o bucket do site. Deixe só isso (menor
   privilégio), com uma política própria dele.

## COMANDOS
gym aws s3 ls s3api list-buckets get-bucket-policy delete-bucket-policy put-public-access-block get-public-access-block put-bucket-versioning iam list-attached-user-policies detach-user-policy put-user-policy

## PERGUNTAS
1. Por que buckets públicos por engano são uma das maiores fontes de vazamento de dados? Que camadas impedem isso (política, bloqueio de acesso público, criptografia, monitoramento)?
2. O que é o princípio do menor privilégio? Por que "é só o CI" não justifica administrador?
3. Política de bucket e política de usuário (IAM): quem controla o quê? Como elas se combinam?
4. Para que serve o versionamento num bucket de backups? Que outra proteção (Object Lock, cópia em outra conta) você acrescentaria?
5. Chave de acesso fixa no CI e papel com credencial temporária (OIDC do GitHub Actions): por que o segundo é melhor?

## ESTUDE
- AWS Cloud Practitioner Essentials (português): https://aws.amazon.com/pt/training/course-descriptions/cloud-practitioner-essentials/
- GIRUS, labs `aws_s3-iam` e `aws_s3_storage` (hoje pedem o token Hobby gratuito do LocalStack): https://github.com/badtuxx/girus-cli
- Moto, a AWS simulada deste ticket (inglês): https://docs.getmoto.org/
