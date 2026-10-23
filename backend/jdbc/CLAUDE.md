# Sistema de Gestão de Academia — DAW2 / IFPB Campus Esperança

Projeto acadêmico da disciplina Desenvolvimento de Aplicações Web II. Grupo de 4 pessoas. Stack: Java + Maven + banco de dados relacional + OO.

## O que o sistema faz

Plataforma centralizada de controle financeiro e de acesso físico para uma rede de academias de ginástica.

**Fora do escopo:** treinos, agendamentos, funcionários, modalidades online ou consultoria.

## Identificação

- **Disciplina:** Desenvolvimento de Aplicações Web II (DAW2)
- **Instituição:** Instituto Federal de Educação, Ciência e Tecnologia da Paraíba (IFPB) — Campus Esperança
- **Curso:** Análise e Desenvolvimento de Sistemas
- **Grupo:** Samuel Cláudio Duarte Lima, João Augusto Silva de Araújo, Arley Andrey Alves Pereira, Miguel Rodrigo da Silva Normando

## Stack Tecnológica

- **Linguagem:** Java
- **Build:** Maven
- **Paradigma:** Orientação a Objetos (OO)
- **Banco de dados:** PostgreSQL

## Entidades e atributos

| Entidade  | Atributos                                                                              |
|-----------|----------------------------------------------------------------------------------------|
| Unidade   | id, nome, endereço, CNPJ, telefone                                                     |
| Aluno     | id, nome, CPF, telefone, e-mail, status (ativo/inativo)                                |
| Plano     | id, tipo, valor, duração em dias, percentual de desconto, descrição                    |
| Contrato  | id, aluno, unidade, plano, data início, data término, status (ativo/cancelado)         |
| Cobrança  | id, contrato, data vencimento, valor, data pagamento, forma de pagamento, status       |

## Regras de negócio

1. **Planos predefinidos:** diário, mensal, trimestral, semestral, anual. Não podem ser criados por unidade nem ter valor alterado por contrato.
2. **Desconto progressivo:** planos mais longos têm desconto embutido, aplicado automaticamente.
3. **Aluno não vinculado a unidade fixa:** a unidade fica no `Contrato`, não no `Aluno`. Isso permite frequentar unidades diferentes ao longo do tempo e preserva o histórico.
4. **Contrato único ativo:** um aluno não pode ter mais de um contrato ativo simultaneamente.
5. **Renovação = novo contrato:** nunca modifica o contrato existente; cria um novo, preservando histórico.
6. **Cancelamento de contrato:** inativa automaticamente o aluno e bloqueia o acesso na catraca.
7. **Carência de 2 dias:** após vencimento da cobrança, o acesso permanece liberado por até 2 dias antes do bloqueio automático.
8. **Geração automática de cobranças:** ao criar o contrato, o sistema gera todas as cobranças do período.
9. **Notificações via WhatsApp:** disparadas automaticamente para vencimento próximo e cobrança atrasada.
10. **Acesso na catraca:** liberado somente com contrato ativo + sem cobranças atrasadas (respeitando carência).

## Decisões de modelagem

- Sem relacionamentos N:N no modelo conceitual
- FK pertencem ao modelo lógico/físico, não ao MER
- Notação de cardinalidade (min, max) posicionada no lado oposto à entidade descrita

## Skills

@.claude/skills/terminal-output-style/SKILL.md
@.claude/skills/formatacao-academica-ifpb/SKILL.md
