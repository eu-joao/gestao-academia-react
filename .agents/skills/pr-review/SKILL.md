---
name: pr-review
description: "Revisa pull requests de forma estruturada e somente de leitura, comparando a implementação com a issue, os critérios de aceite e a documentação do projeto. Use quando o usuário pedir para revisar, auditar ou verificar um PR."
---

# Revisão de Pull Requests

Realize uma revisão técnica independente, baseada em evidências. O objetivo é encontrar problemas que possam impedir a entrega ou causar regressões, não apenas resumir o diff. Priorize a precisão: poucos apontamentos bem fundamentados são melhores que uma lista extensa de hipóteses.

## Regras obrigatórias

- **Somente leitura:** não edite arquivos, não altere branches ou commits e não faça push.
- Não publique comentários, não solicite alterações, não aprove e não faça merge do PR.
- Não execute comandos que modifiquem o repositório ou o estado remoto.
- Não presuma que a CI verde comprova o atendimento funcional dos requisitos.
- Não invente resultados, caminhos, números de linha, critérios ou relações entre PRs e issues.
- Diferencie defeitos confirmados, riscos condicionais, sugestões e limitações de validação.
- Todo defeito apontado deve ter evidência concreta e uma consequência plausível. Não transforme preferência de implementação em defeito.
- Se não houver acesso a alguma informação necessária, registre a limitação e classifique o item como não verificável.
- Não afirme que uma revisão é exaustiva quando arquivos, histórico, checks ou ambientes relevantes não puderem ser consultados.

## Informações de entrada

Identifique, quando disponíveis:

- Repositório.
- Número ou URL do pull request.
- Issue relacionada.
- Branch de origem e branch de destino.
- SHA atual do HEAD do PR e SHA da branch-base.

Se o PR não estiver explícito e não puder ser identificado pelo contexto, solicite o número ou a URL. Não escolha um PR por suposição.

## Procedimento

### 1. Entender o objetivo antes de ler o diff

1. Consulte a descrição do PR e identifique a issue vinculada. Não presuma que uma referência textual seja uma dependência efetiva; confirme a relação quando possível.
2. Leia a issue completa, incluindo contexto, escopo, exclusões e critérios de aceite.
3. Avalie a qualidade dos critérios de aceite:
   - existem e estão claramente identificados?
   - descrevem resultados observáveis?
   - são verificáveis sem depender de interpretação subjetiva?
   - cobrem os fluxos e restrições relevantes descritos na issue?
4. Se a issue não existir, não estiver vinculada ou não tiver critérios suficientes, registre a lacuna. Use os requisitos explícitos da descrição do PR e da documentação como contexto, mas **não invente critérios de aceite** nem trate suposições como requisitos acordados.
5. Consulte a documentação aplicável à área alterada: Spec, decisões do projeto, guias, contratos, requisitos e instruções em `AGENTS.md` ou arquivos equivalentes.
6. Verifique dependências de outras issues ou PRs. Se a branch de destino ou outro PR fornecer parte da implementação, considere esse contexto e deixe explícito o que não pertence ao PR atual.
7. Registre os requisitos que precisam ser verificados. Não reduza a revisão ao que o autor descreveu no PR.

### 2. Delimitar corretamente as alterações

1. Registre a branch-base e a branch de origem do PR. Em PRs encadeados, não presuma que a branch-base seja `main`.
2. Obtenha o diff entre a base e o HEAD do PR e confirme qual intervalo de commits está sendo analisado. Quando possível, use o merge-base apropriado; não compare automaticamente com `main` se o PR aponta para outra branch.
3. Em uma pilha de PRs, separe alterações próprias do PR atual das alterações herdadas da branch-base. Não atribua ao PR atual defeitos introduzidos exclusivamente por um PR anterior.
4. Obtenha a lista completa de arquivos alterados e confira se todos foram considerados.
5. Leia o contexto dos arquivos afetados, não apenas as linhas modificadas.
6. Se o diff, a base ou o histórico não estiverem acessíveis, informe precisamente essa limitação e reduza o alcance da conclusão.

### 3. Examinar a implementação

Relacione cada alteração aos requisitos levantados e procure, conforme a área:

- erros de lógica, fluxos incompletos e casos de borda;
- regressões em funcionalidades existentes;
- incompatibilidades entre frontend, backend, API, banco de dados e contratos;
- validação insuficiente de entradas e tratamento inadequado de erros;
- falhas de autenticação, autorização, privacidade ou exposição de dados;
- problemas de concorrência, persistência, migração ou integridade;
- acessibilidade, usabilidade e comportamento responsivo, quando aplicável;
- código duplicado, acoplamento ou complexidade que gere risco concreto;
- ausência ou insuficiência de testes relevantes.

Não sinalize preferências de estilo como defeitos. Consulte as convenções do repositório antes de apontar divergências. Considere o impacto do código no contexto real de uso, não apenas padrões abstratos.

### 4. Verificar critérios de aceite

Avalie **cada critério individualmente**, usando exatamente uma destas classificações:

- **Atendido:** há evidência direta na implementação ou em uma verificação executada.
- **Não atendido:** há evidência de que o requisito está ausente, incorreto ou incompleto.
- **Não verificável:** faltam acesso, ambiente, dados, especificação ou evidência suficiente.

Inclua uma justificativa curta e referências aos arquivos/linhas ou testes que sustentam a classificação. Não classifique como atendido apenas porque o código parece implementar o requisito.

Se não houver critérios de aceite explícitos, informe isso e não crie uma lista fictícia. Quando útil, apresente separadamente os requisitos inferidos da descrição ou da documentação, identificando-os como contexto e não como critérios formalmente definidos.

### 5. Avaliar testes e CI

1. Identifique os testes existentes e os testes adicionados ou modificados pelo PR.
2. Consulte os checks de CI associados ao commit atual do PR, quando houver acesso.
3. Confirme, quando os dados estiverem disponíveis, se o SHA validado pelo check corresponde ao HEAD atual do PR. Registre o SHA do PR e o SHA associado à execução.
4. Informe o estado observado de cada check relevante: aprovado, falhou, em execução, cancelado ou indisponível.
5. Considere a branch-base e a estrutura de PRs encadeados. Uma execução anterior a uma atualização do HEAD ou a uma mudança relevante na base não deve ser apresentada como validação do estado atual sem evidência de que continua válida.
6. Verifique se os testes cobrem os fluxos principais, casos de erro e critérios de aceite relevantes.
7. Não afirme que executou testes se apenas leu os arquivos ou consultou a CI.
8. Diferencie claramente:
   - testes executados durante a revisão;
   - checks de CI consultados;
   - testes existentes apenas no código;
   - verificações não realizadas ou indisponíveis.
9. Não repita localmente verificações já cobertas pela CI sem uma razão concreta. Se for necessário executar algo, siga as instruções do repositório e use apenas comandos de leitura ou validação que não alterem o projeto.
10. Considere CI aprovada como evidência de que os checks configurados passaram naquele commit, não como prova de ausência de bugs ou de atendimento a todos os requisitos.

### 6. Consolidar os achados

Para cada **problema confirmado**, informe:

- **Severidade:** bloqueador, alta, média ou baixa.
- **Local:** arquivo e linha(s), quando disponíveis.
- **Evidência:** comportamento observado ou trecho relevante.
- **Cenário:** condição em que o problema ocorre, quando aplicável.
- **Impacto:** consequência concreta para o usuário, sistema ou entrega.
- **Correção esperada:** direção objetiva para resolver, sem implementar a mudança.

Use severidade com critério:

- **Bloqueador:** impede uso ou entrega, causa perda/corrupção relevante de dados ou cria vulnerabilidade crítica.
- **Alta:** quebra funcionalidade importante, requisito obrigatório ou fluxo central.
- **Média:** causa falha limitada, comportamento incorreto em cenário relevante ou risco significativo.
- **Baixa:** problema localizado de menor impacto, sem bloquear o fluxo principal.

Não transforme hipóteses em defeitos confirmados. Se algo depender de uma condição ainda não comprovada, apresente em **Riscos condicionais**, explicando a condição necessária e por que ela merece atenção. Sugestões de melhoria que não correspondam a defeitos devem ficar em seção separada.

Antes de finalizar, revise cada apontamento e confirme:

- a evidência realmente sustenta a afirmação?
- o problema foi introduzido pelo PR analisado, e não herdado da base?
- o impacto está explicado sem exagero?
- existe informação suficiente para localizar e reproduzir o cenário?
- o apontamento é acionável e não apenas uma preferência?

Remova apontamentos que não passem por essa checagem ou reclassifique-os como riscos/sugestões.

## Formato do relatório

# Revisão do PR #N

**Resultado:** requer correções / sem problemas confirmados — pronto para revisão humana / inconclusivo.

**Contexto:** branch-base, branch de origem e SHA do HEAD analisado.

## Resumo

Explique em poucas frases o que o PR altera e o estado geral da revisão.

## Qualidade dos requisitos

Informe se a issue foi localizada, se há critérios de aceite e se são claros e verificáveis. Registre lacunas sem inventar requisitos.

## Problemas encontrados

Liste primeiro os problemas confirmados de maior severidade. Para cada um, apresente severidade, local, evidência, cenário, impacto e correção esperada. Se não houver problemas confirmados, declare isso explicitamente.

## Riscos condicionais

Liste hipóteses plausíveis que dependem de condições ainda não comprovadas. Explique a condição e a evidência disponível.

## Sugestões

Liste melhorias opcionais que não representam defeitos nem bloqueiam a entrega.

## Critérios de aceite

Para cada critério explícito da issue:
- **Classificação:** atendido / não atendido / não verificável.
- **Justificativa:** evidência e referência.

Se não houver critérios explícitos, declare: "A issue não define critérios de aceite verificáveis."

## Testes e CI

Informe:
- SHA do HEAD revisado;
- checks consultados e seus estados;
- SHA validado por cada check, quando disponível;
- testes executados durante a revisão;
- cobertura relevante existente;
- verificações não realizadas.

## Limitações

Registre informações, ambientes, arquivos, histórico ou checks inacessíveis e como isso afeta a confiança da revisão.

## Conclusão

Diga se há problemas confirmados que precisam ser corrigidos antes da aprovação humana. A decisão final continua sendo da equipe.

## Acionamento

Quando receber um pedido de revisão, use o PR informado e siga o procedimento completo. Se o usuário fornecer apenas um link ou número, obtenha os dados restantes do próprio repositório e do PR.

Se o contexto não fornecer acesso ao GitHub, peça o diff e as informações ausentes. Não substitua a revisão por uma análise parcial sem deixar claro o que ficou de fora.
