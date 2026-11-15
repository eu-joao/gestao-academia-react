# Spec Cobrança

## Requisitos Funcionais

- Crie cobranças para contratos
- Consulte cobranças do sistema
- Atualize status de cobranças
- Liste cobranças por contrato
- Liste cobranças por status

## Dados da Cobrança

- Associe cobrança a um contrato
- Cadastre valor da cobrança
- Cadastre data de vencimento
- Cadastre data de pagamento
- Cadastre status (PENDENTE, PAGO, ATRASADO, CANCELADO)
- Cadastre descrição da cobrança

## Regras de Negócio

- Valide que contrato existe ao criar cobrança
- Valide que valor é positivo
- Valide que data de vencimento é futura ou hoje
- Valide que data de pagamento é posterior a data de vencimento ou igual
- Atualize status automaticamente com base em data de vencimento e pagamento

## Critérios de Aceitação

- Retorne erro 400 para dados inválidos
- Retorne erro 404 para contrato não encontrado
- Retorne lista paginada de cobranças
- Retorne dados completos da cobrança em consultas individuais

## Endpoints

- POST /api/cobrancas - Criar cobrança
- GET /api/cobrancas - Listar cobranças
- GET /api/cobrancas/{id} - Buscar cobrança por ID
- PUT /api/cobrancas/{id} - Atualizar cobrança
- GET /api/contratos/{contratoId}/cobrancas - Listar cobranças por contrato

## Frontend

- Exiba lista de cobranças do contrato
- Exiba status da cobrança com indicação visual
- Exiba data de vencimento e valor
- Permita registrar pagamento
- Exiba cobranças em atraso com destaque
