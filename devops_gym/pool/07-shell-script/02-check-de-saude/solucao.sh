# Check de saúde: uma solução possível.
mkdir -p ~/bin
cat > ~/bin/saude.sh <<'EOF'
#!/bin/bash
# saude.sh: disco, memória e carga, com código de saída para monitoramento.
# Uso: saude.sh [limite]   (limite do disco /, 0 a 100, padrão 90)
set -euo pipefail

uso() {
  echo "Uso: saude.sh [limite]   (limite do disco /, de 0 a 100; padrão 90)" >&2
  exit 2
}

disco() {       # uso de / em %, só o número
  df --output=pcent / | tail -n 1 | tr -dc '0-9'
}

memoria() {     # usada / total * 100, arredondado
  free | awk '/^Mem:/ { printf "%d", $3 / $2 * 100 + 0.5 }'
}

carga() {       # média do último minuto
  cut -d' ' -f1 /proc/loadavg
}

limite=${1:-90}
case "$limite" in
  ''|*[!0-9]*) uso ;;                # vazio ou com algo que não é dígito
esac
[ "$limite" -le 100 ] || uso

d=$(disco)
echo "disco: ${d}%"
echo "memoria: $(memoria)%"
echo "carga: $(carga)"

if [ "$d" -gt "$limite" ]; then
  echo "ALERTA: disco / em ${d}%, acima do limite de ${limite}%"
  exit 1
fi
exit 0
EOF
chmod +x ~/bin/saude.sh

# Testes: normal, alerta e argumento inválido, olhando o código de saída ($?).
~/bin/saude.sh;      echo "código: $?"
~/bin/saude.sh 0;    echo "código: $?"
~/bin/saude.sh abc;  echo "código: $?"
