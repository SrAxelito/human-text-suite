@echo off
setlocal enabledelayedexpansion
title HumanTextSuite - Arranque Automatico

echo.
echo ==============================================================
echo    HumanTextSuite - Detector ^& Humanizador de Texto IA
echo    Arranque Automatico en Un Solo Clic
echo ==============================================================
echo.

:: 1. Verificar si Node.js esta disponible en PATH o rutas comunes de Windows
where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "%LOCALAPPDATA%\Programs\node\node.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\node;%PATH%"
    ) else if exist "%ProgramFiles%\nodejs\node.exe" (
        set "PATH=%ProgramFiles%\nodejs;%PATH%"
    ) else if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
        set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
    )
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no se encuentra instalado en tu sistema.
    echo.
    echo Para ejecutar HumanTextSuite necesitas tener Node.js instalado.
    echo Puedes descargarlo e instalarlo de forma gratuita desde:
    echo    https://nodejs.org/ (Se recomienda la version LTS)
    echo.
    echo Despues de instalarlo, vuelve a ejecutar este archivo (iniciar.bat).
    echo.
    pause
    exit /b 1
)

:: 2. Verificar y copiar archivo de entorno .env si no existe
if not exist ".env" (
    if exist ".env.example" (
        echo [1/3] Configurando archivo de entorno (.env)...
        copy ".env.example" ".env" >nul
        echo       Archivo .env creado con valores funcionales por defecto.
    )
)

:: 3. Verificar e instalar dependencias si es la primera ejecucion
if not exist "node_modules\" (
    echo [2/3] Primera ejecucion detectada: instalando dependencias...
    echo       Esto puede tardar unos momentos, por favor espera...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Ocurrio un problema durante la instalacion de paquetes (npm install).
        echo Revisa tu conexion a Internet o intenta ejecutar 'npm install' manualmente.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo       Dependencias instaladas con exito.
) else (
    echo [INFO] Dependencias ya instaladas. Saltando paso de instalacion.
)

:: 4. Iniciar la aplicacion y abrir navegador
echo [3/3] Iniciando servidor local en http://localhost:5173 ...
echo.
echo ==============================================================
echo   La aplicacion se abrira automaticamente en tu navegador.
echo   Para detener el servidor, cierra esta ventana o presiona Ctrl+C.
echo ==============================================================
echo.

:: Abrir navegador predeterminado
start http://localhost:5173

:: Iniciar servidor Vite
call npm run dev -- --host

if %errorlevel% neq 0 (
    echo.
    echo [AVISO] El servidor se ha detenido.
    pause
)
