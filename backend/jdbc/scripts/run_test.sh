#!/bin/bash

# Script para executar MainAlunoSave e capturar a saída completa
# Incluindo stdout e stderr para diagnóstico de erros

echo "=== Execução do MainAlunoSave - $(date) ===" > execution_output.txt
echo "Comando: ./mvnw exec:java -Dexec.mainClass=\"br.edu.ifpb.es.daw.MainAlunoSave\"" >> execution_output.txt
echo "" >> execution_output.txt

# Executa o comando e captura tanto stdout quanto stderr
./mvnw exec:java -Dexec.mainClass="br.edu.ifpb.es.daw.MainAlunoSave" >> execution_output.txt 2>&1

echo "" >> execution_output.txt
echo "=== Fim da execução - $(date) ===" >> execution_output.txt

echo "Saída capturada no arquivo 'execution_output.txt'"