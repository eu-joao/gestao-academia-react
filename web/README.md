# Gestão Academia Web

Aplicação web do projeto Gestão Academia, desenvolvida com Next.js, React e TypeScript.

## Capturas de tela

**Tela inicial**

![Tela inicial](../docs/capturas-de-tela/web/tela%20inicial.png)

**Listagem de alunos**

![Listagem de alunos](../docs/capturas-de-tela/web/listagem%20de%20alunos.png)

**Busca por nome**

![Busca por nome](../docs/capturas-de-tela/web/Busca%20por%20nome.png)

**Cadastro de aluno**

![Formulário de cadastro](../docs/capturas-de-tela/web/formulario%20cadastro.png)

**Edição de aluno**

![Formulário de edição](../docs/capturas-de-tela/web/formulario%20edi%C3%A7%C3%A3o.png)

**Exclusão de aluno**

![Tela de exclusão](../docs/capturas-de-tela/web/tela%20de%20exclus%C3%A3o.png)

## Funcionalidades

- **Alunos:** listagem, busca, cadastro, edição e exclusão.
- **Treinos:** listagem dos treinos sincronizados pelo aplicativo mobile, com edição e exclusão. Os dados vêm de `GET /treinos` da API.
- **Acesso:** autenticação do personal trainer via sessão HMAC-SHA256. Todas as rotas, exceto `/login`, exigem sessão válida; sem ela, o acesso é redirecionado para a tela de login. O botão **Sair** encerra a sessão removendo o cookie.

## Variáveis de ambiente

Defina-as no ambiente do servidor Next.js (por exemplo, em `web/.env.local`, que não é versionado):

| Variável      | Obrigatória | Descrição |
| ------------- | ----------- | --------- |
| `API_URL`     | Não (padrão: `http://localhost:8080`) | Endereço do backend Spring Boot. |
| `ADMIN_USER`  | **Sim** | Usuário do login do personal trainer. |
| `ADMIN_PASS`  | **Sim** | Senha do login do personal trainer. |
| `SESSION_SECRET` | **Sim** | Segredo para assinatura HMAC-SHA256 dos cookies de sessão. Deve ser exatamente 64 caracteres hexadecimais (32 bytes). Gere com `openssl rand -hex 32`. |

> **Importante:** Não use os valores padrão em produção. Não existe fallback inseguro para credenciais administrativas em produção — a aplicação falha ao iniciar se `SESSION_SECRET`, `ADMIN_USER` ou `ADMIN_PASS` não estiverem configurados corretamente.

### Geração do `SESSION_SECRET`

```bash
openssl rand -hex 32
```

O comando acima gera 32 bytes aleatórios (64 caracteres hex). Use a saída como valor de `SESSION_SECRET` no seu `.env.local` de produção.

## Desenvolvimento

Na raiz do repositório, use:

```bash
mise install
mise run install
mise run dev:web
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

Consulte o [README da raiz](../README.md) para a visão geral do projeto e os comandos compartilhados.

## Autenticação e Sessão

### Visão geral

A autenticação é **local do portal administrativo Web**. O Google OAuth **não** faz parte desta entrega.

A API Spring Boot **permanece sem autenticação** nesta versão, conforme decisão do grupo. A proteção da sessão Web **não** significa que a API Spring esteja protegida — chamadas diretas à API não são bloqueadas pela sessão do portal.

### Como funciona

1. **Login** (`/login`): O personal informa usuário e senha. Se conferem com `ADMIN_USER`/`ADMIN_PASS`, um cookie de sessão assinado com HMAC-SHA256 é criado e o usuário é redirecionado para `/`.
2. **Cookie de sessão**: Nome `sessao_personal`, `HttpOnly`, `SameSite=Lax`, `Secure` em produção (`NODE_ENV=production`). Contém payload `{ iat, exp }` e assinatura HMAC-SHA256 de 32 bytes.
3. **Duração**: 8 horas (28.800 segundos). O `exp` é validado a cada requisição.
4. **Proteção de rotas (Proxy)**: `web/proxy.ts` (middleware Next.js) intercepta todas as requisições. Valida o cookie via `isSessionValid()` (assinatura, expiração, `iat` no futuro com tolerância de 60s, duração máxima 8h+60s). Sem sessão válida → redirect para `/login`. Com sessão válida em `/login` → redirect para `/`.
5. **Proteção interna (Server Actions)**: `web/lib/require-auth.ts` expõe `requireAuth()`, que lê o cookie via `cookies()` e valida com `isSessionValid()`. Chamada no início de cada Server Action administrativa (`cadastrarAluno`, `atualizarAluno`, `excluirAluno`, `atualizarTreino`, `excluirTreino`). Se inválida → `redirect("/login")` (lança exceção `NEXT_REDIRECT` do Next.js).
6. **Logout** (`/login/actions.ts` → `sair()`): Remove o cookie `sessao_personal` e redireciona para `/login`.

### Segurança da sessão

- **Assinatura HMAC-SHA256**: Impede falsificação do cookie sem conhecer o `SESSION_SECRET`.
- **Expiração**: Sessões expiram automaticamente após 8 horas.
- **Clock skew**: Tolerância de 60 segundos para `iat` no futuro (relógios dessincronizados).
- **Duração máxima**: Rejeita cookies com `exp - iat > 8h + 60s`.
- **Comparação timing-safe**: `safeEqualFixed` e `safeEqualBufferFixed` usam `crypto.timingSafeEqual` com tamanho fixo baseado no segredo esperado.
- **Atributos do cookie**: `HttpOnly` (inacessível a JavaScript), `SameSite=Lax` (proteção CSRF básica), `Secure` em produção.

### Limitações conhecidas

- **Logout não revoga sessões roubadas**: O logout apenas remove o cookie do navegador. Se uma cópia válida do cookie for roubada antes do logout, ela continua válida até expirar (8h), pois não existe armazenamento de revogação no servidor (sessões são stateless).
- **Sem rotação de segredo**: O `SESSION_SECRET` é único. Se comprometido, todas as sessões atuais se tornam invalidas ao alterá-lo (usuários precisam logar novamente).
- **Um único papel (PERSONAL)**: Não há distinção de permissões entre usuários administrativos.

## Testes

```bash
cd web
npm test
```

Executa todos os testes (Vitest, ambiente Node). Inclui:
- Validação de variáveis de ambiente (`env-validation.test.ts`)
- Criptografia utilitária (`crypto-utils.test.ts`)
- Instrumentação de produção (`instrumentation.test.ts`)
- Sessão HMAC (`session.test.ts`)
- Login/logout (`login-actions.test.ts`)
- Proxy middleware (`proxy.test.ts`)
- Proteção de Server Actions (`actions-auth.test.ts`)

### Contagem atual

| Arquivo | Testes |
|---------|--------|
| `crypto-utils.test.ts` | 31 |
| `env-validation.test.ts` | 18 |
| `instrumentation.test.ts` | 21 |
| `login-actions.test.ts` | 10 |
| `session.test.ts` | 49 |
| `proxy.test.ts` | 20 |
| `actions-auth.test.ts` | 25 |
| `vitest-config.test.ts` | 2 |
| **Total** | **176** |

> Nota: A contagem pode variar conforme evolução do código. Execute `npm test` para ver o total atual.

## Verificações de qualidade

```bash
cd web
npm run lint        # ESLint
npx tsc --noEmit    # TypeScript (sem emissão)
npm run build       # Build de produção Next.js
```

Todas devem passar sem erros antes de commitar.

## Configuração para Produção

1. **Variáveis obrigatórias**: Defina `SESSION_SECRET` (via `openssl rand -hex 32`), `ADMIN_USER`, `ADMIN_PASS` e `API_URL` no ambiente de produção (ex: `.env.local` no servidor, ou variáveis de ambiente do provedor de nuvem).
2. **NODE_ENV=production**: Garante que o cookie tenha `Secure=true`.
3. **Build**: `npm run build` — compila a aplicação. **Os segredos NÃO precisam estar disponíveis durante o build** (validação ocorre apenas no `next start` via `instrumentation.ts`).
4. **Start**: `npm start` — inicia o servidor. A validação de produção roda no startup (falha se variáveis obrigatórias ausentes ou inválidas).
5. **HTTPS**: Em produção, o cookie tem `Secure=true`, exigindo HTTPS. Configure TLS no proxy reverso (nginx, Cloudflare, Vercel, etc.).

## Estrutura de arquivos principal

```
web/
├── app/
│   ├── actions.ts              # Server Actions alunos (protegidas)
│   ├── treinos/actions.ts      # Server Actions treinos (protegidas)
│   ├── login/actions.ts        # Login/logout
│   ├── page.tsx                # Dashboard (protegido)
│   ├── alunos/                 # Páginas de alunos
│   └── treinos/                # Páginas de treinos
├── lib/
│   ├── session.ts              # HMAC sessão, validação, credenciais
│   ├── require-auth.ts         # requireAuth() para Server Actions
│   ├── crypto-utils.ts         # Timing-safe, base64url
│   ├── env-validation.ts       # Validação centralizada de env
│   └── api-error.ts            # Tratamento de erros da API
├── proxy.ts                    # Middleware de proteção de rotas
├── instrumentation.ts          # Validação de produção no startup
├── test/                       # Testes Vitest
├── .env.example                # Exemplo de variáveis de ambiente
└── vitest.config.ts
```

## Documentação relacionada

- [Spec de acesso](../docs/spec/spec-acesso.md)
- [Minimundo V6](../docs/gestao-de-treinos-v6/)