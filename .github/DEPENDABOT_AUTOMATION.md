# Política de atualização e integração do Dependabot

## Objetivo

Reduzir o trabalho manual sem integrar atualizações que não tenham passado pelas validações do módulo afetado.

## Validação por módulo

O workflow `.github/workflows/ci.yml` executa:

- **Web:** instalação limpa (`npm ci`), lint, geração de tipos do Next.js, TypeScript e build de produção.
- **Mobile:** instalação limpa, Prettier, lint, TypeScript, Expo Doctor e exportação de produção para iOS, Android e Web.
- **Backend Spring:** `./mvnw verify`, incluindo compilação e testes Maven.
- **Resultado geral:** o job `CI — resultado geral` falha se qualquer job aplicável falhar; jobs de módulos não afetados podem ser ignorados.

A exportação Expo é uma validação de bundle, não substitui testes automatizados de comportamento ou testes em dispositivos.

## Política de integração automática

O workflow `.github/workflows/dependabot-auto-merge.yml` apenas solicita auto-merge quando **todas** estas condições forem verdadeiras:

1. O autor do PR é `dependabot[bot]`, o destino é `main` e o repositório é `eu-joao/gestao-academia-react`.
2. A variável de repositório `DEPENDABOT_AUTO_MERGE_ENABLED` está definida como `true`.
3. O ecossistema é npm e o diretório é `/web`.
4. A dependência é direta e de desenvolvimento.
5. A atualização é patch.
6. O PR atualiza exatamente uma dependência desta allowlist, atualmente presente em `web/package.json`:
   - `eslint`
   - `typescript`
   - `@types/node`
   - `@types/react`
   - `@types/react-dom`

PRs agrupados não entram na allowlist: o nome retornado precisa corresponder exatamente a um único pacote permitido.

A automação usa `gh pr merge --auto --rebase`. Ela não ignora checks; apenas habilita a integração automática, que deve aguardar os requisitos de proteção configurados no GitHub.

## Sempre exigem revisão humana

- Atualizações major ou minor.
- Dependências de produção.
- Expo SDK, pacotes Expo, React, React DOM e React Native.
- Bibliotecas nativas do React Native, incluindo Reanimated, Worklets e Gesture Handler.
- Next.js e configurações diretamente acopladas à versão do framework.
- Spring Boot, Springdoc e dependências centrais do backend.
- Atualizações agrupadas ou qualquer dependência fora da allowlist.

## Ativação em etapas

O auto-merge permanece desativado por padrão porque a variável `DEPENDABOT_AUTO_MERGE_ENABLED` não está habilitada automaticamente.

Antes de ativá-la nas configurações do repositório:

1. Habilitar **Allow auto-merge** nas configurações do repositório.
2. No ruleset da `main`, tornar obrigatório o check agregado `CI — resultado geral`.
3. Confirmar em um PR real que o check agregado aparece, falha quando um job aplicável falha e permanece bem-sucedido quando jobs não aplicáveis são ignorados.
4. Validar um PR de atualização elegível de ponta a ponta.
5. Só então definir a variável de repositório `DEPENDABOT_AUTO_MERGE_ENABLED=true`.

Não configure a variável antes desses passos. Se o check obrigatório ainda não estiver ativo, não existe garantia suficiente para permitir integração automática.

## Segurança do workflow

O workflow de auto-merge usa `pull_request_target` para obter permissão de escrita do token do GitHub. Por isso:

- Não faz checkout da branch do PR.
- Não executa scripts, comandos ou artefatos fornecidos pelo PR.
- Obtém apenas os metadados da atualização com `dependabot/fetch-metadata`, fixado em SHA.
- Restringe a execução ao autor Dependabot, ao destino `main`, ao repositório e à allowlist descrita acima.

Qualquer ampliação da allowlist ou do escopo de diretórios exige revisão explícita.
