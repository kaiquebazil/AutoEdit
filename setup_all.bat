@echo off
chcp 850 > nul
title Video Silence Cutter - Setup
cls

echo ==========================================
echo    Video Silence Cutter - Setup
echo    Full Stack: FastAPI + React
echo ==========================================
echo.

echo [1/4] Verificando pre-requisitos...

:: Try to find Python in common locations
set "PYTHON_CMD="

:: Check python command
where python > nul 2>&1
if %errorlevel% equ 0 (
    set "PYTHON_CMD=python"
    goto :found_python
)

:: Check py command (Python launcher)
where py > nul 2>&1
if %errorlevel% equ 0 (
    set "PYTHON_CMD=py"
    goto :found_python
)

:: Check common Python installation paths
if exist "C:\Python311\python.exe" (
    set "PYTHON_CMD=C:\Python311\python.exe"
    goto :found_python
)
if exist "C:\Python310\python.exe" (
    set "PYTHON_CMD=C:\Python310\python.exe"
    goto :found_python
)
if exist "C:\Python312\python.exe" (
    set "PYTHON_CMD=C:\Python312\python.exe"
    goto :found_python
)
if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    set "PYTHON_CMD=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
    goto :found_python
)
if exist "%LOCALAPPDATA%\Programs\Python\Python310\python.exe" (
    set "PYTHON_CMD=%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
    goto :found_python
)
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    set "PYTHON_CMD=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    goto :found_python
)

if not defined PYTHON_CMD (
    echo [ERRO] Python nao encontrado!
    echo.
    echo Possiveis solucoes:
    echo 1. Instale Python 3.10+ de python.org
    echo 2. Marque "Add Python to PATH" durante instalacao
    echo 3. Ou reinicie o computador apos instalar Python
    echo.
    pause
    exit /b 1
)

:found_python
echo [OK] Python encontrado: %PYTHON_CMD%

:: Check Node.js
where node > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado. Instale de nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js encontrado
echo.
echo.

echo [2/4] Configurando Backend Python...
cd /d "%~dp0backend"

if exist "venv" (
    echo [INFO] Ambiente virtual ja existe
) else (
    echo [INFO] Criando ambiente virtual...
    %PYTHON_CMD% -m venv venv
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao criar ambiente virtual
        pause
        exit /b 1
    )
)

echo [INFO] Ativando ambiente virtual...
call venv\Scripts\activate

echo [INFO] Instalando dependencias do backend...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar dependencias
    pause
    exit /b 1
)

call deactivate
echo [OK] Backend configurado!
echo.

echo [3/4] Configurando Frontend React...
cd /d "%~dp0frontend"

if exist "node_modules" (
    echo [INFO] node_modules ja existe
) else (
    echo [INFO] Instalando dependencias Node.js...
    npm install
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar dependencias
        pause
        exit /b 1
    )
)

echo [OK] Frontend configurado!
echo.

echo [4/4] Configurando variaveis de ambiente...
cd /d "%~dp0"

if not exist "backend\.env" (
    echo [INFO] Criando backend\.env...
    copy "backend\app\.env.example" "backend\.env" > nul
)

if not exist "frontend\.env" (
    echo [INFO] Criando frontend\.env...
    copy "frontend\.env.example" "frontend\.env" > nul
)

echo.
echo ==========================================
echo    Setup Completo!
echo ==========================================
echo.
echo Proximos passos:
echo   1. Execute: run_dev.bat
echo   2. Abra: http://localhost:5173
echo.
pause
