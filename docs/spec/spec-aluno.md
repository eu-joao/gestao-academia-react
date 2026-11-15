# Spec Aluno

## Requisitos Funcionais

- Crie alunos no sistema com dados completos
- Consulte alunos cadastrados no sistema
- Atualize dados de alunos existentes
- Exclua alunos do sistema
- Liste alunos com filtros opcionais

## Dados do Aluno

- Cadastre nome completo do aluno
- Cadastre email do aluno
- Cadastre CPF do aluno
- Cadastre data de nascimento do aluno
- Cadastre telefone do aluno
- Cadastre status do aluno (ATIVO, INATIVO, PENDENTE)
- Cadastre data de cadastro do aluno

## Regras de Negócio

- Valide que email do aluno é único
- Valide que CPF do aluno é único
- Valide que CPF é válido
- Valide que email é válido
- Valide que data de nascimento é válida
- Valide que telefone é válido

## Critérios de Aceitação

- Retorne erro 400 para dados inválidos
- Retorne erro 404 para aluno não encontrado
- Retorne lista paginada de alunos
- Retorne dados completos do aluno em consultas individuais

## Endpoints

- POST /api/alunos - Criar aluno
- GET /api/alunos - Listar alunos
- GET /api/alunos/{id} - Buscar aluno por ID
- PUT /api/alunos/{id} - Atualizar aluno
- DELETE /api/alunos/{id} - Excluir aluno

## Frontend Web

- Exiba lista de alunos em tabela
- Exiba formulário para criar aluno
- Exiba formulário para editar aluno
- Exiba botão para excluir aluno com confirmação

## Frontend Mobile

- Exiba lista de alunos do usuário logado
- Exiba detalhes do aluno
- Permita navegação entre telas de alunos
