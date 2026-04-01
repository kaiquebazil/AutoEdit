@echo off
chcp 850 > nul
title Verificar FFmpeg
cls

echo ==========================================
echo    Verificacao do FFmpeg
echo ==========================================
echo.

echo Verificando instalacao do FFmpeg...
ffmpeg -version > nul 2>&1

if %errorlevel% equ 0 (
    echo.
    echo [OK] FFmpeg esta instalado!
    echo.
    ffmpeg -version 2>&1 | findstr "ffmpeg version"
    echo.
    echo Voce pode rodar o projeto localmente.
) else (
    echo.
    echo [ERRO] FFmpeg nao encontrado!
    echo.
    echo Para usar localmente, instale FFmpeg:
    echo 1. Baixe de: https://ffmpeg.org/download.html
    echo 2. Extraia para C:\ffmpeg
    echo 3. Adicione ao PATH do sistema
    echo.
    echo Ou use Docker que ja inclui FFmpeg.
)

echo.
pause
