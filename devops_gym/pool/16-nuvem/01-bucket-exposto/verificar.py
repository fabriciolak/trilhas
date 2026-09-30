# Bucket exposto: backups fechados e versionados, site ainda público, CI com menor privilégio.
# Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina.
import json
import re
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


status, _ = aws("GET", "/")
checar("a conta simulada (Moto) está no ar", status == 200, "recomece o ticket com [r] para subir o gym-moto")

status, politica = aws("GET", "/pinguim-backups?policy=")
checar("o bucket de backups não tem política pública", status == 404 or '"*"' not in politica,
       "gym aws s3api delete-bucket-policy --bucket pinguim-backups")
status, bloqueio = aws("GET", "/pinguim-backups?publicAccessBlock=")
opcoes = ("BlockPublicAcls", "IgnorePublicAcls", "BlockPublicPolicy", "RestrictPublicBuckets")
checar("o bloqueio de acesso público está ligado (as quatro opções)",
       status == 200 and all(re.search(rf"<{o}>true</{o}>", bloqueio) for o in opcoes),
       "gym aws s3api put-public-access-block --bucket pinguim-backups --public-access-block-configuration ...")
status, versao = aws("GET", "/pinguim-backups?versioning=")
checar("o versionamento dos backups está ligado", "<Status>Enabled</Status>" in versao,
       "gym aws s3api put-bucket-versioning --bucket pinguim-backups --versioning-configuration Status=Enabled")

status, site = aws("GET", "/pinguim-site?policy=")
checar("o site continua público para leitura", status == 200 and '"*"' in site and "s3:GetObject" in site,
       "a política pública do pinguim-site é necessária: ele é o site da loja")

status, anexadas = iam(Action="ListAttachedUserPolicies", UserName="ci-deploy")
checar("o ci-deploy não é mais administrador", status == 200 and "AdministratorAccess" not in anexadas,
       "gym aws iam detach-user-policy --user-name ci-deploy --policy-arn arn:aws:iam::aws:policy/AdministratorAccess")
status, nomes = iam(Action="ListUserPolicies", UserName="ci-deploy")
documentos = []
for nome in re.findall(r"<member>([^<]+)</member>", nomes):
    st, doc = iam(Action="GetUserPolicy", UserName="ci-deploy", PolicyName=nome)
    achado = re.search(r"<PolicyDocument>([^<]+)</PolicyDocument>", doc)
    if achado:
        documentos.append(urllib.parse.unquote(achado.group(1)))
texto = " ".join(documentos)
checar("o ci-deploy tem uma política própria que permite enviar ao site", "s3:PutObject" in texto and "pinguim-site" in texto,
       "gym aws iam put-user-policy --user-name ci-deploy --policy-name deploy-site --policy-document file://politica.json")
amplo = False
for doc in documentos:
    try:
        for st in json.loads(doc).get("Statement", []):
            acoes = st.get("Action", []); acoes = [acoes] if isinstance(acoes, str) else acoes
            recursos = st.get("Resource", []); recursos = [recursos] if isinstance(recursos, str) else recursos
            if st.get("Effect") == "Allow" and ("*" in acoes or "s3:*" in acoes or "*" in recursos or any("pinguim-backups" in r for r in recursos)):
                amplo = True
    except ValueError:
        amplo = True
checar("a política do ci-deploy é mínima (sem *, sem backups)", documentos and not amplo,
       "só s3:PutObject em arn:aws:s3:::pinguim-site/*")
auditoria = oficina / "auditoria.txt"
checar("auditoria.txt tem as políticas encontradas", auditoria.exists() and "Principal" in auditoria.read_text(encoding="utf-8"),
       "gym aws s3api get-bucket-policy --bucket ... >> auditoria.txt")
