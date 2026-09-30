# syntax=docker/dockerfile:1
# Laboratório do DevOps Gym: um Ubuntu 24.04 descartável, com systemd de verdade,
# já "quebrado" pelos preparar.sh dos tickets. Quem constrói e liga é o gym.py:
#   docker build -t devops-gym/lab -f lab/Dockerfile .      (dentro de devops_gym/)
# BASE existe para trocar a imagem de origem (ex.: espelho interno de uma empresa).
ARG BASE=ubuntu:24.04
FROM ${BASE}

ENV DEBIAN_FRONTEND=noninteractive

# A imagem oficial vem "minimizada", sem manuais. Desfazemos isso para o `man` funcionar,
# inclusive em português (manpages-pt-br + locale pt_BR).
RUN rm -f /etc/dpkg/dpkg.cfg.d/excludes /etc/update-motd.d/60-unminimize \
 && apt-get update \
 && apt-get install -y --no-install-recommends \
      systemd systemd-sysv dbus sudo locales \
      man-db manpages manpages-pt-br less vim nano bash-completion \
      procps psmisc lsof file tree tmux \
      curl wget ca-certificates iproute2 iputils-ping dnsutils netcat-openbsd \
      openssh-server openssh-client nginx cron logrotate python3 ansible-core git \
 && if [ -e /usr/bin/man.REAL ]; then rm -f /usr/bin/man && dpkg-divert --quiet --local --rename --remove /usr/bin/man; fi \
 && apt-get install -y --reinstall --no-install-recommends \
      coreutils util-linux procps findutils grep sed gzip tar diffutils passwd login bash \
 && sed -i 's/^# *\(pt_BR.UTF-8\)/\1/' /etc/locale.gen && locale-gen \
 && sed -i '/listen \[::\]/d' /etc/nginx/sites-available/default \
 && rm -rf /var/lib/apt/lists/*

# O usuário do laboratório. Tem sudo sem senha: você é o administrador de plantão.
RUN (userdel -r ubuntu 2>/dev/null || true) \
 && useradd -m -s /bin/bash -c "Aluno do DevOps Gym" aluno \
 && echo 'aluno ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/aluno && chmod 440 /etc/sudoers.d/aluno \
 && printf 'LANG=C.UTF-8\n' > /etc/default/locale

COPY lab/sistema/ /

# Cada ticket do palco "lab" traz um preparar.sh (estado quebrado gravado na imagem) e,
# às vezes, um boot.sh (o que precisa acontecer a cada boot: montagens, processos vivos).
RUN --mount=type=bind,source=pool,target=/opt/gym/pool \
    --mount=type=bind,source=lab/preparar-tudo.sh,target=/opt/gym/preparar-tudo.sh \
    bash /opt/gym/preparar-tudo.sh /opt/gym/pool \
 && systemctl enable lab-inicio.service

STOPSIGNAL SIGRTMIN+3
CMD ["/sbin/init"]
