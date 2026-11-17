# Documentação — Gestão de Treinos para Personal Trainer

**Versão:** V6 — escopo simplificado para implementação

Esta documentação está dividida em arquivos menores para facilitar a revisão e a manutenção.

## Documentos

1. [Minimundo](01-minimundo.md) — contexto, objetivo e funcionamento geral.
2. [Modelo de dados](02-modelo-de-dados.md) — entidades, atributos e relacionamentos.
3. [Regras de negócio](03-regras-de-negocio.md) — regras que orientam o comportamento do sistema.
4. [Escopo e backlog](04-escopo-e-backlog.md) — entregas essenciais, funcionalidades opcionais e organização sugerida das issues.
5. [Diagrama ER](diagrama-er.md) — diagrama Mermaid dentro de um documento Markdown.

## Premissas da V6

- O sistema atende um único personal trainer.
- Os planos são fixos e definidos como enum no backend.
- O aluno possui apenas um programa de treino atual; não há histórico de atribuições.
- Os exercícios são itens pertencentes aos dias de treino, sem catálogo global.
- O sistema mantém somente o peso atual do aluno.
- Notificações ficam fora do escopo inicial.
- O pagamento é simulado, sem integração financeira real.

## Instituição e disciplinas

Instituto Federal de Educação, Ciência e Tecnologia da Paraíba — Campus Esperança  
Curso de Análise e Desenvolvimento de Sistemas  
Disciplinas: Programação para Dispositivos Móveis e Desenvolvimento de Aplicações Web III
