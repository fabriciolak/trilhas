# Bucket exposto: sobe a AWS simulada (Moto) na rede gym-nuvem e fabrica a conta quebrada:
# backups públicos, site público (esse pode) e um usuário de CI com administrador.
import json
import time
import urllib.parse


def aws(metodo, caminho, corpo=None, servico="s3", tipo=None):
    cabecalhos = {"Authorization": "AWS4-HMAC-SHA256 Credential=teste/20260101/us-east-1/"
                                   f"{servico}/aws4_request, SignedHeaders=host, Signature=gym"}
    if tipo:
        cabecalhos["Content-Type"] = tipo
    return http(f"http://localhost:15000{caminho}", metodo=metodo, corpo=corpo, cabecalhos=cabecalhos)


def iam(**params):
    corpo = urllib.parse.urlencode({**params, "Version": "2010-05-08"}).encode()
    return aws("POST", "/", corpo, "iam", "application/x-www-form-urlencoded")


rede_nuvem()
docker("rm", "-f", "gym-moto")
docker("run", "-d", "--name", "gym-moto", "--network", "gym-nuvem", "--network-alias", "moto",
       "-p", "15000:5000", "-e", "MOTO_IAM_LOAD_MANAGED_POLICIES=true", "motoserver/moto:5.2.3")
for _ in range(60):
    if aws("GET", "/")[0] == 200:
        break
    time.sleep(1)


def publica(bucket, recurso):
    return json.dumps({"Version": "2012-10-17", "Statement": [{
        "Sid": "LeituraPublica", "Effect": "Allow", "Principal": "*",
        "Action": "s3:GetObject", "Resource": f"arn:aws:s3:::{recurso}"}]}).encode()


aws("PUT", "/pinguim-backups")
aws("PUT", "/pinguim-backups?policy=", publica("pinguim-backups", "pinguim-backups/*"), tipo="application/json")
for dia in ("2026-09-28", "2026-09-29"):
    aws("PUT", f"/pinguim-backups/banco-{dia}.sql.gz", b"-- dump simulado do banco de clientes\n")
aws("PUT", "/pinguim-site")
aws("PUT", "/pinguim-site?policy=", publica("pinguim-site", "pinguim-site/*"), tipo="application/json")
aws("PUT", "/pinguim-site/index.html", b"<h1>Pinguim Store</h1>", tipo="text/html")

iam(Action="CreateUser", UserName="ci-deploy")
iam(Action="AttachUserPolicy", UserName="ci-deploy", PolicyArn="arn:aws:iam::aws:policy/AdministratorAccess")
