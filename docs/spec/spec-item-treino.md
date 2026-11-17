# Spec Item de Treino

## Requisitos Funcionais

- Associe itens de treino aos dias de um programa
- Consulte os itens de um dia de treino
- Apresente os itens na ordem de execução

## Dados do Item de Treino

- Associe o item a um dia de treino
- Cadastre o nome do exercício
- Cadastre a musculatura alvo
- Cadastre a quantidade de séries
- Cadastre as repetições
- Cadastre a ordem de execução no dia

## Regras de Negócio

- Armazene cada exercício como um item pertencente a um DiaTreino
- Não mantenha catálogo global de exercícios
- Permita que o mesmo exercício tenha configurações diferentes em dias ou programas distintos
- Carregue os itens como parte dos dados iniciais dos programas predefinidos
- Não disponibilize criação ou edição de itens pelo personal na primeira versão

## Critérios de Aceitação

- Consulte os itens vinculados a um dia de treino
- Apresente nome, musculatura alvo, séries e repetições
- Apresente os itens na ordem definida
