# Instruções para agentes

Antes de concluir mudanças de código neste repositório, use a skill [validar-e-acompanhar-ci](.agents/skills/validar-e-acompanhar-ci/SKILL.md) para escolher e executar as verificações locais adequadas e, quando houver um pull request, acompanhar a CI e investigar falhas.

Ao commitar, enviar (push) ou abrir um pull request, use a skill [commit-push-pr-custom](.agents/skills/commit-push-pr-custom/SKILL.md) para executar o fluxo seguindo a convenção do repositório — branch, mensagem de commit e descrição do PR conforme CONTRIBUTING.md e os templates de PR. Ative a skill automaticamente, sem esperar o usuário invocar o comando manualmente.

Registre os comandos executados e seus resultados. Informe também verificações não executadas ou bloqueadas; não declare uma verificação aprovada sem evidência de que foi executada.
