#!/usr/bin/env bash
# Treino de AWS: a solução em bash (usada pelo lab/testar.py). Roda na oficina.
set -euo pipefail
gym aws sts get-caller-identity > identidade.txt
gym aws s3 mb s3://treino-arquivos
gym aws s3 cp relatorio.txt s3://treino-arquivos/relatorios/2026/relatorio.txt
gym aws s3 ls s3://treino-arquivos --recursive > lista.txt
gym aws s3api put-bucket-versioning --bucket treino-arquivos --versioning-configuration Status=Enabled
echo "Relatório de vendas de setembro (revisado): R$ 129.100,00" > relatorio.txt
gym aws s3 cp relatorio.txt s3://treino-arquivos/relatorios/2026/relatorio.txt
gym aws s3api list-object-versions --bucket treino-arquivos --query 'Versions[].[Key,VersionId,IsLatest]' --output table
gym aws iam create-group --group-name leitores
gym aws iam attach-group-policy --group-name leitores --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
gym aws iam create-user --user-name ana
gym aws iam add-user-to-group --user-name ana --group-name leitores
gym aws ec2 create-security-group --group-name treino-web --description "site do treino"
gym aws ec2 authorize-security-group-ingress --group-name treino-web --protocol tcp --port 80 --cidr 0.0.0.0/0
gym aws ec2 authorize-security-group-ingress --group-name treino-web --protocol tcp --port 22 --cidr 10.0.0.0/8
gym aws s3api list-buckets --query 'Buckets[].Name' --output text > buckets.txt
cat buckets.txt
