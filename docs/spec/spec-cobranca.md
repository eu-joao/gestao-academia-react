# Spec Cobrança

## Requisitos Funcionais

- Gere cobranças a partir de contratos
- Consulte as cobranças de um contrato
- Identifique cobranças pendentes, pagas, atrasadas e canceladas
- Permita ao aluno simular o pagamento de uma cobrança própria
- Permita ao personal acompanhar cobranças e valores recebidos ou previstos

## Dados da Cobrança

- Associe cada cobrança a um contrato
- Registre o número da parcela
- Registre a data de vencimento
- Registre o valor mensal definido no plano do contrato
- Mantenha o status (PENDENTE, PAGO, ATRASADO, CANCELADO)
- Registre a data do pagamento quando confirmado

## Regras de Negócio

- Gere uma cobrança para cada mês de vigência do contrato
- Baseie os vencimentos no dia de início do contrato
- Utilize em cada cobrança o valor mensal definido no plano contratado
- Considere atrasada a cobrança não paga cujo vencimento já passou
- Ao cancelar um contrato, cancele cobranças futuras ainda não pagas
- Preserve cobranças pagas ou já vencidas quando o contrato for cancelado
- Permita confirmar o pagamento somente ao aluno dono da cobrança
- Registre a data da confirmação e atualize o status para PAGO
- Não bloqueie o acesso ao aplicativo ou aos treinos por inadimplência
- Não integre o sistema a instituições financeiras ou serviços de pagamento reais

## Critérios de Aceitação

- Gere as parcelas automaticamente na criação do contrato
- Exiba ao aluno somente suas próprias cobranças
- Permita simular o pagamento de uma cobrança própria
- Rejeite tentativas de pagamento de cobranças pertencentes a outro aluno
- Exiba corretamente cobranças pendentes, pagas, atrasadas e canceladas
- Apresente ao personal os indicadores financeiros previstos no minimundo

## Interfaces

- Exiba lista de cobranças e vencimentos no aplicativo mobile
- Disponibilize a ação de pagamento fictício por Pix simulado
- Exiba situação das cobranças no portal web
- Apresente valores recebidos e previstos no período
