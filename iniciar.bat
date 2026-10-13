@echo off
setlocal enabledelayedexpansion
title HumanTextSuite - Arranque Automatico

:: Asegurar que el directorio de trabajo sea siempre la raiz del proyecto
cd /d "%~dp0"

echo.
echo ==============================================================
echo    HumanTextSuite - Detector ^& Humanizador de Texto IA
echo    Arranque Automatico en Un Solo Clic
echo ==============================================================
echo.

:: 1. Incorporar rutas estandar de Node.js al PATH si existen
if exist "%ProgramFiles%\nodejs" (
    set "PATH=%ProgramFiles%\nodejs;!PATH!"
)
if exist "%LOCALAPPDATA%\Programs\node" (
    set "PATH=%LOCALAPPDATA%\Programs\node;!PATH!"
)
if exist "%ProgramFiles(x86)%\nodejs" (
    set "PATH=%ProgramFiles(x86)%\nodejs;!PATH!"
)
if exist "%APPDATA%\npm" (
    set "PATH=%APPDATA%\npm;!PATH!"
)

:: 2. Verificar disponibilidad de Node.js
where node >nul 2>nul
if %errorlevel% neq 0 goto :error_no_node

:: 3. Verificar disponibilidad de npm
where npm >nul 2>nul
if %errorlevel% neq 0 goto :error_no_npm

for /f "tokens=*" %%v in ('node -v 2^>nul') do set "NODE_VERSION=%%v"
echo [OK] Node.js detectado: !NODE_VERSION!
echo [OK] Gestor de paquetes npm detectado.
echo.

:: 4. Verificar y copiar archivo de entorno .env si no existe
if not exist ".env" (
    if exist ".env.example" (
        echo [1/3] Configurando archivo de entorno .env...
        copy /y ".env.example" ".env" >nul
        echo       Archivo .env creado con valores funcionales por defecto.
        echo.
    )
)

:: 5. Verificar e instalar dependencias si es la primera ejecucion
if not exist "node_modules\" (
    echo [2/3] Primera ejecucion detectada: instalando dependencias con npm install...
    echo       Esto puede tomar unos momentos, por favor espera...
    echo.
    call npm install
    if %errorlevel% neq 0 goto :error_install
    echo.
    echo       Dependencias instaladas con exito.
    echo.
) else (
    echo [INFO] Dependencias node_modules detectadas. Saltando instalacion.
    echo.
)

:: 6. Iniciar servidor Vite en ventana persistente y abrir navegador
echo [3/3] Iniciando servidor local en http://localhost:5173 ...
echo.
echo ==============================================================
echo   Iniciando proceso persistente en ventana dedicada...
echo   La ventana 'HumanTextSuite - Servidor' mantendra Vite activo.
echo   Esperando 3 segundos para asegurar inicializacion del puerto 5173...
echo ==============================================================
echo.

start "HumanTextSuite - Servidor" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul 2>nul || ping 127.0.0.1 -n 4 >nul

echo Abriendo navegador en http://localhost:5173 ...
start http://localhost:5173

echo.
echo [EXITO] Servidor levantado correctamente en http://localhost:5173
echo La ventana de servidor continua ejecutando la aplicacion.
echo.
pause
exit /b 0

:error_no_node
echo.
echo [ERROR] Node.js no se encuentra instalado en tu sistema o no esta en el PATH.
echo.
echo Para ejecutar HumanTextSuite necesitas tener Node.js instalado version 18 o superior.
echo Abriendo la pagina oficial de descarga en tu navegador: https://nodejs.org/ ...
start https://nodejs.org/
echo.
echo Despues de instalarlo, vuelve a hacer doble clic en iniciar.bat.
echo.
pause
exit /b 1

:error_no_npm
echo.
echo [ERROR] Node.js fue detectado pero el gestor de paquetes npm no esta disponible.
echo.
echo Por favor, reinstala Node.js para asegurar que npm este configurado correctamente.
echo Abriendo la pagina oficial de descarga en tu navegador: https://nodejs.org/ ...
start https://nodejs.org/
echo.
pause
exit /b 1

:error_install
echo.
echo [ERROR] Ocurrio un problema durante la instalacion de paquetes npm install.
echo Revisa tu conexion a Internet o intenta ejecutar npm install manualmente.
echo.
pause
exit /b 1
