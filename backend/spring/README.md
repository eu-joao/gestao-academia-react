# API Spring Boot

API REST do sistema de gestão de academia, desenvolvida com Spring Boot e Java 17. O código da aplicação fica em `src/`, e o projeto inclui o Maven Wrapper (`mvnw`) para executar tarefas Maven.

## Pré-requisitos

- [mise](https://mise.jdx.dev/) para instalar e selecionar o Java 17 configurado no monorepo;
- PostgreSQL local. Docker é opcional e pode ser usado para iniciar o banco.

Na raiz do repositório, instale os runtimes do projeto:

```bash
mise install
```

## Configuração local

O backend usa PostgreSQL. Com Docker, na raiz do repositório, crie o banco com os mesmos dados de conexão do arquivo de exemplo:

```bash
docker run --name gestao-academia-db -e POSTGRES_PASSWORD=change-me -e POSTGRES_DB=gestao_academia -p 5432:5432 -d postgres:16
```

Nas próximas vezes, inicie o mesmo banco com `docker start gestao-academia-db`. Sem Docker, use uma instalação local do PostgreSQL e ajuste as variáveis abaixo para os dados desse banco.

Crie `backend/spring/.env` a partir do exemplo:

```bash
cp backend/spring/.env.example backend/spring/.env
```

O exemplo define as variáveis `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` e `SPRING_DATASOURCE_PASSWORD`, usadas por `src/main/resources/application.properties`. O arquivo `.env` é local e está ignorado pelo Git.

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

## Contribuir

Consulte [CONTRIBUTING.md](./CONTRIBUTING.md) para as orientações de desenvolvimento e validação do backend.
