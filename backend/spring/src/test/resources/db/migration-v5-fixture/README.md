# Fixture sintética V5 para validar V2 → V6

Esta fixture é sintética, criada a partir das tabelas e colunas que
`V2__migrate_legacy_v5_data.sql` exige. Ela **não representa nem certifica o DDL
original da V5**. Os scripts não apagam nem criam bancos; cada execução deve
usar um banco PostgreSQL descartável, exclusivo e novo.

## Arquivos

- `00_schema_v5_synthetic.sql`: estrutura legada mínima, com FKs para permitir
  testar os caminhos válidos e cenários órfãos controlados.
- `01_fixture_success.sql`: dados determinísticos do caso bem-sucedido:
  12 perfis, 3 alunos, 3 contratos, 6 cobranças, 5 dias, 3 exercícios,
  6 relações exercício/dia e 6 treinos ativos.
- `02_validation_success.sql`: asserts das contagens, vínculos, parcelas,
  atributos dos itens com `EXCEPT ALL` em ambas as direções e preservação das
  tabelas legadas.
- `03_validation_rollback.sql`: asserts para a falha tardia por overflow de
  altura e inspeção do histórico Flyway.
- `04_prepare_negative_scenario.sql`: mutações isoladas a serem aplicadas
  somente em uma cópia nova da fixture descartável. Requer `psql -v scenario=...`.

## Dados e resultados esperados

O caso válido associa o aluno 10 ao programa 4. Os treinos ativos 2002 e 2006
têm a mesma data de início (`2025-02-01`); a ordenação da V2 por
`data_inicio DESC, id DESC` desempata em favor do ID 2006/programa 4. Para os
alunos 20 e 30, os programas atuais esperados são 5 e 12.

As contagens esperadas após a V2 são: 3 alunos, 12 programas, 5 dias, 6 itens,
3 contratos, 6 cobranças e 0 sessões. A tabela de sucesso verifica a
numeração das cobranças pela data de vencimento e pelo ID, além das FKs V6
validadas e das cinco tabelas renomeadas para `legacy_v5_*`.

Na migração de `dia_treino`, a V2 adiciona a coluna `nome`, copia os valores
originais de `nome_dia`, verifica que nenhum nome ficou nulo ou divergente e,
em seguida, remove `nome_dia` da tabela de domínio. Os valores dos cinco dias
permanecem em `nome`, conforme o modelo V6. Essa remoção não altera a
preservação das outras tabelas legadas, que continuam renomeadas como
`legacy_v5_*`.

Os seis itens esperados são exatamente:

| Dia | Ordem | Exercício | Musculatura | Séries | Repetições |
|---:|---:|---|---|---:|---:|
| 101 | 1 | Supino reto | Peitoral | 3 | 10 |
| 101 | 2 | Supino reto | Peitoral | 4 | 8 |
| 102 | 1 | Agachamento | Quadríceps | 3 | 12 |
| 201 | 1 | Supino reto | Peitoral | 3 | 10 |
| 501 | 1 | Remada baixa | Costas | 4 | 10 |
| 1201 | 1 | Agachamento | Quadríceps | 5 | 6 |

A comparação `EXCEPT ALL` detecta valores ausentes, inesperados e duplicados
sem eliminar multiplicidades. Além disso, os asserts confirmam que `Supino
reto` aparece três vezes no total e duas vezes no dia 101, com séries e
repetições diferentes. Não há itens ou exercícios adicionais na fixture.

### Datas de término dos contratos

A V2 recalcula `data_termino` para **todos** os contratos suportados, sem
condicionar pelo status, usando `data_inicio + 1`, `3` ou `6` meses. Neste
conjunto sintético, os resultados observados esperados são `2025-02-15`,
`2025-05-10` e `2025-09-20`. A fixture registra datas legadas diferentes para
deixar visível a sobrescrita. Esse comportamento da migration ainda depende de
confirmação do grupo; o teste não o transforma em decisão de domínio aprovada.

## Preparação em bancos descartáveis

Não use `v6_fresh`, `v6_recognition_test` ou qualquer banco com dados úteis.
Use nomes novos por cenário, por exemplo `v6_fixture_success_20261123`,
`v6_fixture_rollback_20261123` e `v6_fixture_<cenario>_20261123`. Não remova
bancos após o teste como parte deste roteiro.

Com o contêiner PostgreSQL 17 existente `academia-v6-audit` exposto em
`localhost:55432`, e credenciais fornecidas localmente, carregue o schema e os
dados em um banco recém-criado:

```bash
sudo docker exec -i academia-v6-audit createdb -U v6audit v6_fixture_success_20261123
sudo docker exec -i academia-v6-audit psql -U v6audit -d v6_fixture_success_20261123 \
  -v ON_ERROR_STOP=1 < backend/spring/src/test/resources/db/migration-v5-fixture/00_schema_v5_synthetic.sql
sudo docker exec -i academia-v6-audit psql -U v6audit -d v6_fixture_success_20261123 \
  -v ON_ERROR_STOP=1 < backend/spring/src/test/resources/db/migration-v5-fixture/01_fixture_success.sql
```

O roteiro não acessa bancos existentes e não inicia o Spring Boot. Não passe
senhas em argumentos; forneça-as ao cliente Flyway por mecanismo local seguro.

## Flyway isolado do Spring Boot

O `pom.xml` declara `flyway-core` e `flyway-database-postgresql` com versão
efetiva 11.7.2, além do driver PostgreSQL. Não declara o plugin Maven Flyway.
Para execução futura e controlada, o goal Maven pode ser invocado diretamente
com a mesma versão do Flyway. O comando abaixo é apenas documentação: **não foi
executado nesta etapa**.

```bash
cd backend/spring
export FLYWAY_URL='jdbc:postgresql://localhost:55432/v6_fixture_success_20261123'
export FLYWAY_USER='v6audit'
export FLYWAY_PASSWORD='<senha fornecida localmente>'
./mvnw org.flywaydb:flyway-maven-plugin:11.7.2:migrate \
  -Dflyway.locations=filesystem:src/main/resources/db/migration \
  -Dflyway.baselineOnMigrate=true \
  -Dflyway.baselineVersion=1 \
  -Dflyway.baselineDescription='Schema legado V5'
```

O baseline em versão 1 é necessário porque a fixture carrega um schema legado
não vazio; a V1 não deve ser aplicada sobre esse schema e a V2 deve ser a
próxima migration executada. As propriedades correspondem a
`application.properties`. O plugin Maven não está declarado no POM; a invocação
com coordenadas e versão explícitas evita alterar o manifesto. A versão efetiva
do plugin, sua resolução e a conexão ao banco ainda precisam ser comprovadas na
execução futura. Se o plugin não enxergar o módulo PostgreSQL no classpath,
interrompa e corrija a configuração somente em ambiente descartável, sem
iniciar a aplicação.

Depois de sucesso:

```bash
sudo docker exec -i academia-v6-audit psql -U v6audit -d v6_fixture_success_20261123 \
  -v ON_ERROR_STOP=1 < backend/spring/src/test/resources/db/migration-v5-fixture/02_validation_success.sql
```

## Cenários negativos isolados

Cada cenário requer outro banco recém-criado, carregado com os dois scripts de
fixture, e a preparação abaixo antes de executar a mesma migration V2. O script
usa apenas o cenário especificado; nunca o aplique em banco real ou compartilhado.

| `scenario` | Preparação em relação à fixture válida | Diagnóstico esperado no preflight |
|---|---|---|
| `plan_diario` | Altera `plano.id=1` para `DIARIO` | `contrato_id=1001 plano=DIARIO`; bloqueia sem mapeamento aprovado |
| `plan_anual` | Altera `plano.id=1` para `ANUAL` | `contrato_id=1001 plano=ANUAL`; bloqueia sem mapeamento aprovado |
| `orphan_contract_plan` | Remove a FK legada e insere contrato 9904 com plano 9999 | `contrato_id=9904 plano=<ausente>`; bloqueia no preflight |
| `orphan_contract_student` | Remove a FK legada e insere contrato 9901 com aluno 9999 | `Contratos sem aluno correspondente: contrato_id=9901 aluno_id=9999` |
| `orphan_charge_contract` | Remove a FK legada e insere cobrança 9901 para contrato 9999 | `Cobranças sem contrato correspondente: cobranca_id=9901 contrato_id=9999` |
| `orphan_day_program` | Remove a FK legada e insere dia 9901 para programa 9999 | `Dias sem programa correspondente: dia_treino_id=9901 programa_treino_id=9999` |
| `orphan_active_program` | Remove a FK e insere treino ativo 9901 com programa 9999 | `Treinos ativos com programa ausente` com ID 9901 |
| `orphan_active_student` | Remove a FK e insere treino ativo 9902 com aluno 9999 | `Treinos ativos sem aluno correspondente` com ID 9902 |
| `orphan_item_exercise` | Remove a FK e insere relação 9901 com exercício 9999 | `Itens sem exercício correspondente` com IDs 9901/9999 |
| `orphan_item_day` | Remove a FK e insere relação 9902 com dia 9999 | `Itens sem dia de treino correspondente` com IDs 9902/9999 |
| `orphan_contract_unit` | Remove a FK e insere contrato 9902 com unidade 9999 | `Contratos sem unidade correspondente: contrato_id=9902 unidade_id=9999` |
| `duplicate_profile` | Insere programa 99 com perfil INICIANTE/6 | `Perfis de programa duplicados`, nível/frequência e quantidade |
| `duplicate_active_contract` | Insere contrato ATIVO 9903 para aluno 10 | `Contratos ativos duplicados por aluno` e IDs 1001/9903 |
| `duplicate_day_order` | Insere dia 9902 com programa 4/ordem 1 | `Ordens de dia duplicadas` |
| `duplicate_item_order` | Insere relação 9903 com dia 101/ordem 1 | `Ordens de item duplicadas` |
| `duplicate_email` | Remove unique de email e duplica o email do aluno 10 no aluno 20 | `E-mails de aluno duplicados` com IDs 10/20 |
| `null_email` | Define o email do aluno 20 como nulo | `Alunos sem e-mail: 20` |
| `overflow_height` | Define altura do aluno 10 como `999.999` | Falha tardia na conversão para `numeric(5,2)`, não no preflight |

Comandos de preparação em um banco descartável de exemplo:

```bash
sudo docker exec -i academia-v6-audit createdb -U v6audit v6_fixture_orphan_unit_20261123
sudo docker exec -i academia-v6-audit psql -U v6audit -d v6_fixture_orphan_unit_20261123 \
  -v ON_ERROR_STOP=1 < backend/spring/src/test/resources/db/migration-v5-fixture/00_schema_v5_synthetic.sql
sudo docker exec -i academia-v6-audit psql -U v6audit -d v6_fixture_orphan_unit_20261123 \
  -v ON_ERROR_STOP=1 < backend/spring/src/test/resources/db/migration-v5-fixture/01_fixture_success.sql
sudo docker exec -i academia-v6-audit psql -U v6audit -d v6_fixture_orphan_unit_20261123 \
  -v ON_ERROR_STOP=1 -v scenario=orphan_contract_unit \
  < backend/spring/src/test/resources/db/migration-v5-fixture/04_prepare_negative_scenario.sql
```

Repita o procedimento em banco novo para cada linha, trocando nome e valor de
`scenario`. Após a falha esperada, verifique o estado efetivo. Nos cenários de
preflight, a mensagem da V2 informa que nenhuma transformação foi iniciada; no
overflow, execute `03_validation_rollback.sql` para comprovar o rollback real.

## Verificação do rollback tardio

Em banco novo, carregue a fixture válida, depois prepare exclusivamente
`overflow_height`. A conversão de `999.999` de `numeric(6,3)` para `numeric(5,2)`
arredonda para `1000.00`, que excede a precisão de destino. Execute a V2
isoladamente e espere falha; não inicie Spring Boot. Após a falha, execute:

```bash
sudo docker exec -i academia-v6-audit psql -U v6audit -d v6_fixture_rollback_20261123 \
  -v ON_ERROR_STOP=1 < backend/spring/src/test/resources/db/migration-v5-fixture/03_validation_rollback.sql
```

Os asserts verificam a precisão/escala original, colunas e tabelas V6 ausentes,
nomes legados, ausência de `legacy_v5_*`, contagens, valores de contratos e
cobranças, altura original `999.999` e a presença de `dia_treino.nome_dia` com
seus cinco valores originais; `dia_treino.nome` não deve permanecer. A consulta
de histórico permite que a baseline versão 1 permaneça, mas falha se a versão
2 estiver registrada como sucesso. Em PostgreSQL, as alterações DDL e DML da
migration executada em uma transação devem reverter juntas; a consulta, e não
apenas o código de saída, deve demonstrar esse estado.

## Ordem recomendada

1. Criar banco exclusivo para sucesso; carregar schema e dados.
2. Executar somente o Flyway no banco descartável.
3. Executar `02_validation_success.sql` e guardar os resultados.
4. Repetir em bancos recém-criados para cada cenário negativo, verificando o
   diagnóstico e o estado após a falha.
5. Executar o caso de overflow por último e comprovar o rollback com
   `03_validation_rollback.sql`.

## Limitações e decisões ainda pendentes

- A fixture sintética cobre o formato exigido pela V2, não confirma o schema
  histórico original da V5.
- O schema sintético conserva apenas as colunas legadas necessárias ao fluxo e
  aos asserts, não todos os atributos de um possível banco de produção.
- O teste não decide mapeamentos para `DIARIO` ou `ANUAL`; a migration deve
  continuar bloqueando esses contratos até decisão do grupo.
- O recálculo de `data_termino` pode sobrescrever datas históricas e exige
  decisão de domínio.
- Os testes PostgreSQL ainda precisam ser executados em bancos descartáveis
  antes de considerar a migração validada.
- O Spring Boot, `DataInitializer` e agendamentos não devem ser iniciados:
  o inicializador insere perfis e associa alunos sem programa atual; o serviço
  de contratos também executa rotina agendada de encerramento.
