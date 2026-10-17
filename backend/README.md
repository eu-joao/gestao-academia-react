# API Spring Boot

API REST do sistema de gestão de academia, desenvolvida com Spring Boot e Java 17. O código da aplicação fica em `src/`, e o projeto inclui o Maven Wrapper (`mvnw`) para executar tarefas Maven.

## Configuração local

A API usa PostgreSQL. Se você tem Docker, este comando cria um banco compatível com o `backend/.env.example`:

```bash
docker run --name gestao-academia-db -e POSTGRES_PASSWORD=change-me -e POSTGRES_DB=gestao_academia -p 5432:5432 -d postgres:16
```

Nas próximas vezes, inicie o mesmo banco com `docker start gestao-academia-db`. Sem Docker, use um PostgreSQL local e ajuste o `.env` abaixo para ele.

Na raiz do repositório, crie o arquivo de ambiente a partir do exemplo:

```bash
cp backend/.env.example backend/.env
```

O `.env` define `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` e `SPRING_DATASOURCE_PASSWORD`, que o `application.properties` lê. Os valores do exemplo servem só para o banco local de desenvolvimento. O arquivo `.env` é local e ignorado pelo Git.

## Executar

Na raiz do repositório:

```bash
mise run dev:backend
```

A API sobe em http://localhost:8080 e a documentação Swagger fica em http://localhost:8080/swagger-ui.html. Se o `backend/.env` não existir, a tarefa para e mostra como criá-lo.

O Spring não lê o `.env` sozinho: quem carrega as variáveis é o mise. Para rodar sem o mise, carregue o arquivo no comando:

```bash
(set -a; . backend/.env; set +a; cd backend && ./mvnw spring-boot:run)
```

Na IDE, copie as três variáveis do `.env` para a configuração de execução da aplicação.

## Outras tarefas

Na raiz do repositório:

- `mise run test:backend` roda os testes. O backend ainda não tem testes.
- `mise run build:backend` gera o pacote em `backend/target/`.

## Contribuir

Consulte [CONTRIBUTING.md](./CONTRIBUTING.md) para as orientações de desenvolvimento e validação do backend.
