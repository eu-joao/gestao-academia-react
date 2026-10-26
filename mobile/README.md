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
