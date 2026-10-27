## Infraestrutura

### Organização

- Minimundo reaproveitado de outro projeto e adaptado, com stack diferente
- Documentação na pasta `docs/`

### Repositório

- Equipe já conhece MVC, então usaremos essa arquitetura
- Repositório organizado em monorepo com as pastas `/backend`, `/web`, `/mobile`
- Testes básicos nas rotas principais
- Estrutura do repositório:
    
    ```markdown
    sistema-academia/
    ├── .github/
    │   ├── ISSUE_TEMPLATE/
    │   │   ├── bug.md
    │   │   └── tarefa-tecnica.md
    │   ├── pull_request_template.md
    │   └── workflows/
    │       ├── backend.yml        # roda só se backend/** mudar
    │       ├── web.yml            # roda só se web/** mudar
    │       └── mobile.yml         # roda só se mobile/** mudar
    │
    ├── backend/                   # NestJS + Mongoose
    │   ├── src/
    │   │   ├── main.ts
    │   │   ├── app.module.ts
    │   │   └── modules/
    │   │       ├── alunos/
    │   │       │   ├── alunos.controller.ts
    │   │       │   ├── alunos.service.ts
    │   │       │   ├── alunos.module.ts
    │   │       │   ├── schemas/aluno.schema.ts
    │   │       │   └── dto/
    │   │       └── ...            # um módulo por entidade do Minimundo
    │   ├── test/
    │   ├── .env.example
    │   ├── nest-cli.json
    │   ├── package.json
    │   └── tsconfig.json
    │
    ├── web/                       # React
    │   ├── src/
    │   │   ├── main.tsx
    │   │   ├── pages/
    │   │   ├── components/
    │   │   └── services/          # chamadas à API
    │   ├── .env.example
    │   ├── index.html
    │   ├── package.json
    │   └── tsconfig.json
    │
    ├── mobile/                    # React Native + Expo
    │   ├── app/                   # telas
    │   ├── components/
    │   ├── services/
    │   ├── .env.example
    │   ├── app.json
    │   └── package.json
    │
    ├── docs/
    │   ├── requisitos.md          # RF01, RN02...
    │   ├── decisoes.md
    │   └── diagramas/             # PNG + .excalidraw original
    │
    ├── .husky/                    # hooks (lint e commitlint)
    ├── .editorconfig
    ├── .gitignore
    ├── .prettierrc
    ├── commitlint.config.js
    ├── docker-compose.yml         # MongoDB local
    ├── package.json               # raiz: workspaces + scripts de atalho
    ├── CONTRIBUTING.md
    └── README.md
    ```
    
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
