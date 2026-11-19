# Spec do Projeto Gestão Academia

## Contexto e Escopo

- Atenda um único personal trainer e seus alunos
- Disponibilize um portal web para o personal
- Disponibilize um aplicativo mobile para os alunos
- Centralize cadastros, contratos, cobranças e acompanhamento dos treinos
- Mantenha o escopo funcional alinhado ao [minimundo V6 documentado na PR #158](https://github.com/eu-joao/gestao-academia-react/pull/158)

## Modelo de Domínio

- Utilize as entidades Aluno, Contrato, Cobranca, ProgramaTreino, DiaTreino, ItemTreino e SessaoTreino
- Represente Plano como enum no backend, sem tabela própria
- Armazene o programa atual diretamente em Aluno
- Represente exercícios como itens vinculados a DiaTreino
- Armazene somente o peso atual do aluno
- Não implemente unidades, catálogo global de exercícios, TreinoAtivo ou histórico de medições na primeira versão

## Práticas de Desenvolvimento

- Use conventional commits para todos os commits do projeto
- Faça atribuição de coautoria para commits com assistência de agentes de código
- Siga as convenções de branches, commits e pull requests do CONTRIBUTING.md
- Use o mise para gerenciar versões de runtime e executar tarefas do projeto
- Use a skill de validação do repositório para escolher verificações locais e acompanhar a CI remota
- Registre os comandos executados e seus resultados; informe verificações não executadas ou bloqueadas

## Verificações e Qualidade

- Execute as verificações pertinentes aos módulos alterados
- Respeite as verificações da CI do GitHub Actions
- Não declare uma verificação aprovada sem evidência de execução

## Documentação

- Mantenha as especificações em docs/spec/ alinhadas ao minimundo V6
- Consulte os documentos complementares da documentação V6
- Atualize a documentação quando requisitos ou decisões de domínio forem alterados
- Inclua critérios de aceitação nas especificações quando aplicável
