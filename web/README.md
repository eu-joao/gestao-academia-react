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
- **Acesso:** login simulado do personal. Todas as telas, exceto `/login`, exigem sessão; sem ela, o acesso é redirecionado para a tela de login. O botão **Sair** encerra a sessão.

## Variáveis de ambiente

Defina-as no ambiente do servidor Next.js (por exemplo, em `web/.env.local`, que não é versionado):

| Variável     | Padrão                  | Uso                                  |
| ------------ | ----------------------- | ------------------------------------ |
| `API_URL`    | `http://localhost:8080` | Endereço do backend Spring Boot.     |
| `ADMIN_USER` | `admin`                 | Usuário do login simulado do personal. |
| `ADMIN_PASS` | `admin123`              | Senha do login simulado do personal.   |

Os valores padrão servem apenas para desenvolvimento. O login é simulado: a sessão é um cookie `httpOnly` validado pelo `proxy.ts` e a API não exige autenticação. Consulte a [spec de acesso](../docs/spec/spec-acesso.md).

## Desenvolvimento

Na raiz do repositório, use:

```bash
mise install
mise run install
mise run dev:web
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

Consulte o [README da raiz](../README.md) para a visão geral do projeto e os comandos compartilhados.
