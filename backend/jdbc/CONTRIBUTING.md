# 🤝 Como contribuir com o projeto

## Pré-requisitos

- **Git**: [git-scm.com](https://git-scm.com) — instale com as opções padrão
- **JDK 17+**: [adoptium.net](https://adoptium.net) — marque **"Add to PATH"** e **"Set JAVA_HOME"** durante a instalação
- **Maven**: [maven.apache.org/download](https://maven.apache.org/download.cgi) — adicione a pasta `bin` ao PATH manualmente

## Configuração inicial

```bash
# 1. Clonar o repositório
git clone https://github.com/SEU_USUARIO/NOME_DO_REPO.git
cd NOME_DO_REPO

# 2. Instalar dependências e compilar
mvn install

# 3. Rodar o projeto
mvn exec:java
```

## 🔄 Fluxo de Pull Requests (obrigatório)

Toda e qualquer alteração ao projeto **deve ser feita através de um Pull Request (PR)**. Isso garante que o código seja revisado antes de integrado à `main`.

### Processo de contribuição

1. **Crie uma branch** para sua alteração:
   ```bash
   git checkout -b minha-feature
   # ou
   git checkout -b fix/descricao-do-bug
   ```

2. **Faça seus commits** com mensagens claras e descritivas:
   ```bash
   git commit -m "feat: adiciona validação de email"
   git commit -m "fix: corrige bug na autenticação"
   ```

3. **Envie sua branch** para o repositório:
   ```bash
   git push origin minha-feature
   ```

4. **Abra um Pull Request** no GitHub com uma descrição clara do que foi mudado

5. **Aguarde aprovação**: Sua PR precisa ser revisada e aprovada por **pelo menos uma pessoa** da equipe antes de fazer merge na `main`

6. **Resolva comentários**: Se houver solicitações de mudança, faça os ajustes e envie os novos commits

### ✅ Checklist antes de abrir a PR

- [ ] Seu código segue o padrão do projeto
- [ ] Você testou as alterações localmente
- [ ] Adicionou testes para novas funcionalidades (se aplicável)
- [ ] Atualizou a documentação (se necessário)
- [ ] Sua branch está atualizada com a `main` (`git pull origin main`)

## 💡 Dicas para facilitar a aprovação

- **Descreva bem** o propósito da sua PR no campo de descrição
- **PRs menores** são revisadas mais rapidamente — quebre em múltiplos PRs se necessário

