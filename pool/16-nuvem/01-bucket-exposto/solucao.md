# Bucket exposto: uma solução possível

Na pasta da oficina. `gym aws` é a AWS CLI apontada para a conta simulada.

## 1. Inventário

```
gym aws s3api list-buckets
gym aws s3api get-bucket-policy --bucket pinguim-backups > auditoria.txt
gym aws s3api get-bucket-policy --bucket pinguim-site >> auditoria.txt
gym aws iam list-attached-user-policies --user-name ci-deploy >> auditoria.txt
```

As duas políticas têm `"Principal": "*"` com `s3:GetObject`: qualquer pessoa na
internet baixa qualquer arquivo. No site isso é o esperado; nos backups, é o vazamento.

## 2. Fechar os backups

```
gym aws s3api delete-bucket-policy --bucket pinguim-backups
gym aws s3api put-public-access-block --bucket pinguim-backups --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
gym aws s3api put-bucket-versioning --bucket pinguim-backups --versioning-configuration Status=Enabled
gym aws s3api get-public-access-block --bucket pinguim-backups
```

Tirar a política resolve hoje. O bloqueio de acesso público impede que alguém reabra
amanhã sem querer. O versionamento guarda as versões antigas de cada arquivo.

## 3. O site continua como está

Nada a fazer no `pinguim-site`. Confira com `get-bucket-policy`.

## 4. Menor privilégio para o CI

`politica.json`, na oficina:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DeployDoSite",
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::pinguim-site/*"
    }
  ]
}
```

```
gym aws iam detach-user-policy --user-name ci-deploy --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
gym aws iam put-user-policy --user-name ci-deploy --policy-name deploy-site --policy-document file://politica.json
gym aws iam list-attached-user-policies --user-name ci-deploy
gym aws iam get-user-policy --user-name ci-deploy --policy-name deploy-site
```

Num projeto de verdade, o próximo passo é não ter chave fixa no CI: o GitHub Actions
assume um papel da AWS via OIDC, com credenciais que expiram em minutos.
