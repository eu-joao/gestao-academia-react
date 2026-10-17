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
mise run mobile
mise run backend
```

`mise install` instala os runtimes do projeto e `mise run install` instala as dependências do mobile. Execute `mise run mobile` e `mise run backend` em terminais separados. Consulte o [README do mobile](./mobile/README.md) e o [README do backend](./backend/README.md) para detalhes de cada módulo.

## Capturas de tela

As capturas de tela do aplicativo ficam organizadas em [`docs/capturas-de-tela/`](./docs/capturas-de-tela/).

## Contribuindo

Consulte [CONTRIBUTING.md](./CONTRIBUTING.md) para as orientações gerais de contribuição.
