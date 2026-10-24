# Orientações gerais para o monorepo

Estas orientações complementam o arquivo [`AGENTS.md`](../AGENTS.md) da raiz.

## Estrutura do monorepo

- Antes de alterar arquivos, identifique a qual projeto pertencem e consulte o `README.md`, os manifestos e as instruções locais aplicáveis.
- Os projetos e ferramentas podem ter dependências, comandos e padrões próprios. Consulte a documentação e os manifestos no diretório do projeto; não presuma que os comandos da raiz se aplicam a todos.
- Mantenha código e configuração específicos dentro do diretório do projeto correspondente. Adicione ferramentas à raiz apenas quando forem compartilhadas pelo repositório.
- Ao adicionar um projeto ou mudar a estrutura, atualize a documentação geral relevante e considere incluir instruções locais para esse projeto.
- Se uma mudança afetar mais de um projeto, consulte as instruções e valide os comandos pertinentes de cada um.

## Instruções locais

- Os arquivos `AGENTS.md` dentro de diretórios se aplicam ao trabalho nesses diretórios e complementam as instruções da raiz.
- Para o aplicativo mobile, consulte [`mobile/AGENTS.md`](../mobile/AGENTS.md), que contém as regras específicas de Expo e React Native.

## Contribuição

Siga [`CONTRIBUTING.md`](../CONTRIBUTING.md) para o fluxo de issues, branches, commits, pull requests e verificações do repositório.
