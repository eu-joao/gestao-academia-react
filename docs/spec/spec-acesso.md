# Spec Acesso

## Requisitos Funcionais

- Autentique usuários no sistema
- Cadastre novos usuários
- Recupere senha de usuário
- Valide token de acesso

## Dados de Acesso

- Cadastre email do usuário
- Cadastre senha do usuário
- Cadastre papel do usuário (ADMIN, INSTRUTOR, ALUNO)
- Gerencie token JWT de autenticação

## Regras de Negócio

- Valide que email é único
- Valide que senha atende requisitos de segurança
- Valide que email é válido
- Criptografe senha antes de armazenar
- Valide token de acesso em requests autenticadas

## Critérios de Aceitação

- Retorne erro 401 para credenciais inválidas
- Retorne erro 403 para acesso não autorizado
- Retorne token JWT válido em autenticação bem-sucedida
- Retorne dados do usuário autenticado

## Endpoints

- POST /api/auth/login - Autenticar usuário
- POST /api/auth/register - Cadastrar usuário
- POST /api/auth/refresh - Atualizar token
- POST /api/auth/forgot-password - Solicitar recuperação de senha
- POST /api/auth/reset-password - Redefinir senha

## Frontend

- Exiba formulário de login
- Exiba formulário de cadastro
- Exiba formulário de recuperação de senha
- Persista token de autenticação
- Redirecione usuário após login
- Exiba erro para credenciais inválidas
