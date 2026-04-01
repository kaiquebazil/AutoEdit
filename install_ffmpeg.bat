@echo off
chcp 850 > nul
title Instalador FFmpeg
cls

echo ==========================================
echo    Instalador FFmpeg para Windows
echo ==========================================
echo.

:: Check if FFmpeg is already installed
where ffmpeg > nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] FFmpeg ja esta instalado!
    ffmpeg -version | findstr "ffmpeg version"
    echo.
    pause
    exit /b 0
)

echo FFmpeg nao encontrado. Instalando...
echo.

set "FFMPEG_DIR=C:\ffmpeg"
set "DOWNLOAD_URL=https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
set "ZIP_FILE=%TEMP%\ffmpeg.zip"

:: Download FFmpeg
echo [1/3] Baixando FFmpeg...
powershell -Command "Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%ZIP_FILE%'" 2> nul

if not exist "%ZIP_FILE%" (
    echo [ERRO] Falha ao baixar FFmpeg
    echo.
    echo Instale manualmente:
    echo 1. Acesse: https://www.gyan.dev/ffmpeg/builds/
    echo 2. Baixe: ffmpeg-release-essentials.zip
    echo 3. Extraia para C:\ffmpeg
    echo 4. Adicione C:\ffmpeg\bin ao PATH
    pause
    exit /b 1
)

echo [OK] Download completo
echo.

:: Extract
echo [2/3] Extraindo arquivos...
if exist "%FFMPEG_DIR%" rmdir /s /q "%FFMPEG_DIR%" 2> nul

powershell -Command "Expand-Archive -Path '%ZIP_FILE%' -DestinationPath '%TEMP%' -Force" 2> nul

:: Find extracted folder
for /d %%D in ("%TEMP%\ffmpeg-*") do (
    move "%%D" "%FFMPEG_DIR%" > nul 2>&1
)

del "%ZIP_FILE%" 2> nul

if not exist "%FFMPEG_DIR%\bin\ffmpeg.exe" (
    echo [ERRO] Falha ao extrair FFmpeg
    pause
    exit /b 1
)

echo [OK] Extraido para %FFMPEG_DIR%
echo.

:: Add to PATH
echo [3/3] Configurando PATH...
setx PATH "%PATH%;%FFMPEG_DIR%\bin" /M > nul 2>&1

if %errorlevel% neq 0 (
    echo [AVISO] Nao foi possivel adicionar ao PATH automaticamente
    echo Adicione manualmente: %FFMPEG_DIR%\bin
)

echo.
echo ==========================================
echo    FFmpeg instalado com sucesso!
echo ==========================================
echo.
echo Local: %FFMPEG_DIR%
echo.
echo IMPORTANTE: Reinicie o terminal ou computador
cho para que as mudancas do PATH tenham efeito.
echo.
pause
