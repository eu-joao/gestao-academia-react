# Contribuindo com o backend

## Sumário

- [Ambiente](#ambiente)
- [Desenvolvimento](#desenvolvimento)
- [Verificações](#verificações)
- [Regras gerais](#regras-gerais)

## Ambiente

Use Java 17, gerenciado pelo mise na raiz do repositório. Siga a [configuração local do backend](./README.md#configuração-local) antes de executar a API.

Nunca versione credenciais. Dados de acesso ao banco ficam só no `backend/spring/.env`, que o Git ignora. Se você adicionar uma variável nova, inclua o nome dela no `backend/spring/.env.example`.

## Desenvolvimento

Execute a API a partir da raiz com `mise run dev:backend`. Para usar o Maven Wrapper (`backend/spring/mvnw`) direto, carregue antes as variáveis do `.env`, como mostra a seção [Executar](./README.md#executar) do README.

## Verificações

A CI executa `./mvnw --batch-mode --no-transfer-progress verify` com Java 17 quando há alterações no backend Spring. O projeto JDBC em `backend/jdbc/` também executa o Maven Wrapper quando seus arquivos são alterados. A suíte automatizada atual cobre o serviço e o controller de alunos; os demais recursos ainda não têm testes. O ciclo `verify` compila, executa os testes e empacota o projeto. Para executar as verificações localmente, use `mise run test:backend` e `mise run build:backend` como apoio. A CI remota é a validação obrigatória.

## Regras gerais

As regras de branches, commits e pull requests são compartilhadas com o restante do projeto. Consulte [`CONTRIBUTING.md` na raiz](../CONTRIBUTING.md).
