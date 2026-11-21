DO $$
DECLARE
    diferencas_itens integer;
BEGIN
    IF (SELECT count(*) FROM aluno) <> 3
        OR (SELECT count(*) FROM programa_treino) <> 12
        OR (SELECT count(*) FROM dia_treino) <> 5
        OR (SELECT count(*) FROM item_treino) <> 6
        OR (SELECT count(*) FROM contrato) <> 3
        OR (SELECT count(*) FROM cobranca) <> 6
        OR (SELECT count(*) FROM sessao_treino) <> 0 THEN
        RAISE EXCEPTION 'Contagens V6 divergentes das esperadas';
    END IF;

    IF NOT EXISTS (
        SELECT 1
          FROM information_schema.columns
         WHERE table_schema = current_schema()
           AND table_name = 'dia_treino'
           AND column_name = 'nome'
    ) OR EXISTS (
        SELECT 1
          FROM information_schema.columns
         WHERE table_schema = current_schema()
           AND table_name = 'dia_treino'
           AND column_name = 'nome_dia'
    ) THEN
        RAISE EXCEPTION 'Estrutura de dia_treino divergente: deve conter nome e não nome_dia';
    END IF;

    IF EXISTS (SELECT 1 FROM dia_treino WHERE nome IS NULL) THEN
        RAISE EXCEPTION 'Há dias de treino sem nome migrado';
    END IF;

    IF EXISTS (
        WITH esperados(id, nome) AS (
            VALUES
                (101::bigint, 'Treino A'::varchar),
                (102::bigint, 'Treino B'::varchar),
                (201::bigint, 'Treino A'::varchar),
                (501::bigint, 'Treino B'::varchar),
                (1201::bigint, 'Treino A'::varchar)
        ),
        atuais AS (
            SELECT id, nome FROM dia_treino
        ),
        faltantes AS (SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais),
        inesperados AS (SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados)
        SELECT 1 FROM faltantes UNION ALL SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Nomes dos cinco dias não correspondem aos valores originais da fixture';
    END IF;

    IF EXISTS (
        WITH esperados(id, nome, email, cpf, telefone, data_nascimento, peso, altura,
                       nivel_experiencia, frequencia_semanal, status, google_subject,
                       programa_atual_id) AS (
            VALUES
                (10::bigint, 'Aluno Dez'::varchar, 'aluno10@example.test'::varchar,
                 '00000000010'::varchar, '83999990010'::varchar, DATE '1990-01-10',
                 70.00::numeric, 1.75::numeric, 'INICIANTE'::varchar, 6, 'ATIVO'::varchar,
                 NULL::varchar, 4::bigint),
                (20::bigint, 'Aluno Vinte'::varchar, 'aluno20@example.test'::varchar,
                 '00000000020'::varchar, '83999990020'::varchar, DATE '1992-02-20',
                 80.00::numeric, 1.80::numeric, 'INTERMEDIARIO'::varchar, 3, 'ATIVO'::varchar,
                 NULL::varchar, 5::bigint),
                (30::bigint, 'Aluno Trinta'::varchar, 'aluno30@example.test'::varchar,
                 '00000000030'::varchar, '83999990030'::varchar, DATE '1994-03-30',
                 65.00::numeric, 1.65::numeric, 'AVANCADO'::varchar, 6, 'INATIVO'::varchar,
                 NULL::varchar, 12::bigint)
        ),
        atuais AS (
            SELECT id, nome, email, cpf, telefone, data_nascimento, peso, altura,
                   nivel_experiencia, frequencia_semanal, status, google_subject,
                   programa_atual_id
              FROM aluno
        ),
        faltantes AS (SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais),
        inesperados AS (SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados)
        SELECT 1 FROM faltantes UNION ALL SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Dados preservados/convertidos de aluno divergentes';
    END IF;

    IF EXISTS (
        WITH esperados(id, nivel_experiencia, frequencia_semanal, tipo_estrutural, descricao) AS (
            VALUES
                (1::bigint, 'INICIANTE'::varchar, 3, 'FULLBODY'::varchar, 'Programa 1 sintético'::varchar),
                (2::bigint, 'INICIANTE'::varchar, 4, 'UPPER_LOWER'::varchar, 'Programa 2 sintético'::varchar),
                (3::bigint, 'INICIANTE'::varchar, 5, 'PPL_UPPER_LOWER'::varchar, 'Programa 3 sintético'::varchar),
                (4::bigint, 'INICIANTE'::varchar, 6, 'PPL_2X'::varchar, 'Programa 4 sintético'::varchar),
                (5::bigint, 'INTERMEDIARIO'::varchar, 3, 'FULLBODY'::varchar, 'Programa 5 sintético'::varchar),
                (6::bigint, 'INTERMEDIARIO'::varchar, 4, 'UPPER_LOWER'::varchar, 'Programa 6 sintético'::varchar),
                (7::bigint, 'INTERMEDIARIO'::varchar, 5, 'PPL_UPPER_LOWER'::varchar, 'Programa 7 sintético'::varchar),
                (8::bigint, 'INTERMEDIARIO'::varchar, 6, 'PPL_2X'::varchar, 'Programa 8 sintético'::varchar),
                (9::bigint, 'AVANCADO'::varchar, 3, 'FULLBODY'::varchar, 'Programa 9 sintético'::varchar),
                (10::bigint, 'AVANCADO'::varchar, 4, 'UPPER_LOWER'::varchar, 'Programa 10 sintético'::varchar),
                (11::bigint, 'AVANCADO'::varchar, 5, 'PPL_UPPER_LOWER'::varchar, 'Programa 11 sintético'::varchar),
                (12::bigint, 'AVANCADO'::varchar, 6, 'PPL_2X'::varchar, 'Programa 12 sintético'::varchar)
        ),
        atuais AS (
            SELECT id, nivel_experiencia, frequencia_semanal, tipo_estrutural, descricao
              FROM programa_treino
        ),
        faltantes AS (SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais),
        inesperados AS (SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados)
        SELECT 1 FROM faltantes UNION ALL SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Dados de programa_treino divergentes';
    END IF;

    IF EXISTS (
        WITH esperados(id, aluno_id, plano, data_inicio, data_termino, status,
                       legacy_plano_id, legacy_unidade_id) AS (
            VALUES
                (1001::bigint, 10::bigint, 'MENSAL'::varchar, DATE '2025-01-15',
                 DATE '2025-02-15', 'ATIVO'::varchar, 1::bigint, 1::bigint),
                (1002::bigint, 20::bigint, 'TRIMESTRAL'::varchar, DATE '2025-02-10',
                 DATE '2025-05-10', 'ENCERRADO'::varchar, 2::bigint, 1::bigint),
                (1003::bigint, 30::bigint, 'SEMESTRAL'::varchar, DATE '2025-03-20',
                 DATE '2025-09-20', 'CANCELADO'::varchar, 3::bigint, 1::bigint)
        ),
        atuais AS (
            SELECT id, aluno_id, plano, data_inicio, data_termino, status,
                   legacy_plano_id, legacy_unidade_id
              FROM contrato
        ),
        faltantes AS (SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais),
        inesperados AS (SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados)
        SELECT 1 FROM faltantes UNION ALL SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Dados preservados/convertidos de contrato divergentes';
    END IF;

    IF EXISTS (
        WITH esperados(id, contrato_id, data_vencimento, valor, data_pagamento, status,
                       numero_parcela) AS (
            VALUES
                (1101::bigint, 1001::bigint, DATE '2025-02-15', 120.00::numeric, NULL::date,
                 'PENDENTE'::varchar, 2),
                (1102::bigint, 1001::bigint, DATE '2025-01-15', 120.00::numeric, DATE '2025-01-15',
                 'PAGO'::varchar, 1),
                (1201::bigint, 1002::bigint, DATE '2025-03-10', 330.00::numeric, NULL::date,
                 'ATRASADO'::varchar, 2),
                (1202::bigint, 1002::bigint, DATE '2025-01-10', 330.00::numeric, DATE '2025-01-10',
                 'PAGO'::varchar, 1),
                (1301::bigint, 1003::bigint, DATE '2025-09-20', 600.00::numeric, NULL::date,
                 'CANCELADO'::varchar, 2),
                (1302::bigint, 1003::bigint, DATE '2025-06-20', 600.00::numeric, DATE '2025-06-20',
                 'PAGO'::varchar, 1)
        ),
        atuais AS (
            SELECT id, contrato_id, data_vencimento, valor, data_pagamento, status, numero_parcela
              FROM cobranca
        ),
        faltantes AS (SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais),
        inesperados AS (SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados)
        SELECT 1 FROM faltantes UNION ALL SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Dados preservados/convertidos de cobranca divergentes';
    END IF;

    IF EXISTS (
        WITH esperados(id, programa_treino_id, nome, ordem) AS (
            VALUES
                (101::bigint, 4::bigint, 'Treino A'::varchar, 1),
                (102::bigint, 4::bigint, 'Treino B'::varchar, 2),
                (201::bigint, 5::bigint, 'Treino A'::varchar, 1),
                (501::bigint, 5::bigint, 'Treino B'::varchar, 2),
                (1201::bigint, 12::bigint, 'Treino A'::varchar, 1)
        ),
        atuais AS (
            SELECT id, programa_treino_id, nome, ordem FROM dia_treino
        ),
        faltantes AS (SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais),
        inesperados AS (SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados)
        SELECT 1 FROM faltantes UNION ALL SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Dados preservados/convertidos de dia_treino divergentes';
    END IF;

    IF EXISTS (
        WITH esperados(aluno_id, programa_treino_id) AS (
            VALUES (10::bigint, 4::bigint), (20::bigint, 5::bigint), (30::bigint, 12::bigint)
        ),
        atuais AS (
            SELECT id AS aluno_id, programa_atual_id AS programa_treino_id FROM aluno
        ),
        faltantes AS (
            SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais
        ),
        inesperados AS (
            SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados
        )
        SELECT 1 FROM faltantes
        UNION ALL
        SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Programa atual divergente; aluno 10 deve selecionar programa 4 pelo desempate data_inicio DESC, id DESC';
    END IF;

    IF EXISTS (
        WITH esperados(contrato_id, plano, data_termino) AS (
            VALUES
                (1001::bigint, 'MENSAL'::varchar,     DATE '2025-02-15'),
                (1002::bigint, 'TRIMESTRAL'::varchar, DATE '2025-05-10'),
                (1003::bigint, 'SEMESTRAL'::varchar,  DATE '2025-09-20')
        ),
        atuais AS (
            SELECT id, plano, data_termino FROM contrato
        ),
        faltantes AS (
            SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais
        ),
        inesperados AS (
            SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados
        )
        SELECT 1 FROM faltantes
        UNION ALL
        SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Planos ou datas recalculadas de contrato divergentes';
    END IF;

    IF EXISTS (
        WITH esperados(cobranca_id, numero_parcela) AS (
            VALUES
                (1101::bigint, 2), (1102::bigint, 1),
                (1201::bigint, 2), (1202::bigint, 1),
                (1301::bigint, 2), (1302::bigint, 1)
        ),
        atuais AS (
            SELECT id, numero_parcela FROM cobranca
        ),
        faltantes AS (
            SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais
        ),
        inesperados AS (
            SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados
        )
        SELECT 1 FROM faltantes
        UNION ALL
        SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Numeração de parcelas divergente';
    END IF;

    IF EXISTS (
        WITH esperados(dia_treino_id, nome_exercicio, musculatura_alvo, series, repeticoes, ordem) AS (
            VALUES
                (101::bigint, 'Supino reto'::varchar, 'Peitoral'::varchar, 3, '10'::varchar, 1),
                (101::bigint, 'Supino reto'::varchar, 'Peitoral'::varchar, 4, '8'::varchar,  2),
                (102::bigint, 'Agachamento'::varchar, 'Quadríceps'::varchar, 3, '12'::varchar, 1),
                (201::bigint, 'Supino reto'::varchar, 'Peitoral'::varchar, 3, '10'::varchar, 1),
                (501::bigint, 'Remada baixa'::varchar, 'Costas'::varchar, 4, '10'::varchar, 1),
                (1201::bigint, 'Agachamento'::varchar, 'Quadríceps'::varchar, 5, '6'::varchar, 1)
        ),
        atuais AS (
            SELECT dia_treino_id, nome_exercicio, musculatura_alvo, series, repeticoes, ordem
              FROM item_treino
        ),
        faltantes AS (
            SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais
        ),
        inesperados AS (
            SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados
        )
        SELECT 1 FROM faltantes
        UNION ALL
        SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Itens migrados ausentes, inesperados, duplicados ou com atributos divergentes';
    END IF;

    SELECT count(*) INTO diferencas_itens
      FROM item_treino
     WHERE nome_exercicio = 'Supino reto';
    IF diferencas_itens <> 3
        OR (SELECT count(*) FROM item_treino
             WHERE dia_treino_id = 101 AND nome_exercicio = 'Supino reto') <> 2
        OR (SELECT count(DISTINCT (series, repeticoes)) FROM item_treino
             WHERE dia_treino_id = 101 AND nome_exercicio = 'Supino reto') <> 2 THEN
        RAISE EXCEPTION 'Reutilização legítima do exercício Supino reto não foi preservada';
    END IF;

    IF (SELECT count(*) FROM legacy_v5_unidade) <> 1
        OR (SELECT count(*) FROM legacy_v5_plano) <> 3
        OR (SELECT count(*) FROM legacy_v5_exercicio) <> 3
        OR (SELECT count(*) FROM legacy_v5_dia_treino_exercicio) <> 6
        OR (SELECT count(*) FROM legacy_v5_treino_ativo) <> 6 THEN
        RAISE EXCEPTION 'Tabelas legadas renomeadas ou contagens preservadas divergentes';
    END IF;

    IF EXISTS (
        WITH esperados(id, nome) AS (
            VALUES (1::bigint, 'Unidade sintética'::varchar)
        ),
        atuais AS (
            SELECT id, nome FROM legacy_v5_unidade
        )
        SELECT 1 FROM (SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais) ausentes
        UNION ALL
        SELECT 1 FROM (SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados) inesperados
    ) THEN
        RAISE EXCEPTION 'Dados da tabela legada unidade não foram preservados integralmente';
    END IF;

    IF EXISTS (
        WITH esperados(id, tipo) AS (
            VALUES
                (1::bigint, 'MENSAL'::varchar),
                (2::bigint, 'TRIMESTRAL'::varchar),
                (3::bigint, 'SEMESTRAL'::varchar)
        ),
        atuais AS (
            SELECT id, tipo FROM legacy_v5_plano
        )
        SELECT 1 FROM (SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais) ausentes
        UNION ALL
        SELECT 1 FROM (SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados) inesperados
    ) THEN
        RAISE EXCEPTION 'Dados da tabela legada plano não foram preservados integralmente';
    END IF;

    IF EXISTS (
        WITH esperados(id, programa_treino_id, nome, ordem) AS (
            VALUES
                (101::bigint, 4::bigint, 'Treino A'::varchar, 1),
                (102::bigint, 4::bigint, 'Treino B'::varchar, 2),
                (201::bigint, 5::bigint, 'Treino A'::varchar, 1),
                (501::bigint, 5::bigint, 'Treino B'::varchar, 2),
                (1201::bigint, 12::bigint, 'Treino A'::varchar, 1)
        ),
        atuais AS (
            SELECT id, programa_treino_id, nome, ordem FROM dia_treino
        ),
        faltantes AS (
            SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais
        ),
        inesperados AS (
            SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados
        )
        SELECT 1 FROM faltantes
        UNION ALL
        SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Dias de treino ou seus programas/ordens divergentes';
    END IF;

    IF EXISTS (
        WITH esperados(id, aluno_id) AS (
            VALUES (1001::bigint, 10::bigint), (1002::bigint, 20::bigint), (1003::bigint, 30::bigint)
        ),
        atuais AS (
            SELECT id, aluno_id FROM contrato
        ),
        faltantes AS (
            SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais
        ),
        inesperados AS (
            SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados
        )
        SELECT 1 FROM faltantes
        UNION ALL
        SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Associação dos contratos aos alunos divergente';
    END IF;

    IF EXISTS (
        WITH esperados(id, contrato_id) AS (
            VALUES
                (1101::bigint, 1001::bigint), (1102::bigint, 1001::bigint),
                (1201::bigint, 1002::bigint), (1202::bigint, 1002::bigint),
                (1301::bigint, 1003::bigint), (1302::bigint, 1003::bigint)
        ),
        atuais AS (
            SELECT id, contrato_id FROM cobranca
        ),
        faltantes AS (
            SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais
        ),
        inesperados AS (
            SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados
        )
        SELECT 1 FROM faltantes
        UNION ALL
        SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Associação das cobranças aos contratos divergente';
    END IF;

    IF EXISTS (
        WITH esperados(id, nome, musculatura_alvo) AS (
            VALUES
                (1::bigint, 'Supino reto'::varchar, 'Peitoral'::varchar),
                (2::bigint, 'Agachamento'::varchar, 'Quadríceps'::varchar),
                (3::bigint, 'Remada baixa'::varchar, 'Costas'::varchar)
        ),
        atuais AS (
            SELECT id, nome, musculatura_alvo FROM legacy_v5_exercicio
        ),
        faltantes AS (
            SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais
        ),
        inesperados AS (
            SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados
        )
        SELECT 1 FROM faltantes
        UNION ALL
        SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Dados do catálogo legado de exercícios não foram preservados';
    END IF;

    IF EXISTS (
        WITH esperados(id, dia_treino_id, exercicio_id, series, repeticoes, ordem) AS (
            VALUES
                (10001::bigint, 101::bigint, 1::bigint, 3, 10, 1),
                (10002::bigint, 101::bigint, 1::bigint, 4, 8,  2),
                (10003::bigint, 102::bigint, 2::bigint, 3, 12, 1),
                (10004::bigint, 201::bigint, 1::bigint, 3, 10, 1),
                (10005::bigint, 501::bigint, 3::bigint, 4, 10, 1),
                (10006::bigint, 1201::bigint, 2::bigint, 5, 6, 1)
        ),
        atuais AS (
            SELECT id, dia_treino_id, exercicio_id, series, repeticoes, ordem
              FROM legacy_v5_dia_treino_exercicio
        ),
        faltantes AS (
            SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais
        ),
        inesperados AS (
            SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados
        )
        SELECT 1 FROM faltantes
        UNION ALL
        SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Relações legadas dia/exercício ou configurações não foram preservadas';
    END IF;

    IF EXISTS (
        WITH esperados(id, aluno_id, programa_treino_id, data_inicio, status) AS (
            VALUES
                (2001::bigint, 10::bigint, 1::bigint, DATE '2025-01-01', 'ATIVO'::varchar),
                (2002::bigint, 10::bigint, 2::bigint, DATE '2025-02-01', 'ATIVO'::varchar),
                (2005::bigint, 10::bigint, 3::bigint, DATE '2025-01-15', 'ATIVO'::varchar),
                (2006::bigint, 10::bigint, 4::bigint, DATE '2025-02-01', 'ATIVO'::varchar),
                (2010::bigint, 20::bigint, 5::bigint, DATE '2025-02-05', 'ATIVO'::varchar),
                (3010::bigint, 30::bigint, 12::bigint, DATE '2025-03-05', 'ATIVO'::varchar)
        ),
        atuais AS (
            SELECT id, aluno_id, programa_treino_id, data_inicio, status
              FROM legacy_v5_treino_ativo
        ),
        faltantes AS (
            SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais
        ),
        inesperados AS (
            SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados
        )
        SELECT 1 FROM faltantes
        UNION ALL
        SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Dados legados de treino ativo não foram preservados';
    END IF;

    IF EXISTS (
        WITH esperadas(nome, tabela_origem, coluna_origem, tabela_destino, coluna_destino) AS (
            VALUES
                ('fk_aluno_programa_atual', 'aluno', 'programa_atual_id', 'programa_treino', 'id'),
                ('fk_contrato_aluno', 'contrato', 'aluno_id', 'aluno', 'id'),
                ('fk_cobranca_contrato', 'cobranca', 'contrato_id', 'contrato', 'id'),
                ('fk_dia_programa', 'dia_treino', 'programa_treino_id', 'programa_treino', 'id'),
                ('fk_item_dia', 'item_treino', 'dia_treino_id', 'dia_treino', 'id'),
                ('fk_sessao_aluno', 'sessao_treino', 'aluno_id', 'aluno', 'id'),
                ('fk_sessao_programa', 'sessao_treino', 'programa_treino_id', 'programa_treino', 'id'),
                ('fk_sessao_dia', 'sessao_treino', 'dia_treino_id', 'dia_treino', 'id')
        )
        SELECT 1
          FROM esperadas e
         WHERE NOT EXISTS (
             SELECT 1
               FROM pg_catalog.pg_constraint c
               JOIN pg_catalog.pg_class origem
                 ON origem.oid = c.conrelid
               JOIN pg_catalog.pg_namespace schema_origem
                 ON schema_origem.oid = origem.relnamespace
               JOIN pg_catalog.pg_class destino
                 ON destino.oid = c.confrelid
               JOIN pg_catalog.pg_namespace schema_destino
                 ON schema_destino.oid = destino.relnamespace
              WHERE c.conname = e.nome
                AND c.contype = 'f'
                AND c.convalidated
                AND origem.relname = e.tabela_origem
                AND schema_origem.nspname = current_schema()
                AND destino.relname = e.tabela_destino
                AND schema_destino.nspname = current_schema()
                AND c.conkey = ARRAY[(
                    SELECT a.attnum
                      FROM pg_catalog.pg_attribute a
                     WHERE a.attrelid = c.conrelid
                       AND a.attname = e.coluna_origem
                       AND NOT a.attisdropped
                )]::smallint[]
                AND c.confkey = ARRAY[(
                    SELECT a.attnum
                      FROM pg_catalog.pg_attribute a
                     WHERE a.attrelid = c.confrelid
                       AND a.attname = e.coluna_destino
                       AND NOT a.attisdropped
                )]::smallint[]
         )
    ) THEN
        RAISE EXCEPTION 'Uma ou mais FKs do schema V6 estão ausentes, incompatíveis ou não validadas';
    END IF;
END $$;

SELECT
    (SELECT count(*) FROM aluno) AS alunos,
    (SELECT count(*) FROM programa_treino) AS programas,
    (SELECT count(*) FROM dia_treino) AS dias,
    (SELECT count(*) FROM item_treino) AS itens,
    (SELECT count(*) FROM contrato) AS contratos,
    (SELECT count(*) FROM cobranca) AS cobrancas,
    (SELECT count(*) FROM sessao_treino) AS sessoes;

SELECT id AS aluno_id, programa_atual_id
  FROM aluno
 ORDER BY id;

SELECT contrato_id, numero_parcela, data_vencimento
  FROM cobranca
 ORDER BY contrato_id, numero_parcela;

SELECT id, plano, data_inicio, data_termino, status
  FROM contrato
 ORDER BY id;
