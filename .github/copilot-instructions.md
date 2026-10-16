# Guia do repositório

## Comandos

O repositório usa Node 24 e npm. O app Expo e seu manifesto de pacotes ficam em `mobile/`; o pacote da raiz é usado principalmente pelos hooks de commit.

A partir da raiz do repositório, os atalhos definidos em `mise.toml` são:

```bash
mise run install   # executa npm ci na raiz e em mobile/
mise run mobile    # inicia o Expo
mise run lint      # executa ESLint e as verificações de TypeScript do app
```

Para trabalhar diretamente no app:

```bash
cd mobile
npm start                 # inicia o servidor de desenvolvimento do Expo
npm run android           # inicia para Android
npm run ios               # inicia para iOS
npm run web               # inicia para web
npm run lint              # executa o ESLint do Expo
npx tsc --noEmit          # verifica os tipos TypeScript
```

Não há runner ou suíte de testes configurados, portanto não existe um comando para executar um teste específico. O script `npm test` da raiz é apenas um placeholder e termina com erro. Também não há script de build de produção nem configuração do EAS versionada no repositório. Para adicionar dependências, use `npx expo install <package>` para que o Expo selecione uma versão compatível.

## Validação de mudanças

Antes de concluir mudanças de código, siga a skill de validação e acompanhamento da CI em `.agents/skills/validar-e-acompanhar-ci/SKILL.md`.

## Arquitetura

- `mobile/` é um app Expo multiplataforma (Expo SDK 57, React Native e TypeScript) cuja entrada é o Expo Router (`expo-router/entry`). Os projetos nativos de Android e iOS são gerados pelo Continuous Native Generation; configure recursos nativos em `mobile/app.json` ou em config plugins, não em diretórios nativos mantidos manualmente.
- As rotas são baseadas em arquivos em `mobile/src/app/`. `_layout.tsx` configura o tema compartilhado do roteador, a sobreposição da tela de abertura e a navegação por abas; `index.tsx` e `explore.tsx` são as telas atuais das abas. Mantenha componentes e lógica compartilhados fora do diretório de rotas.
- `mobile/src/components/app-tabs.tsx` implementa as abas nativas, enquanto `app-tabs.web.tsx` implementa as abas para web. A convenção de arquivos irmãos com sufixo `.web.tsx` também é usada em componentes e hooks com comportamento específico por plataforma; mantenha o comportamento equivalente entre plataformas.
- A aparência compartilhada fica centralizada em `mobile/src/constants/theme.ts`: paletas de cores, fontes, espaçamento, largura do conteúdo e recuo das abas. `use-theme.ts` seleciona o esquema de cores do sistema, usado pelos componentes de texto e visualização temáticos. Para estilos web, `global.css` é importado pelo módulo de tema.
- As telas e a identidade visual atuais ainda são conteúdo inicial do Expo; o código-fonte ainda não estabelece um domínio de gestão de academia nem uma arquitetura de backend.
- O TypeScript está em modo estrito. O alias `@/*` aponta para `mobile/src/*`, e `@/assets/*` aponta para `mobile/assets/*`.

## Convenções do repositório

- Antes de usar ou alterar APIs do Expo, EAS ou React Native, confira a versão principal de `expo` em `mobile/package.json` e consulte a documentação Expo correspondente à versão (atualmente `https://docs.expo.dev/versions/v57.0.0/`) e o índice `https://docs.expo.dev/llms.txt`; essas APIs podem mudar entre versões do SDK.
- Use Expo Router para navegação e mantenha os arquivos de rota restritos a telas e layouts. Para código específico de plataforma, prefira o padrão existente de resolução por sufixo de arquivo em vez de ramificações em tempo de execução quando a implementação diferir entre plataformas.
- Ao adicionar uma dependência com código nativo, considere que será necessário usar um development build; o Expo Go inclui apenas os módulos nativos que já vêm nele. Prefira módulos compatíveis com Expo e versões compatíveis com o SDK.
- As mensagens de commit são verificadas pelo Commitlint com Conventional Commits. O Husky também executa lint-staged para arquivos TypeScript/JavaScript do app e formata arquivos staged.
