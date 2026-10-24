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

Cada agente de IA que contribuir para um commit deve incluir sua própria co-autoria quando tiver uma identidade e um email válidos para esse uso. Use um trailer `Co-authored-by: Nome do agente <email>` para cada agente; não use uma identidade fixa de outro agente nem invente ou empreste um email.

Para o GitHub vincular a co-autoria a uma conta, o email do trailer deve estar associado a essa conta. Se a conta mantiver o email privado, use o endereço `noreply` fornecido pelo GitHub. Se não houver identidade e email válidos disponíveis para o agente, não crie um trailer fictício e informe que não foi possível registrar a co-autoria. Consulte a [documentação do GitHub sobre commits com vários autores](https://docs.github.com/pt/pull-requests/how-tos/commit-changes/creating-a-commit-with-multiple-authors).

## Pull requests

Abra o PR da branch da issue para `main` e use o modelo em [`.github/pull_request_template.md`](./.github/pull_request_template.md). Informe a issue relacionada no campo indicado e use `Closes #<número>` quando o PR concluir a issue.

O PR só pode ser aceito depois de uma aprovação de outra pessoa que não seja o autor e da aprovação das verificações de CI. O merge deve ser normal, preservando os commits da branch; não use squash.

## Verificações

A CI do GitHub Actions é a validação obrigatória e a referência final para todos os PRs. Ela valida o título e as mensagens dos commits e executa somente os módulos afetados:

- **Mobile:** Prettier, ESLint, TypeScript e Expo Doctor.
- **Web:** ESLint, geração dos tipos do Next.js, TypeScript e build de produção.
- **Backend Spring e JDBC:** Maven Wrapper com `verify`, usando Java 17.

Alterações em `.github/workflows/` executam todas as verificações dos módulos. Um job ignorado porque seu módulo não foi alterado é considerado válido pelo job final da CI; isso evita deixar verificações obrigatórias pendentes em PRs de documentação ou de outro módulo.

O Husky e os hooks locais foram removidos. Não é necessário instalar ferramentas de Git hooks nem executar verificações automáticas a cada commit. As tarefas locais do mise continuam disponíveis como opção para obter feedback antes de abrir um PR:

```bash
mise run lint
mise run test:backend
mise run build
```

Essas tarefas são auxiliares; não substituem nem alteram o resultado obrigatório da CI. O backend ainda não possui testes automatizados, então o Maven `verify` valida compilação e empacotamento, mas não representa cobertura de testes. Os detalhes de cada módulo estão em [mobile/CONTRIBUTING.md](./mobile/CONTRIBUTING.md) e [backend/CONTRIBUTING.md](./backend/spring/CONTRIBUTING.md).
