---
mes: 3
semana: 12
palco: lab
tipo: treino
nivel: 1
conceitos: ssh, chaves ed25519, authorized_keys, permissões do .ssh, ~/.ssh/config, scp, fingerprint
---
# Treino: SSH com chaves

## AULA
**SSH** abre um terminal (ou copia arquivos) numa máquina remota por um canal
criptografado. O servidor (`sshd`) escuta na porta 22.

**Chaves no lugar de senha.** Você gera um **par**: a chave privada fica com você (nunca
sai da sua máquina) e a pública vai para o servidor, dentro de
`~/.ssh/authorized_keys` do usuário remoto.

    ssh-keygen -t ed25519 -f ~/.ssh/minha_chave -C "eu@notebook"   # -N '' = sem senha (só para treino)
    ssh-copy-id -i ~/.ssh/minha_chave.pub usuario@servidor          # ou acrescente o .pub à mão:
    cat ~/.ssh/minha_chave.pub >> ~/.ssh/authorized_keys            # (no servidor)
    ssh -i ~/.ssh/minha_chave usuario@servidor

**O servidor é exigente com permissões** (e isso derruba muita gente): a pasta pessoal não
pode ser gravável por outros, `~/.ssh` precisa ser `700` e o `authorized_keys`, `600`, do
próprio usuário. Se não for assim, a chave é recusada em silêncio: o motivo aparece em
`ssh -v` (do lado do cliente) e no log do servidor (`journalctl -u ssh`).

**Atalhos no `~/.ssh/config`:**

    Host treino
        HostName localhost
        User aluno
        IdentityFile ~/.ssh/minha_chave
        IdentitiesOnly yes

Depois disso, `ssh treino` basta, e o `scp` e o `rsync` também entendem o apelido.

    ssh treino 'df -h /'                     # roda um comando e volta
    scp arquivo.txt treino:/tmp/             # copia para lá
    scp treino:/etc/hostname .               # copia de lá

**Na primeira conexão**, o SSH mostra a *fingerprint* da chave do servidor e pergunta se
você confia. Ela fica em `~/.ssh/known_hosts`. Se um dia ela mudar sem motivo, desconfie:
pode ser um ataque. Para conferir no servidor: `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`.

## TICKET
Neste laboratório, você vai entrar nele mesmo (`localhost`) com uma chave nova. Respostas
em `~/treinos/ssh/`. Não mexa na chave `~/.ssh/id_ed25519`, que outro ticket usa.

1. Gere um par de chaves ed25519 em `~/.ssh/treino_ed25519` (sem senha, para o treino).
2. Autorize essa chave para o seu usuário (`aluno`) com as permissões que o SSH exige.
3. Entre com ela em `aluno@localhost` e, do outro lado, salve o valor da variável
   `SSH_CONNECTION` em `~/treinos/ssh/conexao.txt` (ela só existe numa sessão SSH).
4. Crie o apelido `treino` no `~/.ssh/config`, para `ssh treino` entrar com essa chave.
5. Copie `~/treinos/ssh/relatorio.txt` para `/tmp/relatorio-copiado.txt` usando o `scp`
   pelo apelido.
6. Salve a fingerprint da chave ed25519 do servidor em `fingerprint.txt`.

## COMANDOS
ssh-keygen ssh ssh -v scp cat chmod ~/.ssh/config journalctl -u ssh

## PERGUNTAS
1. Por que a chave privada nunca sai da sua máquina? O que o servidor guarda?
2. O SSH recusa a chave se o `authorized_keys` estiver aberto para outros. Por que isso é uma proteção?
3. O que a mensagem "REMOTE HOST IDENTIFICATION HAS CHANGED" quer dizer, e o que você faz antes de apagar a linha do `known_hosts`?

## ESTUDE
- Documentação do Ubuntu Server, OpenSSH: https://documentation.ubuntu.com/server/
- `man ssh`, `man ssh_config`, `man sshd_config`
