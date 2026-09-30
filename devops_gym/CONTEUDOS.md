# Conteúdos em português

Curadoria para o [roadmap de 6 meses](ROADMAP.md). As aulas dos treinos do gym (tecla `a`) são o ponto de partida de cada semana; os conteúdos abaixo aprofundam. Tudo é **gratuito**, salvo quando
indicado. Conferido em **setembro de 2026**. Quando o material é antigo, a data aparece
ao lado, com o que ainda vale e o que mudou.

Legenda: 📖 texto · 🎬 vídeo · 🧪 prática · 🌎 em inglês (quando não há equivalente em
português à altura)

> Vídeos somem e mudam de endereço. Se um link quebrar, procure o título no canal. Se
> achar algo melhor, troque aqui: este arquivo é seu.

## Por onde começar (se for escolher só três)

1. 📖 **LPI Linux Essentials**, material oficial em português. A espinha dorsal dos
   meses 1 a 3. <https://learning.lpi.org/pt/learning-materials/010-160/>
2. 🧪 **GIRUS** (LINUXtips): laboratórios interativos em português, com validação
   automática, rodando no seu Docker. Complementa o gym nos meses 1 a 6.
   <https://github.com/badtuxx/girus-cli>
3. 📖🎬 **Descomplicando o Docker** e **Descomplicando o Kubernetes** (LINUXtips):
   livros abertos no GitHub, mais treinamento em vídeo.

---

## Linux

| | Conteúdo | Por que | Estado |
|---|---|---|---|
| 📖 | [LPI Linux Essentials (010-160) em português](https://learning.lpi.org/pt/learning-materials/010-160/) | Material oficial da certificação, com lições e exercícios respondidos. Tópicos 1 a 5 cobrem os meses 1 a 3 do gym. | Oficial, mantido pelo LPI |
| 📖 | Manuais do sistema em português, dentro do lab: `LANG=pt_BR.UTF-8 man ls` | O pacote `manpages-pt-br` já vem instalado no laboratório. O que não tiver tradução abre em inglês. | Sempre à mão |
| 📖 | [tldr pages](https://tldr.sh/): exemplos curtos de cada comando, com tradução pt_BR | "Como uso o tar mesmo?" em 5 linhas. `tldr tar` depois de instalar o cliente. | Comunitário, ativo |
| 📖 | [Documentação do Ubuntu Server](https://documentation.ubuntu.com/server/) 🌎 | Referência de verdade para pacotes, serviços, rede e SSH no Ubuntu (o laboratório é Ubuntu 24.04). | Oficial |
| 🎬 | [LINUXtips (canal do Jeferson Fernando)](https://www.youtube.com/channel/UCJnKVGmXRXrH49Tvrx5X0Sw) | O maior canal brasileiro de Linux, containers e DevOps; lives gratuitas frequentes. | Ativo |
| 🧪 | GIRUS, labs `linux_comandos-basicos`, `linux_permissoes-arquivos`, `linux_gerenciamento-usuarios`, `linux_gerenciamento-processos`, `linux_processamento-texto`, `linux_redes-conectividade`, `linux_automacao-agendamento`, `linux_shell-script`, `linux_monitoramento-sistema`, `linux_seguranca-criptografia` | Os mesmos temas do gym, em formato guiado passo a passo. Bom para quando um ticket parecer difícil demais. | v0.5 (mai/2025); instalação: `curl -sSL girus.linuxtips.io \| bash` |
| 🧪 | [roadmap.sh/linux](https://roadmap.sh/linux) 🌎 | Mapa interativo para conferir se ficou algum buraco. | Ativo |

## Shell script

| | Conteúdo | Por que | Estado |
|---|---|---|---|
| 🎬📖 | [Blau Araujo: Curso Shell GNU/Linux](https://debxp.org/curso-shell-gnu-linux-ao-vivo/) (aulas gravadas + wiki) | O melhor conteúdo em português sobre como o shell realmente funciona (expansões, redirecionamento, processos). Para iniciantes, ele recomenda começar pelo *Curso Básico de Programação em Bash*. | Ativo; material também no [Codeberg](https://codeberg.org/blau_araujo/csgl) |
| 📖 | [Aurélio Jargas: guia de expressões regulares](https://aurelio.net/regex/guia/) | Clássico brasileiro de regex, curto e direto. Serve para grep, sed, awk e qualquer linguagem. | Antigo, mas regex não mudou |
| 📖 | Julio Neves: *Papo de Botequim* (busque pelo título) | Clássico gratuito do shell em forma de conversa de bar. | Antigo; complementar |
| 🧪 | [ShellCheck](https://www.shellcheck.net/) 🌎 | Aponta erros e armadilhas em scripts. Você vai colocar no CI no mês 2. | Ferramenta ativa |

## Git e GitHub

| | Conteúdo | Por que | Estado |
|---|---|---|---|
| 📖 | [Pro Git em português](https://git-scm.com/book/pt-br/v2) | O livro oficial do Git, traduzido e gratuito. Capítulos 1 a 3 no mês 1. | 2ª edição, mantido |
| 🎬 | [Teo Me Why: Git e GitHub para iniciantes 2025](https://github.com/TeoMeWhy/curso-git-github-2025) (links para as aulas no repositório) | Curso recente, do zero, com VS Code e fluxo de contribuição. | 2025 |
| 🎬 | [Curso em Vídeo: Git e GitHub](https://www.cursoemvideo.com/curso/curso-de-git-e-github/) (Gustavo Guanabara) | Muito didático para quem nunca usou controle de versão. | Mais antigo; conceitos valem |
| 📖 | [Documentação do GitHub em português](https://docs.github.com/pt) | Tutoriais oficiais traduzidos, inclusive de GitHub Actions. | Oficial |

## Redes

| | Conteúdo | Por que | Estado |
|---|---|---|---|
| 🎬📖 | Fabio Akita (Akitando), série *Introdução a Redes*: [#121](https://akitaonrails.com/2022/07/01/akitando-121-entendendo-transferencia-de-sinais-digitais-introducao-a-redes-parte-1/), [#123](https://akitaonrails.com/2022/07/23/akitando-123-como-sua-internet-funciona-introducao-a-redes-parte-3/), [#124](https://akitaonrails.com/2022/08/04/akitando-124-como-funciona-sockets-cliente-servidor-e-a-web-introducao-a-redes-parte-4/) | Explica de verdade como IP, DNS, portas, sockets e HTTP funcionam, com transcrição em texto. | 2022; fundamentos não mudam |
| 📖 | [MDN: HTTP em português](https://developer.mozilla.org/pt-BR/docs/Web/HTTP) | Referência de HTTP: métodos, status, cabeçalhos. | Oficial, mantido |
| 📖 | LPI Linux Essentials, tópico 4.4 ("Seu computador na rede") | IP, DNS e portas do ponto de vista de quem administra Linux. | Oficial |

## Containers: Docker e Compose

| | Conteúdo | Por que | Estado |
|---|---|---|---|
| 📖 | [Descomplicando o Docker (livro)](https://livro.descomplicandodocker.com.br/) · [GitHub](https://github.com/badtuxx/DescomplicandoDocker) | Livro completo e gratuito, do básico ao avançado. | Atualizado até 2023. Onde aparecer `docker-compose` (com hífen), use `docker compose` |
| 🎬 | LINUXtips: treinamento *Descomplicando o Docker*, liberado de graça no canal ([anúncio](https://www.youtube.com/watch?v=Wm99C_f7Kxw)) | O curso em vídeo que acompanha o livro. | Gravado por volta de 2021; conceitos valem |
| 📖 | [Full Cycle: artigos de Docker](https://fullcycle.com.br/categoria/docker/) | Visão de quem desenvolve: Docker no dia a dia de times. | Ativo |
| 🧪 | GIRUS, labs `docker_fundamentos`, `docker_gerenciamento-containers`, `docker_volumes`, `docker_volumes-persistencia`, `docker_fundamentos-redes`, `docker_redes-avancadas`, `docker_multi-stage-builds`, `docker_compose` | Prática guiada dos mesmos temas dos tickets do mês 4. | v0.5 (mai/2025) |
| 📖 | [Documentação oficial do Docker](https://docs.docker.com/get-started/) 🌎 | A referência mais atual (Compose, BuildKit, Docker Desktop). | Oficial |
| 📖 | [The Twelve-Factor App em português](https://12factor.net/pt_br/) | Os 12 princípios de aplicações que rodam bem em containers e na nuvem. | Clássico |

## CI/CD

| | Conteúdo | Por que | Estado |
|---|---|---|---|
| 📖 | [Descomplicando GitHub Actions](https://github.com/badtuxx/DescomplicandoGithubActions) (LINUXtips) | Do primeiro workflow a matrizes, cache, segredos e actions próprias. | 2024 |
| 📖 | [GitHub Actions na documentação em português](https://docs.github.com/pt/actions) | Início rápido oficial e referência de sintaxe. | Oficial |
| 🎬📖 | [Microsoft Learn: Introdução ao GitHub Actions](https://learn.microsoft.com/pt-br/training/modules/introduction-to-github-actions/) | Módulo curto e gratuito, com exercícios. | Oficial |

## Automação e Infraestrutura como Código

| | Conteúdo | Por que | Estado |
|---|---|---|---|
| 📖 | [Descomplicando o Ansible (LINUXtips)](https://github.com/badtuxx/descomplicando-ansible-2020) | Material do treinamento de Ansible, em português. | 2020–2022; a sintaxe `ansible.builtin.*` é a atual |
| 📖 | [Ansible: Getting started](https://docs.ansible.com/ansible/latest/getting_started/index.html) 🌎 | A documentação oficial é o melhor lugar para módulos (`ansible-doc` no terminal). | Oficial |
| 🎬 | [Google Cloud: Getting Started with Terraform (versão em português)](https://www.coursera.org/learn/getting-started-with-terraform-for-google-cloud---portugus) | Curso introdutório de Terraform em português, cerca de 6 h. No Coursera, em geral dá para assistir de graça no modo ouvinte (a opção aparece na inscrição). | Oficial Google Cloud |
| 🧪 | GIRUS, labs `terraform_fundamentos`, `terraform_estado-remoto`, `terraform_modulos`, `terraform_aws_infraestrutura` e `aws_localstack_terraform` | Terraform na prática. Os labs de AWS usam o LocalStack: veja o aviso na seção de nuvem. | v0.5 (mai/2025) |
| 📖 | [OpenTofu](https://opentofu.org/docs/) 🌎 | Alternativa aberta e compatível com o Terraform. Os comandos são os mesmos (`tofu` em vez de `terraform`). | Ativo |

## Nuvem

| | Conteúdo | Por que | Estado |
|---|---|---|---|
| 🎬 | [AWS Cloud Practitioner Essentials](https://aws.amazon.com/pt/training/course-descriptions/cloud-practitioner-essentials/) (AWS Skill Builder) | Curso oficial, totalmente em português com instrutores brasileiros, cerca de 6 h. Prepara para a certificação de entrada da AWS. | Oficial |
| 🧪 | `gym aws` (no próprio gym) com o [Moto](https://github.com/getmoto/moto) 🌎 | A AWS CLI de verdade contra uma conta **simulada** no seu Docker (S3, IAM, EC2...). Sem cadastro, sem custo. É o que os itens `treino-aws` e `bucket-exposto` usam. | Moto 5.x, Apache 2.0 |
| 🧪 | GIRUS, labs `aws_s3-iam`, `aws_ec2-vpc`, `aws_lambda_serverless`, `aws_dynamodb_nosql`, `aws_rds-elasticache` | Serviços da AWS simulados localmente com o LocalStack. | v0.5 (mai/2025); **veja o aviso abaixo** |

> **LocalStack mudou em 2026:** a edição Community (a imagem gratuita, sem conta) foi
> encerrada em 23/03/2026. A imagem atual exige conta e token, e o plano gratuito
> (Hobby) é só para uso pessoal e não comercial. Os labs de AWS do GIRUS dependem dele:
> confira se ainda funcionam do seu lado antes de contar com eles. No gym, a AWS
> simulada é o Moto, que continua aberto e sem cadastro.
>
> **Cuidado com custo na nuvem de verdade:** crie alertas de orçamento no primeiro dia,
> use só recursos do nível gratuito e apague tudo ao terminar. Enquanto estiver
> aprendendo, prefira a conta simulada (`gym aws`).

## Kubernetes

| | Conteúdo | Por que | Estado |
|---|---|---|---|
| 📖🎬 | [Descomplicando o Kubernetes](https://github.com/badtuxx/DescomplicandoKubernetes) (LINUXtips) | Dezesseis "dias" do básico ao avançado: Pods, Deployments, Services, Ingress, volumes, RBAC, HPA, Helm. Em português, gratuito. | Atualizado até 2024; confira versões de ferramentas |
| 📖 | [Documentação do Kubernetes em português](https://kubernetes.io/pt-br/docs/) | Conceitos e tutoriais oficiais traduzidos pela comunidade. | Oficial |
| 🧪 | GIRUS, labs `kubernetes_fundamentos`, `kubernetes_deployments`, `kubernetes_services-networking`, `kubernetes_configmaps-secrets`, `kubernetes_cronjobs`, `kubernetes_exploracao-recursos` | Kubernetes de verdade (kind) com tarefas validadas. | v0.5 (mai/2025) |
| 📖 | [k3s](https://docs.k3s.io/) 🌎 | O Kubernetes leve que o `gym k8s start` sobe no seu Docker (mês 6). É um Kubernetes certificado: o que você aprende nele vale para qualquer cluster. | Oficial (CNCF) |
| 📖 | [kind](https://kind.sigs.k8s.io/) 🌎 | Outra forma de rodar Kubernetes no Docker, com vários nós. Boa para o projeto final. | Oficial |

## Observabilidade

| | Conteúdo | Por que | Estado |
|---|---|---|---|
| 📖 | [Descomplicando o Prometheus](https://github.com/badtuxx/DescomplicandoPrometheus) · [livro online](https://livro.descomplicandoprometheus.com.br/) | Prometheus, PromQL, exporters, Grafana, Alertmanager e kube-prometheus, em português. | 2024 |

## Cultura DevOps e carreira

| | Conteúdo | Por que | Estado |
|---|---|---|---|
| 📖 | [AWS: O que é DevOps?](https://aws.amazon.com/pt/devops/what-is-devops/) | Uma página para entender a ideia (cultura + automação + medição) antes das ferramentas. | Oficial |
| 📖 | [roadmap.sh/devops](https://roadmap.sh/devops) 🌎 | O mapa mais usado da área. Use para se localizar, não como lista de obrigações. | Ativo |
| 📖 | [Google SRE books](https://sre.google/books/) 🌎 | *Site Reliability Engineering* completo e gratuito. Leia os capítulos de SLO, monitoramento e postmortem no mês 6. | Clássico |
| 📚 | *O Projeto Fênix* e *Manual de DevOps* (pagos, com edição em português) | Romance e manual que explicam por que DevOps existe. Opcionais. | Clássicos |

## Certificações (opcionais)

Nenhuma é pré-requisito para o gym. Se quiser um marco oficial:

- **LPI Linux Essentials**: ao fim do mês 3. Material oficial em português (acima).
- **AWS Certified Cloud Practitioner**: no mês 5. O curso preparatório oficial é em português.
- **KCNA** (Kubernetes e Cloud Native Associate, CNCF) 🌎: depois do mês 6.
