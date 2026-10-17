# Contribuindo com o backend

## Sumário

- [Ambiente](#ambiente)
- [Desenvolvimento](#desenvolvimento)
- [Verificações](#verificações)
- [Regras gerais](#regras-gerais)

## Ambiente

Use Java 17, gerenciado pelo mise na raiz do repositório. Siga a [configuração local do backend](./README.md#configuração-local) antes de executar a API.

Nunca versione credenciais. Dados de acesso ao banco ficam só no `backend/.env`, que o Git ignora. Se você adicionar uma variável nova, inclua o nome dela no `backend/.env.example`.

## Desenvolvimento

Execute a API a partir da raiz com `mise run dev:backend`. Para usar o Maven Wrapper (`backend/mvnw`) direto, carregue antes as variáveis do `.env`, como mostra a seção [Executar](./README.md#executar) do README.

## Verificações

Execute os testes com `mise run test:backend` e gere o pacote com `mise run build:backend`. O backend ainda não tem testes automatizados, então `test:backend` não valida nada por enquanto. A CI atual do repositório não executa verificações Maven; a configuração dessa CI está sendo acompanhada separadamente.

## Regras gerais

As regras de branches, commits e pull requests são compartilhadas com o restante do projeto. Consulte [CONTRIBUTING.md na raiz](../CONTRIBUTING.md).
