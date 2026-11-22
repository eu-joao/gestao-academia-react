# Diagrama Entidade-Relacionamento (ER)

Diagrama do modelo de dados da versão V6 com suporte à gestão de treinos mobile e persistência na nuvem. O conteúdo está em Mermaid para facilitar a visualização em editores compatíveis.

```mermaid
erDiagram
    ALUNO {
        bigint id PK
        string nome
        string email
        decimal peso
        decimal altura
        string nivelExperiencia
        int frequenciaSemanal
        string status
        bigint programaAtualId FK
    }

    CONTRATO {
        bigint id PK
        bigint alunoId FK
        string plano
        date dataInicio
        date dataTermino
        string status
    }

    COBRANCA {
        bigint id PK
        bigint contratoId FK
        int numeroParcela
        date dataVencimento
        decimal valor
        string status
        date dataPagamento
    }

    PROGRAMA_TREINO {
        bigint id PK
        string nivelExperiencia
        int frequenciaSemanal
        string tipoEstrutural
        string descricao
    }

    DIA_TREINO {
        bigint id PK
        bigint programaId FK
        string nome
        int ordem
    }

    ITEM_TREINO {
        bigint id PK
        bigint diaTreinoId FK
        string nomeExercicio
        string musculaturaAlvo
        int series
        string repeticoes
        int ordem
    }

    SESSAO_TREINO {
        bigint id PK
        bigint alunoId FK
        bigint programaId FK
        bigint diaTreinoId FK
        datetime dataHoraConclusao
    }

    TREINO {
        uuid id PK
        bigint alunoId FK
        string nome
        string categoria
        string diaSemana
        int duracaoMin
        boolean ativo
        datetime criadoEm
        datetime atualizadoEm
    }

    PROGRAMA_TREINO ||--o{ ALUNO : "programa atual"
    ALUNO ||--o{ CONTRATO : possui
    CONTRATO ||--|{ COBRANCA : gera
    PROGRAMA_TREINO ||--|{ DIA_TREINO : contem
    DIA_TREINO ||--|{ ITEM_TREINO : possui
    ALUNO ||--o{ SESSAO_TREINO : realiza
    PROGRAMA_TREINO ||--o{ SESSAO_TREINO : identifica
    DIA_TREINO ||--o{ SESSAO_TREINO : registra
    ALUNO ||--o{ TREINO : cadastra
```
