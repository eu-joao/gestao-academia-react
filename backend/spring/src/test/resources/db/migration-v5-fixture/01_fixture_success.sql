INSERT INTO unidade (id, nome) VALUES
    (1, 'Unidade sintética');

INSERT INTO plano (id, tipo) VALUES
    (1, 'MENSAL'),
    (2, 'TRIMESTRAL'),
    (3, 'SEMESTRAL');

INSERT INTO programa_treino
    (id, nivel_experiencia, frequencia_semanal, tipo_estrutural, descricao)
VALUES
    (1,  'INICIANTE',     3, 'FULLBODY',         'Programa 1 sintético'),
    (2,  'INICIANTE',     4, 'UPPER_LOWER',      'Programa 2 sintético'),
    (3,  'INICIANTE',     5, 'PPL_UPPER_LOWER',  'Programa 3 sintético'),
    (4,  'INICIANTE',     6, 'PPL_2X',           'Programa 4 sintético'),
    (5,  'INTERMEDIARIO', 3, 'FULLBODY',         'Programa 5 sintético'),
    (6,  'INTERMEDIARIO', 4, 'UPPER_LOWER',      'Programa 6 sintético'),
    (7,  'INTERMEDIARIO', 5, 'PPL_UPPER_LOWER',  'Programa 7 sintético'),
    (8,  'INTERMEDIARIO', 6, 'PPL_2X',           'Programa 8 sintético'),
    (9,  'AVANCADO',      3, 'FULLBODY',         'Programa 9 sintético'),
    (10, 'AVANCADO',      4, 'UPPER_LOWER',      'Programa 10 sintético'),
    (11, 'AVANCADO',      5, 'PPL_UPPER_LOWER',  'Programa 11 sintético'),
    (12, 'AVANCADO',      6, 'PPL_2X',           'Programa 12 sintético');

INSERT INTO aluno
    (id, nome, email, cpf, telefone, data_nascimento, peso, altura,
     nivel_experiencia, frequencia_semanal, status)
VALUES
    (10, 'Aluno Dez',  'aluno10@example.test', '00000000010', '83999990010',
     DATE '1990-01-10', 70.00, 1.750, 'INICIANTE', 6, 'ATIVO'),
    (20, 'Aluno Vinte','aluno20@example.test', '00000000020', '83999990020',
     DATE '1992-02-20', 80.00, 1.800, 'INTERMEDIARIO', 3, 'ATIVO'),
    (30, 'Aluno Trinta','aluno30@example.test','00000000030', '83999990030',
     DATE '1994-03-30', 65.00, 1.650, 'AVANCADO', 6, 'INATIVO');

INSERT INTO contrato
    (id, aluno_id, plano_id, unidade_id, data_inicio, data_termino, status)
VALUES
    (1001, 10, 1, 1, DATE '2025-01-15', DATE '2040-12-31', 'ATIVO'),
    (1002, 20, 2, 1, DATE '2025-02-10', DATE '2041-12-31', 'ENCERRADO'),
    (1003, 30, 3, 1, DATE '2025-03-20', DATE '2042-12-31', 'CANCELADO');

INSERT INTO cobranca
    (id, contrato_id, data_vencimento, valor, data_pagamento, status)
VALUES
    (1101, 1001, DATE '2025-02-15', 120.00, NULL, 'PENDENTE'),
    (1102, 1001, DATE '2025-01-15', 120.00, DATE '2025-01-15', 'PAGO'),
    (1201, 1002, DATE '2025-03-10', 330.00, NULL, 'ATRASADO'),
    (1202, 1002, DATE '2025-01-10', 330.00, DATE '2025-01-10', 'PAGO'),
    (1301, 1003, DATE '2025-09-20', 600.00, NULL, 'CANCELADO'),
    (1302, 1003, DATE '2025-06-20', 600.00, DATE '2025-06-20', 'PAGO');

INSERT INTO dia_treino (id, programa_treino_id, nome_dia, ordem) VALUES
    (101, 4,  'Treino A', 1),
    (102, 4,  'Treino B', 2),
    (201, 5,  'Treino A', 1),
    (501, 5,  'Treino B', 2),
    (1201, 12, 'Treino A', 1);

INSERT INTO exercicio (id, nome, musculatura_alvo) VALUES
    (1, 'Supino reto', 'Peitoral'),
    (2, 'Agachamento', 'Quadríceps'),
    (3, 'Remada baixa', 'Costas');

INSERT INTO dia_treino_exercicio
    (id, dia_treino_id, exercicio_id, series, repeticoes, ordem)
VALUES
    (10001, 101, 1, 3, 10, 1),
    (10002, 101, 1, 4, 8,  2),
    (10003, 102, 2, 3, 12, 1),
    (10004, 201, 1, 3, 10, 1),
    (10005, 501, 3, 4, 10, 1),
    (10006, 1201, 2, 5, 6,  1);

INSERT INTO treino_ativo (id, aluno_id, programa_treino_id, data_inicio, status) VALUES
    (2001, 10, 1,  DATE '2025-01-01', 'ATIVO'),
    (2002, 10, 2,  DATE '2025-02-01', 'ATIVO'),
    (2005, 10, 3,  DATE '2025-01-15', 'ATIVO'),
    (2006, 10, 4,  DATE '2025-02-01', 'ATIVO'),
    (2010, 20, 5,  DATE '2025-02-05', 'ATIVO'),
    (3010, 30, 12, DATE '2025-03-05', 'ATIVO');
