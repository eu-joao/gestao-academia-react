# Scripts para Teste de Execução

## O que é testado
Os scripts executam as três classes principais do projeto em sequência:
1. **MainAlunoSave** — testa a entidade Aluno
2. **MainContratoSave** — testa a entidade Contrato (sem mapeamento de FKs)
3. **MainCobrancaSave** — testa a entidade Cobrança (sem mapeamento de FKs)

## Para Linux/Mac:
```bash
chmod +x run_simple.sh
./run_simple.sh
```

## Para Windows:
```cmd
run_test.bat
```

## Resultado:
A saída completa de todos os três testes (incluindo erros) será salva no arquivo `execution_output.txt` na raiz do projeto.

Cada teste é separado por um cabeçalho indicando qual classe está sendo executada, facilitando a leitura e diagnóstico de problemas.