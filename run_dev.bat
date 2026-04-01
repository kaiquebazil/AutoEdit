@echo off
chcp 850 > nul
title Video Silence Cutter - Dev Mode
cls

echo ==========================================
echo    Video Silence Cutter - Dev Mode
echo ==========================================
echo.

cd /d "%~dp0"
set "PROJECT_ROOT=%CD%"

echo [INFO] Iniciando servidores em paralelo...
echo [INFO] Backend: http://localhost:8000
echo [INFO] Frontend: http://localhost:5173
echo.

:: Backend
echo [1/2] Iniciando Backend...
start "Backend - FastAPI" cmd /k "cd /d "%PROJECT_ROOT%\backend" && call venv\Scripts\activate.bat && echo. && echo ================================= && echo    Backend FastAPI && echo    http://localhost:8000 && echo ================================= && echo. && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak > nul

:: Frontend
echo [2/2] Iniciando Frontend...
start "Frontend - React" cmd /k "cd /d "%PROJECT_ROOT%\frontend" && echo. && echo ================================= && echo    Frontend React && echo    http://localhost:5173 && echo ================================= && echo. && npm run dev"

echo.
echo ==========================================
echo    Ambiente iniciado!
echo ==========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Duas janelas foram abertas.
pause
