# Spec Contrato

## Requisitos Funcionais

- Crie contratos para alunos
- Consulte contratos de um aluno
- Consulte o contrato vigente do aluno
- Permita ao personal cancelar um contrato

## Dados do Contrato

- Associe o contrato a um aluno
- Associe o contrato a um plano definido no enum do backend
- Registre data de início e data de término
- Mantenha o status (ATIVO, CANCELADO, ENCERRADO)

## Regras de Negócio

- Permita somente um contrato ativo por aluno
- Calcule a data de término conforme a duração do plano
- Gere as cobranças mensais correspondentes à vigência do contrato
- Ative o aluno quando o contrato for criado
- Ao cancelar ou encerrar o contrato, torne o aluno inativo se não houver outro contrato vigente
- Ao cancelar o contrato, cancele cobranças futuras ainda não pagas
- Preserve cobranças pagas ou vencidas no cancelamento

## Critérios de Aceitação

- Rejeite a criação de um segundo contrato ativo para o mesmo aluno
- Registre corretamente o período de vigência e o plano contratado
- Gere as cobranças previstas para o período
- Atualize o status do aluno conforme as regras de negócio
- Permita ao personal consultar e cancelar contratos

## Interfaces

- Exiba o contrato vigente e seus dados no portal web
- Disponibilize ao personal a criação e o cancelamento de contratos
- Exiba ao aluno as informações do próprio contrato no aplicativo
