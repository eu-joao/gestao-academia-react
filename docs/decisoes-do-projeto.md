## Infraestrutura

### Organização

- Minimundo reaproveitado de outro projeto e adaptado, com stack diferente
- Documentação na pasta `docs/`

### Repositório

- Equipe já conhece MVC, então usaremos essa arquitetura
- Repositório organizado em monorepo com as pastas `/backend`, `/web`, `/mobile`
- Testes básicos nas rotas principais
- Gerenciamento de branches:
    - Trunk-based: `main` protegida + branches curtas (horas a poucos dias) que voltam via PR
    - Usar o nome que o **GitHub gera automaticamente** ao criar a branch a partir da issue (botão "Create a branch" na issue): `nº-título-da-issue`
- Regras de merge:
    - `main` protegida: sem push direto, apenas PR
    - Mínimo de **1 aprovação** e **CI verde** antes do merge
    - Título do PR seguindo Conventional Commits
    - Apagar a branch após o merge
    - Referenciar a issue no PR (`Closes #12`)
    - Atualizar a branch com a `main` (rebase ou merge) antes de abrir o PR
    - Sem prazo fixo para revisão de PR
- Qualidade e entrega:
    - PRs e Issues têm descrições padronizadas via template
    - Commits seguem Conventional Commits
    - Padronização de código: ESLint + Prettier + Husky/commitlint
        - Configuração de ferramentas: ESLint, Prettier e Husky/commitlint podem ficar na raiz, compartilhados. Cada projeto pode ter ajustes próprios.
    - Deploy automático ao dar merge na `main`

## Mobile

- Persistência de dados local usando https://reactnative.dev/docs/asyncstorage
- Stack: React Native com Expo
- Build com Expo Go

## Web

- Modelagem do banco de dados em PostgreSQL + NeonDB
- Back-end organizado por módulo como padrão do NestJS
- Stack:
    - Backend: Node + NestJS
    - API: REST
    - Banco de dados: PostgreSQL
    - Front-end: React
- Autenticação por Firebase
- Validação de entrada de dados no backend usando class-validator
- Hospedagem:
    - GitHub Pages
    - Render
    - NeonDB
