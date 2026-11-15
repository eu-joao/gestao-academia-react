# Spec Contrato

## Requisitos Funcionais

- Crie contratos para alunos
- Consulte contratos do sistema
- Atualize dados de contratos existentes
- Exclua contratos do sistema
- Liste contratos por aluno
- Liste contratos por status

## Dados do Contrato

- Associe contrato a um aluno
- Associe contrato a um plano
- Cadastre data de início do contrato
- Cadastre data de término do contrato
- Cadastre status do contrato (ATIVO, CANCELADO, FINALIZADO, PENDENTE)
- Cadastre forma de pagamento (PIX, CARTAO, DINHEIRO, BOLETO)
- Cadastre valor do contrato

## Regras de Negócio

- Valide que aluno existe ao criar contrato
- Valide que plano existe ao criar contrato
- Valide que data de início é anterior ou igual a data de término
- Valide que valor é positivo
- Valide que não existe contrato ativo para o mesmo aluno
- Calcule data de término com base no plano quando não informado

## Critérios de Aceitação

- Retorne erro 400 para dados inválidos
- Retorne erro 404 para aluno ou plano não encontrado
- Retorne lista paginada de contratos
- Retorne dados completos do contrato em consultas individuais

## Endpoints

- POST /api/contratos - Criar contrato
- GET /api/contratos - Listar contratos
- GET /api/contratos/{id} - Buscar contrato por ID
- PUT /api/contratos/{id} - Atualizar contrato
- DELETE /api/contratos/{id} - Excluir contrato
- GET /api/alunos/{alunoId}/contratos - Listar contratos por aluno

## Frontend

- Exiba lista de contratos do aluno
- Exiba formulário para criar contrato
- Exiba status do contrato com indicação visual
- Exiba data de vencimento do contrato
- Permita cancelar contrato
