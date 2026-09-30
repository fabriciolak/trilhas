@echo off
rem Atalho para o gym.py no Windows (PowerShell ou Prompt de Comando): .\gym [comando]
where py >nul 2>nul && (py -3 "%~dp0gym.py" %* & exit /b)
python "%~dp0gym.py" %*
