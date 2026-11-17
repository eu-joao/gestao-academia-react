# Spec Acesso

## Requisitos Funcionais

- Autentique o aluno pelo provedor Google
- Permita o acesso do personal por uma conta administrativa previamente cadastrada
- Identifique o papel do usuário autenticado
- Valide a identidade e as permissões do usuário em cada operação protegida

## Dados de Acesso

- Obtenha nome e email do aluno a partir da autenticação Google
- Associe a identidade autenticada ao cadastro do aluno
- Mantenha uma conta administrativa previamente cadastrada para o personal

## Regras de Negócio

- Restrinja o aluno aos próprios dados e operações
- Permita ao personal consultar e administrar os dados de todos os alunos
- Não disponibilize cadastro público de contas administrativas
- Não permita que um aluno acesse dados de outro aluno

## Critérios de Aceitação

- Autentique o aluno por meio do Google
- Permita o acesso administrativo somente à conta previamente cadastrada
- Retorne erro 401 para usuário não autenticado
- Retorne erro 403 para usuário autenticado sem permissão
- Preserve a identificação do usuário nas operações realizadas

## Interfaces

- Disponibilize o fluxo de autenticação Google no aplicativo mobile
- Disponibilize o acesso administrativo do personal no portal web
- Exiba mensagens adequadas para falhas de autenticação e autorização

## Ponto para validação

- Confirme com a equipe se a autenticação do aluno será exclusivamente Google, conforme a RN18 do minimundo V6.
