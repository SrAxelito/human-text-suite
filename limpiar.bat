@echo off
title HumanTextSuite - Limpieza y Reseteo
cd /d "%~dp0"
echo.
echo ==============================================================
echo    HumanTextSuite - Limpieza de Cache y Dependencias
echo ==============================================================
echo.
echo Este script eliminara la carpeta node_modules, la cache de compilacion
echo y archivos temporales para permitir una instalacion limpia.
echo.
set /p RESP="¿Deseas continuar? (S/N): "
if /i "%RESP%" neq "S" (
    echo Operacion cancelada.
    pause
    exit /b 0
)

echo.
echo Eliminando node_modules...
if exist "node_modules\" rmdir /s /q "node_modules"

echo Eliminando dist...
if exist "dist\" rmdir /s /q "dist"

echo Eliminando cache de vite (.vite)...
if exist "node_modules\.vite\" rmdir /s /q "node_modules\.vite"

echo.
echo [EXITO] Limpieza completada.
echo La proxima vez que ejecutes 'iniciar.bat' se reinstalaran las dependencias limpias.
echo.
pause
