# Primeiro plantão: uma solução possível. Tudo vai para ~/fatos.txt com > (cria) e >>
# (acrescenta). Agrupar comandos com { ...; } redireciona tudo de uma vez.

{
  echo "== quem sou eu";            whoami; id
  echo "== quem está logado";       who; w
  echo "== servidor";               hostname
  echo "== pasta atual";            pwd
  echo "== data";                   date
  echo "== distribuição";           cat /etc/os-release       # o bilhete dizia Debian 11
  echo "== kernel";                 uname -a
  echo "== shell";                  getent passwd "$(whoami)"  # último campo: o shell de login
  command -v zsh || echo "zsh não está instalado"             # "todo mundo usa zsh"?
  echo "== ligado há";              uptime
  echo "== memória";                free -h                    # 64 GB?
  echo "== processadores";          nproc; lscpu | grep -E '^CPU\(s\)'
  echo "== onde ficam os programas"; command -v whoami id who hostname uname free nproc lscpu last
  echo "== ambiente herdado";       env | sort
} > ~/fatos.txt 2>&1

# O histórico de logins: o Beto entrou de 198.51.100.77, um IP de fora.
{ echo "== histórico de logins"; last; } >> ~/fatos.txt

# O histórico do Beto é dele e tem modo 600 (ls -l /home/beto/.bash_history):
# só o dono lê. O root lê qualquer arquivo, então usamos sudo só para LER.
# O >> fica fora do sudo, então quem escreve em ~/fatos.txt continua sendo você.
{ echo "== histórico do beto: linhas suspeitas"; sudo grep -nE 'curl|useradd|history -c' /home/beto/.bash_history; } >> ~/fatos.txt

# O rastro: toda conta com UID 0 (terceiro campo de /etc/passwd) é um root.
{ echo "== contas com UID 0"; awk -F: '$3 == 0 {print $1, $3, $7}' /etc/passwd; } >> ~/fatos.txt

echo "VEREDITO: escalar para segurança. O Beto rodou como root um script baixado de um IP desconhecido (curl | sudo bash), criou a conta suporte2 com UID 0 (um segundo root) e apagou o próprio histórico da sessão (history -c)." >> ~/fatos.txt

cat ~/fatos.txt
