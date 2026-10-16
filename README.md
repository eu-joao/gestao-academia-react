# Gestão Academia

Sistema multiplataforma para apoiar a gestão de uma academia.

## Sobre

Este repositório reúne o aplicativo mobile e as ferramentas compartilhadas do projeto. O app mobile usa Expo, React Native e TypeScript, com suporte a Android, iOS e web.

## Estrutura

```text
.
├── .github/                  # Modelos de issues e pull requests
├── .husky/                   # Hooks de commit
├── docs/
│   └── capturas-de-tela/     # Capturas de tela do aplicativo
├── mobile/                   # Aplicativo Expo
├── mise.toml                 # Versão do Node.js e tarefas do projeto
├── package.json              # Ferramentas de commit da raiz
├── README.md
└── CONTRIBUTING.md
```

## Como executar

Recomendamos usar [mise](https://mise.jdx.dev/) para instalar e gerenciar o Node.js e outros runtimes do projeto. Com o mise instalado, na raiz do repositório execute:

```bash
mise install
mise run install
mise run mobile  # inicia o aplicativo mobile
```

O primeiro comando instala a versão do Node.js declarada no `mise.toml`; os demais instalam as dependências e iniciam o app. Consulte o [README do mobile](./mobile/README.md) para escolher uma plataforma e ver os comandos específicos.

## Capturas de tela

As capturas de tela do aplicativo ficam organizadas em [`docs/capturas-de-tela/`](./docs/capturas-de-tela/).

## Protótipo mobile

O protótipo da interface mobile está disponível no [Figma](https://www.figma.com/proto/yjRxhNBA2eSLiNGXFwswcn/Aplicativo-de-rede-de-academias?node-id=0-1&t=wmaNHiS11XvZoqm8-1).

## Contribuindo

Consulte [CONTRIBUTING.md](./CONTRIBUTING.md) para as orientações gerais de contribuição.
