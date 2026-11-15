# Spec Programa de Treino

## Requisitos Funcionais

- Crie programas de treino
- Consulte programas de treino
- Atualize programas de treino
- Exclua programas de treino
- Associe programas a dias de treino

## Dados do Programa de Treino

- Cadastre nome do programa
- Cadastre descrição do programa
- Cadastre nível de experiência (INICIANTE, INTERMEDIARIO, AVANCADO)
- Cadastre objetivo do programa

## Regras de Negócio

- Valide que nome é único
- Valide que nível de experiência é válido
- Valide que programa pode ser associado a múltiplos dias de treino

## Critérios de Aceitação

- Retorne erro 400 para dados inválidos
- Retorne erro 404 para programa não encontrado
- Retorne lista paginada de programas
- Retorne dados completos do programa

## Endpoints

- POST /api/programas-treino - Criar programa de treino
- GET /api/programas-treino - Listar programas de treino
- GET /api/programas-treino/{id} - Buscar programa por ID
- PUT /api/programas-treino/{id} - Atualizar programa
- DELETE /api/programas-treino/{id} - Excluir programa

## Frontend

- Exiba lista de programas de treino
- Exiba formulário para criar programa
- Permita associar exercícios a programas
- Exiba nível de experiência do programa
