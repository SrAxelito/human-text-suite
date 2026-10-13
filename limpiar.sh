#!/usr/bin/env bash

# Colores para la terminal
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}=============================================================="
echo -e "   HumanTextSuite - Limpieza de Caché y Dependencias"
echo -e "==============================================================${NC}"
echo ""
echo "Este script eliminará la carpeta node_modules, la caché de compilación"
echo "y archivos temporales para permitir una instalación limpia."
echo ""

read -p "¿Deseas continuar? (s/N): " -r RESP
echo ""
if [[ ! "$RESP" =~ ^[sS]$ ]]; then
    echo "Operación cancelada."
    exit 0
fi

echo "Eliminando node_modules..."
rm -rf node_modules

echo "Eliminando dist..."
rm -rf dist

echo "Eliminando caché de vite..."
rm -rf node_modules/.vite

echo ""
echo -e "${GREEN}[ÉXITO] Limpieza completada.${NC}"
echo "La próxima vez que ejecutes './iniciar.sh' se reinstalarán las dependencias limpias."
echo ""
