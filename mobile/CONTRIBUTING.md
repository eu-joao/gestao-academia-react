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

A CI executa Prettier, ESLint, TypeScript e Expo Doctor quando há alterações em `mobile/`. O aplicativo ainda não possui uma suíte de testes automatizados; essa tarefa está acompanhada pela issue [#55](https://github.com/eu-joao/gestao-academia-react/issues/55). A CI remota é a validação obrigatória. Para obter feedback local antes de abrir o PR, você pode executar, na raiz do repositório:

```bash
mise run lint:mobile
```

Essa tarefa roda Prettier, ESLint e TypeScript, as mesmas verificações da CI, exceto o Expo Doctor.

## Regras gerais

Para criar uma branch vinculada a uma issue, escrever commits e abrir um PR, siga as [orientações gerais do repositório](../CONTRIBUTING.md).
