---
name: validar-e-acompanhar-ci
description: Escolhe e executa validações locais conforme as mudanças e acompanha os checks de CI de um pull request, investigando falhas antes de relatar o resultado.
---

# Validar mudanças e acompanhar CI

Use esta skill antes de concluir mudanças de código neste repositório e ao acompanhar a CI de um pull request relacionado ao trabalho.

## Validação local

1. Identifique os arquivos e áreas afetados pelo diff.
2. Consulte `AGENTS.md`, `CONTRIBUTING.md`, os guias da área e os scripts de pacote ou tarefas para descobrir as verificações documentadas. Confira também `.github/workflows/` para entender o que a CI executa.
3. Escolha as verificações pertinentes ao escopo. Prefira os comandos documentados e execute verificações mais amplas quando a mudança for transversal ou a CI sempre as exigir.
4. Se uma verificação falhar, examine a saída e determine se ela aponta para a mudança, para um problema preexistente ou para um bloqueio do ambiente. Investigue antes de relatar a tarefa como concluída.
5. Registre os comandos executados e seus resultados. Identifique explicitamente o que não foi executado e o motivo; não apresente isso como aprovado.

Não invente comandos de teste. Se o projeto não tiver testes automatizados para aquela área, diga isso e informe quais outras verificações foram executadas.

## Acompanhar CI de pull request

Quando houver um pull request associado ao trabalho, use `gh` para consultar seu estado e os checks. Por exemplo:

```bash
gh pr view <número-ou-branch> --json number,url,statusCheckRollup
gh pr checks <número-ou-branch>
```

Se checks ainda estiverem em execução, acompanhe-os com `gh pr checks <número-ou-branch> --watch`. Se algum check falhar, obtenha o SHA da branch do PR com `gh pr view` e localize as execuções daquele commit usando `gh run list --commit <sha> --json databaseId,name,status,conclusion,url`. Correlacione o workflow e o estado com o check que falhou e consulte os logs com `gh run view <run-id> --log-failed`.

Investigue as mensagens de erro e relate o check afetado, as evidências relevantes e o diagnóstico possível. Se `gh` não estiver autenticado, o pull request não puder ser localizado ou os logs não estiverem acessíveis, registre essa limitação e não declare a CI aprovada. Não corrija código nem faça merge como parte do acompanhamento da CI; aguarde uma solicitação explícita para essas ações.

## Relato final

Resuma as mudanças e liste as verificações locais e os checks de CI com seus estados. Para falhas, informe o diagnóstico; para itens pendentes ou bloqueados, explique o motivo e o próximo passo necessário. Faça uma última revisão de `git status` e `git diff` para confirmar que o relato corresponde às mudanças presentes.
