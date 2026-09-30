# Invasão de madrugada: uma solução possível.

# 1. Linha do tempo: find entra em pastas escondidas; -printf escreve a data de
#    modificação (%T) e o caminho (%p). Datas no formato ano-mês-dia ordenam como texto.
find /srv/deploy/loja -type f -printf '%TY-%Tm-%Td %TH:%TM:%.2TS  %p\n' | sort > ~/linha-do-tempo.txt
cat ~/linha-do-tempo.txt

# 2. Só arquivos dentro da janela. -newermt compara com uma data escrita por extenso.
find /srv/deploy/loja -type f -newermt '2026-09-13 03:00' ! -newermt '2026-09-13 04:00' | sort > ~/plantados.txt
# Outra forma, com arquivos de referência fabricados em /tmp (não na pasta da perícia!):
touch -d '2026-09-13 03:00' /tmp/inicio; touch -d '2026-09-13 04:00' /tmp/fim
find /srv/deploy/loja -type f -newer /tmp/inicio ! -newer /tmp/fim
cat ~/plantados.txt

# 3. file olha o conteúdo, não o nome.
file /srv/deploy/loja/public/img/banner-promo.png >> ~/linha-do-tempo.txt
cat /srv/deploy/loja/public/img/banner-promo.png   # um "reverse shell" para 203.0.113.66

# 4. Treino de busca.
find /srv/deploy/loja -name '*.png'               # por nome (padrão do shell, entre aspas)
find /srv/deploy/loja -regex '.*/\.[^/]*'         # por expressão regular: nomes que começam com ponto
find /srv/deploy/loja -type d                     # só pastas
find /srv/deploy/loja -type f -size +1k           # arquivos com mais de 1 KB
