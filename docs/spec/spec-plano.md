# Spec Plano

## Requisitos Funcionais

- Crie planos para a academia
- Consulte planos cadastrados
- Atualize dados de planos
- Exclua planos do sistema

## Dados do Plano

- Cadastre nome do plano
- Cadastre descrição do plano
- Cadastre valor do plano
- Cadastre tipo do plano (MENSAL, TRIMESTRAL, SEMESTRAL, ANUAL)
- Cadastre duração em dias do plano

## Regras de Negócio

- Valide que nome é único
- Valide que valor é positivo
- Valide que duração é válida para o tipo
- Calcule duração automaticamente quando tipo for informado

## Critérios de Aceitação

- Retorne erro 400 para dados inválidos
- Retorne erro 404 para plano não encontrado
- Retorne lista de todos os planos ativos
- Retorne dados completos do plano em consultas individuais

## Endpoints

- POST /api/planos - Criar plano
- GET /api/planos - Listar planos
- GET /api/planos/{id} - Buscar plano por ID
- PUT /api/planos/{id} - Atualizar plano
- DELETE /api/planos/{id} - Excluir plano

## Frontend

- Exiba lista de planos em tabela
- Exiba formulário para criar plano
- Exiba formulário para editar plano
- Exiba valor e tipo do plano
- Permita associar plano a novos contratos
