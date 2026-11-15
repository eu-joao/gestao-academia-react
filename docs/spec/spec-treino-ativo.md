# Spec Treino Ativo

## Requisitos Funcionais

- Crie treinos ativos para alunos
- Consulte treinos ativos
- Atualize status de treinos ativos
- Exclua treinos ativos
- Associe treinos ativos a alunos

## Dados do Treino Ativo

- Associe a um aluno
- Associe a um programa de treino
- Cadastre data de início
- Cadastre data de término
- Cadastre status (ATIVO, FINALIZADO, CANCELADO)

## Regras de Negócio

- Valide que aluno existe
- Valide que programa de treino existe
- Valide que data de início é anterior ou igual a data de término
- Valide que aluno pode ter apenas um treino ativo por vez

## Critérios de Aceitação

- Retorne erro 400 para dados inválidos
- Retorne erro 404 para aluno ou programa não encontrado
- Retorne lista de treinos ativos por aluno
- Retorne dados completos do treino ativo

## Endpoints

- POST /api/treinos-ativos - Criar treino ativo
- GET /api/treinos-ativos - Listar treinos ativos
- GET /api/treinos-ativos/{id} - Buscar treino ativo por ID
- PUT /api/treinos-ativos/{id} - Atualizar treino ativo
- DELETE /api/treinos-ativos/{id} - Excluir treino ativo
- GET /api/alunos/{alunoId}/treinos-ativos - Listar treinos ativos por aluno

## Frontend

- Exiba lista de treinos ativos do aluno
- Exiba status do treino ativo
- Exiba data de início e término
- Permita iniciar treino para aluno
- Permita finalizar treino ativo
