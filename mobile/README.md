# Gestão Academia Mobile

Aplicativo do aluno do sistema Gestão Academia, desenvolvido com Expo, React Native e TypeScript. O app permite que cada aluno acompanhe seu cadastro, consulte o programa de treino atual, registre sessões concluídas e acompanhe suas cobranças.

## Funcionalidades

- **Cadastro e acesso:** criação de conta pelo aplicativo com autenticação Google. Nome e e-mail são obtidos do provedor de autenticação.
- **Dados pessoais:** consulta e atualização dos próprios dados, incluindo peso, altura, nível de experiência e frequência semanal.
- **Programa de treino:** consulta do programa atual, dos dias em sequência e dos exercícios de cada dia, com musculatura trabalhada, séries e repetições.
- **Registro de sessões:** conclusão do próximo dia previsto do programa. O sistema reinicia a sequência após o último dia.
- **Cobranças:** consulta das mensalidades e de seus estados (pendente, paga ou atrasada).
- **Pagamento simulado:** confirmação de pagamento por Pix fictício, sem movimentação real de dinheiro ou integração financeira.

O aplicativo mostra somente os dados do aluno autenticado. A inadimplência não bloqueia o acesso ao app ou aos treinos.

## Tecnologias

As versões abaixo correspondem às dependências declaradas em `package.json`.

- Expo SDK 58
- React Native 0.88.1
- React 19.3
- TypeScript 6
- Expo Router
- React Native Web

## Instalação e execução

Use [mise](https://mise.jdx.dev/) para instalar as versões de Node.js e Java definidas pelo repositório. Na raiz do projeto, execute:

```bash
mise install
mise run install
mise run dev:mobile
```

O Expo iniciará o servidor de desenvolvimento. Siga as instruções exibidas no terminal para abrir o aplicativo em um dispositivo ou emulador.

Também é possível executar os comandos específicos dentro do diretório `mobile/`:

```bash
npm start       # Inicia o Expo
npm run android # Abre no Android
npm run ios     # Abre no iOS
npm run web     # Abre no navegador
npm run lint    # Executa o lint
```

## Documentação relacionada

- [Documentação geral e minimundo V6](../docs/gestao-de-treinos-v6/README.md)
- [Modelo de dados](../docs/gestao-de-treinos-v6/02-modelo-de-dados.md)
- [Regras de negócio](../docs/gestao-de-treinos-v6/03-regras-de-negocio.md)
- [Orientações para agentes mobile](./AGENTS.md)
- [Contribuição](../CONTRIBUTING.md)

Consulte o [README da raiz](../README.md) para a visão geral do monorepositório e os comandos compartilhados.
