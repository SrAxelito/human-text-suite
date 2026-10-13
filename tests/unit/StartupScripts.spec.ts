import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Scripts de Arranque y DevOps - Windows (iniciar.bat)', () => {
  const batPath = path.resolve(__dirname, '../../iniciar.bat');

  it('debe existir el archivo iniciar.bat en la raíz del proyecto', () => {
    expect(fs.existsSync(batPath)).toBe(true);
  });

  it('debe comprobar la presencia de Node.js y ofrecer enlace de descarga en caso de fallo', () => {
    const contenido = fs.readFileSync(batPath, 'utf-8');
    expect(contenido).toContain('where node');
    expect(contenido).toContain('https://nodejs.org/');
    expect(contenido).toContain('pause');
  });

  it('debe copiar automáticamente .env.example a .env si no existe', () => {
    const contenido = fs.readFileSync(batPath, 'utf-8');
    expect(contenido).toContain('if not exist ".env"');
    expect(contenido).toContain('.env.example');
  });

  it('debe detectar la primera ejecución para instalar dependencias y saltarse en ejecuciones posteriores', () => {
    const contenido = fs.readFileSync(batPath, 'utf-8');
    expect(contenido).toContain('if not exist "node_modules\\"');
    expect(contenido).toContain('npm install');
  });

  it('debe iniciar el servidor y abrir automáticamente el navegador en localhost:5173', () => {
    const contenido = fs.readFileSync(batPath, 'utf-8');
    expect(contenido).toContain('http://localhost:5173');
    expect(contenido).toContain('npm run dev');
  });

  it('no debe utilizar @cls para preservar el historial de errores en terminal', () => {
    const contenido = fs.readFileSync(batPath, 'utf-8');
    expect(contenido).not.toMatch(/@cls\b/i);
    expect(contenido).not.toMatch(/^cls$/im);
  });

  it('debe arrancar el servidor en ventana persistente cmd /k y esperar 3 segundos antes del navegador', () => {
    const contenido = fs.readFileSync(batPath, 'utf-8');
    expect(contenido).toContain('start "HumanTextSuite - Servidor" cmd /k "npm run dev"');
    expect(contenido).toContain('timeout /t 3');
  });

  it('debe verificar tanto node como npm y disponer de rutas estandar de Windows', () => {
    const contenido = fs.readFileSync(batPath, 'utf-8');
    expect(contenido).toContain('where node');
    expect(contenido).toContain('where npm');
    expect(contenido).toContain('%ProgramFiles%\\nodejs');
    expect(contenido).toContain('%LOCALAPPDATA%\\Programs\\node');
  });
});

describe('Manejo de Puertos Dinámicos y Servidor Fijo (5173)', () => {
  it('package.json debe configurar el script dev con --port 5173 y --strictPort', () => {
    const pkgPath = path.resolve(__dirname, '../../package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.scripts.dev).toContain('--port 5173');
    expect(pkg.scripts.dev).toContain('--strictPort');
  });

  it('vite.config.ts debe forzar puerto 5173 y strictPort true', () => {
    const viteConfigPath = path.resolve(__dirname, '../../vite.config.ts');
    const contenido = fs.readFileSync(viteConfigPath, 'utf-8');
    expect(contenido).toContain('port: 5173');
    expect(contenido).toContain('strictPort: true');
  });
});

describe('Scripts de Arranque y DevOps - macOS y Linux (iniciar.sh)', () => {
  const shPath = path.resolve(__dirname, '../../iniciar.sh');

  it('debe existir el archivo iniciar.sh en la raíz del proyecto con cabecera bash', () => {
    expect(fs.existsSync(shPath)).toBe(true);
    const contenido = fs.readFileSync(shPath, 'utf-8');
    expect(contenido.startsWith('#!/usr/bin/env bash')).toBe(true);
  });

  it('debe comprobar la instalación de node y npm con enlaces de descarga', () => {
    const contenido = fs.readFileSync(shPath, 'utf-8');
    expect(contenido).toContain('command -v node');
    expect(contenido).toContain('command -v npm');
    expect(contenido).toContain('https://nodejs.org/');
  });

  it('debe copiar .env.example si .env no existe', () => {
    const contenido = fs.readFileSync(shPath, 'utf-8');
    expect(contenido).toContain('if [ ! -f ".env" ]');
    expect(contenido).toContain('cp .env.example .env');
  });

  it('debe instalar dependencias en la primera ejecución si falta node_modules', () => {
    const contenido = fs.readFileSync(shPath, 'utf-8');
    expect(contenido).toContain('if [ ! -d "node_modules" ]');
    expect(contenido).toContain('npm install');
  });

  it('debe abrir el navegador con xdg-open o open y ejecutar el servidor en localhost:5173', () => {
    const contenido = fs.readFileSync(shPath, 'utf-8');
    expect(contenido).toContain('http://localhost:5173');
    expect(contenido).toContain('open "$URL"');
    expect(contenido).toContain('xdg-open "$URL"');
    expect(contenido).toContain('npm run dev');
  });
});

describe('Scripts de Limpieza y Reseteo (limpiar.bat y limpiar.sh)', () => {
  it('deben existir los scripts de limpieza para Windows y Unix', () => {
    const batLimpiar = path.resolve(__dirname, '../../limpiar.bat');
    const shLimpiar = path.resolve(__dirname, '../../limpiar.sh');
    expect(fs.existsSync(batLimpiar)).toBe(true);
    expect(fs.existsSync(shLimpiar)).toBe(true);
  });
});
