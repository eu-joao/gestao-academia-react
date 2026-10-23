# Contribuindo com o app mobile

## Sumário

- [Ambiente](#ambiente)
- [Desenvolvimento](#desenvolvimento)
- [Verificações](#verificações)
- [Regras gerais](#regras-gerais)

## Ambiente

Use o [mise](https://mise.jdx.dev/) para instalar o Node.js definido pelo projeto. Na raiz do repositório, execute `mise install` e `mise run install` para instalar o runtime e as dependências.

## Desenvolvimento

As rotas do Expo Router ficam em `src/app/`; mantenha componentes, hooks e lógica compartilhada fora desse diretório. Antes de alterar APIs do Expo ou React Native, consulte a documentação da versão do SDK usada pelo app (`expo` 57) e verifique as orientações em [`AGENTS.md`](./AGENTS.md). Para adicionar dependências Expo, use `npx expo install <pacote>` para selecionar uma versão compatível com o SDK.

## Verificações

A CI executa Prettier, ESLint, TypeScript, Expo Doctor e os testes, se existirem. É recomendável executar as verificações antes de abrir o PR. Na raiz do repositório:

```bash
mise run lint:mobile
```

Essa tarefa roda Prettier, ESLint e TypeScript, as mesmas verificações da CI, exceto o Expo Doctor.

## Regras gerais

Para criar uma branch vinculada a uma issue, escrever commits e abrir um PR, siga as [orientações gerais do repositório](../CONTRIBUTING.md).
