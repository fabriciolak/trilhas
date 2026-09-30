#!/usr/bin/env bash
# Bucket exposto: a solução em bash (usada pelo lab/testar.py). Roda na oficina.
set -euo pipefail
gym aws s3api list-buckets
gym aws s3api get-bucket-policy --bucket pinguim-backups > auditoria.txt
gym aws s3api get-bucket-policy --bucket pinguim-site >> auditoria.txt
gym aws iam list-attached-user-policies --user-name ci-deploy >> auditoria.txt
gym aws s3api delete-bucket-policy --bucket pinguim-backups
gym aws s3api put-public-access-block --bucket pinguim-backups --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
gym aws s3api put-bucket-versioning --bucket pinguim-backups --versioning-configuration Status=Enabled
cat > politica.json <<'EOF'
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
EOF
gym aws iam detach-user-policy --user-name ci-deploy --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
gym aws iam put-user-policy --user-name ci-deploy --policy-name deploy-site --policy-document file://politica.json
gym aws s3api get-public-access-block --bucket pinguim-backups
