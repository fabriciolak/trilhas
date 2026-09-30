# Treino de AWS: identidade, bucket e objeto, versões, IAM (grupo com política), security
# group e --query.
# Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina.
import re
import urllib.parse


def aws(metodo, caminho, corpo=None, servico="s3", tipo=None):
    cabecalhos = {"Authorization": "AWS4-HMAC-SHA256 Credential=teste/20260101/us-east-1/"
                                   f"{servico}/aws4_request, SignedHeaders=host, Signature=gym"}
    if tipo:
        cabecalhos["Content-Type"] = tipo
    return http(f"http://localhost:15000{caminho}", metodo=metodo, corpo=corpo, cabecalhos=cabecalhos)


def consulta(servico, versao, **params):
    corpo = urllib.parse.urlencode({**params, "Version": versao}).encode()
    return aws("POST", "/", corpo, servico, "application/x-www-form-urlencoded")


def ler(nome: str) -> str:
    arquivo = oficina / nome
    return arquivo.read_text(encoding="utf-8", errors="replace") if arquivo.exists() else ""


status, _ = aws("GET", "/")
checar("a conta simulada (Moto) está no ar", status == 200, "recomece o treino com [r] para subir o gym-moto")
checar("1. identidade.txt tem a conta", "Account" in ler("identidade.txt"), "gym aws sts get-caller-identity > identidade.txt")
status, _ = aws("HEAD", "/treino-arquivos")
checar("2. o bucket treino-arquivos existe", status == 200, "gym aws s3 mb s3://treino-arquivos")
chave = "relatorios/2026/relatorio.txt"
status, _ = aws("HEAD", f"/treino-arquivos/{chave}")
checar("3. o objeto está na chave certa", status == 200, f"gym aws s3 cp relatorio.txt s3://treino-arquivos/{chave}")
checar("4. lista.txt tem a listagem com a chave", chave in ler("lista.txt"), "gym aws s3 ls s3://treino-arquivos --recursive > lista.txt")
status, versionamento = aws("GET", "/treino-arquivos?versioning=")
checar("5. o versionamento está ligado", "<Status>Enabled</Status>" in versionamento,
       "gym aws s3api put-bucket-versioning --bucket treino-arquivos --versioning-configuration Status=Enabled")
status, versoes = aws("GET", "/treino-arquivos?versions=")
n = len(re.findall(rf"<Version>.*?<Key>{re.escape(chave)}</Key>.*?</Version>", versoes, re.S))
checar(f"5. o objeto tem duas versões ou mais ({n})", n >= 2, "ligue o versionamento ANTES de enviar de novo")
status, anexadas = consulta("iam", "2010-05-08", Action="ListAttachedGroupPolicies", GroupName="leitores")
checar("6. o grupo leitores tem a AmazonS3ReadOnlyAccess", status == 200 and "AmazonS3ReadOnlyAccess" in anexadas,
       "gym aws iam attach-group-policy --group-name leitores --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess")
status, grupos = consulta("iam", "2010-05-08", Action="ListGroupsForUser", UserName="ana")
checar("6. a ana existe e está no grupo leitores", status == 200 and "<GroupName>leitores</GroupName>" in grupos,
       "gym aws iam create-user --user-name ana; gym aws iam add-user-to-group ...")
status, sg = consulta("ec2", "2016-11-15", Action="DescribeSecurityGroups", **{"Filter.1.Name": "group-name", "Filter.1.Value.1": "treino-web"})
blocos = re.findall(r"<ipPermissions>(.*?)</ipPermissions>", sg, re.S)
entrada = blocos[0] if blocos else ""
permissoes = re.findall(r"<fromPort>(\d+)</fromPort>.*?<ipRanges>(.*?)</ipRanges>", entrada, re.S)
cidrs = {porta: re.findall(r"<cidrIp>([^<]+)</cidrIp>", faixas) for porta, faixas in permissoes}
checar("7. o security group treino-web existe", "<groupName>treino-web</groupName>" in sg,
       'gym aws ec2 create-security-group --group-name treino-web --description "site do treino"')
checar("7. a porta 80 está aberta para 0.0.0.0/0", "0.0.0.0/0" in cidrs.get("80", []),
       "gym aws ec2 authorize-security-group-ingress --group-name treino-web --protocol tcp --port 80 --cidr 0.0.0.0/0")
checar("7. a porta 22 só para 10.0.0.0/8", cidrs.get("22") == ["10.0.0.0/8"], "--port 22 --cidr 10.0.0.0/8 (e nada mais na 22)")
b = ler("buckets.txt")
checar("8. buckets.txt tem só os nomes, em texto", "treino-arquivos" in b and "{" not in b and "Name" not in b,
       "gym aws s3api list-buckets --query 'Buckets[].Name' --output text > buckets.txt")
