# Gestão Academia

Sistema multiplataforma para gestão de treinos de um personal trainer, composto por uma API, um site e um aplicativo mobile.

- **Backend:** Spring Boot, Java 17 e PostgreSQL.
- **Web:** Next.js, React e TypeScript.
- **Mobile:** Expo, React Native e TypeScript.

A documentação do domínio está em [docs/gestao-de-treinos-v6](./docs/gestao-de-treinos-v6/README.md).

## Executar o projeto

Use o [mise](https://mise.jdx.dev/) para instalar as versões de Node.js e Java definidas pelo projeto. Execute os comandos na raiz do repositório. Cada módulo deve ser iniciado em um terminal próprio.

Antes de iniciar o backend pela primeira vez, siga a [configuração local](./backend/spring/README.md#configuração-local).

```bash
# Instalar runtimes e dependências
mise install
mise run install

# Iniciar os módulos
mise run dev:backend  # API: http://localhost:8080
mise run dev:web      # Site: http://localhost:3000
mise run dev:mobile   # Aplicativo: Expo

# Verificar e gerar builds
mise run lint
mise run test:backend
mise run build
```

Para consultar todas as tarefas disponíveis, execute `mise tasks`.

## Protótipo mobile

O protótipo da interface mobile está disponível no [Figma](https://www.figma.com/proto/yjRxhNBA2eSLiNGXFwswcn/Aplicativo-de-rede-de-academias?node-id=0-1&t=wmaNHiS11XvZoqm8-1).

## Contribuição

Consulte [CONTRIBUTING.md](./CONTRIBUTING.md) para as orientações de contribuição.
