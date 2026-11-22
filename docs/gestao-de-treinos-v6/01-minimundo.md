# Minimundo — Gestão de Treinos para Personal Trainer

**Versão:** V6 — escopo simplificado para implementação

## 1. Contexto e problema

Um personal trainer que acompanha vários alunos precisa controlar cadastros, planos contratados, pagamentos e treinos. Quando essas informações ficam espalhadas em planilhas e mensagens, torna-se difícil acompanhar a situação de cada aluno e sua frequência de treinamento.

O sistema centraliza essas atividades em duas interfaces:

- **Portal web do personal:** gerenciamento dos alunos, contratos, cobranças e programas de treino, além de indicadores básicos.
- **Aplicativo mobile do aluno:** gerenciamento de treinos personalizados com funcionamento **offline-first**, consulta do programa predefinido, registro de sessões concluídas e simulação de pagamento de mensalidades.

## 2. Limites do sistema

O sistema atende **um único personal trainer**, previamente cadastrado. Não contempla múltiplos profissionais, unidades, funcionários, catracas, agendamentos, aulas on-line ou integração com serviços financeiros reais.

## 3. Descrição do domínio

### 3.1 Alunos e acesso

O aluno é cadastrado com nome, e-mail, peso, altura, nível de experiência (Iniciante, Intermediário ou Avançado) e frequência semanal desejada (3, 4, 5 ou 6 dias).

Nesta versão não há autenticação de aluno: o aplicativo mobile utiliza a API sem login. O personal utiliza o portal web, protegido por um login simulado, e pode consultar e administrar todos os alunos.

O cadastro do aluno possui um status que indica se ele está ativo. Para esta versão, o status pode ser atualizado quando um contrato é criado, cancelado ou encerrado.

### 3.2 Planos

Existem três opções fixas: mensal, trimestral e semestral. Elas serão representadas por um **enum no backend**, contendo o tipo, a duração em meses e o valor mensal.

Os planos não serão cadastrados ou editados pelo personal. Alterações nas opções ou nos preços exigirão alteração na definição do enum e uma nova versão do backend.

### 3.3 Contratos e cobranças

O contrato registra o aluno, o plano escolhido, as datas de início e término e seu status (ativo, encerrado ou cancelado). Um aluno não pode possuir mais de um contrato ativo ao mesmo tempo.

Na criação do contrato, o sistema gera uma cobrança para cada mês de vigência. Cada cobrança registra o contrato, o vencimento, o valor, o status e, quando aplicável, a data do pagamento.

O valor mensal da cobrança corresponde ao valor definido no plano contratado. O vencimento é baseado no dia de início do contrato.

O pagamento é fictício: o aplicativo apresenta uma opção de Pix simulado e o aluno confirma a operação. Não há geração de cobrança bancária, comunicação com instituições financeiras ou movimentação real de dinheiro.

O sistema identifica cobranças vencidas e não pagas como atrasadas. O atraso não bloqueia o acesso ao aplicativo nem aos treinos. O aluno pode consultar suas cobranças e o personal pode acompanhar os pagamentos.

### 3.4 Programas de treino

O sistema disponibiliza doze programas predefinidos, correspondentes às combinações de três níveis de experiência e quatro frequências semanais.

Cada programa possui dias de treino ordenados. Cada dia contém seus itens de treino, com nome do exercício, musculatura trabalhada, séries, repetições e ordem de execução.

Não haverá cadastro global de exercícios. Os dados de cada exercício serão registrados diretamente como itens do dia de treino. Isso permite que o mesmo exercício tenha configurações diferentes em dias ou programas distintos, sem exigir uma entidade independente para o catálogo de exercícios.

Os programas e seus conteúdos serão carregados como dados iniciais do sistema. O personal poderá atribuir um dos programas disponíveis ao aluno, mas a criação e edição de programas e exercícios ficam fora do escopo inicial.

### 3.5 Programa atual e execução dos treinos

Cada aluno possui um único programa de treino atual. Ao concluir o cadastro, o sistema seleciona o programa correspondente ao nível e à frequência informados.

O personal pode substituir o programa atual por outro dos programas predefinidos. A substituição não mantém histórico de atribuições anteriores nesta versão.

O aplicativo apresenta os dias do programa em sequência. Ao concluir uma sessão, o aluno registra sua conclusão. O sistema utiliza esses registros para determinar o próximo dia da sequência e calcular a assiduidade.

Cada sessão registra o aluno, o programa e o dia de treino realizados, além da data e hora da conclusão. O registro do programa na sessão preserva a referência correta mesmo que o aluno receba outro programa posteriormente.

### 3.6 Acompanhamento pelo personal

O portal web apresenta uma listagem de alunos e indicadores básicos:

- quantidade de alunos ativos e inativos;
- distribuição de alunos por nível de experiência e frequência semanal;
- sessões concluídas por aluno na semana, comparadas à frequência desejada;
- cobranças pagas, pendentes e atrasadas;
- valores recebidos e previstos no período.

A evolução histórica do peso não faz parte desta versão. O sistema mantém apenas o peso atual informado no cadastro ou atualizado pelo aluno.

### 3.7 Rotina de treinos mobile e arquitetura offline-first

Para garantir usabilidade ininterrupta mesmo em ambientes com oscilação ou ausência total de conexão à internet, o aplicativo implementa uma arquitetura **offline-first** para a gestão da rotina de treinos do aluno.

O aluno pode cadastrar, consultar, filtrar, editar e excluir treinos semanais, informando nome, categoria (como Musculação, Cardio ou Funcional), dia da semana e duração estimada em minutos. Cada treino pode ser associado opcionalmente ao aluno autenticado.

Todas as mutações (criação, edição e exclusão) são persistidas imediatamente no armazenamento local do dispositivo (`AsyncStorage`) com latência zero (0ms), garantindo resposta instantânea na interface. Cada treino recebe um identificador único universal (UUID v4) gerado no próprio dispositivo móvel, eliminando a dependência de sequências de banco de dados e prevenindo colisões de chaves primárias.

Em segundo plano, as mutações alimentam uma fila de requisições persistida localmente (Outbox Pattern). Assim que uma conexão ativa com a internet e com a API Spring Boot é estabelecida, o aplicativo processa a fila e envia as alterações pendentes em lote (`POST /treinos/sincronizar`). O backend executa o processamento de forma idempotente: insere novos treinos, atualiza os modificados e aplica exclusão lógica (`ativo = false`) aos removidos.

O aplicativo fornece feedback em tempo real sobre a sincronização com um selo interativo no cabeçalho (Nuvem sincronizada, Sincronizando ou Offline com contador de pendências). A interface também disponibiliza suporte a tema claro e escuro persistido, painel de estatísticas com gráfico semanal de volume, exportação e compartilhamento de ficha de treinos (texto e JSON) e lembretes diários com notificações locais.

## 4. Documentos complementares

- Consulte [Modelo de dados](02-modelo-de-dados.md) para entidades e relacionamentos.
- Consulte [Regras de negócio](03-regras-de-negocio.md) para as restrições funcionais.
- Consulte [Escopo e backlog](04-escopo-e-backlog.md) para prioridades e organização das entregas.
