@echo off
echo Iniciando execução em %date% %time% > execution_output.txt

echo. >> execution_output.txt
echo === Teste 1: MainAlunoSave === >> execution_output.txt
call mvnw.cmd exec:java -Dexec.mainClass="br.edu.ifpb.es.daw.MainAlunoSave" >> execution_output.txt 2>&1

echo. >> execution_output.txt
echo === Teste 2: MainContratoSave === >> execution_output.txt
call mvnw.cmd exec:java -Dexec.mainClass="br.edu.ifpb.es.daw.MainContratoSave" >> execution_output.txt 2>&1

echo. >> execution_output.txt
echo === Teste 3: MainCobrancaSave === >> execution_output.txt
call mvnw.cmd exec:java -Dexec.mainClass="br.edu.ifpb.es.daw.MainCobrancaSave" >> execution_output.txt 2>&1

echo. >> execution_output.txt
echo Execução finalizada em %date% %time% >> execution_output.txt
echo.
echo Saída capturada no arquivo 'execution_output.txt'
pause