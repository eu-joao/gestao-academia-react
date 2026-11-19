# Escopo e Backlog — Gestão de Treinos

**Versão:** V6

Este documento separa o que deve compor a primeira entrega do que pode permanecer no backlog. As issues devem representar entregas verificáveis, não cada atributo ou regra isolada.

## 1. Entregas essenciais — primeira versão

| Ordem | Issue sugerida | Resultado esperado |
|---|---|---|
| 1 | Adequar cadastro e autenticação do aluno ao minimundo V6 | Cadastro com dados físicos, nível, frequência e autenticação Google. |
| 2 | Implementar planos fixos e contratos | Enum de planos, criação de contrato, vigência e restrição de contrato ativo duplicado. |
| 3 | Implementar geração e controle de cobranças | Geração das parcelas, consulta de status e identificação de atrasos. |
| 4 | Implementar pagamento fictício no aplicativo | Aluno consegue simular o pagamento de uma cobrança própria. |
| 5 | Estruturar os programas e dias de treino | Carga inicial dos doze programas, dias e itens de treino. |
| 6 | Implementar atribuição e consulta do programa atual | Seleção automática e substituição manual pelo personal. |
| 7 | Implementar registro e sequência das sessões | Consulta do próximo dia, conclusão e histórico de sessões. |
| 8 | Implementar painel de acompanhamento do personal | Listagem de alunos e indicadores de assiduidade e financeiro. |

## 2. Funcionalidades opcionais — backlog

| Issue sugerida | Resultado esperado |
|---|---|
| Adicionar histórico de peso e gráfico de evolução | Registrar medições e visualizar a evolução corporal. |
| Implementar histórico de programas do aluno | Consultar programas anteriores e períodos de utilização. |
| Implementar notificações internas | Avisos de vencimento, atraso, pagamento e novo treino. |
| Permitir personalização dos exercícios | Personal edita itens, séries e repetições dos programas/alunos. |
| Registrar carga por exercício | Aluno informa a carga utilizada em cada sessão. |

## 3. Organização das issues

Labels sugeridas:

- `essencial` — necessária para a primeira entrega;
- `opcional` — melhoria que pode ficar para depois;
- `backend` — alterações no servidor;
- `web` — alterações no portal do personal;
- `mobile` — alterações no aplicativo do aluno.

As issues essenciais devem ser criadas primeiro e priorizadas conforme as dependências. As opcionais podem permanecer no backlog sem comprometer a definição da primeira entrega.

## 4. Pontos para validação da equipe

- Confirmar os valores mensais e as durações dos três planos antes de defini-los no enum.
- Confirmar se a autenticação será exclusivamente Google, considerando o prazo e a infraestrutura disponível.
- Confirmar se os doze programas e seus exercícios já estão definidos e prontos para carga inicial.
- Confirmar se o pagamento simulado será suficiente para a avaliação.
- Confirmar com o professor se os indicadores financeiros e de assiduidade são obrigatórios na primeira entrega.
