# Pod em CrashLoopBackOff: uma solução possível

Na pasta da oficina. `gym kubectl` é o `kubectl` do cluster local; se criou o apelido,
escreva só `kubectl`.

## 1. O que está rodando

```
gym kubectl get pods -n vitrine
```

A vitrine aparece com `ErrImagePull` e depois `ImagePullBackOff`; o catálogo, com
`Error` e depois `CrashLoopBackOff`, e o número de RESTARTS subindo.

## 2. Os motivos

```
gym kubectl describe pod -n vitrine -l app=vitrine
```

Nos eventos do fim: `Failed to pull image "nginx:1.30-alpina" ... not found`. A tag
tem um erro de digitação: o certo é `nginx:1.30-alpine`.

```
gym kubectl logs -n vitrine deploy/catalogo --previous
```

`FATAL catalogo: BANCO_URL não definida`. O container sobe, não acha a variável e sai com
código 1. O Kubernetes reinicia, ele morre de novo, e o intervalo entre as tentativas
cresce: é o *back-off*. Sem `--previous`, você às vezes pega o container novo, que ainda
não disse nada.

`relatorio.txt`:

```
gym kubectl get pods -n vitrine > relatorio.txt
echo "vitrine: ImagePullBackOff, tag nginx:1.30-alpina não existe" >> relatorio.txt
echo "catalogo: CrashLoopBackOff, o log diz FATAL BANCO_URL não definida" >> relatorio.txt
```

## 3. e 4. Consertar nos arquivos e aplicar

Em `k8s/vitrine.yaml`, troque a imagem para `nginx:1.30-alpine`. Em
`k8s/catalogo.yaml`, no container, acrescente:

```yaml
          env:
            - name: BANCO_URL
              value: postgres://catalogo@banco:5432/catalogo
```

```
gym kubectl apply -f k8s/
gym kubectl rollout status deployment/vitrine -n vitrine
gym kubectl rollout status deployment/catalogo -n vitrine
gym kubectl get pods -n vitrine
```

Em produção, uma URL com senha iria num **Secret**, não no Deployment (é o próximo ticket).
