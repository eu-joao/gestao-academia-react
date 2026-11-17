# Spec Programa de Treino

## Requisitos Funcionais

- Disponibilize programas de treino predefinidos
- Selecione o programa inicial do aluno conforme seu perfil
- Permita ao personal substituir o programa atual por outro predefinido
- Consulte o programa atual do aluno e seus dias de treino

## Dados do Programa de Treino

- Cadastre nível de experiência (INICIANTE, INTERMEDIARIO, AVANCADO)
- Cadastre frequência semanal (3, 4, 5 ou 6 dias)
- Cadastre tipo estrutural
- Cadastre descrição

## Regras de Negócio

- Disponibilize doze programas predefinidos, correspondentes às combinações de nível e frequência
- Carregue os programas e seus conteúdos como dados iniciais do sistema
- Selecione o programa inicial pela combinação de nível de experiência e frequência semanal do aluno
- Mantenha somente um programa atual por aluno
- Permita ao personal substituir o programa atual por outro predefinido
- Não mantenha histórico de atribuições nesta versão
- Não disponibilize criação ou edição de programas pelo personal na primeira versão

## Critérios de Aceitação

- Associe automaticamente o programa correspondente ao perfil no cadastro do aluno
- Permita ao personal trocar o programa atual
- Exiba ao aluno o programa atualmente atribuído
- Preserve nas sessões a referência ao programa efetivamente realizado

## Interfaces

- Exiba o programa atual e seus dias no aplicativo mobile
- Disponibilize ao personal a consulta e substituição do programa no portal web
