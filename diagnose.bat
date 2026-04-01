@echo off
chcp 850 > nul
cls

echo ==========================================
echo    Diagnostico do Sistema
echo ==========================================
echo.

echo [1/4] Verificando Python...
python --version 2>nul || py --version 2>nul
echo.

echo [2/4] Verificando Node.js...
node --version 2>nul
echo.

echo [3/4] Verificando FFmpeg...
ffmpeg -version 2>nul | findstr "ffmpeg version" || echo [ERRO] FFmpeg NAO encontrado!
echo.

echo [4/4] Verificando portas em uso...
echo Porta 8000 (Backend):
netstat -ano | findstr ":8000" | findstr "LISTENING" && echo Backend esta rodando || echo Backend NAO esta rodando!

echo.
echo Porta 5173 (Frontend):
netstat -ano | findstr ":5173" | findstr "LISTENING" && echo Frontend esta rodando || echo Frontend NAO esta rodando!

echo.
echo ==========================================
echo Verificacao completa!
echo ==========================================
pause
