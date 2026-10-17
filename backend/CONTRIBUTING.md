# Contribuindo com o backend

## Sumário

- [Ambiente](#ambiente)
- [Desenvolvimento](#desenvolvimento)
- [Verificações](#verificações)
- [Regras gerais](#regras-gerais)

## Ambiente

Use Java 17, gerenciado pelo mise na raiz do repositório. Siga a [configuração local do backend](./README.md#configuração-local) antes de executar a API.

## Desenvolvimento

Execute a API a partir da raiz com `mise run backend`. O Maven Wrapper também está disponível em `backend/mvnw`.

## Verificações

Execute os testes com `mise run test-backend` e gere o pacote com `mise run package-backend`. A CI atual do repositório não executa verificações Maven; a configuração dessa CI está sendo acompanhada separadamente.

## Regras gerais

As regras de branches, commits e pull requests são compartilhadas com o restante do projeto. Consulte [CONTRIBUTING.md na raiz](../CONTRIBUTING.md).
