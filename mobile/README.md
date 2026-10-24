# Gestão Academia Mobile

Aplicativo multiplataforma do projeto Gestão Academia para Android, iOS e web.

## Documentação do Projeto

A especificação completa do aplicativo, modelo de dados, justificativa técnica da persistência e roteiro de gravação do vídeo avaliativo estão disponíveis em:

- [Documentação do Projeto (1 a 2 páginas)](../docs/mobile/documentacao-projeto.md)

## Sobre

O app mobile é implementado com Expo, React Native, TypeScript e Expo Router. As telas e a navegação ficam no diretório `src/app/`.

### Funcionalidades Implementadas

- **CRUD Completo de Treinos (RF01):** Criação, listagem, visualização de detalhes, edição e exclusão de treinos.
- **Persistência Local (RF02):** Armazenamento permanente offline no dispositivo utilizando `AsyncStorage`.
- **Listagem Inteligente e Estatísticas (RF03 + Bônus):** Busca por nome, filtro por dia da semana, ordenação (duração/nome) e estatísticas simples (sessões, tempo total e média por sessão).
- **Validação de Formulários (RF04):** Mensagens inline de erro impedindo inserção de dados incompletos ou inválidos.
- **Navegação Declarativa (RF05):** Estrutura de rotas organizada com Expo Router.
- **Feedback ao Usuário (RF06):** Banners e mensagens de confirmação para ações de cadastro, edição e exclusão.

## Tecnologias

- Expo SDK 57
- React Native 0.86
- React 19
- TypeScript
- Expo Router
- AsyncStorage

## Estrutura

```text
mobile/
├── assets/       # Imagens e recursos visuais
├── src/
│   ├── app/      # Rotas e telas do aplicativo (Expo Router)
│   ├── services/ # Camada de persistência (AsyncStorage)
│   └── utils/    # Validação e helpers
├── app.json      # Configuração do Expo
└── package.json  # Dependências e comandos do app
```

## Instalação e execução

Recomendamos usar [mise](https://mise.jdx.dev/) para instalar e gerenciar o Node.js. Na raiz do repositório, execute:

```bash
mise install
mise run install
```

`mise install` instala a versão do Node.js declarada no `mise.toml`. `mise run install` instala as dependências da raiz, do app e do web.

Depois, inicie o Expo, também na raiz do repositório:

```bash
mise run dev:mobile
```

No terminal do Expo, escolha Android, iOS ou web. Também é possível executar comandos específicos diretamente no diretório `mobile/`:

- `npm start` inicia o servidor de desenvolvimento do Expo.
- `npm run android` inicia para Android.
- `npm run ios` inicia para iOS.
- `npm run web` inicia para web.

## Contribuindo

Consulte [CONTRIBUTING.md](./CONTRIBUTING.md) para as orientações específicas do app mobile. As regras gerais de branch, commit e pull request estão em [../CONTRIBUTING.md](../CONTRIBUTING.md).
