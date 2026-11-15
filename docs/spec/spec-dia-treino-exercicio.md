# Spec Dia de Treino Exercício

## Requisitos Funcionais

- Associe exercícios a dias de treino
- Consulte associações de exercícios
- Atualize associações de exercícios
- Exclua associações de exercícios

## Dados da Associação

- Associe a um dia de treino
- Associe a um exercício
- Cadastre série do exercício
- Cadastre repetição do exercício
- Cadastre carga do exercício
- Cadastre descanso entre séries
- Cadastre ordem do exercício no dia

## Regras de Negócio

- Valide que dia de treino existe
- Valide que exercício existe
- Valide que série é positiva
- Valide que repetição é positiva
- Valide que carga é positiva quando aplicável
- Valide que ordem é única dentro do dia

## Critérios de Aceitação

- Retorne erro 400 para dados inválidos
- Retorne erro 404 para dia de treino ou exercício não encontrado
- Retorne lista de exercícios por dia de treino
- Retorne dados completos da associação

## Endpoints

- POST /api/dias-treino-exercicios - Criar associação
- GET /api/dias-treino-exercicios - Listar associações
- GET /api/dias-treino-exercicios/{id} - Buscar associação por ID
- PUT /api/dias-treino-exercicios/{id} - Atualizar associação
- DELETE /api/dias-treino-exercicios/{id} - Excluir associação
- GET /api/dias-treino/{diaId}/exercicios - Listar exercícios por dia de treino

## Frontend

- Exiba lista de exercícios de um dia de treino
- Exiba detalhes de cada exercício no dia
- Permita atualizar séries, repetições e carga
- Exiba ordem dos exercícios no dia
