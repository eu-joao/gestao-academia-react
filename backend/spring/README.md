# API Spring Boot

API REST do sistema de gestão de academia, desenvolvida com Spring Boot e Java 17. O código da aplicação fica em `src/`, e o projeto inclui o Maven Wrapper (`mvnw`) para executar tarefas Maven.

## Pré-requisitos

- [mise](https://mise.jdx.dev/) para instalar e selecionar o Java 17 configurado no monorepo;
- PostgreSQL instalado localmente ou banco na nuvem (ex.: Neon PostgreSQL).

Na raiz do repositório, instale os runtimes do projeto:

```bash
mise install
```

## Configuração local

O backend utiliza o PostgreSQL e suporta carregamento automático de variáveis a partir do arquivo `.env` local via `spring.config.import`.

Crie `backend/spring/.env` a partir do exemplo:

```bash
cp backend/spring/.env.example backend/spring/.env
```

O exemplo define as variáveis `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` e `SPRING_DATASOURCE_PASSWORD`, usadas por `src/main/resources/application.properties`. Configure os dados de conexão com o banco local ou na nuvem (Neon com parâmetros SSL `sslmode=require&channelbinding=require`). O arquivo `.env` é local e está estritamente protegido pelo Git.

A API não exige autenticação nesta versão: `SecurityConfig` libera todas as rotas e a segurança por método (`@PreAuthorize`) está desativada. As variáveis `GOOGLE_CLIENT_IDS` e `ACADEMIA_PERSONAL_EMAIL` são opcionais e só terão efeito se a validação de tokens Google for reativada.

## Migração do banco

O Flyway gerencia as migrações automáticas do banco de dados na inicialização:

- **`V1__create_v6_schema.sql`**: cria o esquema V6 básico (aluno, programa de treino, dia de treino, item de treino, contrato, cobrança e sessão de treino).
- **`V2__migrate_legacy_v5_data.sql`**: converte dados legados da versão V5 para o modelo V6.
- **`V3__create_treino_pdm.sql`**: cria a tabela `treino` com chave primária UUID, soft-delete (`ativo`), índices por aluno e dia da semana, e timestamps de auditoria para suporte à persistência na nuvem e offline-first do módulo mobile.

O Hibernate valida o esquema contra as tabelas criadas pelo Flyway (`spring.jpa.hibernate.ddl-auto=validate`).

## Acesso da API

- **Alunos e Administração:** Os endpoints `/me` dependem da identidade do usuário autenticado e não funcionam enquanto a API estiver sem autenticação; o portal web usa os endpoints por identificador (`/alunos`, `/alunos/{id}`). O aluno consulta `/alunos/me`, `/alunos/me/peso`, `/contratos/me`, `/cobrancas/me`, `/programas-treino/me` e `/sessoes-treino/me`. Pagamento fictício em `POST /cobrancas/{id}/pagar` e conclusão de sessões em `POST /sessoes-treino/me`.
- **Treinos Mobile (PDM):** CRUD completo e sincronização offline-first:
  - `GET /treinos`: lista treinos ativos (com filtros opcionais por aluno e dia da semana).
  - `GET /treinos/{id}`: busca um treino por identificador UUID.
  - `POST /treinos`: cria um novo treino.
  - `PUT /treinos/{id}`: atualiza os dados de um treino existente.
  - `DELETE /treinos/{id}`: executa a exclusão lógica (`ativo = false`).
  - `POST /treinos/sincronizar`: processa um lote de mutações da fila offline do mobile (`CRIAR`, `ATUALIZAR`, `EXCLUIR`) de forma idempotente.

Nos requests de cadastro e atualização de aluno, a altura pode ser informada em metros (por exemplo, `1.80`) ou centímetros (por exemplo, `180`, entre `30` e `300`). Valores em centímetros são normalizados para metros antes da persistência; alturas acima de `3.00 m` são rejeitadas com erro de validação.

## Executar

Na raiz do monorepo:

```bash
mise run dev:backend
```

Ou dentro de `backend/spring/`:

```bash
./mvnw spring-boot:run
```

A API fica disponível em http://localhost:8080 e a documentação interativa Swagger/OpenAPI em http://localhost:8080/swagger-ui.html.

## Testar e empacotar

```bash
mise run test:backend
mise run build:backend
```

Ou no diretório do backend:

```bash
./mvnw test
./mvnw package
```
