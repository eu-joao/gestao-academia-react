---
name: github-issue-creation
description: "Cria ou redige issues do GitHub claras e prontas para execução, seguindo os templates e convenções do repositório. Use quando o usuário pedir para criar, abrir, escrever ou melhorar uma issue."
---

# Criação de issues no GitHub

Crie issues claras e prontas para alguém executar. Siga primeiro as convenções do repositório; não imponha um modelo genérico quando o projeto já define um.

## 1. Entender o pedido e o modo de trabalho

- Use o contexto da conversa e do repositório atual. Identifique se é bug, funcionalidade, tarefa técnica ou outro tipo de issue.
- “Crie/abra uma issue” autoriza publicar no GitHub. “Escreva/redija uma issue” sem pedido para abrir significa entregar apenas o rascunho.
- Preserve o escopo solicitado. Não transforme uma ideia em requisitos ou compromissos que o usuário não mencionou.
- Se uma dúvida puder mudar o escopo ou o comportamento esperado, pergunte antes de publicar. Para detalhes menores, use uma suposição razoável e sinalize-a no rascunho se necessário.

## 2. Conferir as convenções do projeto

Antes de redigir, verifique:

- O repositório e o remote atual, se estiver trabalhando localmente.
- Templates em `.github/ISSUE_TEMPLATE/`, `.github/ISSUE_TEMPLATE.md` e formulários de issue em YAML; também procure instruções do projeto sobre issues.
- Issues existentes e labels disponíveis quando isso ajudar a evitar duplicatas ou escolher metadados.

Use o template que melhor corresponde ao pedido. Preserve seus títulos, comentários, checklists e ordem; preencha somente com informações confirmadas. Se não houver template, use uma estrutura simples apropriada ao tipo:

- **Bug:** o que acontece, como reproduzir, resultado esperado e ambiente relevante.
- **Funcionalidade:** problema ou necessidade, resultado esperado e critérios de aceite verificáveis.
- **Tarefa técnica:** trabalho necessário e checklist ou condição de conclusão, quando útil.

Não inclua seções vazias, requisitos especulativos ou detalhes irrelevantes. Escreva no idioma usado pelo usuário ou pelo template do projeto.

## 3. Escrever título, descrição e metadados

- Use um título curto e específico, que identifique o problema ou resultado.
- Dê contexto suficiente para alguém entender e executar o pedido sem depender da conversa.
- Prefira critérios de aceite concretos e observáveis; não repita a descrição com outras palavras.
- Não invente labels, responsáveis, milestones, prioridades, passos para reproduzir ou comportamento esperado. Só preencha esses dados quando o usuário informar ou quando uma convenção existente os determinar claramente.
- Antes de criar, procure uma issue aberta semelhante quando houver acesso ao GitHub. Se encontrar uma possível duplicata, mostre o link e não abra outra sem confirmação.

## 4. Publicar somente quando solicitado

- Para criar no GitHub, prefira `gh` CLI. Confirme o repositório de destino e verifique autenticação antes de publicar.
- Use o título, corpo e metadados já conferidos; aplique apenas labels existentes e claramente apropriadas.
- Não publique se o destino não estiver claro, se faltar uma decisão importante ou se houver uma possível duplicata. Pergunte ao usuário nesses casos.
- Se `gh` não estiver disponível ou autenticado, não alegue que criou a issue. Entregue o rascunho pronto e explique brevemente o bloqueio.
- Depois de publicar, confirme o resultado consultando a issue criada e retorne o link, o título e, se relevante, as labels aplicadas.

## 5. Responder com concisão

Para um rascunho, entregue o título e o corpo formatados para copiar. Para uma issue publicada, informe o link e o título. Mencione suposições ou bloqueios importantes, sem repetir todo o processo.
