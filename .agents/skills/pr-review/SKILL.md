---
name: pr-review
description: "Revisa pull requests de forma estruturada e somente de leitura, comparando a implementação com a issue, os critérios de aceite e a documentação do projeto. Use quando o usuário pedir para revisar, auditar ou verificar um PR."
---

# Revisão de Pull Requests

Realize uma revisão técnica independente, baseada em evidências. O objetivo é encontrar problemas que possam impedir a entrega ou causar regressões, não apenas resumir o diff.

## Regras obrigatórias

- **Somente leitura:** não edite arquivos, não altere branches ou commits e não faça push.
- Não publique comentários, não solicite alterações, não aprove e não faça merge do PR.
- Não execute comandos que modifiquem o repositório ou o estado remoto.
- Não presuma que a CI verde comprova o atendimento funcional dos requisitos.
- Não invente resultados, caminhos, números de linha, critérios ou relações entre PRs e issues.
- Diferencie fatos confirmados, riscos plausíveis e sugestões.
- Se não houver acesso a alguma informação necessária, registre a limitação e classifique o item como não verificável.

## Informações de entrada

Identifique, quando disponíveis:

- Repositório.
- Número ou URL do pull request.
- Issue relacionada.
- Branch de origem e branch de destino.

Se o PR não estiver explícito e não puder ser identificado pelo contexto, solicite o número ou a URL. Não escolha um PR por suposição.

## Procedimento

### 1. Entender o objetivo antes de ler o diff

1. Consulte a descrição do PR e identifique a issue vinculada.
2. Leia a issue completa, incluindo contexto, escopo, exclusões e critérios de aceite.
3. Consulte a documentação aplicável à área alterada: Spec, decisões do projeto, guias, contratos, requisitos e instruções em `AGENTS.md`.
4. Verifique dependências de outras issues ou PRs. Se a branch de destino ou outro PR fornecer parte da implementação, considere esse contexto e deixe explícito o que não pertence ao PR atual.
5. Registre os requisitos que precisam ser verificados. Não reduza a revisão ao que o autor descreveu no PR.

### 2. Examinar todas as alterações

1. Obtenha o diff completo entre a branch de destino e a branch do PR. Confira também a lista de arquivos alterados para detectar arquivos omitidos na análise.
2. Leia o contexto dos arquivos afetados, não apenas as linhas modificadas.
3. Relacione cada alteração aos requisitos e critérios levantados na etapa anterior.
4. Procure, conforme a área:
   - erros de lógica, fluxos incompletos e casos de borda;
   - regressões em funcionalidades existentes;
   - incompatibilidades entre frontend, backend, API, banco de dados e contratos;
   - validação insuficiente de entradas e tratamento inadequado de erros;
   - falhas de autenticação, autorização, privacidade ou exposição de dados;
   - problemas de concorrência, persistência, migração ou integridade;
   - acessibilidade, usabilidade e comportamento responsivo, quando aplicável;
   - código duplicado, acoplamento ou complexidade que gere risco concreto;
   - ausência ou insuficiência de testes relevantes.
5. Não sinalize preferências de estilo como defeitos. Consulte as convenções do repositório antes de apontar divergências.

### 3. Verificar critérios de aceite

Avalie **cada critério individualmente**, usando exatamente uma destas classificações:

- **Atendido:** há evidência direta na implementação ou em uma verificação executada.
- **Não atendido:** há evidência de que o requisito está ausente, incorreto ou incompleto.
- **Não verificável:** faltam acesso, ambiente, dados, especificação ou evidência suficiente.

Inclua uma justificativa curta e referências aos arquivos/linhas ou testes que sustentam a classificação. Não classifique como atendido apenas porque o código parece implementar o requisito.

### 4. Avaliar testes e CI

1. Identifique os testes existentes e os testes adicionados ou modificados pelo PR.
2. Consulte os checks de CI associados ao commit atual do PR, quando houver acesso.
3. Informe o estado observado de cada check relevante: aprovado, falhou, em execução, cancelado ou indisponível.
4. Verifique se os testes cobrem os fluxos principais, casos de erro e critérios de aceite relevantes.
5. Não afirme que executou testes se apenas leu os arquivos ou consultou a CI.
6. Não repita localmente verificações já cobertas pela CI sem uma razão concreta. Se for necessário executar algo, siga as instruções do repositório e use apenas comandos de leitura ou validação que não alterem o projeto.
7. Considere CI aprovada como evidência de que os checks configurados passaram, não como prova de ausência de bugs ou de atendimento a todos os requisitos.

### 5. Consolidar os achados

Para cada problema, informe:

- **Severidade:** bloqueador, alta, média ou baixa.
- **Local:** arquivo e linha(s), quando disponíveis.
- **Evidência:** comportamento observado ou trecho relevante.
- **Impacto:** consequência concreta para o usuário, sistema ou entrega.
- **Correção esperada:** direção objetiva para resolver, sem implementar a mudança.

Use severidade com critério:

- **Bloqueador:** impede uso ou entrega, causa perda/corrupção relevante de dados ou cria vulnerabilidade crítica.
- **Alta:** quebra funcionalidade importante, requisito obrigatório ou fluxo central.
- **Média:** causa falha limitada, comportamento incorreto em cenário relevante ou risco significativo.
- **Baixa:** problema localizado de menor impacto, sem bloquear o fluxo principal.

Não transforme hipóteses em defeitos confirmados. Se algo depender de uma condição ainda não comprovada, apresente como risco e explique a condição.

## Formato do relatório

# Revisão do PR #N

**Resultado:** aprovado para revisão humana / requer correções / inconclusivo.

## Resumo
Explique em poucas frases o que o PR altera e o estado geral da revisão.

## Problemas encontrados
Liste primeiro os problemas de maior severidade. Se não houver problemas confirmados, declare isso explicitamente.

## Riscos e pontos de atenção
Liste riscos plausíveis, limitações de cobertura e sugestões que não sejam defeitos comprovados.

## Critérios de aceite
Para cada critério da issue:
- **Classificação:** atendido / não atendido / não verificável.
- **Justificativa:** evidência e referência.

## Testes e CI
Informe o que foi consultado ou executado, os resultados e o que não pôde ser verificado.

## Limitações
Registre informações, ambientes, arquivos ou checks inacessíveis.

## Conclusão
Diga se há problemas que precisam ser corrigidos antes da aprovação humana. A decisão final continua sendo da equipe.

## Acionamento

Quando receber um pedido de revisão, use o PR informado e siga o procedimento completo. Se o usuário fornecer apenas um link ou número, obtenha os dados restantes do próprio repositório e do PR.

Se o contexto não fornecer acesso ao GitHub, peça o diff e as informações ausentes. Não substitua a revisão por uma análise parcial sem deixar claro o que ficou de fora.
