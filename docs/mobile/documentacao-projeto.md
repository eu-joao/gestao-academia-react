# Documentação do Projeto Mobile: Gestão Academia

Este documento apresenta a especificação técnica e o manual do aplicativo móvel de **Gestão de Treinos**, desenvolvido para a disciplina de Programação para Dispositivos Móveis (PDM) do Instituto Federal da Paraíba (IFPB) - Campus Esperança.

---

## 1. Tema Escolhido e Objetivos do Aplicativo

### 1.1 Tema

Gestão e acompanhamento personalizado de rotinas de treino para praticantes de atividade física e frequentadores de academia.

### 1.2 Objetivos

- **Principal:** Permitir ao usuário planejar, registrar, consultar, editar e excluir suas sessões semanais de treinamento físico de maneira prática, intuitiva e sem complexidade desnecessária.
- **Específicos:**
  - Garantir a persistência local dos dados no dispositivo, permitindo o uso integral offline e mantendo as informações preservadas após o fechamento ou reinicialização do aplicativo.
  - Oferecer navegação fluida e estruturada em abas ou telas dedicadas (Home, Listagem Inteligente, Cadastro/Edição e Detalhes) utilizando rotas modernas com Expo Router.
  - Disponibilizar recursos de busca em tempo real, filtros por dia da semana e ordenação para facilitar a organização das rotinas.
  - Exibir métricas e estatísticas simples (quantidade de sessões cadastradas, tempo total planejado e média de minutos por sessão) para acompanhamento do progresso semanal.

---

## 2. Modelo de Dados

O aplicativo gerencia a entidade central **Treino**, modelada em TypeScript e estruturada para representar fielmente uma sessão de exercícios na rotina do praticante.

### 2.1 Entidade `Treino`

| Atributo     | Tipo TypeScript     | Descrição                                                                 | Regras de Validação                                                                 |
| :----------- | :------------------ | :------------------------------------------------------------------------ | :---------------------------------------------------------------------------------- |
| `id`         | `string`            | Identificador único gerado por timestamp no momento da criação.           | Gerado automaticamente (`Date.now().toString()`), não editável.                     |
| `nome`       | `string`            | Nome ou grupamento muscular da sessão de treino.                          | Obrigatório, mínimo de 3 caracteres.                                                |
| `categoria`  | `string` (opcional) | Modalidade do treino (_Musculação_, _Cardio_, _Funcional_, _Mobilidade_). | Seleção por chips rápidos no formulário.                                            |
| `diaSemana`  | `string`            | Dia da semana em que o treino é executado.                                | Obrigatório (_Segunda_, _Terça_, _Quarta_, _Quinta_, _Sexta_, _Sábado_, _Domingo_). |
| `duracaoMin` | `number`            | Duração estimada da sessão em minutos.                                    | Obrigatório, número inteiro entre 1 e 300 minutos.                                  |

```typescript
export type Treino = {
  id: string;
  nome: string;
  categoria?: string;
  diaSemana: string;
  duracaoMin: number;
};
```

---

## 3. Justificativa Técnica do Método de Persistência

Para atender ao requisito **RF02 (Persistência de Dados)**, foi adotada a biblioteca oficial `@react-native-async-storage/async-storage`.

### 3.1 Motivação Técnica

1. **Adequação ao Modelo de Dados:** O domínio do aplicativo opera sobre uma coleção de sessões de treino pertencentes ao usuário do dispositivo. Por se tratar de um conjunto de dados direto e sem relacionamentos relacionais complexos (como chaves estrangeiras ou joins múltiplos), um banco relacional como SQLite agregaria complexidade desnecessária de schema e migrations.
2. **Leveza e Desempenho:** O `AsyncStorage` opera de forma não bloqueante (assíncrona) sobre o armazenamento nativo da plataforma (SharedPreferences no Android, UserDefaults/arquivos no iOS e LocalStorage na Web), consumindo pouca memória e com tempos de resposta imediatos para leituras e escritas serializadas em JSON.
3. **Multiplataforma Sem Fricção:** A biblioteca possui compatibilidade garantida tanto nos ambientes móveis (Android e iOS) quanto no ambiente Web (utilizado em desenvolvimento e testes rápidos com Expo).
4. **Isolamento e Clareza no Código:** Todas as operações com o storage foram encapsuladas em um módulo de serviço exclusivo (`src/services/treinoStorage.ts`), expondo funções puras e de assinatura simples (`listar`, `salvar`, `adicionar`, `atualizar`, `remover`, `buscarPorId`). Isso mantém a lógica dos componentes visuais limpa e modular.

---

## 4. Telas do Aplicativo e Fluxo de Navegação

O aplicativo utiliza a biblioteca **Expo Router** (baseada no sistema de arquivos). As rotas estão organizadas de forma hierárquica e declarativa:

```text
mobile/src/app/
├── _layout.tsx           # Layout raiz com Stack Router
├── index.tsx             # Rota '/' - Tela inicial / Boas-vindas
└── treinos/
    ├── _layout.tsx       # Layout aninhado para o grupo de treinos
    ├── index.tsx         # Rota '/treinos' - Listagem inteligente e estatísticas
    ├── novo.tsx          # Rota '/treinos/novo' - Formulário de cadastro e edição
    └── [id].tsx          # Rota '/treinos/[id]' - Detalhes da sessão
```

### 4.1 Descrição das Telas

1. **Tela Inicial / Boas-vindas (`/`):**
   - Apresenta mensagem de acolhimento e identidade visual da aplicação.
   - Exibe um resumo rápido informando a quantidade total de treinos na rotina do usuário.
   - Fornece botões de ação rápida para acessar a listagem ("Ver Meus Treinos") ou criar uma nova sessão ("Cadastrar Treino").
2. **Tela de Listagem Inteligente (`/treinos`):**
   - **Hero Card:** Imagem de cabeçalho com painel de estatísticas simples: Total de Sessões, Tempo Total em minutos e Média por Sessão.
   - **Barra de Busca:** Filtro textual dinâmico por nome do treino, com controle de foco e botão para limpar a digitação.
   - **Filtros por Dia:** Chips horizontais para filtrar treinos por dias específicos da semana (_Segunda_ a _Domingo_) ou exibir _Todos_.
   - **Ordenação:** Alternância rápida entre ordem padrão, duração decrescente e ordem alfabética (A-Z).
   - **Cards de Treino:** Apresentam o nome do treino, badge de categoria (_Musculação_, _Cardio_, etc.), dia da semana e tempo estimado, além de botões rápidos para edição e exclusão com diálogo de confirmação.
   - **Estado Vazio (Empty State):** Exibição amigável com imagem ilustrativa e botão de ação quando nenhum treino corresponde aos critérios ou quando a lista está vazia.
3. **Tela de Formulário (`/treinos/novo`):**
   - Permite cadastrar um novo treino ou editar um treino existente (quando invocada com o parâmetro `?id=...`).
   - Validação inline em tempo real contra campos em branco, nomes curtos (< 3 caracteres) ou durações inválidas (< 1 ou > 300 minutos).
   - Feedback visual imediato através de mensagens de erro específicas por campo e banner superior de confirmação de sucesso antes do redirecionamento.
4. **Tela de Detalhes (`/treinos/[id]`):**
   - Exibe a ficha completa do treino com cabeçalho em imagem, categoria destacada, dia programado e duração prevista.
   - Cartão com orientações de execução física e botões para editar ou remover o treino com confirmação de segurança.

### 4.2 Galeria Visual das Telas

|                                       Tela Inicial                                       |                               Listagem Inteligente & Estatísticas                               |                                              Cadastro & Edição de Treino                                              |                                       Detalhes da Sessão                                        |
| :--------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------: |
| <img src="../capturas-de-tela/tela_inicial.png" width="180" alt="Tela Inicial do App" /> | <img src="../capturas-de-tela/tela_de_treinos.png" width="180" alt="Listagem e Estatísticas" /> | <img src="../capturas-de-tela/tela_criacao_edicao_de_treino.png" width="180" alt="Formulário de Cadastro e Edição" /> | <img src="../capturas-de-tela/tela_detalhes_treino.png" width="180" alt="Detalhes do Treino" /> |
|                                 **Boas-vindas e Status**                                 |                                      **Painel de Treinos**                                      |                                             **Formulário com Validação**                                              |                                      **Ficha de Detalhes**                                      |

---

## 5. Roteiro Sugerido para Gravação do Vídeo (2 a 5 minutos)

Para a entrega avaliativa da disciplina, siga o roteiro estruturado abaixo:

1. **Abertura (0:00 - 0:30):**
   - Apresentação dos integrantes da equipe.
   - Exibição da tela inicial (`/`) e breve explicação do tema e objetivos do aplicativo.
2. **Cadastro e Validação de Formulário - RF01, RF04 e RF06 (0:30 - 1:30):**
   - Toque em "Cadastrar Treino" para abrir o formulário (`/treinos/novo`).
   - Tente salvar com os campos em branco para demonstrar as mensagens de validação (RF04).
   - Preencha os campos com dados válidos: Nome (ex: "Treino de Peito e Tríceps"), Categoria ("Musculação"), Dia ("Segunda") e Duração ("60").
   - Salve o treino e mostre a mensagem/banner de sucesso (RF06).
3. **Listagem Inteligente e Estatísticas - RF03 e Bônus (1:30 - 2:30):**
   - Mostre a tela de listagem (`/treinos`).
   - Demonstre as estatísticas simples no topo: Total de sessões, Tempo total em minutos e Média por sessão.
   - Mostre o funcionamento da busca digitando parte do nome do treino.
   - Demonstre o filtro rápido clicando em um dia da semana (ex: "Segunda").
   - Demonstre o botão de ordenação alternando entre duração e ordem alfabética.
4. **Edição e Detalhes (2:30 - 3:15):**
   - Toque no card para abrir a tela de detalhes (`/treinos/[id]`).
   - Toque no botão de edição, altere a duração (ex: de 60 para 75 minutos) e confirme a alteração.
   - Mostre o card atualizado na listagem.
5. **Persistência de Dados - RF02 (3:15 - 4:00):**
   - Feche completamente o aplicativo (encerre o processo no Expo Go ou navegador).
   - Reabra o aplicativo e navegue até a listagem para evidenciar que todos os dados cadastrados permanecem salvos intactos.
6. **Exclusão e Encerramento (4:00 - 4:45):**
   - Toque no botão de exclusão de um treino para demonstrar a caixa de confirmação ("Deseja realmente remover...?").
   - Confirme a exclusão e aponte a atualização das estatísticas e a mensagem de feedback.
   - Agradecimentos e encerramento.
