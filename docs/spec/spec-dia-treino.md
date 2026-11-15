# Spec Dia de Treino

## Requisitos Funcionais

- Crie dias de treino
- Consulte dias de treino
- Atualize dias de treino
- Exclua dias de treino
- Associe exercícios a dias de treino

## Dados do Dia de Treino

- Cadastre nome do dia de treino
- Cadastre descrição do dia de treino
- Associe a um programa de treino
- Cadastre ordem do dia no programa

## Regras de Negócio

- Valide que nome é único dentro do programa
- Valide que programa de treino existe
- Valide que ordem é única dentro do programa

## Critérios de Aceitação

- Retorne erro 400 para dados inválidos
- Retorne erro 404 para dia de treino ou programa não encontrado
- Retorne lista de dias de treino por programa
- Retorne dados completos do dia de treino

## Endpoints

- POST /api/dias-treino - Criar dia de treino
- GET /api/dias-treino - Listar dias de treino
- GET /api/dias-treino/{id} - Buscar dia de treino por ID
- PUT /api/dias-treino/{id} - Atualizar dia de treino
- DELETE /api/dias-treino/{id} - Excluir dia de treino
- GET /api/programas-treino/{programaId}/dias-treino - Listar dias de treino por programa

## Frontend

- Exiba lista de dias de treino de um programa
- Exiba formulário para criar dia de treino
- Permita associar exercícios ao dia de treino
- Exiba ordem dos dias no programa
