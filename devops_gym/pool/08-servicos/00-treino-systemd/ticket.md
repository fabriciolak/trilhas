---
mes: 3
semana: 9
palco: lab
tipo: treino
nivel: 1
conceitos: systemd, unit, systemctl, enable, daemon-reload, Environment, Restart, journalctl
---
# Treino: serviços com o systemd

## AULA
**O systemd** é o primeiro processo do sistema (PID 1). Ele liga, desliga, vigia e
religa os serviços, e guarda os logs deles (o *journal*). Cada coisa que ele cuida é uma
**unit**: `nginx.service`, `cron.service`, `ssh.socket`...

    systemctl status nginx          # estado, PID, últimas linhas de log
    sudo systemctl start nginx      # liga agora          (stop, restart)
    sudo systemctl reload nginx     # relê a configuração sem derrubar (se o serviço souber)
    sudo systemctl enable nginx     # liga no boot        (disable; enable --now faz os dois)
    systemctl is-active nginx       # active / inactive / failed
    systemctl --failed              # o que quebrou

**Escrever uma unit.** Arquivos seus ficam em `/etc/systemd/system/` (os que vêm dos
pacotes ficam em `/usr/lib/systemd/system/`: não mexa neles).

    [Unit]
    Description=Minha API
    After=network.target

    [Service]
    User=nobody                              # nunca root sem motivo
    Environment=PORTA=8080                   # ou EnvironmentFile=/etc/minha-api.env
    ExecStart=/usr/bin/python3 /opt/api/api.py
    Restart=on-failure                       # religa se morrer com erro

    [Install]
    WantedBy=multi-user.target               # o que o enable usa

Depois de criar ou mudar um arquivo de unit: `sudo systemctl daemon-reload`. Para mudar
só um pedaço sem tocar no original: `sudo systemctl edit nome` (cria um *drop-in* em
`/etc/systemd/system/nome.service.d/`).

**Logs.**

    journalctl -u nginx             # tudo do serviço
    journalctl -u nginx -n 50       # as últimas 50 linhas
    journalctl -u nginx -f          # ao vivo (Ctrl+C sai)
    journalctl -u nginx --since "10 min ago"
    journalctl -p err -b            # só erros, desde o boot

Sem `sudo` (ou sem estar no grupo `adm`), o `journalctl` só mostra o log do seu próprio
usuário: para os serviços do sistema, use `sudo journalctl ...`.

## TICKET
Existe um programa pronto em `/opt/treino/saudacao.py` (um servidor HTTP na porta 8900),
mas ninguém cuida dele. Respostas em `~/treinos/systemd/`.

1. Crie a unit `saudacao.service` que roda `/usr/bin/python3 /opt/treino/saudacao.py`
   como o usuário `nobody`.
2. Ligue o serviço e confira que ele responde em `http://localhost:8900`.
3. Faça ele subir sozinho no boot.
4. A mensagem vem da variável `MENSAGEM`. Faça o serviço responder `Bom dia, plantão!`.
5. Faça o serviço voltar sozinho se o processo morrer (teste com `kill -9`).
6. Salve as últimas 20 linhas do log do serviço em `log.txt`.
7. Salve a lista de units que falharam no sistema em `falhas.txt`.

## COMANDOS
systemctl status/start/stop/restart/enable/daemon-reload/edit/--failed journalctl -u -n -f curl kill

## PERGUNTAS
1. Qual a diferença entre `start` e `enable`? E entre `restart` e `reload`?
2. Por que rodar o programa na mão com `&` não é o mesmo que ter um serviço?
3. Onde ficam as units que você escreve, e por que não se edita a que veio no pacote?

## ESTUDE
- `man systemctl`, `man systemd.service`, `man journalctl`
- Documentação do Ubuntu Server (serviços): https://documentation.ubuntu.com/server/
