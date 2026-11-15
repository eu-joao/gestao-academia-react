# Spec Unidade

## Requisitos Funcionais

- Crie unidades da academia
- Consulte unidades cadastradas
- Atualize unidades
- Exclua unidades

## Dados da Unidade

- Cadastre nome da unidade
- Cadastre endereço da unidade
- Cadastre telefone da unidade
- Cadastre email da unidade
- Cadastre capacidade máxima de alunos

## Regras de Negócio

- Valide que nome é único
- Valide que email é válido
- Valide que telefone é válido
- Valide que capacidade é positiva

## Critérios de Aceitação

- Retorne erro 400 para dados inválidos
- Retorne erro 404 para unidade não encontrado
- Retorne lista de todas as unidades
- Retorne dados completos da unidade

## Endpoints

- POST /api/unidades - Criar unidade
- GET /api/unidades - Listar unidades
- GET /api/unidades/{id} - Buscar unidade por ID
- PUT /api/unidades/{id} - Atualizar unidade
- DELETE /api/unidades/{id} - Excluir unidade

## Frontend

- Exiba lista de unidades
- Exiba formulário para criar unidade
- Exiba endereço e contato da unidade
- Permita associar alunos a unidades
