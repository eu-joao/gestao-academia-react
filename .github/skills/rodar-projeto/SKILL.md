---
name: rodar-projeto
description: Sobe, consulta e derruba API, web e mobile do gestao-academia-react no Codespace. Use quando o usuário pedir para rodar, testar, iniciar, parar o projeto ou ver URLs/QR do app.
---

# Rodar o projeto no Codespace

Toda a lógica está em `scripts/dev.sh`. Nunca reimplemente comandos de start: chame o script.

## Passos

1. Confirme que está dentro do Codespace (`echo $CODESPACE_NAME` não vazio). Se não estiver, oriente a abrir o Codespace do repositório (ou rodar `gh codespace create --repo eu-joao/gestao-academia-react`).
2. Inicie o que foi pedido:
   - tudo: `./scripts/dev.sh up`
   - só um: `./scripts/dev.sh up api` | `up web` | `up mobile`
3. Mostre ao usuário as URLs e, para o celular, o QR/URL `exp://` (`./scripts/dev.sh qr`).
4. Para diagnóstico: `./scripts/dev.sh status` e `./scripts/dev.sh logs <api|web|mobile>`.
5. Para encerrar: `./scripts/dev.sh down`.

## Regras

- A API usa o banco Neon via Codespaces secrets ou `backend/spring/.env`. Nunca imprima nem copie valores de credenciais.
- Se a API falhar ao subir, leia `logs api` e explique a causa (credencial ausente, banco inacessível, porta ocupada) antes de tentar de novo.
- A porta 8080 é deixada pública enquanto a API roda, para web e celular acessarem; `down` volta para privada.
