# Gestão Academia Mobile

Aplicativo multiplataforma do projeto Gestão Academia para Android, iOS e web.

## Sobre

O app mobile é implementado com Expo, React Native, TypeScript e Expo Router. As telas e a navegação ficam no diretório `src/app/`.

## Tecnologias

- Expo SDK 57
- React Native 0.86
- React 19
- TypeScript
- Expo Router

## Estrutura

```text
mobile/
├── assets/       # Imagens e recursos visuais
├── src/app/      # Rotas e telas do aplicativo
├── app.json      # Configuração do Expo
└── package.json  # Dependências e comandos do app
```

## Instalação e execução

Recomendamos usar [mise](https://mise.jdx.dev/) para instalar e gerenciar o Node.js. Na raiz do repositório, execute:

```bash
mise install
mise run install
mise run mobile
```

`mise install` instala a versão do Node.js declarada no `mise.toml`. `mise run install` instala as dependências da raiz e do app; `mise run mobile` inicia o Expo.

No terminal do Expo, escolha Android, iOS ou web. Também é possível executar comandos específicos diretamente no diretório `mobile/`:

```bash
npm start
npm run android
npm run ios
npm run web
```

## Contribuindo

Consulte [CONTRIBUTING.md](./CONTRIBUTING.md) para as orientações específicas do app mobile. As regras gerais de branch, commit e pull request estão em [../CONTRIBUTING.md](../CONTRIBUTING.md).
