# Spec Aluno

## Requisitos Funcionais

- Cadastre alunos pelo aplicativo mobile
- Consulte os dados do próprio aluno
- Permita que o aluno atualize seu peso atual
- Permita que o personal consulte e administre todos os alunos
- Liste alunos no portal web com os indicadores necessários ao acompanhamento

## Dados do Aluno

- Obtenha nome e email a partir da autenticação Google
- Cadastre peso e altura
- Cadastre nível de experiência (INICIANTE, INTERMEDIARIO, AVANCADO)
- Cadastre frequência semanal desejada (3, 4, 5 ou 6 dias)
- Mantenha status do aluno (ATIVO ou INATIVO)
- Associe o aluno ao seu programa de treino atual

## Regras de Negócio

- Selecione o programa inicial pela combinação de nível de experiência e frequência semanal
- Ative o aluno quando um contrato for criado
- Torne o aluno inativo quando o contrato for cancelado ou encerrado e não houver outro contrato vigente
- Armazene somente o peso atual, sem histórico de medições nesta versão
- Restrinja o aluno aos próprios dados
- Permita ao personal acessar os dados de todos os alunos

## Critérios de Aceitação

- Cadastre o aluno com os dados exigidos pelo minimundo V6
- Retorne os dados do aluno autenticado no aplicativo
- Permita ao personal consultar e atualizar os dados dos alunos
- Rejeite tentativas de acesso de um aluno aos dados de outro
- Atualize o status conforme as regras de contrato

## Interfaces

- Exiba os dados pessoais e físicos do aluno no aplicativo mobile
- Permita atualizar o peso atual
- Exiba a listagem de alunos no portal web
- Permita consultar os detalhes de cada aluno no portal web
