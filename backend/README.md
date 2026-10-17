# API Spring Boot

API REST do sistema de gestão de academia, desenvolvida com Spring Boot e Java 17. O código da aplicação fica em `src/`, e o projeto inclui o Maven Wrapper (`mvnw`) para executar tarefas Maven.

## Configuração local

Na raiz do repositório, crie o arquivo de ambiente a partir do exemplo:

```bash
cp backend/.env.example backend/.env
```

Preencha `backend/.env` com os dados do PostgreSQL local. As variáveis necessárias são `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` e `SPRING_DATASOURCE_PASSWORD`. O arquivo `.env` é local e ignorado pelo Git.

## Executar

Instale os runtimes e inicie a API a partir da raiz do repositório:

```bash
mise install
mise run backend
```

## Contribuir

Consulte [CONTRIBUTING.md](./CONTRIBUTING.md) para as orientações de desenvolvimento e validação do backend.
