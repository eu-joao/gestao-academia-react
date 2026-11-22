\if :{?scenario}
\else
\echo 'Informe -v scenario=<nome_do_cenario>'
\quit
\endif

SELECT :'scenario' IN (
    'plan_diario', 'plan_anual', 'orphan_contract_plan', 'orphan_contract_student', 'orphan_charge_contract',
    'orphan_day_program', 'orphan_active_program', 'orphan_active_student',
    'orphan_item_exercise', 'orphan_item_day', 'orphan_contract_unit',
    'duplicate_profile', 'duplicate_active_contract', 'duplicate_day_order',
    'duplicate_item_order', 'duplicate_email', 'null_email', 'overflow_height'
) AS scenario_valid
\gset

\if :scenario_valid
\else
\echo 'Cenário inválido; consulte os nomes no README.md'
\quit
\endif

WITH actions(scenario, step, command) AS (
    VALUES
        ('plan_diario', 1, 'UPDATE plano SET tipo = ''DIARIO'' WHERE id = 1'),
        ('plan_anual', 1, 'UPDATE plano SET tipo = ''ANUAL'' WHERE id = 1'),
        ('orphan_contract_plan', 1, 'ALTER TABLE contrato DROP CONSTRAINT fk_contrato_plano_v5'),
        ('orphan_contract_plan', 2, 'INSERT INTO contrato VALUES (9904, 10, 9999, 1, DATE ''2025-01-01'', DATE ''2030-01-01'', ''ENCERRADO'')'),
        ('orphan_contract_student', 1, 'ALTER TABLE contrato DROP CONSTRAINT fk_contrato_aluno_v5'),
        ('orphan_contract_student', 2, 'INSERT INTO contrato VALUES (9901, 9999, 1, 1, DATE ''2025-01-01'', DATE ''2030-01-01'', ''ENCERRADO'')'),
        ('orphan_charge_contract', 1, 'ALTER TABLE cobranca DROP CONSTRAINT fk_cobranca_contrato_v5'),
        ('orphan_charge_contract', 2, 'INSERT INTO cobranca VALUES (9901, 9999, DATE ''2025-01-01'', 1.00, NULL, ''PENDENTE'')'),
        ('orphan_day_program', 1, 'ALTER TABLE dia_treino DROP CONSTRAINT fk_dia_programa_v5'),
        ('orphan_day_program', 2, 'INSERT INTO dia_treino VALUES (9901, 9999, ''Dia órfão'', 99)'),
        ('orphan_active_program', 1, 'ALTER TABLE treino_ativo DROP CONSTRAINT fk_treino_programa_v5'),
        ('orphan_active_program', 2, 'INSERT INTO treino_ativo VALUES (9901, 10, 9999, DATE ''2025-01-01'', ''ATIVO'')'),
        ('orphan_active_student', 1, 'ALTER TABLE treino_ativo DROP CONSTRAINT fk_treino_aluno_v5'),
        ('orphan_active_student', 2, 'INSERT INTO treino_ativo VALUES (9902, 9999, 4, DATE ''2025-01-01'', ''ATIVO'')'),
        ('orphan_item_exercise', 1, 'ALTER TABLE dia_treino_exercicio DROP CONSTRAINT fk_dte_exercicio_v5'),
        ('orphan_item_exercise', 2, 'INSERT INTO dia_treino_exercicio VALUES (9901, 101, 9999, 1, 10, 99)'),
        ('orphan_item_day', 1, 'ALTER TABLE dia_treino_exercicio DROP CONSTRAINT fk_dte_dia_v5'),
        ('orphan_item_day', 2, 'INSERT INTO dia_treino_exercicio VALUES (9902, 9999, 1, 1, 10, 99)'),
        ('orphan_contract_unit', 1, 'ALTER TABLE contrato DROP CONSTRAINT fk_contrato_unidade_v5'),
        ('orphan_contract_unit', 2, 'INSERT INTO contrato VALUES (9902, 10, 1, 9999, DATE ''2025-01-01'', DATE ''2030-01-01'', ''ENCERRADO'')'),
        ('duplicate_profile', 1, 'INSERT INTO programa_treino VALUES (99, ''INICIANTE'', 6, ''FULLBODY'', ''Perfil duplicado'')'),
        ('duplicate_active_contract', 1, 'INSERT INTO contrato VALUES (9903, 10, 1, 1, DATE ''2025-01-01'', DATE ''2030-01-01'', ''ATIVO'')'),
        ('duplicate_day_order', 1, 'INSERT INTO dia_treino VALUES (9902, 4, ''Ordem duplicada'', 1)'),
        ('duplicate_item_order', 1, 'INSERT INTO dia_treino_exercicio VALUES (9903, 101, 1, 2, 20, 1)'),
        ('duplicate_email', 1, 'ALTER TABLE aluno DROP CONSTRAINT uk_aluno_email_v5'),
        ('duplicate_email', 2, 'UPDATE aluno SET email = ''aluno10@example.test'' WHERE id = 20'),
        ('null_email', 1, 'UPDATE aluno SET email = NULL WHERE id = 20'),
        ('overflow_height', 1, 'UPDATE aluno SET altura = 999.999 WHERE id = 10')
)
SELECT command
  FROM actions
 WHERE scenario = :'scenario'
 ORDER BY step
\gexec
