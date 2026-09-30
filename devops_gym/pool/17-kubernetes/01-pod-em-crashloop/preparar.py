# Pod em CrashLoopBackOff: liga o k3s e aplica os manifestos quebrados, do zero.
if k3s_ligar():
    k8s("delete", "namespace", "vitrine", "--ignore-not-found", "--wait=true", "--timeout=120s")
    for nome in ("00-namespace.yaml", "vitrine.yaml", "catalogo.yaml"):
        k8s("apply", "-f", "-", entrada=(oficina / "k8s" / nome).read_text(encoding="utf-8"))
