# Spec Acesso

## Requisitos Funcionais

- Restrinja o portal web ao personal por meio de um login simulado
- Redirecione para a tela de login qualquer acesso ao portal sem sessão válida
- Permita ao personal encerrar a sessão
- Mantenha a API e o aplicativo mobile sem autenticação nesta versão

## Dados de Acesso

- Defina o usuário e a senha do personal nas variáveis de ambiente `ADMIN_USER` e `ADMIN_PASS` do servidor web
- Grave a sessão em um cookie `httpOnly` com validade de 8 horas

## Regras de Negócio

- Não envie usuário nem senha ao navegador; a validação ocorre no servidor web
- Não disponibilize cadastro público de contas
- Não use os valores padrão em ambiente de produção
- Reconheça que a API não impõe isolamento entre os dados de cada aluno, pois não há autenticação de aluno nesta versão

## Critérios de Aceitação

- Redirecione para `/login` o acesso sem sessão a qualquer tela do portal
- Rejeite credenciais inválidas com mensagem de erro na tela de login
- Libere o portal após o login com credenciais válidas
- Redirecione para o portal o acesso à tela de login com sessão ativa
- Remova a sessão e volte para `/login` ao acionar o botão Sair

## Interfaces

- Disponibilize a tela de login no portal web
- Disponibilize o botão Sair no cabeçalho do portal web

## Ponto para validação

- Confirme com o professor se o login simulado é suficiente para o requisito de controle de acesso. Para uma versão em produção, a evolução prevista é armazenar as credenciais no banco de dados, emitir um token JWT no login e reativar a segurança por método (`@PreAuthorize`) já anotada nos controllers do backend.
