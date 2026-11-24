---
name: commit-push-pr-custom
description: "Commit, push e abre um PR seguindo o CONTRIBUTING.md do repositório e usando vocabulário simples. Use quando o usuário pedir commit, push, PR ou disser “sobe isso”."
---

# Commit, push e PR

Versão personalizada do `commit-push-pr` do plugin `commit-commands` (repositório `anthropics/claude-code`). O fluxo base é o mesmo: contexto do git, branch, commits, push, `gh pr create`. O que muda é de onde saem os nomes e os textos: da convenção do próprio repositório e do vocabulário simples do usuário, não de um padrão genérico. Se o `gh` não estiver disponível, a skill faz commit e push e entrega o PR pronto para abrir pelo navegador.

## Passo 1 — Coletar contexto (tudo de uma vez, em paralelo)

- `git status`
- `git diff HEAD`
- `git branch --show-current`
- `git log -5 --oneline`, para ver o estilo dos commits recentes
- `git remote get-url origin`, para saber dono e repositório
- `gh auth status`, para saber se o `gh` está instalado e autenticado
- Ler `CONTRIBUTING.md` na raiz, se existir, e `.github/pull_request_template.md`, se existir

Guardar o resultado de `gh auth status`: ele decide o passo 5 do Passo 3. Se o comando não existir ou falhar, tratar como `gh` indisponível.

## Passo 2 — Achar a convenção antes de escrever

Do `CONTRIBUTING.md` (ou do template de PR), extrair:

- Nome de branch (ex.: `<número-da-issue>-<slug>`)
- Formato do commit: prefixo, idioma, imperativo ou descritivo
- Títulos das seções da descrição do PR: reusar o texto **exato** e a mesma ordem
- Como referenciar ou fechar a issue

Se não houver `CONTRIBUTING.md` nem template, perguntar ao usuário uma vez qual é a convenção. Não assumir Conventional Commits nem um template genérico. Se ninguém puder responder (execução sem o usuário), usar o formato padrão do Passo 4 e dizer isso na resposta final.

## Passo 3 — Executar

Sempre que possível, tudo na mesma rodada de chamadas de ferramenta:

1. **Branch:** se estiver na branch principal (`main` ou `master`), criar uma nova com `git checkout -b`, no formato da convenção. Se a convenção usa o número da issue e ele não for conhecido, perguntar. Nunca commitar direto na branch principal.
2. **Stage:** `git add` só dos arquivos ligados à mudança. Deixar de fora `.env`, chaves, saída de build e arquivos não relacionados, e mencionar o que ficou de fora.
3. **Organizar e commitar:** antes de criar os commits, agrupar as alterações por escopo e responsabilidade. Quando houver mudanças de escopos diferentes, faça commits separados para cada unidade lógica e coesa, em vez de reunir tudo em um único commit. Não crie um commit por arquivo nem fragmente alterações que dependam umas das outras. Cada mensagem deve descrever apenas o conteúdo daquele commit, ser curta e objetiva e respeitar os limites configurados pelo Commitlint. Se uma mensagem ficar longa por tentar descrever responsabilidades diferentes, reveja a divisão dos commits; não encurte a mensagem a ponto de torná-la vaga. Faça os commits na ordem necessária para preservar as dependências entre as alterações. Sempre que a IA tiver criado ou alterado parte relevante do conteúdo de um commit, incluir no fim da mensagem o trailer `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`, para identificar a contribuição de IA. Manter esse trailer mesmo quando a convenção exigir um formato específico para o título; não o incluir se o usuário pedir explicitamente para não fazê-lo ou se a IA não tiver contribuído para o conteúdo daquele commit.
4. **Push:** `git push -u origin <branch>`. Nunca usar `--force`.
5. **PR:**
   - Com `gh` disponível e autenticado: `gh pr create` com título e corpo do Passo 4. Usar `--draft` se o usuário disser rascunho ou draft.
   - Sem `gh` ou sem autenticação: não tentar criar o PR. Seguir o plano B abaixo.

## Plano B — git sem gh

Fazer branch, stage, commits e push normalmente (passos 1 a 4). Depois entregar, no lugar do `gh pr create`:

- O título e o corpo do PR, prontos para copiar, no formato do Passo 4
- O link `https://github.com/<dono>/<repo>/compare/<branch>?expand=1`, montado a partir de `git remote get-url origin` (aceitar remote HTTPS ou SSH e tirar o `.git` do final)
- Uma linha dizendo por que não foi possível criar o PR (`gh` não instalado ou não autenticado), com `gh auth login` como correção

Se o remote não for do GitHub, entregar só o título e o corpo e avisar que o link de comparação não se aplica.

## Passo 4 — Texto do PR em vocabulário simples

O texto de PR gerado por IA costuma ter palavras sofisticadas demais e tópicos demais por seção. Evitar isso:

- Uma ideia por frase. Sem frases compostas empilhando duas justificativas.
- Dizer o que mudou e por quê, no menor número de palavras que ainda seja específico.
- Não repetir o que já está óbvio no diff ou no título da issue.
- Não criar seção de "Testes" ou "Notas" se o `CONTRIBUTING.md` não pedir ou se o usuário não pedir.
- Entre duas formas de dizer, escolher a mais simples.
- Idioma: o mesmo do `CONTRIBUTING.md`; sem ele, português.

Formato padrão, só quando não houver convenção do repositório:

```
[TIPO] Título curto no imperativo

O que mudou?
<1 a 3 frases, linguagem simples: o que mudou e por quê>

Issue: <#número ou N/A>
Outras dependências: <N/A ou lista>
```

O número da issue pode vir do início do nome da branch. Se não der para saber, perguntar ou usar N/A.

Antes de enviar, reler e cortar tudo que repete o título da issue com outras palavras, usa hedge ("isso deve", "pode ajudar") em vez de afirmar direto, ou acrescenta seção que a convenção não pede.

## Passo 5 — Resposta final

Uma ou duas linhas: link do PR (ou o link de comparação, no plano B), nome da branch e mensagens dos commits. Ao mostrar cada mensagem, incluir também o trailer de coautoria quando aplicável. Sem recapitular os passos.

## Sem acesso a git

Se não houver repositório ou terminal disponível (ex.: conversa no chat sem o repo), não tentar executar. Pedir o diff ou a lista de mudanças se faltar e entregar:

- o nome da branch
- os comandos prontos para copiar: `git checkout -b`, `git add`, `git commit -m` (um por unidade lógica), `git push -u origin` e `gh pr create --title --body`
- o texto do PR no formato do Passo 4
