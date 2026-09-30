# Treino do terminal: uma solução possível.
cd ~/treinos/terminal
pwd > onde.txt
mkdir -p projeto/src projeto/docs projeto/testes
touch projeto/README.md
cp bagunca/relatorio-final.txt projeto/docs/
cp -r bagunca/fotos projeto/
mv bagunca/rascunho-velho.txt bagunca/rascunho.txt
ls -la bagunca
cp bagunca/.escondido projeto/segredo.txt
rm -r bagunca/fotos
ls -lhS bagunca > tamanhos.txt
# "history" só existe no shell interativo; num script, o arquivo de histórico faz o papel.
HISTFILE=~/.bash_history; set -o history; history -r 2>/dev/null
for c in pwd "ls -la" "cd ~" "mkdir -p x" "cp a b" "mv a b"; do history -s "$c"; done
history 30 > historico.txt
cat onde.txt tamanhos.txt
