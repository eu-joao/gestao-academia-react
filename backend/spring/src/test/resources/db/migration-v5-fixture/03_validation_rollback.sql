DO $$
DECLARE
    altura_precision integer;
    altura_scale integer;
BEGIN
    SELECT numeric_precision, numeric_scale
      INTO altura_precision, altura_scale
      FROM information_schema.columns
     WHERE table_schema = current_schema()
       AND table_name = 'aluno'
       AND column_name = 'altura';

    IF altura_precision IS DISTINCT FROM 6 OR altura_scale IS DISTINCT FROM 3 THEN
        RAISE EXCEPTION 'Rollback incompleto: altura não voltou a numeric(6,3)';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = current_schema()
           AND ((table_name = 'aluno' AND column_name IN ('programa_atual_id', 'google_subject'))
             OR (table_name = 'contrato' AND column_name IN
                 ('plano', 'legacy_plano_id', 'legacy_unidade_id'))
             OR (table_name = 'cobranca' AND column_name = 'numero_parcela')
             OR (table_name = 'dia_treino' AND column_name = 'nome'))
    ) THEN
        RAISE EXCEPTION 'Rollback incompleto: colunas V6 foram mantidas';
    END IF;

    IF NOT EXISTS (
        SELECT 1
          FROM information_schema.columns
         WHERE table_schema = current_schema()
           AND table_name = 'dia_treino'
           AND column_name = 'nome_dia'
    ) THEN
        RAISE EXCEPTION 'Rollback incompleto: coluna original dia_treino.nome_dia não foi restaurada';
    END IF;

    IF to_regclass('item_treino') IS NOT NULL
        OR to_regclass('sessao_treino') IS NOT NULL THEN
        RAISE EXCEPTION 'Rollback incompleto: tabelas V6 item_treino/sessao_treino foram mantidas';
    END IF;

    IF to_regclass('aluno') IS NULL OR to_regclass('contrato') IS NULL
        OR to_regclass('cobranca') IS NULL OR to_regclass('programa_treino') IS NULL
        OR to_regclass('dia_treino') IS NULL OR to_regclass('plano') IS NULL
        OR to_regclass('unidade') IS NULL OR to_regclass('exercicio') IS NULL
        OR to_regclass('dia_treino_exercicio') IS NULL OR to_regclass('treino_ativo') IS NULL THEN
        RAISE EXCEPTION 'Rollback incompleto: alguma tabela não manteve o nome legado';
    END IF;

    IF to_regclass('legacy_v5_unidade') IS NOT NULL
        OR to_regclass('legacy_v5_plano') IS NOT NULL
        OR to_regclass('legacy_v5_exercicio') IS NOT NULL
        OR to_regclass('legacy_v5_dia_treino_exercicio') IS NOT NULL
        OR to_regclass('legacy_v5_treino_ativo') IS NOT NULL THEN
        RAISE EXCEPTION 'Rollback incompleto: tabelas legacy_v5_* permaneceram';
    END IF;

    IF EXISTS (
        SELECT 1
          FROM pg_catalog.pg_constraint
         WHERE conrelid IN (
             to_regclass('aluno'), to_regclass('contrato'), to_regclass('cobranca'),
             to_regclass('programa_treino'), to_regclass('dia_treino')
         )
           AND conname IN (
               'aluno_email_key', 'aluno_google_subject_key', 'fk_aluno_programa_atual',
               'ck_aluno_status', 'fk_contrato_aluno', 'ck_contrato_plano',
               'ck_contrato_status', 'uk_cobranca_parcela', 'ck_cobranca_status',
               'uk_programa_perfil', 'uk_dia_ordem'
           )
    ) THEN
        RAISE EXCEPTION 'Rollback incompleto: constraints adicionadas/renomeadas pela V2 permaneceram';
    END IF;

    IF EXISTS (
        SELECT 1
          FROM pg_catalog.pg_class i
          JOIN pg_catalog.pg_namespace n ON n.oid = i.relnamespace
         WHERE n.nspname = current_schema()
           AND i.relkind = 'i'
           AND i.relname IN (
               'idx_aluno_programa_atual', 'idx_contrato_aluno_status',
               'uk_contrato_ativo_aluno', 'idx_cobranca_vencimento_status',
               'idx_cobranca_contrato', 'idx_sessao_aluno_programa_data',
               'aluno_email_key'
           )
    ) THEN
        RAISE EXCEPTION 'Rollback incompleto: índices adicionados pela V2 permaneceram';
    END IF;

    IF NOT EXISTS (
        SELECT 1
          FROM pg_catalog.pg_class i
          JOIN pg_catalog.pg_namespace n ON n.oid = i.relnamespace
         WHERE n.nspname = current_schema()
           AND i.relkind = 'i'
           AND i.relname = 'uk_aluno_email_v5'
    ) THEN
        RAISE EXCEPTION 'Rollback incompleto: índice original da unicidade de email não recuperou o nome original';
    END IF;

    IF EXISTS (
        WITH esperadas(tabela, nome, tipo, colunas, tabela_referenciada,
                       colunas_referenciadas, definicao) AS (
            VALUES
                ('unidade', 'unidade_pkey', 'p', ARRAY['id']::text[], NULL::text[], NULL::text[], 'PRIMARY KEY (id)'),
                ('plano', 'plano_pkey', 'p', ARRAY['id']::text[], NULL::text[], NULL::text[], 'PRIMARY KEY (id)'),
                ('programa_treino', 'programa_treino_pkey', 'p', ARRAY['id']::text[], NULL::text[], NULL::text[], 'PRIMARY KEY (id)'),
                ('aluno', 'aluno_pkey', 'p', ARRAY['id']::text[], NULL::text[], NULL::text[], 'PRIMARY KEY (id)'),
                ('aluno', 'uk_aluno_email_v5', 'u', ARRAY['email']::text[], NULL::text[], NULL::text[], 'UNIQUE (email)'),
                ('contrato', 'contrato_pkey', 'p', ARRAY['id']::text[], NULL::text[], NULL::text[], 'PRIMARY KEY (id)'),
                ('contrato', 'fk_contrato_aluno_v5', 'f', ARRAY['aluno_id']::text[], 'aluno', ARRAY['id']::text[], 'FOREIGN KEY (aluno_id) REFERENCES aluno(id)'),
                ('contrato', 'fk_contrato_plano_v5', 'f', ARRAY['plano_id']::text[], 'plano', ARRAY['id']::text[], 'FOREIGN KEY (plano_id) REFERENCES plano(id)'),
                ('contrato', 'fk_contrato_unidade_v5', 'f', ARRAY['unidade_id']::text[], 'unidade', ARRAY['id']::text[], 'FOREIGN KEY (unidade_id) REFERENCES unidade(id)'),
                ('cobranca', 'cobranca_pkey', 'p', ARRAY['id']::text[], NULL::text[], NULL::text[], 'PRIMARY KEY (id)'),
                ('cobranca', 'fk_cobranca_contrato_v5', 'f', ARRAY['contrato_id']::text[], 'contrato', ARRAY['id']::text[], 'FOREIGN KEY (contrato_id) REFERENCES contrato(id)'),
                ('dia_treino', 'dia_treino_pkey', 'p', ARRAY['id']::text[], NULL::text[], NULL::text[], 'PRIMARY KEY (id)'),
                ('dia_treino', 'fk_dia_programa_v5', 'f', ARRAY['programa_treino_id']::text[], 'programa_treino', ARRAY['id']::text[], 'FOREIGN KEY (programa_treino_id) REFERENCES programa_treino(id)'),
                ('exercicio', 'exercicio_pkey', 'p', ARRAY['id']::text[], NULL::text[], NULL::text[], 'PRIMARY KEY (id)'),
                ('dia_treino_exercicio', 'dia_treino_exercicio_pkey', 'p', ARRAY['id']::text[], NULL::text[], NULL::text[], 'PRIMARY KEY (id)'),
                ('dia_treino_exercicio', 'fk_dte_dia_v5', 'f', ARRAY['dia_treino_id']::text[], 'dia_treino', ARRAY['id']::text[], 'FOREIGN KEY (dia_treino_id) REFERENCES dia_treino(id)'),
                ('dia_treino_exercicio', 'fk_dte_exercicio_v5', 'f', ARRAY['exercicio_id']::text[], 'exercicio', ARRAY['id']::text[], 'FOREIGN KEY (exercicio_id) REFERENCES exercicio(id)'),
                ('treino_ativo', 'treino_ativo_pkey', 'p', ARRAY['id']::text[], NULL::text[], NULL::text[], 'PRIMARY KEY (id)'),
                ('treino_ativo', 'fk_treino_aluno_v5', 'f', ARRAY['aluno_id']::text[], 'aluno', ARRAY['id']::text[], 'FOREIGN KEY (aluno_id) REFERENCES aluno(id)'),
                ('treino_ativo', 'fk_treino_programa_v5', 'f', ARRAY['programa_treino_id']::text[], 'programa_treino', ARRAY['id']::text[], 'FOREIGN KEY (programa_treino_id) REFERENCES programa_treino(id)')
        )
        SELECT 1
          FROM esperadas e
          LEFT JOIN pg_catalog.pg_namespace tn
            ON tn.nspname = current_schema()
          LEFT JOIN pg_catalog.pg_class t
            ON t.relname = e.tabela
           AND t.relnamespace = tn.oid
          LEFT JOIN pg_catalog.pg_constraint c
            ON c.conrelid = t.oid
           AND c.conname = e.nome
          LEFT JOIN pg_catalog.pg_class ci
            ON ci.relname = e.nome
           AND ci.relnamespace = tn.oid
          LEFT JOIN pg_catalog.pg_class rt
            ON rt.oid = c.confrelid
          LEFT JOIN pg_catalog.pg_namespace rtn
            ON rtn.oid = rt.relnamespace
         WHERE tn.oid IS NULL
            OR c.oid IS NULL
            OR c.contype IS DISTINCT FROM e.tipo
            OR c.convalidated IS DISTINCT FROM true
            OR c.condeferrable IS DISTINCT FROM false
            OR c.condeferred IS DISTINCT FROM false
            OR regexp_replace(pg_catalog.pg_get_constraintdef(c.oid),
                              '[[:space:]]', '', 'g')
                IS DISTINCT FROM regexp_replace(e.definicao, '[[:space:]]', '', 'g')
            OR (e.tipo IN ('p', 'u') AND c.conindid IS DISTINCT FROM ci.oid)
            OR (
                SELECT array_agg(a.attname ORDER BY k.ordinality)::text[]
                  FROM unnest(c.conkey) WITH ORDINALITY AS k(attnum, ordinality)
                  JOIN pg_catalog.pg_attribute a
                    ON a.attrelid = c.conrelid
                   AND a.attnum = k.attnum
                   AND NOT a.attisdropped
            ) IS DISTINCT FROM e.colunas
            OR (
                CASE WHEN c.contype = 'f' THEN rt.relname END
            ) IS DISTINCT FROM e.tabela_referenciada
            OR (c.contype = 'f' AND rtn.nspname IS DISTINCT FROM current_schema())
            OR (
                SELECT array_agg(a.attname ORDER BY k.ordinality)::text[]
                  FROM unnest(c.confkey) WITH ORDINALITY AS k(attnum, ordinality)
                  JOIN pg_catalog.pg_attribute a
                    ON a.attrelid = c.confrelid
                   AND a.attnum = k.attnum
                   AND NOT a.attisdropped
            ) IS DISTINCT FROM e.colunas_referenciadas
            OR (c.contype = 'f' AND (
                c.confupdtype IS DISTINCT FROM 'a'
                OR c.confdeltype IS DISTINCT FROM 'a'
                OR c.confmatchtype IS DISTINCT FROM 's'
            ))
    ) OR (
        SELECT count(*)
          FROM pg_catalog.pg_constraint c
          JOIN pg_catalog.pg_class t ON t.oid = c.conrelid
          JOIN pg_catalog.pg_namespace n ON n.oid = t.relnamespace
         WHERE n.nspname = current_schema()
           AND t.relname IN (
               'unidade', 'plano', 'programa_treino', 'aluno', 'contrato',
               'cobranca', 'dia_treino', 'exercicio', 'dia_treino_exercicio',
               'treino_ativo'
           )
    ) <> 20 THEN
        RAISE EXCEPTION 'Rollback incompleto: constraints legadas diferem em nome, tabela, tipo, colunas, referência ou validação';
    END IF;

    IF EXISTS (
        WITH esperados(tabela, nome, unico, primario, colunas) AS (
            VALUES
                ('unidade', 'unidade_pkey', true, true, ARRAY['id']::text[]),
                ('plano', 'plano_pkey', true, true, ARRAY['id']::text[]),
                ('programa_treino', 'programa_treino_pkey', true, true, ARRAY['id']::text[]),
                ('aluno', 'aluno_pkey', true, true, ARRAY['id']::text[]),
                ('aluno', 'uk_aluno_email_v5', true, false, ARRAY['email']::text[]),
                ('contrato', 'contrato_pkey', true, true, ARRAY['id']::text[]),
                ('cobranca', 'cobranca_pkey', true, true, ARRAY['id']::text[]),
                ('dia_treino', 'dia_treino_pkey', true, true, ARRAY['id']::text[]),
                ('exercicio', 'exercicio_pkey', true, true, ARRAY['id']::text[]),
                ('dia_treino_exercicio', 'dia_treino_exercicio_pkey', true, true, ARRAY['id']::text[]),
                ('treino_ativo', 'treino_ativo_pkey', true, true, ARRAY['id']::text[])
        )
        SELECT 1
          FROM esperadas e
          LEFT JOIN pg_catalog.pg_namespace tn
            ON tn.nspname = current_schema()
          LEFT JOIN pg_catalog.pg_class t
            ON t.relname = e.tabela
           AND t.relnamespace = tn.oid
          LEFT JOIN pg_catalog.pg_class idx
            ON idx.relname = e.nome
           AND idx.relnamespace = tn.oid
          LEFT JOIN pg_catalog.pg_index i
            ON i.indexrelid = idx.oid
           AND i.indrelid = t.oid
          LEFT JOIN pg_catalog.pg_am am
            ON am.oid = idx.relam
         WHERE tn.oid IS NULL
            OR idx.oid IS NULL
            OR i.indisunique IS DISTINCT FROM e.unico
            OR i.indisprimary IS DISTINCT FROM e.primario
            OR i.indisvalid IS DISTINCT FROM true
            OR i.indisready IS DISTINCT FROM true
            OR i.indnatts IS DISTINCT FROM i.indnkeyatts
            OR am.amname IS DISTINCT FROM 'btree'
            OR i.indpred IS NOT NULL
            OR i.indexprs IS NOT NULL
            OR (
                SELECT array_agg(o.option ORDER BY o.ordinality)::smallint[]
                  FROM unnest(i.indoption::smallint[]) WITH ORDINALITY AS o(option, ordinality)
            ) IS DISTINCT FROM ARRAY[0]::smallint[]
            OR (
                SELECT array_agg(a.attname ORDER BY k.ordinality)::text[]
                  FROM unnest(i.indkey::smallint[]) WITH ORDINALITY AS k(attnum, ordinality)
                  JOIN pg_catalog.pg_attribute a
                    ON a.attrelid = i.indrelid
                   AND a.attnum = k.attnum
                   AND NOT a.attisdropped
                 WHERE k.ordinality <= i.indnkeyatts
            ) IS DISTINCT FROM e.colunas
    ) OR (
        SELECT count(*)
          FROM pg_catalog.pg_index i
          JOIN pg_catalog.pg_class t ON t.oid = i.indrelid
          JOIN pg_catalog.pg_namespace n ON n.oid = t.relnamespace
         WHERE n.nspname = current_schema()
           AND t.relname IN (
               'unidade', 'plano', 'programa_treino', 'aluno', 'contrato',
               'cobranca', 'dia_treino', 'exercicio', 'dia_treino_exercicio',
               'treino_ativo'
           )
    ) <> 11 THEN
        RAISE EXCEPTION 'Rollback incompleto: conjunto, definição ou tabela dos índices legados diverge da fixture';
    END IF;

    IF EXISTS (
        WITH esperadas(tabla, columna, tipo, longitud, precision, escala, nullable, identidad) AS (
            VALUES
                ('unidade', 'id', 'bigint', NULL::integer, NULL::integer, NULL::integer, 'NO', 'YES'),
                ('unidade', 'nome', 'character varying', 255, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('plano', 'id', 'bigint', NULL::integer, NULL::integer, NULL::integer, 'NO', 'YES'),
                ('plano', 'tipo', 'character varying', 30, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('programa_treino', 'id', 'bigint', NULL::integer, NULL::integer, NULL::integer, 'NO', 'YES'),
                ('programa_treino', 'nivel_experiencia', 'character varying', 30, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('programa_treino', 'frequencia_semanal', 'integer', NULL::integer, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('programa_treino', 'tipo_estrutural', 'character varying', 40, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('programa_treino', 'descricao', 'character varying', 255, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('aluno', 'id', 'bigint', NULL::integer, NULL::integer, NULL::integer, 'NO', 'YES'),
                ('aluno', 'nome', 'character varying', 255, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('aluno', 'email', 'character varying', 255, NULL::integer, NULL::integer, 'YES', 'NO'),
                ('aluno', 'cpf', 'character varying', 20, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('aluno', 'telefone', 'character varying', 30, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('aluno', 'data_nascimento', 'date', NULL::integer, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('aluno', 'peso', 'numeric', NULL::integer, 6, 2, 'NO', 'NO'),
                ('aluno', 'altura', 'numeric', NULL::integer, 6, 3, 'NO', 'NO'),
                ('aluno', 'nivel_experiencia', 'character varying', 30, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('aluno', 'frequencia_semanal', 'integer', NULL::integer, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('aluno', 'status', 'character varying', 30, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('contrato', 'id', 'bigint', NULL::integer, NULL::integer, NULL::integer, 'NO', 'YES'),
                ('contrato', 'aluno_id', 'bigint', NULL::integer, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('contrato', 'plano_id', 'bigint', NULL::integer, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('contrato', 'unidade_id', 'bigint', NULL::integer, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('contrato', 'data_inicio', 'date', NULL::integer, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('contrato', 'data_termino', 'date', NULL::integer, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('contrato', 'status', 'character varying', 30, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('cobranca', 'id', 'bigint', NULL::integer, NULL::integer, NULL::integer, 'NO', 'YES'),
                ('cobranca', 'contrato_id', 'bigint', NULL::integer, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('cobranca', 'data_vencimento', 'date', NULL::integer, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('cobranca', 'valor', 'numeric', NULL::integer, 10, 2, 'NO', 'NO'),
                ('cobranca', 'data_pagamento', 'date', NULL::integer, NULL::integer, NULL::integer, 'YES', 'NO'),
                ('cobranca', 'status', 'character varying', 30, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('dia_treino', 'id', 'bigint', NULL::integer, NULL::integer, NULL::integer, 'NO', 'YES'),
                ('dia_treino', 'programa_treino_id', 'bigint', NULL::integer, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('dia_treino', 'nome_dia', 'character varying', 255, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('dia_treino', 'ordem', 'integer', NULL::integer, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('exercicio', 'id', 'bigint', NULL::integer, NULL::integer, NULL::integer, 'NO', 'YES'),
                ('exercicio', 'nome', 'character varying', 255, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('exercicio', 'musculatura_alvo', 'character varying', 255, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('dia_treino_exercicio', 'id', 'bigint', NULL::integer, NULL::integer, NULL::integer, 'NO', 'YES'),
                ('dia_treino_exercicio', 'dia_treino_id', 'bigint', NULL::integer, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('dia_treino_exercicio', 'exercicio_id', 'bigint', NULL::integer, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('dia_treino_exercicio', 'series', 'integer', NULL::integer, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('dia_treino_exercicio', 'repeticoes', 'integer', NULL::integer, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('dia_treino_exercicio', 'ordem', 'integer', NULL::integer, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('treino_ativo', 'id', 'bigint', NULL::integer, NULL::integer, NULL::integer, 'NO', 'YES'),
                ('treino_ativo', 'aluno_id', 'bigint', NULL::integer, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('treino_ativo', 'programa_treino_id', 'bigint', NULL::integer, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('treino_ativo', 'data_inicio', 'date', NULL::integer, NULL::integer, NULL::integer, 'NO', 'NO'),
                ('treino_ativo', 'status', 'character varying', 30, NULL::integer, NULL::integer, 'NO', 'NO')
        )
        SELECT 1
          FROM esperadas e
          LEFT JOIN information_schema.columns c
            ON c.table_schema = current_schema()
           AND c.table_name = e.tabla
           AND c.column_name = e.columna
         WHERE c.column_name IS NULL
            OR c.data_type IS DISTINCT FROM e.tipo
            OR c.character_maximum_length IS DISTINCT FROM e.longitud
            OR c.numeric_precision IS DISTINCT FROM e.precision
            OR c.numeric_scale IS DISTINCT FROM e.escala
            OR c.is_nullable IS DISTINCT FROM e.nullable
            OR c.is_identity IS DISTINCT FROM e.identidad
    ) OR (
        SELECT count(*)
          FROM information_schema.columns
         WHERE table_schema = current_schema()
           AND table_name IN (
               'unidade', 'plano', 'programa_treino', 'aluno', 'contrato',
               'cobranca', 'dia_treino', 'exercicio', 'dia_treino_exercicio',
               'treino_ativo'
           )
    ) <> 51 THEN
        RAISE EXCEPTION 'Rollback incompleto: colunas, nomes, tipos, precisões, nullability ou identity diferem da fixture original';
    END IF;

    IF EXISTS (
        SELECT 1
          FROM (VALUES
              ('aluno', 'uk_aluno_email_v5', 'u'),
              ('contrato', 'fk_contrato_aluno_v5', 'f'),
              ('cobranca', 'fk_cobranca_contrato_v5', 'f'),
              ('dia_treino', 'fk_dia_programa_v5', 'f')
          ) AS originais(tabela, nome, tipo)
         WHERE NOT EXISTS (
             SELECT 1
               FROM pg_catalog.pg_constraint c
              WHERE c.conrelid = to_regclass(originais.tabela)
                AND c.conname = originais.nome
                AND c.contype = originais.tipo
                AND c.convalidated
         )
    ) THEN
        RAISE EXCEPTION 'Rollback incompleto: constraints legadas renomeadas pela V2 não recuperaram os nomes originais';
    END IF;

    IF EXISTS (
        SELECT 1
          FROM (VALUES
              ('aluno', 'aluno_email_key'),
              ('aluno', 'aluno_google_subject_key'),
              ('aluno', 'fk_aluno_programa_atual'),
              ('aluno', 'ck_aluno_status'),
              ('contrato', 'fk_contrato_aluno'),
              ('contrato', 'ck_contrato_plano'),
              ('contrato', 'ck_contrato_status'),
              ('cobranca', 'fk_cobranca_contrato'),
              ('cobranca', 'uk_cobranca_parcela'),
              ('cobranca', 'ck_cobranca_status'),
              ('programa_treino', 'uk_programa_perfil'),
              ('dia_treino', 'fk_dia_programa'),
              ('dia_treino', 'uk_dia_ordem')
          ) AS alteradas(tabela, nome)
         WHERE EXISTS (
             SELECT 1
               FROM pg_catalog.pg_constraint c
              WHERE c.conrelid = to_regclass(alteradas.tabela)
                AND c.conname = alteradas.nome
         )
    ) THEN
        RAISE EXCEPTION 'Rollback incompleto: constraint criada ou renomeada pela V2 permaneceu';
    END IF;

    IF (SELECT count(*) FROM aluno) <> 3
        OR (SELECT count(*) FROM contrato) <> 3
        OR (SELECT count(*) FROM cobranca) <> 6
        OR (SELECT count(*) FROM programa_treino) <> 12
        OR (SELECT count(*) FROM dia_treino) <> 5
        OR (SELECT count(*) FROM exercicio) <> 3
        OR (SELECT count(*) FROM dia_treino_exercicio) <> 6
        OR (SELECT count(*) FROM treino_ativo) <> 6 THEN
        RAISE EXCEPTION 'Rollback incompleto: contagens legadas divergentes';
    END IF;

    IF (SELECT count(*) FROM aluno
         WHERE (id, altura) IN ((10, 999.999), (20, 1.800), (30, 1.650))) <> 3 THEN
        RAISE EXCEPTION 'Rollback incompleto: valores originais de altura não foram restaurados';
    END IF;

    IF EXISTS (
        WITH esperados(id, aluno_id, plano_id, unidade_id, data_inicio, data_termino, status) AS (
            VALUES
                (1001::bigint, 10::bigint, 1::bigint, 1::bigint, DATE '2025-01-15', DATE '2040-12-31', 'ATIVO'::varchar),
                (1002::bigint, 20::bigint, 2::bigint, 1::bigint, DATE '2025-02-10', DATE '2041-12-31', 'ENCERRADO'::varchar),
                (1003::bigint, 30::bigint, 3::bigint, 1::bigint, DATE '2025-03-20', DATE '2042-12-31', 'CANCELADO'::varchar)
        ),
        atuais AS (
            SELECT id, aluno_id, plano_id, unidade_id, data_inicio, data_termino, status FROM contrato
        ),
        faltantes AS (SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais),
        inesperados AS (SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados)
        SELECT 1 FROM faltantes UNION ALL SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Rollback incompleto: valores originais de contratos divergentes';
    END IF;

    IF EXISTS (
        WITH esperados(id, contrato_id, data_vencimento, valor, data_pagamento, status) AS (
            VALUES
                (1101::bigint, 1001::bigint, DATE '2025-02-15', 120.00::numeric, NULL::date, 'PENDENTE'::varchar),
                (1102::bigint, 1001::bigint, DATE '2025-01-15', 120.00::numeric, DATE '2025-01-15', 'PAGO'::varchar),
                (1201::bigint, 1002::bigint, DATE '2025-03-10', 330.00::numeric, NULL::date, 'ATRASADO'::varchar),
                (1202::bigint, 1002::bigint, DATE '2025-01-10', 330.00::numeric, DATE '2025-01-10', 'PAGO'::varchar),
                (1301::bigint, 1003::bigint, DATE '2025-09-20', 600.00::numeric, NULL::date, 'CANCELADO'::varchar),
                (1302::bigint, 1003::bigint, DATE '2025-06-20', 600.00::numeric, DATE '2025-06-20', 'PAGO'::varchar)
        ),
        atuais AS (
            SELECT id, contrato_id, data_vencimento, valor, data_pagamento, status FROM cobranca
        ),
        faltantes AS (SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais),
        inesperados AS (SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados)
        SELECT 1 FROM faltantes UNION ALL SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Rollback incompleto: valores originais de cobranças divergentes';
    END IF;

    IF EXISTS (
        WITH esperados(id, nome) AS (
            VALUES (1::bigint, 'Unidade sintética'::varchar)
        ),
        atuais AS (SELECT id, nome FROM unidade),
        ausentes AS (SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais),
        inesperados AS (SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados)
        SELECT 1 FROM ausentes UNION ALL SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Rollback incompleto: dados originais de unidade divergentes';
    END IF;

    IF EXISTS (
        WITH esperados(id, tipo) AS (
            VALUES
                (1::bigint, 'MENSAL'::varchar),
                (2::bigint, 'TRIMESTRAL'::varchar),
                (3::bigint, 'SEMESTRAL'::varchar)
        ),
        atuais AS (SELECT id, tipo FROM plano),
        ausentes AS (SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais),
        inesperados AS (SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados)
        SELECT 1 FROM ausentes UNION ALL SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Rollback incompleto: dados originais de plano divergentes';
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
        ausentes AS (SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais),
        inesperados AS (SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados)
        SELECT 1 FROM ausentes UNION ALL SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Rollback incompleto: dados originais de programa_treino divergentes';
    END IF;

    IF EXISTS (
        WITH esperados(id, nome, email, cpf, telefone, data_nascimento, peso, altura,
                       nivel_experiencia, frequencia_semanal, status) AS (
            VALUES
                (10::bigint, 'Aluno Dez'::varchar, 'aluno10@example.test'::varchar, '00000000010'::varchar,
                 '83999990010'::varchar, DATE '1990-01-10', 70.00::numeric, 999.999::numeric,
                 'INICIANTE'::varchar, 6, 'ATIVO'::varchar),
                (20::bigint, 'Aluno Vinte'::varchar, 'aluno20@example.test'::varchar, '00000000020'::varchar,
                 '83999990020'::varchar, DATE '1992-02-20', 80.00::numeric, 1.800::numeric,
                 'INTERMEDIARIO'::varchar, 3, 'ATIVO'::varchar),
                (30::bigint, 'Aluno Trinta'::varchar, 'aluno30@example.test'::varchar, '00000000030'::varchar,
                 '83999990030'::varchar, DATE '1994-03-30', 65.00::numeric, 1.650::numeric,
                 'AVANCADO'::varchar, 6, 'INATIVO'::varchar)
        ),
        atuais AS (
            SELECT id, nome, email, cpf, telefone, data_nascimento, peso, altura,
                   nivel_experiencia, frequencia_semanal, status
              FROM aluno
        ),
        ausentes AS (SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais),
        inesperados AS (SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados)
        SELECT 1 FROM ausentes UNION ALL SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Rollback incompleto: dados originais de aluno divergentes';
    END IF;

    IF EXISTS (
        WITH esperados(id, programa_treino_id, nome_dia, ordem) AS (
            VALUES
                (101::bigint, 4::bigint, 'Treino A'::varchar, 1),
                (102::bigint, 4::bigint, 'Treino B'::varchar, 2),
                (201::bigint, 5::bigint, 'Treino A'::varchar, 1),
                (501::bigint, 5::bigint, 'Treino B'::varchar, 2),
                (1201::bigint, 12::bigint, 'Treino A'::varchar, 1)
        ),
        atuais AS (SELECT id, programa_treino_id, nome_dia, ordem FROM dia_treino),
        ausentes AS (SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais),
        inesperados AS (SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados)
        SELECT 1 FROM ausentes UNION ALL SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Rollback incompleto: dados originais de dia_treino divergentes';
    END IF;

    IF EXISTS (
        WITH esperados(id, nome, musculatura_alvo) AS (
            VALUES
                (1::bigint, 'Supino reto'::varchar, 'Peitoral'::varchar),
                (2::bigint, 'Agachamento'::varchar, 'Quadríceps'::varchar),
                (3::bigint, 'Remada baixa'::varchar, 'Costas'::varchar)
        ),
        atuais AS (SELECT id, nome, musculatura_alvo FROM exercicio),
        ausentes AS (SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais),
        inesperados AS (SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados)
        SELECT 1 FROM ausentes UNION ALL SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Rollback incompleto: dados originais de exercicio divergentes';
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
              FROM dia_treino_exercicio
        ),
        ausentes AS (SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais),
        inesperados AS (SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados)
        SELECT 1 FROM ausentes UNION ALL SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Rollback incompleto: dados originais de dia_treino_exercicio divergentes';
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
              FROM treino_ativo
        ),
        ausentes AS (SELECT * FROM esperados EXCEPT ALL SELECT * FROM atuais),
        inesperados AS (SELECT * FROM atuais EXCEPT ALL SELECT * FROM esperados)
        SELECT 1 FROM ausentes UNION ALL SELECT 1 FROM inesperados
    ) THEN
        RAISE EXCEPTION 'Rollback incompleto: dados originais de treino_ativo divergentes';
    END IF;

    IF to_regclass('flyway_schema_history') IS NULL THEN
        RAISE EXCEPTION 'Histórico Flyway ausente; não é possível verificar o rollback da V2';
    END IF;

    IF EXISTS (
        SELECT 1 FROM flyway_schema_history WHERE version = '2' AND success
    ) THEN
        RAISE EXCEPTION 'Histórico Flyway indica V2 bem-sucedida apesar da falha provocada';
    END IF;
END $$;

SELECT table_name, column_name, data_type, numeric_precision, numeric_scale
  FROM information_schema.columns
 WHERE table_schema = current_schema()
   AND table_name IN ('aluno', 'contrato', 'cobranca', 'dia_treino')
 ORDER BY table_name, ordinal_position;

SELECT installed_rank, version, type, description, success
  FROM flyway_schema_history
 ORDER BY installed_rank;
