# Service sem endpoints: liga o k3s e aplica os manifestos quebrados, do zero.
if k3s_ligar():
    k8s("delete", "namespace", "carrinho", "--ignore-not-found", "--wait=true", "--timeout=120s")
    for nome in ("00-namespace.yaml", "carrinho.yaml"):
        k8s("apply", "-f", "-", entrada=(oficina / "k8s" / nome).read_text(encoding="utf-8"))
