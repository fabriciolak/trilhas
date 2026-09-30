# Service sem endpoints: selector e targetPort certos, endpoints com os 2 pods e resposta
# de verdade pelo ClusterIP. Recebe prontos do gym.py: ok, falha, checar, docker, http, oficina, k8s.
import json

rc, saida = k8s("get", "service", "carrinho", "-n", "carrinho", "-o", "json")
checar("o Service carrinho existe", rc == 0, "gym k8s start; ou recomece o ticket com [r]")
if rc == 0:
    svc = json.loads(saida)
    checar("o selector do Service casa com os pods (app: carrinho)", svc["spec"].get("selector") == {"app": "carrinho"},
           "compare o selector com: gym kubectl get pods -n carrinho --show-labels")
    alvo = svc["spec"]["ports"][0].get("targetPort")
    checar(f"o targetPort é a porta do app (8080), não {alvo}", str(alvo) == "8080",
           "o app diz no log em que porta escuta")
    rc, saida = k8s("get", "endpoints", "carrinho", "-n", "carrinho", "-o", "json")
    enderecos = sum(len(s.get("addresses", [])) for s in json.loads(saida).get("subsets", [])) if rc == 0 else 0
    checar(f"o Service tem os 2 pods como destino ({enderecos} endpoints)", enderecos == 2,
           "Endpoints: <none> no describe = selector que não casa com nenhum pod pronto")
    ip = svc["spec"].get("clusterIP")
    rc, resposta = docker("exec", "gym-k3s", "wget", "-qO-", "-T", "5", f"http://{ip}:80/")
    checar("o Service responde de verdade (pelo ClusterIP, porta 80)", rc == 0 and '"carrinho"' in resposta,
           "teste de dentro do cluster: gym kubectl run -n carrinho t --rm -i --restart=Never --image=alpine:3.24 -- wget -qO- http://carrinho")

texto = (oficina / "k8s" / "carrinho.yaml").read_text(encoding="utf-8")
checar("o conserto está no arquivo", "app: carinho" not in texto and "targetPort: 8080" in texto,
       "corrija k8s/carrinho.yaml e reaplique")
relatorio = oficina / "relatorio.txt"
rel = relatorio.read_text(encoding="utf-8") if relatorio.exists() else ""
checar("relatorio.txt tem o sinal do problema (endpoints vazios)", "<none>" in rel or "endpoints" in rel.lower(),
       "gym kubectl describe service carrinho -n carrinho >> relatorio.txt")
checar("relatorio.txt tem a resposta final do carrinho", '"carrinho"' in rel, "acrescente a saída do wget que funcionou")
