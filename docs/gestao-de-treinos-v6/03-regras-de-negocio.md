# Regras de Negócio — Gestão de Treinos

**Versão:** V6

| Código | Regra                                                                                                                                                                                                 |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN01   | O sistema possui três planos fixos (mensal, trimestral e semestral), definidos no enum do backend.                                                                                                    |
| RN02   | O valor de cada cobrança é o valor mensal definido no plano do contrato.                                                                                                                              |
| RN03   | Um aluno não pode possuir mais de um contrato ativo simultaneamente.                                                                                                                                  |
| RN04   | A criação do contrato gera uma cobrança por mês de vigência, com vencimentos baseados na data de início.                                                                                              |
| RN05   | A criação de um contrato ativa o aluno; o cancelamento ou encerramento do contrato o torna inativo quando não houver outro contrato vigente.                                                          |
| RN06   | O cancelamento do contrato cancela cobranças futuras ainda não pagas; cobranças já pagas ou vencidas devem permanecer registradas.                                                                    |
| RN07   | Uma cobrança não paga é considerada atrasada quando sua data de vencimento já passou.                                                                                                                 |
| RN08   | O pagamento é simulado e só pode ser confirmado pelo aluno dono da cobrança. A confirmação registra a data e atualiza o status.                                                                       |
| RN09   | A inadimplência não bloqueia o acesso ao aplicativo ou aos treinos.                                                                                                                                   |
| RN10   | O programa inicial do aluno é selecionado pela combinação de nível de experiência e frequência semanal.                                                                                               |
| RN11   | O aluno possui apenas um programa atual. O personal pode substituí-lo por outro programa predefinido, sem manter histórico de atribuições.                                                            |
| RN12   | Séries, repetições, musculatura e ordem são características do item de treino dentro de um dia, não de um catálogo global de exercícios.                                                              |
| RN13   | Os dias do programa são apresentados em sequência; após o último, a sequência recomeça no primeiro.                                                                                                   |
| RN14   | O aluno só pode registrar sessões referentes ao seu programa atual e ao próximo dia previsto da sequência.                                                                                            |
| RN15   | Cada sessão concluída registra aluno, programa, dia e data/hora da conclusão.                                                                                                                         |
| RN16   | O peso armazenado no cadastro representa o peso atual do aluno, sem histórico de medições nesta versão.                                                                                               |
| RN17   | O portal web é de uso exclusivo do personal, que acessa os dados de todos os alunos. A API não impõe isolamento entre os dados de cada aluno nesta versão, pois não há autenticação de aluno. |
| RN18   | O acesso ao portal web é protegido por um login simulado do personal, com usuário e senha definidos em variáveis de ambiente do servidor web. A API e o aplicativo mobile não exigem autenticação. |
| RN19   | Os treinos do aluno são persistidos imediatamente no armazenamento local do dispositivo móvel (`AsyncStorage`), operando com latência nula e independência total de conexão de rede.                  |
| RN20   | A sincronização de treinos com o servidor na nuvem utiliza processamento idempotente em lote (Outbox Pattern), garantindo que mutações offline sejam reconciliadas na ordem correta após a reconexão. |
| RN21   | A exclusão de treinos no servidor é lógica (`ativo = false`), preservando histórico e evitando violações de integridade referencial.                                                                  |

## Observações

- Atraso de cobrança pode ser calculado a partir do vencimento e da ausência de pagamento, sem depender de uma rotina que atualize registros periodicamente.
- As restrições de um contrato ativo por aluno e de propriedade da cobrança devem ser verificadas no backend.
- A sequência de dias deve considerar as sessões registradas para o programa atual do aluno.
- As mutações da fila offline são identificadas por UUID e acompanhadas de timestamp para resolução determinística de atualizações.
