# Spec Exercício

## Requisitos Funcionais

- Crie exercícios para o sistema
- Consulte exercícios cadastrados
- Atualize exercícios
- Exclua exercícios
- Associe exercícios a dias de treino

## Dados do Exercício

- Cadastre nome do exercício
- Cadastre descrição do exercício
- Cadastre grupo muscular do exercício
- Cadastre tipo estrutural (AEROBICO, ANAEROBICO)
- Cadastre nível de intensidade

## Regras de Negócio

- Valide que nome é único
- Valide que grupo muscular é válido
- Valide que tipo estrutural é válido

## Critérios de Aceitação

- Retorne erro 400 para dados inválidos
- Retorne erro 404 para exercício não encontrado
- Retorne lista paginada de exercícios
- Retorne dados completos do exercício

## Endpoints

- POST /api/exercicios - Criar exercício
- GET /api/exercicios - Listar exercícios
- GET /api/exercicios/{id} - Buscar exercício por ID
- PUT /api/exercicios/{id} - Atualizar exercício
- DELETE /api/exercicios/{id} - Excluir exercício

## Frontend

- Exiba lista de exercícios
- Exiba formulário para criar exercício
- Permita buscar exercícios por grupo muscular
- Permita associar exercícios a programas de treino
