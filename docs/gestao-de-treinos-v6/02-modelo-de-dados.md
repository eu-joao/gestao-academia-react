# Modelo de Dados — Gestão de Treinos

**Versão:** V6

O modelo utiliza entidades persistidas para a administração do personal e para o gerenciamento de treinos offline-first no aplicativo móvel. `Plano` é um enum do backend, não uma entidade/tabela. Os exercícios do programa predefinido são representados por itens pertencentes a um dia de treino.

## 1. Entidades e atributos

| Entidade           | Principais atributos                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| **Aluno**          | id, nome, email, peso, altura, nivelExperiencia, frequenciaSemanal, status, programaAtual             |
| **Contrato**       | id, aluno, plano (enum), dataInicio, dataTermino, status                                              |
| **Cobranca**       | id, contrato, numeroParcela, dataVencimento, valor, status, dataPagamento                             |
| **ProgramaTreino** | id, nivelExperiencia, frequenciaSemanal, tipoEstrutural, descricao                                    |
| **DiaTreino**      | id, programa, nome, ordem                                                                             |
| **ItemTreino**     | id, diaTreino, nomeExercicio, musculaturaAlvo, series, repeticoes, ordem                              |
| **SessaoTreino**   | id, aluno, programa, diaTreino, dataHoraConclusao                                                     |
| **Treino**         | id (UUID), aluno (FK opcional), nome, categoria, diaSemana, duracaoMin, ativo, criadoEm, atualizadoEm |

## 2. Decisões de modelagem

### Plano como enum

O backend define as três opções fixas (mensal, trimestral e semestral), com tipo, duração e valor mensal. Não haverá tabela, CRUD ou manutenção de planos pelo portal.

### Itens de treino

Não haverá entidade global `Exercicio`. Cada `ItemTreino` guarda o nome, a musculatura, as séries, as repetições e a ordem daquele exercício em um dia específico. Assim, o mesmo exercício pode ter configurações diferentes em dias distintos.

### Programa atual do aluno

`Aluno` mantém uma referência para o programa atualmente atribuído. Não haverá entidade `TreinoAtivo` nem histórico de atribuições nesta versão.

### Sessões

`SessaoTreino` referencia aluno, programa e dia realizados, além da data/hora de conclusão. A referência ao programa registra qual programa foi executado, mesmo que o programa atual do aluno seja alterado depois.

### Treinos mobile e chave primária UUID

A entidade `Treino` atende à gestão de treinos do aplicativo móvel com persistência na nuvem e suporte à arquitetura offline-first. Para viabilizar a criação de registros no dispositivo do aluno sem conexão com a internet e sem conflitos de concorrência com o servidor, sua chave primária é do tipo `UUID` (RFC 4122 v4), gerada no próprio cliente antes da sincronização.

A exclusão de treinos no servidor é lógica (`ativo = false`), garantindo idempotência no processamento da fila de sincronização em lote e preservando a integridade referencial com os dados do aluno.

### Peso

O peso atual é armazenado diretamente em `Aluno`. Não haverá entidade `MedicaoCorporal` nesta versão.

## 3. Diagrama

O diagrama completo está no documento [diagrama-er.md](diagrama-er.md), em um bloco Mermaid dentro de Markdown.
