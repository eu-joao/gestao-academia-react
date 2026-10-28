---
name: "commit-push-pr-custom"
description: "Executa o fluxo completo de commit, push e criação de PR, seguindo as regras do repositório. Use somente quando o usuário invocar explicitamente o comando `/commit-push-pr-custom`. Não ative com base em pedidos em linguagem natural, mesmo que solicitem commit, push ou criação de PR."
---

# Commit, push e PR

Ao ser acionada, esta skill executa o fluxo completo: um commit, push e criação de PR. Não pare depois do commit ou do push como alternativa normal.

## 1. Conferir contexto e regras

Antes de alterar o repositório, confira:

- `git status`, `git diff HEAD`, branch atual, `git log -5 --oneline` e `git remote get-url origin`
- `gh auth status`
- `CONTRIBUTING.md` na raiz e templates em `.github/pull_request_template.md` ou `.github/PULL_REQUEST_TEMPLATE/`

Use as regras encontradas para nome da branch, mensagem do commit, título, idioma, seções e referências de issue. Reuse os títulos e a ordem do template exatamente. Se não houver regra, pergunte uma vez; se o usuário não puder responder, use o formato simples abaixo e informe isso no final.

Antes de iniciar qualquer mudança, confirme que há um repositório Git, mudanças relacionadas ao pedido, um `origin` do GitHub e `gh` instalado e autenticado. Se algo impedir a criação do PR, pare sem criar branch, stage, commit ou push e explique o bloqueio. Não use um plano B que deixe o fluxo pela metade.

Se não houver convenção e o usuário não responder, use uma mensagem de commit curta no imperativo e no idioma do projeto. Use este corpo de PR:

```text
O que mudou?
<1 a 3 frases simples sobre o que mudou e por quê>

Issue: <número ou N/A>
Outras dependências: <N/A ou lista>
```

## 2. Executar o fluxo

1. Se estiver em `main` ou `master`, crie uma branch de trabalho seguindo a convenção do repositório. Se não houver convenção, use `feature/<slug-curto>`. Se uma regra exigir um número de issue que não esteja disponível, pergunte antes de prosseguir. Nunca faça commit direto na branch principal.
2. Faça stage apenas dos arquivos ligados ao pedido. Não inclua mudanças não relacionadas, segredos ou saídas de build.
3. Faça um único commit com uma ideia, seguindo o formato do repositório. Se a IA contribuiu para o conteúdo e tiver uma identidade de co-autoria própria (nome e e-mail verificados no GitHub), inclua-a no commit com `Co-authored-by: <nome> <<email>>`. Se não tiver uma identidade própria, omita a linha de co-autoria.
4. Faça push para `origin` com `git push -u origin <branch>`. Nunca use `--force`.
5. Crie o PR com `gh pr create`, usando o título e o corpo conforme as regras do repositório. Use `--draft` se o usuário pedir um rascunho.

## 3. Escrever sem excesso

- Use vocabulário simples e frases curtas; diga o que mudou e por quê.
- Não repita o título da issue ou o que já está óbvio no diff.
- Não use frases de hesitação nem acrescente seções que o template não pede.
- Sem orientação do projeto, use o idioma do projeto; se não der para identificar, use português.

## 4. Falhas e resposta

Se uma etapa falhar, informe claramente o que foi concluído e o que impediu terminar. Não diga que o fluxo foi concluído sem confirmar a criação do PR. Ao concluir, responda em uma ou duas linhas com link do PR, branch e mensagem do commit.

Se não houver acesso ao repositório ou ao terminal, explique o bloqueio; não simule a execução nem apresente comandos como se fossem o resultado do fluxo.
