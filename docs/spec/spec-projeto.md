# Spec do Projeto Gestão Academia

## Práticas de Desenvolvimento

- Use conventional commits para todos os commits do projeto
- Faça atribuição de co-autoria para todos os commits com assistência de agentes de código
- Use o gh para fazer acompanhamento do PR antes de finalizar a task
- Verifique se o PR foi aprovado pela CI remota
- Se o PR não for aprovado pela CI remota, investigue o problema e retorne um pequeno relatório para aprovação sobre como o problema pode ser resolvido
- Siga as convenções de naming do CONTRIBUTING.md para branches e commits
- Use o mise para gerenciar versões de runtime e executar tarefas do projeto

## Estrutura do Projeto

- Mantenha a estrutura de pasta conforme definido no README.md
- Organize nova documentação em docs/spec/ com documentos separados por funcionalidade
- Atualize o README.md quando adicionar novos módulos ou funcionalidades
- Mantenha os arquivos de configuração na raiz do repositório

## Verificações e Qualidade

- Execute mise run lint antes de abrir PRs para verificar formatação e lint
- Execute mise run test:backend para validar testes do backend
- Execute mise run build para validar build de produção
- Respeite as verificações da CI do GitHub Actions
- Não adicione hooks de commit locais - use as tarefas do mise

## Documentação

- Mantenha a documentação de spec atualizada com as funcionalidades implementadas
- Use frases no imperativo nos documentos de spec
- Organize specs por funcionalidade/entidade
- Inclua critérios de aceitação em cada spec quando aplicável
