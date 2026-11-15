# Instruções para agentes

- Use conventional commits para mensagens de commit e títulos de pull request. Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes.
- Use a skill validar-e-acompanhar-ci para escolher e executar verificações locais adequadas antes de concluir mudanças de código neste repositório. Acompanhe a CI e investigue falhas quando houver um pull request.
- Registre os comandos executados e seus resultados. Informe também verificações não executadas ou bloqueadas; não declare uma verificação aprovada sem evidência de que foi executada.
- Os comandos de build, teste e run são feitos usando o mise como primeira opção. Se o mise não estiver disponível, use os comandos nativos do projeto, mas registre-os e explique por que o mise não pôde ser usado.
- A pasta docs/spec/ contém especificações de requisitos, decisões de projeto e diagramas. Consulte-a para entender o contexto do projeto e as decisões tomadas quando for necessário.
- Quando estiver trabalhando em uma issue ou PR, certifique-se de dar assign do usuário no PR e na issue.
- Siga [docs/spec/spec-ci-cd.md](docs/spec/spec-ci-cd.md) para o fluxo de CI/CD e atualize-o quando alterar workflows.
