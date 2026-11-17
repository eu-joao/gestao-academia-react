# Spec Plano

## Requisitos Funcionais

- Disponibilize três opções fixas de plano para contratação
- Consulte as opções e seus valores durante a criação de um contrato

## Dados do Plano

- Defina o tipo do plano (MENSAL, TRIMESTRAL, SEMESTRAL)
- Defina a duração em meses
- Defina o valor mensal

## Regras de Negócio

- Represente os planos como enum no backend
- Não crie tabela ou entidade persistida para planos
- Não disponibilize operações de cadastro, edição ou exclusão no portal
- Utilize o valor mensal do plano para gerar as cobranças
- Exija alteração no enum e nova versão do backend para modificar opções ou valores

## Critérios de Aceitação

- Disponibilize somente os planos mensal, trimestral e semestral
- Informe a duração e o valor mensal de cada opção
- Associe o plano escolhido ao contrato
- Utilize o valor mensal definido no enum em todas as cobranças do contrato
