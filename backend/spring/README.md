# API Spring Boot

API REST do sistema de gestão de academia, desenvolvida com Spring Boot e Java 17. O código da aplicação fica em `src/`, e o projeto inclui o Maven Wrapper (`mvnw`) para executar tarefas Maven.

## Pré-requisitos

- [mise](https://mise.jdx.dev/) para instalar e selecionar o Java 17 configurado no monorepo;
- PostgreSQL instalado e em execução na máquina.

Na raiz do repositório, instale os runtimes do projeto:

```bash
mise install
```

## Configuração local

O backend utiliza uma instância local do PostgreSQL. Crie o banco de dados `gestao_academia` e configure um usuário com permissão de acesso. Ajuste os valores de conexão conforme sua instalação.

Crie `backend/spring/.env` a partir do exemplo:

```bash
cp backend/spring/.env.example backend/spring/.env
```

O exemplo define as variáveis `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` e `SPRING_DATASOURCE_PASSWORD`, usadas por `src/main/resources/application.properties`. Atualize os valores para corresponder ao PostgreSQL local. O arquivo `.env` é local e está ignorado pelo Git.

Configure também `GOOGLE_CLIENT_IDS` com os client IDs usados pelos clientes Google, separados por vírgula, e `ACADEMIA_PERSONAL_EMAIL` com o e-mail Google previamente autorizado para o personal. A API exige um ID token Google válido no cabeçalho `Authorization: Bearer <token>`. Sem audience configurada, todos os tokens são rejeitados. Não há cadastro público de personal.

## Migração do banco

O Flyway cria o esquema V6 em bancos vazios. Em um banco existente sem histórico Flyway, a configuração o registra como esquema legado V5 e executa a migração V2. Ela converte programa atual, contratos, parcelas, dias e exercícios para o modelo V6. Os dados e as tabelas descontinuadas são preservados com os nomes `legacy_v5_*`, e campos antigos de aluno e contrato permanecem como colunas `legacy_*` ou colunas sem mapeamento. O Hibernate valida o esquema; não atualiza tabelas automaticamente.

A migração interrompe e reverte a transação se encontrar contrato associado aos planos `DIARIO` ou `ANUAL`, que não têm equivalente na V6. Faça backup e defina um mapeamento explícito para esses contratos antes de tentar novamente. A migração local desta tarefa não foi executada contra uma base PostgreSQL.

Os três valores mensais do enum preservam os valores implícitos no seed antigo: R$ 120 no mensal, R$ 330 / 3 no trimestral e R$ 600 / 6 no semestral. Os doze programas são criados por `DataInitializer`. O repositório ainda não contém os dias e os itens do catálogo V6; eles precisam ser fornecidos antes de o fluxo de sessões poder ser usado.

## Acesso da API

O aluno usa `/alunos/me`, atualiza o peso em `/alunos/me/peso`, e consulta `/contratos/me`, `/cobrancas/me`, `/programas-treino/me` e `/sessoes-treino/me`. O personal administra alunos e contratos e consulta cobranças e programas com sua conta autorizada. Cobranças são pagas pelo aluno em `POST /cobrancas/{id}/pagar`; sessões são concluídas em `POST /sessoes-treino/me` informando o `diaTreinoId` seguinte.

O web atual ainda não envia token de autenticação e espera campos removidos da V6. O mobile atual mantém treinos no armazenamento local. Ambos precisam de integração de autenticação Google e dos novos contratos HTTP antes de consumirem esta API protegida; os aplicativos não foram alterados nesta migração de backend.

## Executar

Na raiz do monorepo:

```bash
mise run dev:backend
```

A tarefa carrega `backend/spring/.env`, verifica se o arquivo existe e executa `./mvnw spring-boot:run` em `backend/spring/`. A API fica disponível em http://localhost:8080 e a documentação Swagger em http://localhost:8080/swagger-ui.html.

Se preferir executar o Maven Wrapper sem mise, rode da raiz do repositório:

```bash
(set -a; . backend/spring/.env; set +a; cd backend/spring && ./mvnw spring-boot:run)
```

Na IDE, configure as mesmas três variáveis de ambiente para a aplicação Spring Boot.

## Testar e empacotar

Os comandos também são executados na raiz do monorepo:

```bash
mise run test:backend
mise run build:backend
```

`test:backend` executa `./mvnw test` em `backend/spring/`. A suíte inicial cobre o serviço e o controller de alunos; os demais recursos ainda não têm cobertura automatizada. `build:backend` executa `./mvnw package` e gera os artefatos Maven em `backend/spring/target/`.
