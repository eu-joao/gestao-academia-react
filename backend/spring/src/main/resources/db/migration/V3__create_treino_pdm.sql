CREATE TABLE treino (
    id uuid PRIMARY KEY,
    nome varchar(255) NOT NULL,
    categoria varchar(100),
    dia_semana varchar(50) NOT NULL,
    duracao_min integer NOT NULL,
    aluno_id bigint,
    criado_em timestamp without time zone NOT NULL,
    atualizado_em timestamp without time zone NOT NULL,
    ativo boolean NOT NULL DEFAULT true,
    CONSTRAINT fk_treino_aluno FOREIGN KEY (aluno_id) REFERENCES aluno(id) ON DELETE SET NULL
);

CREATE INDEX idx_treino_aluno_ativo ON treino (aluno_id, ativo);
CREATE INDEX idx_treino_dia_semana ON treino (dia_semana);
CREATE INDEX idx_treino_atualizado_em ON treino (atualizado_em);
