#!/usr/bin/env bash

# Detener el script si ocurre un error inesperado
set -e

# Colores para la terminal
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

echo -e "${CYAN}=============================================================="
echo -e "   HumanTextSuite - Detector & Humanizador de Texto IA"
echo -e "   Arranque Automático en Un Solo Clic (macOS / Linux)"
echo -e "==============================================================${NC}"
echo ""

# 1. Comprobar instalación de Node.js y npm
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}[ERROR] Node.js no se encuentra instalado en tu sistema.${NC}"
    echo ""
    echo "Para ejecutar HumanTextSuite necesitas tener Node.js instalado."
    echo "Puedes descargarlo e instalarlo de forma gratuita desde:"
    echo -e "   ${YELLOW}https://nodejs.org/${NC} (Se recomienda la versión LTS)"
    echo ""
    echo "O mediante tu gestor de paquetes:"
    echo "   macOS (Homebrew): brew install node"
    echo "   Debian/Ubuntu:    sudo apt update && sudo apt install nodejs npm"
    echo "   Fedora/RHEL:      sudo dnf install nodejs"
    echo ""
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}[ERROR] npm no se encuentra disponible.${NC}"
    echo "Por favor instala npm junto a Node.js desde https://nodejs.org/"
    exit 1
fi

NODE_VER=$(node -v)
echo -e "${GREEN}[OK] Node.js detectado: ${NODE_VER}${NC}"

# 2. Configurar archivo de entorno si no existe
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}[1/3] Configurando archivo de entorno (.env)...${NC}"
        cp .env.example .env
        echo "      Archivo .env creado con valores funcionales por defecto."
    fi
fi

# 3. Comprobar e instalar dependencias en la primera ejecución
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[2/3] Primera ejecución detectada: instalando dependencias...${NC}"
    echo "      Esto puede tardar unos momentos, por favor espera..."
    echo ""
    npm install
    echo ""
    echo -e "${GREEN}      Dependencias instaladas con éxito.${NC}"
else
    echo -e "${GREEN}[INFO] Dependencias ya instaladas. Saltando paso de instalación.${NC}"
fi

# 4. Iniciar la aplicación y abrir navegador
URL="http://localhost:5173"
echo -e "${CYAN}[3/3] Iniciando servidor local en ${URL} ...${NC}"
echo ""
echo -e "${CYAN}=============================================================="
echo "  La aplicación se abrirá automáticamente en tu navegador."
echo "  Para detener el servidor, presiona Ctrl+C en esta terminal."
echo -e "==============================================================${NC}"
echo ""

# Abrir el navegador en segundo plano según el sistema operativo
abrir_navegador() {
    sleep 1.5
    if command -v open >/dev/null 2>&1; then
        # macOS
        open "$URL" >/dev/null 2>&1 || true
    elif command -v xdg-open >/dev/null 2>&1; then
        # Linux
        xdg-open "$URL" >/dev/null 2>&1 || true
    elif command -v sensible-browser >/dev/null 2>&1; then
        sensible-browser "$URL" >/dev/null 2>&1 || true
    fi
}

abrir_navegador &

# Ejecutar el servidor de desarrollo
npm run dev -- --host
