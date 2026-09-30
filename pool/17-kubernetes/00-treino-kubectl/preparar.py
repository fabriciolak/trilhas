# Treino de kubectl: liga o k3s e começa sem o namespace do treino.
if k3s_ligar():
    k8s("delete", "namespace", "treino", "--ignore-not-found", "--wait=true", "--timeout=120s")
