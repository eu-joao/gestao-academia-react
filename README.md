# Gestão Academia

Sistema multiplataforma para apoiar a gestão de uma academia.

## Sobre

Este repositório reúne o aplicativo mobile, a API REST e as ferramentas compartilhadas do projeto. O app mobile usa Expo, React Native e TypeScript, com suporte a Android, iOS e web. A API usa Spring Boot.

## Estrutura

```text
.
├── .github/                  # Modelos de issues e pull requests
├── .husky/                   # Hooks de commit
├── docs/
│   └── capturas-de-tela/     # Capturas de tela do aplicativo
├── backend/                  # API Spring Boot
├── mobile/                   # Aplicativo Expo
├── mise.toml                 # Versões do Node.js e Java, e tarefas do projeto
├── package.json              # Ferramentas de commit da raiz
├── README.md
└── CONTRIBUTING.md
```

## Como executar

Recomendamos usar [mise](https://mise.jdx.dev/) para instalar e gerenciar o Node.js e o Java do projeto. Na raiz do repositório, instale os runtimes e as dependências com:

```bash
mise install
mise run install
mise run mobile  # inicia o aplicativo mobile
```

`mise install` instala o Node.js e o Java declarados no `mise.toml`. `mise run install` instala as dependências da raiz e do mobile. Consulte o [README do mobile](./mobile/README.md) para escolher uma plataforma e ver os comandos específicos.

### Backend

Copie o exemplo de configuração para criar o arquivo local de variáveis de ambiente:

```bash
cp backend/.env.example backend/.env
```

Edite `backend/.env` com os dados de conexão do banco. Esse arquivo não é enviado ao Git. Para iniciar a API, execute na raiz:

```bash
mise run backend-run
```

Para testar ou empacotar o backend, use `mise run backend-test` ou `mise run backend-package`.

## Capturas de tela

As capturas de tela do aplicativo ficam organizadas em [`docs/capturas-de-tela/`](./docs/capturas-de-tela/).

## Contribuindo

Consulte [CONTRIBUTING.md](./CONTRIBUTING.md) para as orientações gerais de contribuição.
