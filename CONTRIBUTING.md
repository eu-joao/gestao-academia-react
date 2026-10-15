# Contribuindo

## Sumário

- [Branches](#branches)
- [Commits](#commits)
- [Pull requests](#pull-requests)
- [Verificações](#verificações)

## Branches

Cada issue deve ser trabalhada em uma branch própria, criada a partir de `main`. Crie a branch pela opção de desenvolvimento da issue e associe-a à issue correspondente na seção **Development**. Antes de criar, revise o nome sugerido pelo GitHub: use somente letras ASCII sem acentos, números e hífens (`-`), no formato `<número-da-issue>-<descrição>`. Não use espaços nem outros caracteres especiais. Por exemplo, use `65-nomes-de-branches-ascii` em vez de `65-nomes-de-branches-sem-acentos`.

## Commits

As mensagens seguem [Conventional Commits](https://www.conventionalcommits.org/) e são verificadas pelo Commitlint. Use o formato `<tipo>(<escopo opcional>): <descrição>`, com uma descrição curta que diga o que a mudança faz.

Exemplos:

- `feat(membros): adiciona cadastro de aluno`
- `fix(login): valida campos vazios`
- `docs(mobile): atualiza instruções de execução`
- `test(membros): cobre validação do formulário`

Use um tipo compatível com a mudança (`feat`, `fix`, `docs`, `test`, `refactor` ou `chore`, por exemplo). O escopo é opcional; não termine a mensagem com ponto.

### Co-autoria de agentes de IA

Todo commit gerado ou assistido por agentes de IA **deve** incluir a co-autoria explícita no rodapé da mensagem de commit. Use o formato `Co-Authored-By: <nome> <email>`.

## Pull requests

Abra o PR da branch da issue para `main` e use o modelo em [`.github/pull_request_template.md`](./.github/pull_request_template.md). Informe a issue relacionada no campo indicado e use `Closes #<número>` quando o PR concluir a issue.

O PR só pode ser aceito depois de uma aprovação de outra pessoa que não seja o autor e da aprovação das verificações de CI. O merge deve ser normal, preservando os commits da branch; não use squash.

## Verificações

A CI executa o lint do aplicativo mobile. É recomendável executar as verificações localmente antes de abrir o PR; os comandos estão em [mobile/CONTRIBUTING.md](./mobile/CONTRIBUTING.md).
