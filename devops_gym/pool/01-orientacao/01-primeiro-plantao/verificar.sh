f=$CASA/fatos.txt

checar "~/fatos.txt existe e não está vazio" "crie com redirecionamento: comando > arquivo, comando >> arquivo" test -s "$f"
checar "o arquivo é seu, não do root" "se você escreveu com sudo, o dono ficou errado (veja: ls -l ~/fatos.txt)" \
  test "$(stat -c %U "$f" 2>/dev/null)" = aluno
checar "mostra quem é você" "whoami, id" contem "$f" "aluno"
checar "mostra o nome do servidor" "hostname" contem "$f" "devops-lab"
checar "mostra a distribuição de verdade" "o bilhete diz Debian. O que diz /etc/os-release?" contem "$f" "24.04"
checar "mostra a versão do kernel" "uname -r ou uname -a" contem "$f" "$(uname -r)"
checar "mostra quantos processadores existem" "nproc ou lscpu" grep -qw "$(nproc)" "$f"
checar "mostra a memória" "free -h" grep -qiE "^ *mem" "$f"
checar "mostra onde ficam os programas" "command -v whoami" grep -q "/usr/bin/" "$f"
checar "inclui o histórico de logins (alguém entrou de fora)" "last" contem "$f" "198.51.100.77"
checar "separou o comando que baixa um script e roda como root" \
  "o histórico do Beto é dele e só ele lê (ls -l). Quem pode ler qualquer arquivo?" contem "$f" "otimizador.sh"
checar "achou o rastro no sistema" "que conta foi criada? com qual UID? procure em /etc/passwd" contem "$f" "suporte2"
checar "fechou com uma linha VEREDITO:" "echo 'VEREDITO: ...' >> ~/fatos.txt" grep -q "^VEREDITO:" "$f"
checar "a evidência continua lá (a conta suporte2 não foi apagada)" \
  "numa investigação, a perícia vem antes da limpeza" id suporte2
