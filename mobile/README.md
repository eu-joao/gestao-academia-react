# Gestão Academia Mobile

Aplicativo do aluno do sistema Gestão Academia, desenvolvido com Expo, React Native e TypeScript. O app permite que cada aluno gerencie seus treinos com arquitetura **Offline-First**, consulte o programa predefinido, registre sessões concluídas e acompanhe cobranças.

## Funcionalidades

- **Persistência na nuvem e Offline-First:** gestão completa de treinos (criação, edição, listagem, filtros por dia e exclusão). Gravação imediata no armazenamento local (`AsyncStorage`) com latência 0ms e sincronização em segundo plano via fila outbox com o backend Spring Boot e banco Neon PostgreSQL.
- **Feedback visual de sincronização:** indicador no cabeçalho em tempo real (`SyncBadge`) exibindo o estado da conexão (Nuvem sincronizada, Sincronizando ou Offline com contador de pendências) e permitindo retentativa manual.
- **Tema Claro / Escuro:** alternância dinâmica entre temas claro e escuro persistida localmente (`ThemeContext` e `ThemeToggle`), com adaptação imediata da barra de status e cores de fundo do sistema.
- **Estatísticas e gráficos:** painel dedicado (`/estatisticas`) com gráfico de barras semanais em React Native puro, distribuição percentual por modalidade (Musculação, Cardio, Funcional, etc.) e métricas de volume de treino.
- **Exportação de dados:** compartilhamento nativo (`Share.share`) da ficha de treinos formatada em texto (para WhatsApp e bloco de notas) e backup estruturado em formato JSON.
- **Notificações locais e lembretes:** card dinâmico _"Treino de Hoje"_ na tela inicial identificando o treino do dia atual e agendamento de lembretes diários com seletor de horários via `expo-notifications`.
- **Formulário responsivo:** interface adaptada com `KeyboardAvoidingView` e `ScrollView` para prevenir sobreposição de campos (como duração) pelo teclado virtual.
- **Acesso:** o aplicativo não possui login nesta versão e consome a API do backend sem autenticação.
- **Programa de treino e sessões:** consulta do programa predefinido, dos dias em sequência e registro de sessões concluídas.
- **Cobranças e pagamento simulado:** consulta de mensalidades e simulação de pagamento via Pix fictício.

## Tecnologias

As versões abaixo correspondem às dependências declaradas em `package.json`.

- Expo SDK 58
- React Native 0.88.1
- React 19.3
- TypeScript 6
- Expo Router
- Expo Notifications (`expo-notifications`)
- React Native Web
- AsyncStorage (`@react-native-async-storage/async-storage`)

## Instalação e execução

Use [mise](https://mise.jdx.dev/) para instalar as versões de Node.js e Java definidas pelo repositório. Na raiz do projeto, execute:

```bash
mise install
mise run install
mise run dev:mobile
```

O Expo iniciará o servidor de desenvolvimento Metro. Siga as instruções exibidas no terminal para abrir o aplicativo em um dispositivo físico ou emulador.

Também é possível executar os comandos específicos dentro do diretório `mobile/`:

```bash
npm start       # Inicia o Expo
npm run android # Abre no Android
npm run ios     # Abre no iOS
npm run web     # Abre no navegador
npm run lint    # Executa o lint (expo lint)
```

## Documentação relacionada

- [Documentação geral e minimundo V6](../docs/gestao-de-treinos-v6/README.md)
- [Modelo de dados](../docs/gestao-de-treinos-v6/02-modelo-de-dados.md)
- [Regras de negócio](../docs/gestao-de-treinos-v6/03-regras-de-negocio.md)
- [Diagrama ER](../docs/gestao-de-treinos-v6/diagrama-er.md)
- [Orientações para agentes mobile](./AGENTS.md)
- [Contribuição](../CONTRIBUTING.md)

Consulte o [README da raiz](../README.md) para a visão geral do monorepositório e os comandos compartilhados.
