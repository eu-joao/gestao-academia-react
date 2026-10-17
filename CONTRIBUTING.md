# Contribuindo

## Sumário

- [Branches](#branches)
- [Commits](#commits)
- [Pull requests](#pull-requests)
- [Verificações](#verificações)

## Branches

Cada issue deve ser trabalhada em uma branch própria, criada a partir de `main`. Crie a branch pela opção de desenvolvimento da issue e mantenha o nome sugerido automaticamente pelo GitHub (normalmente `<número-da-issue>-<descrição>`). Toda branch de trabalho deve estar associada à issue correspondente na seção **Development**.

## Commits

As mensagens seguem [Conventional Commits](https://www.conventionalcommits.org/) e são verificadas pelo Commitlint. Use o formato `<tipo>(<escopo opcional>): <descrição>`, com uma descrição curta que diga o que a mudança faz.

Exemplos:

- `feat(membros): adiciona cadastro de aluno`
- `fix(login): valida campos vazios`
- `docs(mobile): atualiza instruções de execução`
- `test(membros): cobre validação do formulário`

Use um tipo compatível com a mudança (`feat`, `fix`, `docs`, `test`, `refactor` ou `chore`, por exemplo). O escopo é opcional; não termine a mensagem com ponto.

## Pull requests

Abra o PR da branch da issue para `main` e use o modelo em [`.github/pull_request_template.md`](./.github/pull_request_template.md). Informe a issue relacionada no campo indicado e use `Closes #<número>` quando o PR concluir a issue.

O PR só pode ser aceito depois de uma aprovação de outra pessoa que não seja o autor e da aprovação das verificações de CI. O merge deve ser normal, preservando os commits da branch; não use squash.

## Verificações

A CI valida o título do PR e executa as verificações do aplicativo mobile. O web e o backend ainda não têm verificações na CI.

Antes de abrir o PR, execute localmente as verificações dos módulos que você alterou. Na raiz do repositório:

```bash
mise run lint
mise run test:backend
mise run build
```

`lint` cobre o mobile e o web, `test:backend` cobre o backend e `build` gera o pacote do backend e o build do web. Os detalhes de cada módulo estão em [mobile/CONTRIBUTING.md](./mobile/CONTRIBUTING.md) e [backend/CONTRIBUTING.md](./backend/CONTRIBUTING.md).
