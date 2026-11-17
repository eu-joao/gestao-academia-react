# Modelo de Dados — Gestão de Treinos

**Versão:** V6

O modelo inicial utiliza sete entidades persistidas. `Plano` é um enum do backend, não uma entidade/tabela. Os exercícios são representados por itens pertencentes a um dia de treino.

## 1. Entidades e atributos

| Entidade | Principais atributos |
|---|---|
| **Aluno** | id, nome, email, peso, altura, nivelExperiencia, frequenciaSemanal, status, programaAtual |
| **Contrato** | id, aluno, plano (enum), dataInicio, dataTermino, status |
| **Cobranca** | id, contrato, numeroParcela, dataVencimento, valor, status, dataPagamento |
| **ProgramaTreino** | id, nivelExperiencia, frequenciaSemanal, tipoEstrutural, descricao |
| **DiaTreino** | id, programa, nome, ordem |
| **ItemTreino** | id, diaTreino, nomeExercicio, musculaturaAlvo, series, repeticoes, ordem |
| **SessaoTreino** | id, aluno, programa, diaTreino, dataHoraConclusao |

## 2. Decisões de modelagem

### Plano como enum

O backend define as três opções fixas (mensal, trimestral e semestral), com tipo, duração e valor mensal. Não haverá tabela, CRUD ou manutenção de planos pelo portal.

### Itens de treino

Não haverá entidade global `Exercicio`. Cada `ItemTreino` guarda o nome, a musculatura, as séries, as repetições e a ordem daquele exercício em um dia específico. Assim, o mesmo exercício pode ter configurações diferentes em dias distintos.

### Programa atual do aluno

`Aluno` mantém uma referência para o programa atualmente atribuído. Não haverá entidade `TreinoAtivo` nem histórico de atribuições nesta versão.

### Sessões

`SessaoTreino` referencia aluno, programa e dia realizados, além da data/hora de conclusão. A referência ao programa registra qual programa foi executado, mesmo que o programa atual do aluno seja alterado depois.

### Peso

O peso atual é armazenado diretamente em `Aluno`. Não haverá entidade `MedicaoCorporal` nesta versão.

## 3. Diagrama

O diagrama completo está no documento [diagrama-er.md](diagrama-er.md), em um bloco Mermaid dentro de Markdown.
