# Spec Sessão de Treino

## Requisitos Funcionais

- Registre a conclusão de uma sessão de treino pelo aluno
- Consulte as sessões concluídas pelo aluno
- Utilize as sessões para determinar o próximo dia da sequência
- Disponibilize dados de assiduidade para o acompanhamento do personal

## Dados da Sessão

- Associe a sessão ao aluno
- Registre o programa de treino realizado
- Registre o dia de treino realizado
- Registre a data e hora da conclusão

## Regras de Negócio

- Permita ao aluno registrar sessões somente para seu próprio cadastro
- Permita registrar sessões somente do programa atual do aluno
- Permita registrar somente o próximo dia previsto da sequência
- Apresente os dias do programa em sequência e reinicie pelo primeiro após o último
- Preserve na sessão a referência ao programa realizado, mesmo que o programa atual do aluno seja alterado posteriormente
- Utilize as sessões concluídas para calcular a assiduidade em relação à frequência semanal desejada

## Critérios de Aceitação

- Registre aluno, programa, dia e data/hora de conclusão
- Rejeite sessões de outro aluno ou de programa que não seja o atual
- Rejeite a conclusão de um dia diferente do próximo previsto
- Determine corretamente o próximo dia após cada sessão
- Disponibilize o histórico de sessões para consulta e indicadores do personal

## Interfaces

- Exiba o próximo dia previsto no aplicativo mobile
- Permita ao aluno confirmar a conclusão da sessão
- Exiba sessões concluídas e indicadores de assiduidade no portal web
