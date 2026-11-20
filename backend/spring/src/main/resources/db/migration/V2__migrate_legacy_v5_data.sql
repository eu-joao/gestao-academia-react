DO $$
DECLARE
    tabelas_legado_presentes integer;
    tabelas_v6_ausentes text;
    tabelas_legado_ausentes text;
    colunas_legado_ausentes text;
    colunas_v6_ausentes text;
    constraints_v6_ausentes text;
    constraints_v6_invalidas text;
    checks_v6_invalidas text;
    fks_v6_invalidas text;
    indices_v6_ausentes text;
    artefatos_v6_preexistentes text;
    contratos_com_plano_fora_v6 text;
    conflitos_perfil_programa text;
    conflitos_contrato_ativo text;
    conflitos_ordem_dia text;
    conflitos_ordem_item text;
    emails_duplicados text;
    alunos_sem_email text;
    treinos_com_programa_orfao text;
    treinos_com_aluno_orfao text;
    itens_com_exercicio_orfao text;
    itens_com_dia_orfao text;
    contratos_com_aluno_orfao text;
    contratos_com_unidade_orfa text;
    cobrancas_com_contrato_orfao text;
    dias_com_programa_orfao text;
    fk record;
    fk_existente record;
    fk_equivalente record;
    fks_equivalentes integer;
    unique_existente record;
    unique_equivalente record;
    indice_unico record;
BEGIN
    SELECT string_agg(tabela, ', ' ORDER BY tabela)
      INTO tabelas_v6_ausentes
      FROM (VALUES
          ('aluno'),
          ('contrato'),
          ('cobranca'),
          ('programa_treino'),
          ('dia_treino'),
          ('item_treino'),
          ('sessao_treino')
      ) AS requeridas(tabela)
     WHERE to_regclass(tabela) IS NULL;

    SELECT count(*)
      INTO tabelas_legado_presentes
      FROM (VALUES
          ('plano'),
          ('unidade'),
          ('exercicio'),
          ('dia_treino_exercicio'),
          ('treino_ativo')
      ) AS marcadores(tabela)
     WHERE to_regclass(tabela) IS NOT NULL;

    IF tabelas_legado_presentes = 0 THEN
        IF tabelas_v6_ausentes IS NOT NULL THEN
            RAISE EXCEPTION USING
                MESSAGE = 'Migração V2 interrompida: schema não corresponde a um V6 completo nem a um legado V5.',
                DETAIL = format('Tabelas V6 ausentes: %s', tabelas_v6_ausentes);
        END IF;

        SELECT string_agg(format('%s.%s', tabela, coluna), ', ' ORDER BY tabela, coluna)
          INTO colunas_v6_ausentes
          FROM (VALUES
              ('aluno', 'id'),
              ('aluno', 'nome'),
              ('aluno', 'email'),
              ('aluno', 'google_subject'),
              ('aluno', 'peso'),
              ('aluno', 'altura'),
              ('aluno', 'nivel_experiencia'),
              ('aluno', 'frequencia_semanal'),
              ('aluno', 'status'),
              ('aluno', 'programa_atual_id'),
              ('contrato', 'id'),
              ('contrato', 'aluno_id'),
              ('contrato', 'plano'),
              ('contrato', 'data_inicio'),
              ('contrato', 'data_termino'),
              ('contrato', 'status'),
              ('cobranca', 'id'),
              ('cobranca', 'contrato_id'),
              ('cobranca', 'numero_parcela'),
              ('cobranca', 'data_vencimento'),
              ('cobranca', 'valor'),
              ('cobranca', 'data_pagamento'),
              ('cobranca', 'status'),
              ('programa_treino', 'id'),
              ('programa_treino', 'nivel_experiencia'),
              ('programa_treino', 'frequencia_semanal'),
              ('programa_treino', 'tipo_estrutural'),
              ('programa_treino', 'descricao'),
              ('dia_treino', 'id'),
              ('dia_treino', 'programa_treino_id'),
              ('dia_treino', 'nome'),
              ('dia_treino', 'ordem'),
              ('item_treino', 'id'),
              ('item_treino', 'dia_treino_id'),
              ('item_treino', 'nome_exercicio'),
              ('item_treino', 'musculatura_alvo'),
              ('item_treino', 'series'),
              ('item_treino', 'repeticoes'),
              ('item_treino', 'ordem'),
              ('sessao_treino', 'id'),
              ('sessao_treino', 'aluno_id'),
              ('sessao_treino', 'programa_treino_id'),
              ('sessao_treino', 'dia_treino_id'),
              ('sessao_treino', 'data_hora_conclusao')
          ) AS requeridas(tabela, coluna)
         WHERE NOT EXISTS (
             SELECT 1
               FROM information_schema.columns c
              WHERE c.table_schema = current_schema()
                AND c.table_name = requeridas.tabela
                AND c.column_name = requeridas.coluna
         );

        IF colunas_v6_ausentes IS NOT NULL THEN
            RAISE EXCEPTION USING
                MESSAGE = 'Migração V2 interrompida: tabelas presentes, mas o schema V6 está incompleto.',
                DETAIL = format('Colunas V6 ausentes: %s', colunas_v6_ausentes);
        END IF;

        SELECT string_agg(format('%s.%s', tabela, constraint_name), ', '
                          ORDER BY tabela, constraint_name)
          INTO constraints_v6_ausentes
          FROM (VALUES
              ('aluno', 'aluno_pkey', 'p'),
              ('aluno', 'aluno_email_key', 'u'),
              ('aluno', 'aluno_google_subject_key', 'u'),
              ('aluno', 'fk_aluno_programa_atual', 'f'),
              ('aluno', 'ck_aluno_status', 'c'),
              ('contrato', 'contrato_pkey', 'p'),
              ('contrato', 'fk_contrato_aluno', 'f'),
              ('contrato', 'ck_contrato_plano', 'c'),
              ('contrato', 'ck_contrato_status', 'c'),
              ('cobranca', 'cobranca_pkey', 'p'),
              ('cobranca', 'fk_cobranca_contrato', 'f'),
              ('cobranca', 'uk_cobranca_parcela', 'u'),
              ('programa_treino', 'programa_treino_pkey', 'p'),
              ('programa_treino', 'uk_programa_perfil', 'u'),
              ('dia_treino', 'dia_treino_pkey', 'p'),
              ('dia_treino', 'fk_dia_programa', 'f'),
              ('dia_treino', 'uk_dia_ordem', 'u'),
              ('item_treino', 'item_treino_pkey', 'p'),
              ('item_treino', 'fk_item_dia', 'f'),
              ('item_treino', 'uk_item_ordem', 'u'),
              ('sessao_treino', 'sessao_treino_pkey', 'p'),
              ('sessao_treino', 'fk_sessao_aluno', 'f'),
              ('sessao_treino', 'fk_sessao_programa', 'f'),
              ('sessao_treino', 'fk_sessao_dia', 'f')
          ) AS requeridas(tabela, constraint_name, tipo)
         WHERE NOT EXISTS (
             SELECT 1
               FROM pg_catalog.pg_constraint c
              WHERE c.conrelid = to_regclass(requeridas.tabela)
                AND c.conname = requeridas.constraint_name
                AND c.contype = requeridas.tipo
                AND c.convalidated
         );

        SELECT string_agg(format('%s.%s', esperadas.tabla, esperadas.constraint_name),
                          ', ' ORDER BY esperadas.tabla, esperadas.constraint_name)
          INTO constraints_v6_invalidas
          FROM (VALUES
              ('aluno', 'aluno_pkey', ARRAY['id']::text[]),
              ('aluno', 'aluno_email_key', ARRAY['email']::text[]),
              ('aluno', 'aluno_google_subject_key', ARRAY['google_subject']::text[]),
              ('contrato', 'contrato_pkey', ARRAY['id']::text[]),
              ('cobranca', 'cobranca_pkey', ARRAY['id']::text[]),
              ('cobranca', 'uk_cobranca_parcela', ARRAY['contrato_id', 'numero_parcela']::text[]),
              ('programa_treino', 'programa_treino_pkey', ARRAY['id']::text[]),
              ('programa_treino', 'uk_programa_perfil',
                  ARRAY['nivel_experiencia', 'frequencia_semanal']::text[]),
              ('dia_treino', 'dia_treino_pkey', ARRAY['id']::text[]),
              ('dia_treino', 'uk_dia_ordem', ARRAY['programa_treino_id', 'ordem']::text[]),
              ('item_treino', 'item_treino_pkey', ARRAY['id']::text[]),
              ('item_treino', 'uk_item_ordem', ARRAY['dia_treino_id', 'ordem']::text[]),
              ('sessao_treino', 'sessao_treino_pkey', ARRAY['id']::text[])
          ) AS esperadas(tabla, constraint_name, colunas)
         WHERE NOT EXISTS (
             SELECT 1
               FROM pg_catalog.pg_constraint c
              WHERE c.conrelid = to_regclass(esperadas.tabla)
                AND c.conname = esperadas.constraint_name
                AND c.convalidated
                AND (
                    SELECT array_agg(a.attname ORDER BY k.ordinality)::text[]
                      FROM unnest(c.conkey) WITH ORDINALITY AS k(attnum, ordinality)
                      JOIN pg_catalog.pg_attribute a
                        ON a.attrelid = c.conrelid
                       AND a.attnum = k.attnum
                       AND NOT a.attisdropped
                ) = esperadas.colunas
         );

        SELECT string_agg(format('%s.%s', esperadas.tabla, esperadas.constraint_name),
                          ', ' ORDER BY esperadas.tabla, esperadas.constraint_name)
          INTO fks_v6_invalidas
          FROM (VALUES
              ('aluno', 'fk_aluno_programa_atual', 'programa_atual_id', 'programa_treino', 'id'),
              ('contrato', 'fk_contrato_aluno', 'aluno_id', 'aluno', 'id'),
              ('cobranca', 'fk_cobranca_contrato', 'contrato_id', 'contrato', 'id'),
              ('dia_treino', 'fk_dia_programa', 'programa_treino_id', 'programa_treino', 'id'),
              ('item_treino', 'fk_item_dia', 'dia_treino_id', 'dia_treino', 'id'),
              ('sessao_treino', 'fk_sessao_aluno', 'aluno_id', 'aluno', 'id'),
              ('sessao_treino', 'fk_sessao_programa', 'programa_treino_id', 'programa_treino', 'id'),
              ('sessao_treino', 'fk_sessao_dia', 'dia_treino_id', 'dia_treino', 'id')
          ) AS esperadas(tabla, constraint_name, coluna, tabela_referenciada, coluna_referenciada)
         WHERE NOT EXISTS (
             SELECT 1
               FROM pg_catalog.pg_constraint c
              WHERE c.conrelid = to_regclass(esperadas.tabla)
                AND c.conname = esperadas.constraint_name
                AND c.contype = 'f'
                AND c.convalidated
                AND c.confrelid = to_regclass(esperadas.tabela_referenciada)
                AND c.conkey = ARRAY[(
                    SELECT a.attnum
                      FROM pg_catalog.pg_attribute a
                     WHERE a.attrelid = c.conrelid
                       AND a.attname = esperadas.coluna
                       AND NOT a.attisdropped
                )]::smallint[]
                AND c.confkey = ARRAY[(
                    SELECT a.attnum
                      FROM pg_catalog.pg_attribute a
                     WHERE a.attrelid = c.confrelid
                       AND a.attname = esperadas.coluna_referenciada
                       AND NOT a.attisdropped
                )]::smallint[]
                AND c.confupdtype = 'a'
                AND c.confdeltype = 'a'
                AND c.confmatchtype = 's'
                AND NOT c.condeferrable
         );

        SELECT string_agg(format('%s.%s', esperadas.tabla, esperadas.index_name),
                          ', ' ORDER BY esperadas.tabla, esperadas.index_name)
          INTO indices_v6_ausentes
          FROM (VALUES
              ('aluno', 'idx_aluno_programa_atual', false, ARRAY['programa_atual_id']::text[], false),
              ('contrato', 'idx_contrato_aluno_status', false,
                  ARRAY['aluno_id', 'status', 'data_termino']::text[], false),
              ('contrato', 'uk_contrato_ativo_aluno', true, ARRAY['aluno_id']::text[], true),
              ('cobranca', 'idx_cobranca_vencimento_status', false,
                  ARRAY['data_vencimento', 'status']::text[], false),
              ('cobranca', 'idx_cobranca_contrato', false, ARRAY['contrato_id']::text[], false),
              ('sessao_treino', 'idx_sessao_aluno_programa_data', false,
                  ARRAY['aluno_id', 'programa_treino_id', 'data_hora_conclusao']::text[], false)
          ) AS esperadas(tabla, index_name, unique_index, colunas, parcial)
         WHERE NOT EXISTS (
             SELECT 1
               FROM pg_catalog.pg_index i
               JOIN pg_catalog.pg_class idx ON idx.oid = i.indexrelid
               JOIN pg_catalog.pg_namespace ns ON ns.oid = idx.relnamespace
               JOIN pg_catalog.pg_am am ON am.oid = idx.relam
              WHERE ns.nspname = current_schema()
                AND idx.relname = esperadas.index_name
                AND i.indrelid = to_regclass(esperadas.tabla)
                AND i.indisvalid
                AND i.indisready
                AND i.indisunique = esperadas.unique_index
                AND i.indnatts = i.indnkeyatts
                AND am.amname = 'btree'
                AND (
                    SELECT array_agg(a.attname ORDER BY k.ordinality)::text[]
                      FROM unnest(i.indkey::smallint[]) WITH ORDINALITY AS k(attnum, ordinality)
                      JOIN pg_catalog.pg_attribute a
                        ON a.attrelid = i.indrelid
                       AND a.attnum = k.attnum
                     WHERE k.ordinality <= i.indnkeyatts
                ) = esperadas.colunas
                AND (
                    (NOT esperadas.parcial AND i.indpred IS NULL)
                    OR (
                        esperadas.parcial
                        AND regexp_replace(
                            regexp_replace(
                                regexp_replace(
                                    pg_catalog.pg_get_expr(i.indpred, i.indrelid),
                                    '[[:space:]]', '', 'g'
                                ),
                                '::(text|charactervarying|varchar)(\([0-9]+\))?',
                                '',
                                'gi'
                            ),
                            '[()]', '', 'g'
                        ) = 'status=''ATIVO'''
                    )
                )
         );

        SELECT string_agg(format('%s.%s', esperadas.tabla, esperadas.constraint_name),
                          ', ' ORDER BY esperadas.tabla, esperadas.constraint_name)
          INTO checks_v6_invalidas
          FROM (VALUES
              ('aluno', 'ck_aluno_status',
                  'CHECK (((status)::text = ANY ((ARRAY[''ATIVO''::character varying, ''INATIVO''::character varying])::text[])))'),
              ('contrato', 'ck_contrato_plano',
                  'CHECK (((plano)::text = ANY ((ARRAY[''MENSAL''::character varying, ''TRIMESTRAL''::character varying, ''SEMESTRAL''::character varying])::text[])))'),
              ('contrato', 'ck_contrato_status',
                  'CHECK (((status)::text = ANY ((ARRAY[''ATIVO''::character varying, ''ENCERRADO''::character varying, ''CANCELADO''::character varying])::text[])))'),
              ('cobranca', 'ck_cobranca_status',
                  'CHECK (((status)::text = ANY ((ARRAY[''PENDENTE''::character varying, ''PAGO''::character varying, ''ATRASADO''::character varying, ''CANCELADO''::character varying])::text[])))')
          ) AS esperadas(tabla, constraint_name, definicao)
         WHERE NOT EXISTS (
             SELECT 1
               FROM pg_catalog.pg_constraint c
              WHERE c.conrelid = to_regclass(esperadas.tabla)
                AND c.conname = esperadas.constraint_name
                AND c.contype = 'c'
                AND c.convalidated
                AND regexp_replace(
                    pg_catalog.pg_get_constraintdef(c.oid),
                    '[[:space:]]', '', 'g'
                ) = regexp_replace(
                    esperadas.definicao,
                    '[[:space:]]', '', 'g'
                )
         );

        IF constraints_v6_ausentes IS NOT NULL
            OR constraints_v6_invalidas IS NOT NULL
            OR checks_v6_invalidas IS NOT NULL
            OR fks_v6_invalidas IS NOT NULL
            OR indices_v6_ausentes IS NOT NULL THEN
            RAISE EXCEPTION USING
                MESSAGE = 'Migração V2 interrompida: constraints ou índices do schema V6 estão incompletos ou incompatíveis.',
                DETAIL = concat_ws(', ',
                    CASE WHEN constraints_v6_ausentes IS NOT NULL
                        THEN 'Constraints: ' || constraints_v6_ausentes END,
                    CASE WHEN constraints_v6_invalidas IS NOT NULL
                        THEN 'Constraints com colunas incompatíveis: ' || constraints_v6_invalidas END,
                    CASE WHEN checks_v6_invalidas IS NOT NULL
                        THEN 'Checks incompatíveis: ' || checks_v6_invalidas END,
                    CASE WHEN fks_v6_invalidas IS NOT NULL
                        THEN 'Chaves estrangeiras: ' || fks_v6_invalidas END,
                    CASE WHEN indices_v6_ausentes IS NOT NULL
                        THEN 'Índices: ' || indices_v6_ausentes END
                );
        END IF;

        RETURN;
    END IF;

    SELECT string_agg(tabela, ', ' ORDER BY tabela)
      INTO tabelas_legado_ausentes
      FROM (VALUES
          ('aluno'),
          ('contrato'),
          ('cobranca'),
          ('programa_treino'),
          ('dia_treino'),
          ('plano'),
          ('unidade'),
          ('exercicio'),
          ('dia_treino_exercicio'),
          ('treino_ativo')
      ) AS requeridas(tabela)
     WHERE to_regclass(tabela) IS NULL;

    IF tabelas_legado_ausentes IS NOT NULL THEN
        RAISE EXCEPTION USING
            MESSAGE = 'Migração V2 interrompida: schema legado incompleto.',
            DETAIL = format('Tabelas V5 ausentes: %s', tabelas_legado_ausentes);
    END IF;

    SELECT string_agg(format('%s.%s', tabela, coluna), ', ' ORDER BY tabela, coluna)
      INTO colunas_legado_ausentes
      FROM (VALUES
          ('aluno', 'id'),
          ('aluno', 'cpf'),
          ('aluno', 'telefone'),
          ('aluno', 'data_nascimento'),
          ('aluno', 'altura'),
          ('aluno', 'status'),
          ('contrato', 'id'),
          ('contrato', 'aluno_id'),
          ('contrato', 'plano_id'),
          ('contrato', 'unidade_id'),
          ('contrato', 'data_inicio'),
          ('contrato', 'data_termino'),
          ('contrato', 'status'),
          ('cobranca', 'id'),
          ('cobranca', 'contrato_id'),
          ('cobranca', 'data_vencimento'),
          ('cobranca', 'status'),
          ('programa_treino', 'id'),
          ('programa_treino', 'nivel_experiencia'),
          ('programa_treino', 'frequencia_semanal'),
          ('dia_treino', 'id'),
          ('dia_treino', 'programa_treino_id'),
          ('dia_treino', 'nome_dia'),
          ('dia_treino', 'ordem'),
          ('plano', 'id'),
          ('plano', 'tipo'),
          ('exercicio', 'id'),
          ('exercicio', 'nome'),
          ('exercicio', 'musculatura_alvo'),
          ('dia_treino_exercicio', 'id'),
          ('dia_treino_exercicio', 'dia_treino_id'),
          ('dia_treino_exercicio', 'exercicio_id'),
          ('dia_treino_exercicio', 'series'),
          ('dia_treino_exercicio', 'repeticoes'),
          ('dia_treino_exercicio', 'ordem'),
          ('treino_ativo', 'id'),
          ('treino_ativo', 'aluno_id'),
          ('treino_ativo', 'programa_treino_id'),
          ('treino_ativo', 'data_inicio'),
          ('treino_ativo', 'status')
      ) AS requeridas(tabela, coluna)
     WHERE NOT EXISTS (
         SELECT 1
           FROM information_schema.columns c
          WHERE c.table_schema = current_schema()
            AND c.table_name = requeridas.tabela
            AND c.column_name = requeridas.coluna
     );

    IF colunas_legado_ausentes IS NOT NULL THEN
        RAISE EXCEPTION USING
            MESSAGE = 'Migração V2 interrompida: schema legado incompleto.',
            DETAIL = format('Colunas V5 ausentes: %s', colunas_legado_ausentes);
    END IF;

    SELECT string_agg(artefato, ', ' ORDER BY artefato)
      INTO artefatos_v6_preexistentes
      FROM (
          SELECT 'item_treino' AS artefato
           WHERE to_regclass('item_treino') IS NOT NULL
          UNION ALL
          SELECT 'sessao_treino'
           WHERE to_regclass('sessao_treino') IS NOT NULL
          UNION ALL
          SELECT format('%s.%s', c.table_name, c.column_name)
            FROM information_schema.columns c
           WHERE c.table_schema = current_schema()
             AND (c.table_name, c.column_name) IN (
                 ('aluno', 'google_subject'),
                 ('aluno', 'programa_atual_id'),
                 ('contrato', 'plano'),
                 ('cobranca', 'numero_parcela'),
                 ('dia_treino', 'nome')
             )
      ) artefatos;

    IF artefatos_v6_preexistentes IS NOT NULL THEN
        RAISE EXCEPTION USING
            MESSAGE = 'Migração V2 interrompida: schema legado contém artefatos V6 preexistentes e pode estar parcialmente migrado.',
            DETAIL = format('Artefatos encontrados: %s', artefatos_v6_preexistentes);
    END IF;

    SELECT string_agg(
               format('contrato_id=%s plano=%s', c.id, COALESCE(p.tipo::text, '<ausente>')),
               ', ' ORDER BY c.id
           )
      INTO contratos_com_plano_fora_v6
      FROM contrato c
      LEFT JOIN plano p ON p.id = c.plano_id
     WHERE p.id IS NULL
        OR p.tipo IS NULL
        OR p.tipo::text NOT IN ('MENSAL', 'TRIMESTRAL', 'SEMESTRAL');

    IF contratos_com_plano_fora_v6 IS NOT NULL THEN
        RAISE EXCEPTION USING
            MESSAGE = 'Migração V2 interrompida: contratos usam planos sem mapeamento aprovado para V6.',
            DETAIL = format(
                'Nenhum contrato foi convertido. Revise e preserve os registros legados antes de decidir seu tratamento. Contratos: %s',
                contratos_com_plano_fora_v6
            );
    END IF;

    SELECT string_agg(
               format('nivel=%s frequencia=%s quantidade=%s',
                   nivel_experiencia, frequencia_semanal, quantidade),
               '; ' ORDER BY nivel_experiencia, frequencia_semanal
           )
      INTO conflitos_perfil_programa
      FROM (
          SELECT nivel_experiencia, frequencia_semanal, count(*) AS quantidade
            FROM programa_treino
           GROUP BY nivel_experiencia, frequencia_semanal
          HAVING count(*) > 1
      ) conflitos;

    SELECT string_agg(format('email=%s aluno_ids=%s', email, ids),
                      '; ' ORDER BY email)
      INTO emails_duplicados
      FROM (
          SELECT email, string_agg(id::text, ',' ORDER BY id) AS ids
            FROM aluno
           WHERE email IS NOT NULL
           GROUP BY email
          HAVING count(*) > 1
      ) conflitos;

    SELECT string_agg(id::text, ', ' ORDER BY id)
      INTO alunos_sem_email
      FROM aluno
     WHERE email IS NULL;

    SELECT string_agg(
               format('aluno_id=%s contratos=%s', aluno_id, ids),
               '; ' ORDER BY aluno_id
           )
      INTO conflitos_contrato_ativo
      FROM (
          SELECT aluno_id, string_agg(id::text, ',' ORDER BY id) AS ids
            FROM contrato
           WHERE status::text = 'ATIVO'
           GROUP BY aluno_id
          HAVING count(*) > 1
      ) conflitos;

    SELECT string_agg(
               format('programa_treino_id=%s ordem=%s quantidade=%s',
                   programa_treino_id, ordem, quantidade),
               '; ' ORDER BY programa_treino_id, ordem
           )
      INTO conflitos_ordem_dia
      FROM (
          SELECT programa_treino_id, ordem, count(*) AS quantidade
            FROM dia_treino
           GROUP BY programa_treino_id, ordem
          HAVING count(*) > 1
      ) conflitos;

    SELECT string_agg(
               format('dia_treino_id=%s ordem=%s quantidade=%s',
                   dia_treino_id, ordem, quantidade),
               '; ' ORDER BY dia_treino_id, ordem
           )
      INTO conflitos_ordem_item
      FROM (
          SELECT dia_treino_id, ordem, count(*) AS quantidade
            FROM dia_treino_exercicio
           GROUP BY dia_treino_id, ordem
          HAVING count(*) > 1
      ) conflitos;

    SELECT string_agg(
               format('treino_ativo_id=%s aluno_id=%s programa_treino_id=%s',
                   t.id, t.aluno_id, t.programa_treino_id),
               '; ' ORDER BY t.id
           )
      INTO treinos_com_programa_orfao
      FROM treino_ativo t
      LEFT JOIN programa_treino p ON p.id = t.programa_treino_id
     WHERE p.id IS NULL;

    SELECT string_agg(format('treino_ativo_id=%s aluno_id=%s', t.id, t.aluno_id),
                       ', ' ORDER BY t.id)
       INTO treinos_com_aluno_orfao
       FROM treino_ativo t
       LEFT JOIN aluno a ON a.id = t.aluno_id
      WHERE a.id IS NULL;

    SELECT string_agg(
               format('dia_treino_exercicio_id=%s exercicio_id=%s',
                   dte.id, dte.exercicio_id),
               '; ' ORDER BY dte.id
           )
      INTO itens_com_exercicio_orfao
      FROM dia_treino_exercicio dte
      LEFT JOIN exercicio e ON e.id = dte.exercicio_id
     WHERE e.id IS NULL;

    SELECT string_agg(format('dia_treino_exercicio_id=%s dia_treino_id=%s', dte.id, dte.dia_treino_id),
                       ', ' ORDER BY dte.id)
       INTO itens_com_dia_orfao
       FROM dia_treino_exercicio dte
       LEFT JOIN dia_treino d ON d.id = dte.dia_treino_id
      WHERE d.id IS NULL;

    SELECT string_agg(format('contrato_id=%s aluno_id=%s', c.id, c.aluno_id),
                      ', ' ORDER BY c.id)
      INTO contratos_com_aluno_orfao
      FROM contrato c
      LEFT JOIN aluno a ON a.id = c.aluno_id
     WHERE a.id IS NULL;

    SELECT string_agg(
               format('contrato_id=%s unidade_id=%s',
                   c.id, COALESCE(c.unidade_id::text, '<NULL>')),
               ', ' ORDER BY c.id
           )
      INTO contratos_com_unidade_orfa
      FROM contrato c
      LEFT JOIN unidade u ON u.id = c.unidade_id
     WHERE u.id IS NULL;

    SELECT string_agg(format('cobranca_id=%s contrato_id=%s', c.id, c.contrato_id),
                      ', ' ORDER BY c.id)
      INTO cobrancas_com_contrato_orfao
      FROM cobranca c
      LEFT JOIN contrato ct ON ct.id = c.contrato_id
     WHERE ct.id IS NULL;

    SELECT string_agg(format('dia_treino_id=%s programa_treino_id=%s', d.id, d.programa_treino_id),
                      ', ' ORDER BY d.id)
      INTO dias_com_programa_orfao
      FROM dia_treino d
      LEFT JOIN programa_treino p ON p.id = d.programa_treino_id
     WHERE p.id IS NULL;

    IF conflitos_perfil_programa IS NOT NULL
        OR conflitos_contrato_ativo IS NOT NULL
        OR conflitos_ordem_dia IS NOT NULL
        OR conflitos_ordem_item IS NOT NULL
        OR emails_duplicados IS NOT NULL
        OR alunos_sem_email IS NOT NULL
        OR treinos_com_programa_orfao IS NOT NULL
        OR treinos_com_aluno_orfao IS NOT NULL
        OR itens_com_exercicio_orfao IS NOT NULL
        OR itens_com_dia_orfao IS NOT NULL
        OR contratos_com_aluno_orfao IS NOT NULL
        OR contratos_com_unidade_orfa IS NOT NULL
        OR cobrancas_com_contrato_orfao IS NOT NULL
        OR dias_com_programa_orfao IS NOT NULL THEN
        RAISE EXCEPTION USING
            MESSAGE = 'Migração V2 interrompida: conflitos nos dados legados. Nenhuma transformação foi iniciada.',
            DETAIL = concat_ws(E'\n',
                CASE WHEN conflitos_perfil_programa IS NOT NULL
                    THEN 'Perfis de programa duplicados: ' || conflitos_perfil_programa END,
                CASE WHEN conflitos_contrato_ativo IS NOT NULL
                    THEN 'Contratos ativos duplicados por aluno: ' || conflitos_contrato_ativo END,
                CASE WHEN conflitos_ordem_dia IS NOT NULL
                    THEN 'Ordens de dia duplicadas: ' || conflitos_ordem_dia END,
                CASE WHEN conflitos_ordem_item IS NOT NULL
                    THEN 'Ordens de item duplicadas: ' || conflitos_ordem_item END,
                CASE WHEN emails_duplicados IS NOT NULL
                    THEN 'E-mails de aluno duplicados: ' || emails_duplicados END,
                CASE WHEN alunos_sem_email IS NOT NULL
                    THEN 'Alunos sem e-mail: ' || alunos_sem_email END,
                CASE WHEN treinos_com_programa_orfao IS NOT NULL
                    THEN 'Treinos ativos com programa ausente: ' || treinos_com_programa_orfao END,
                CASE WHEN treinos_com_aluno_orfao IS NOT NULL
                    THEN 'Treinos ativos sem aluno correspondente: ' || treinos_com_aluno_orfao END,
                CASE WHEN itens_com_exercicio_orfao IS NOT NULL
                    THEN 'Itens sem exercício correspondente (seriam omitidos pela conversão): '
                        || itens_com_exercicio_orfao END,
                CASE WHEN itens_com_dia_orfao IS NOT NULL
                    THEN 'Itens sem dia de treino correspondente: ' || itens_com_dia_orfao END,
                CASE WHEN contratos_com_aluno_orfao IS NOT NULL
                    THEN 'Contratos sem aluno correspondente: ' || contratos_com_aluno_orfao END,
                CASE WHEN contratos_com_unidade_orfa IS NOT NULL
                    THEN 'Contratos sem unidade correspondente: ' || contratos_com_unidade_orfa END,
                CASE WHEN cobrancas_com_contrato_orfao IS NOT NULL
                    THEN 'Cobranças sem contrato correspondente: ' || cobrancas_com_contrato_orfao END,
                CASE WHEN dias_com_programa_orfao IS NOT NULL
                    THEN 'Dias sem programa correspondente: ' || dias_com_programa_orfao END
            );
    END IF;

    SELECT c.conname,
           c.contype = 'u'
               AND c.conkey = ARRAY[(
                   SELECT a.attnum
                     FROM pg_catalog.pg_attribute a
                    WHERE a.attrelid = c.conrelid
                      AND a.attname = 'email'
                      AND NOT a.attisdropped
               )]::smallint[]
               AND NOT c.condeferrable
               AND NOT c.condeferred AS is_expected
      INTO unique_existente
      FROM pg_catalog.pg_constraint c
     WHERE c.conrelid = to_regclass('aluno')
       AND c.conname = 'aluno_email_key';

    IF FOUND THEN
        IF NOT unique_existente.is_expected THEN
            RAISE EXCEPTION 'Migração V2 interrompida: constraint aluno_email_key existe com definição incompatível.';
        END IF;
    ELSE
        SELECT c.conname INTO unique_equivalente
          FROM pg_catalog.pg_constraint c
         WHERE c.conrelid = to_regclass('aluno')
           AND c.contype = 'u'
           AND c.conkey = ARRAY[(
               SELECT a.attnum
                 FROM pg_catalog.pg_attribute a
                WHERE a.attrelid = c.conrelid
                  AND a.attname = 'email'
                  AND NOT a.attisdropped
           )]::smallint[]
           AND NOT c.condeferrable
           AND NOT c.condeferred
         ORDER BY c.conname
         LIMIT 1;

        IF FOUND THEN
            EXECUTE format('ALTER TABLE aluno RENAME CONSTRAINT %I TO aluno_email_key',
                unique_equivalente.conname);
        ELSE
            SELECT idx.relname INTO indice_unico
              FROM pg_catalog.pg_index i
              JOIN pg_catalog.pg_class idx ON idx.oid = i.indexrelid
              JOIN pg_catalog.pg_am am ON am.oid = idx.relam
             WHERE i.indrelid = to_regclass('aluno')
               AND i.indisunique
               AND i.indisvalid
               AND i.indisready
               AND i.indpred IS NULL
               AND i.indexprs IS NULL
               AND i.indnatts = i.indnkeyatts
               AND i.indnkeyatts = 1
               AND am.amname = 'btree'
               AND (
                   SELECT array_agg(a.attname ORDER BY k.ordinality)::text[]
                     FROM unnest(i.indkey::smallint[]) WITH ORDINALITY AS k(attnum, ordinality)
                     JOIN pg_catalog.pg_attribute a
                       ON a.attrelid = i.indrelid
                      AND a.attnum = k.attnum
                      AND NOT a.attisdropped
               ) = ARRAY['email']::text[]
             ORDER BY idx.relname
             LIMIT 1;

            IF FOUND THEN
                EXECUTE format(
                    'ALTER TABLE aluno ADD CONSTRAINT aluno_email_key UNIQUE USING INDEX %I',
                    indice_unico.relname
                );
            ELSE
                ALTER TABLE aluno ADD CONSTRAINT aluno_email_key UNIQUE (email);
            END IF;
        END IF;
    END IF;

    ALTER TABLE aluno ALTER COLUMN email SET NOT NULL;
    ALTER TABLE aluno ADD COLUMN google_subject varchar(255);
    ALTER TABLE aluno ADD CONSTRAINT aluno_google_subject_key UNIQUE (google_subject);
    ALTER TABLE aluno ADD COLUMN programa_atual_id bigint;
    ALTER TABLE aluno ADD CONSTRAINT fk_aluno_programa_atual FOREIGN KEY (programa_atual_id)
        REFERENCES programa_treino(id);
    ALTER TABLE aluno ADD CONSTRAINT ck_aluno_status CHECK (status IN ('ATIVO', 'INATIVO'));
    CREATE INDEX idx_aluno_programa_atual ON aluno (programa_atual_id);
    UPDATE aluno a
       SET programa_atual_id = t.programa_treino_id
      FROM (
          SELECT DISTINCT ON (aluno_id) aluno_id, programa_treino_id
            FROM treino_ativo
           WHERE status = 'ATIVO'
           ORDER BY aluno_id, data_inicio DESC, id DESC
      ) t
     WHERE a.id = t.aluno_id;

    ALTER TABLE aluno ALTER COLUMN cpf DROP NOT NULL;
    ALTER TABLE aluno ALTER COLUMN telefone DROP NOT NULL;
    ALTER TABLE aluno ALTER COLUMN data_nascimento DROP NOT NULL;
    ALTER TABLE aluno ALTER COLUMN altura TYPE numeric(5, 2) USING altura::numeric(5, 2);

    ALTER TABLE programa_treino ADD CONSTRAINT uk_programa_perfil
        UNIQUE (nivel_experiencia, frequencia_semanal);

    ALTER TABLE contrato ADD COLUMN plano varchar(20);
    UPDATE contrato c SET plano = p.tipo
      FROM plano p WHERE p.id = c.plano_id;
    UPDATE contrato SET data_termino = (data_inicio + interval '1 month')::date WHERE plano = 'MENSAL';
    UPDATE contrato SET data_termino = (data_inicio + interval '3 months')::date WHERE plano = 'TRIMESTRAL';
    UPDATE contrato SET data_termino = (data_inicio + interval '6 months')::date WHERE plano = 'SEMESTRAL';
    ALTER TABLE contrato ALTER COLUMN plano SET NOT NULL;
    ALTER TABLE contrato ALTER COLUMN unidade_id DROP NOT NULL;
    ALTER TABLE contrato ALTER COLUMN plano_id DROP NOT NULL;
    ALTER TABLE contrato RENAME COLUMN unidade_id TO legacy_unidade_id;
    ALTER TABLE contrato RENAME COLUMN plano_id TO legacy_plano_id;
    ALTER TABLE contrato ADD CONSTRAINT ck_contrato_plano
        CHECK (plano IN ('MENSAL', 'TRIMESTRAL', 'SEMESTRAL'));
    ALTER TABLE contrato ADD CONSTRAINT ck_contrato_status
        CHECK (status IN ('ATIVO', 'ENCERRADO', 'CANCELADO'));
    CREATE INDEX idx_contrato_aluno_status ON contrato (aluno_id, status, data_termino);
    CREATE UNIQUE INDEX uk_contrato_ativo_aluno ON contrato (aluno_id) WHERE status = 'ATIVO';

    ALTER TABLE cobranca ADD COLUMN numero_parcela integer;
    WITH parcelas AS (
        SELECT id, row_number() OVER (PARTITION BY contrato_id ORDER BY data_vencimento, id) AS numero
          FROM cobranca
    )
    UPDATE cobranca c SET numero_parcela = p.numero FROM parcelas p WHERE c.id = p.id;
    ALTER TABLE cobranca ALTER COLUMN numero_parcela SET NOT NULL;
    ALTER TABLE cobranca ADD CONSTRAINT uk_cobranca_parcela UNIQUE (contrato_id, numero_parcela);
    ALTER TABLE cobranca ADD CONSTRAINT ck_cobranca_status
        CHECK (status IN ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO'));
    CREATE INDEX idx_cobranca_vencimento_status ON cobranca (data_vencimento, status);
    CREATE INDEX idx_cobranca_contrato ON cobranca (contrato_id);

    ALTER TABLE dia_treino ADD COLUMN nome varchar(255);
    UPDATE dia_treino SET nome = nome_dia;
    IF EXISTS (
        SELECT 1
          FROM dia_treino
         WHERE nome IS NULL
            OR nome IS DISTINCT FROM nome_dia
    ) THEN
        RAISE EXCEPTION 'Migração V2 interrompida: nomes dos dias não foram preservados em dia_treino.nome.';
    END IF;
    ALTER TABLE dia_treino ALTER COLUMN nome SET NOT NULL;
    ALTER TABLE dia_treino DROP COLUMN nome_dia;
    ALTER TABLE dia_treino ADD CONSTRAINT uk_dia_ordem UNIQUE (programa_treino_id, ordem);

    CREATE TABLE item_treino (
        id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        dia_treino_id bigint NOT NULL,
        nome_exercicio varchar(255) NOT NULL,
        musculatura_alvo varchar(255) NOT NULL,
        series integer NOT NULL,
        repeticoes varchar(255) NOT NULL,
        ordem integer NOT NULL,
        CONSTRAINT fk_item_dia FOREIGN KEY (dia_treino_id) REFERENCES dia_treino(id),
        CONSTRAINT uk_item_ordem UNIQUE (dia_treino_id, ordem)
    );
    INSERT INTO item_treino (dia_treino_id, nome_exercicio, musculatura_alvo, series, repeticoes, ordem)
    SELECT dte.dia_treino_id, e.nome, e.musculatura_alvo, dte.series,
           dte.repeticoes::varchar, dte.ordem
      FROM dia_treino_exercicio dte
      JOIN exercicio e ON e.id = dte.exercicio_id;

    CREATE TABLE sessao_treino (
        id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        aluno_id bigint NOT NULL,
        programa_treino_id bigint NOT NULL,
        dia_treino_id bigint NOT NULL,
        data_hora_conclusao timestamp without time zone NOT NULL,
        CONSTRAINT fk_sessao_aluno FOREIGN KEY (aluno_id) REFERENCES aluno(id),
        CONSTRAINT fk_sessao_programa FOREIGN KEY (programa_treino_id) REFERENCES programa_treino(id),
        CONSTRAINT fk_sessao_dia FOREIGN KEY (dia_treino_id) REFERENCES dia_treino(id)
    );
    CREATE INDEX idx_sessao_aluno_programa_data
        ON sessao_treino (aluno_id, programa_treino_id, data_hora_conclusao);

    FOR fk IN
        SELECT *
          FROM (VALUES
              ('contrato', 'fk_contrato_aluno', 'aluno_id', 'aluno', 'id'),
              ('cobranca', 'fk_cobranca_contrato', 'contrato_id', 'contrato', 'id'),
              ('dia_treino', 'fk_dia_programa', 'programa_treino_id', 'programa_treino', 'id')
          ) AS requeridas(tabela, constraint_name, coluna, tabela_referenciada, coluna_referenciada)
    LOOP
        SELECT c.conname,
               c.contype = 'f'
                   AND c.confrelid = to_regclass(fk.tabela_referenciada)
                   AND c.conkey = ARRAY[(
                       SELECT a.attnum
                         FROM pg_catalog.pg_attribute a
                        WHERE a.attrelid = c.conrelid
                          AND a.attname = fk.coluna
                          AND NOT a.attisdropped
                   )]::smallint[]
                   AND c.confkey = ARRAY[(
                       SELECT a.attnum
                         FROM pg_catalog.pg_attribute a
                        WHERE a.attrelid = c.confrelid
                          AND a.attname = fk.coluna_referenciada
                          AND NOT a.attisdropped
                   )]::smallint[]
                   AND c.confupdtype = 'a'
                   AND c.confdeltype = 'a'
                   AND c.confmatchtype = 's'
                   AND NOT c.condeferrable AS is_expected,
               c.convalidated AS is_validated
          INTO fk_existente
          FROM pg_catalog.pg_constraint c
         WHERE c.conrelid = to_regclass(fk.tabela)
           AND c.conname = fk.constraint_name;

        IF FOUND THEN
            IF NOT fk_existente.is_expected THEN
                RAISE EXCEPTION 'Migração V2 interrompida: constraint % na tabela % existe com definição incompatível.',
                    fk.constraint_name, fk.tabela;
            END IF;
            IF NOT fk_existente.is_validated THEN
                EXECUTE format('ALTER TABLE %I VALIDATE CONSTRAINT %I',
                    fk.tabela, fk.constraint_name);
            END IF;
            CONTINUE;
        END IF;

        SELECT count(*) INTO fks_equivalentes
          FROM pg_catalog.pg_constraint c
         WHERE c.conrelid = to_regclass(fk.tabela)
           AND c.contype = 'f'
           AND c.confrelid = to_regclass(fk.tabela_referenciada)
           AND c.conkey = ARRAY[(
               SELECT a.attnum
                 FROM pg_catalog.pg_attribute a
                WHERE a.attrelid = c.conrelid
                  AND a.attname = fk.coluna
                  AND NOT a.attisdropped
           )]::smallint[]
           AND c.confkey = ARRAY[(
               SELECT a.attnum
                 FROM pg_catalog.pg_attribute a
                WHERE a.attrelid = c.confrelid
                  AND a.attname = fk.coluna_referenciada
                  AND NOT a.attisdropped
           )]::smallint[]
           AND c.confupdtype = 'a'
           AND c.confdeltype = 'a'
           AND c.confmatchtype = 's'
           AND NOT c.condeferrable;

        IF fks_equivalentes > 0 THEN
            SELECT c.conname, c.convalidated INTO fk_equivalente
              FROM pg_catalog.pg_constraint c
             WHERE c.conrelid = to_regclass(fk.tabela)
               AND c.contype = 'f'
               AND c.confrelid = to_regclass(fk.tabela_referenciada)
               AND c.conkey = ARRAY[(
                   SELECT a.attnum
                     FROM pg_catalog.pg_attribute a
                    WHERE a.attrelid = c.conrelid
                      AND a.attname = fk.coluna
                      AND NOT a.attisdropped
               )]::smallint[]
               AND c.confkey = ARRAY[(
                   SELECT a.attnum
                     FROM pg_catalog.pg_attribute a
                    WHERE a.attrelid = c.confrelid
                      AND a.attname = fk.coluna_referenciada
                      AND NOT a.attisdropped
               )]::smallint[]
               AND c.confupdtype = 'a'
               AND c.confdeltype = 'a'
               AND c.confmatchtype = 's'
               AND NOT c.condeferrable
             ORDER BY c.conname
             LIMIT 1;

            IF NOT fk_equivalente.convalidated THEN
                EXECUTE format('ALTER TABLE %I VALIDATE CONSTRAINT %I',
                    fk.tabela, fk_equivalente.conname);
            END IF;
            EXECUTE format('ALTER TABLE %I RENAME CONSTRAINT %I TO %I',
                fk.tabela, fk_equivalente.conname, fk.constraint_name);
        ELSE
            EXECUTE format(
                'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I (%I) NOT VALID',
                fk.tabela, fk.constraint_name, fk.coluna,
                fk.tabela_referenciada, fk.coluna_referenciada
            );
            EXECUTE format('ALTER TABLE %I VALIDATE CONSTRAINT %I',
                fk.tabela, fk.constraint_name);
        END IF;
    END LOOP;

    ALTER TABLE unidade RENAME TO legacy_v5_unidade;
    ALTER TABLE plano RENAME TO legacy_v5_plano;
    ALTER TABLE exercicio RENAME TO legacy_v5_exercicio;
    ALTER TABLE dia_treino_exercicio RENAME TO legacy_v5_dia_treino_exercicio;
    ALTER TABLE treino_ativo RENAME TO legacy_v5_treino_ativo;
END $$;
