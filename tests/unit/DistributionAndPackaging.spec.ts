import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Empaquetado de Escritorio y Distribución (Electron)', () => {
  const electronMainPath = path.resolve(__dirname, '../../electron/main.cjs');
  const pkgPath = path.resolve(__dirname, '../../package.json');

  it('debe existir el punto de entrada electron/main.cjs', () => {
    expect(fs.existsSync(electronMainPath)).toBe(true);
  });

  it('electron/main.cjs debe cargar dist/index.html y configurar entorno seguro', () => {
    const contenido = fs.readFileSync(electronMainPath, 'utf-8');
    expect(contenido).toContain('dist/index.html');
    expect(contenido).toContain('BrowserWindow');
    expect(contenido).toContain('nodeIntegration: false');
    expect(contenido).toContain('contextIsolation: true');
    expect(contenido).toContain('requestSingleInstanceLock');
  });

  it('package.json debe apuntar a electron/main.cjs y contener scripts de empaquetado', () => {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.main).toBe('electron/main.cjs');
    expect(pkg.scripts.pack).toBeDefined();
    expect(pkg.scripts.dist).toBeDefined();
    expect(pkg.build).toBeDefined();
    expect(pkg.build.productName).toBe('HumanTextSuite');
  });

  it('vite.config.ts debe usar base relativa "./" para compatibilidad con Electron y GitHub Pages', () => {
    const viteConfigPath = path.resolve(__dirname, '../../vite.config.ts');
    const contenido = fs.readFileSync(viteConfigPath, 'utf-8');
    expect(contenido).toContain("base: './'");
  });
});

describe('Despliegue Continuo Web y CD Multi-Plataforma', () => {
  it('debe existir vercel.json configurado para Vite', () => {
    const vercelPath = path.resolve(__dirname, '../../vercel.json');
    expect(fs.existsSync(vercelPath)).toBe(true);
    const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));
    expect(vercel.framework).toBe('vite');
    expect(vercel.outputDirectory).toBe('dist');
  });

  it('debe existir netlify.toml configurado para publicar dist', () => {
    const netlifyPath = path.resolve(__dirname, '../../netlify.toml');
    expect(fs.existsSync(netlifyPath)).toBe(true);
    const contenido = fs.readFileSync(netlifyPath, 'utf-8');
    expect(contenido).toContain('publish = "dist"');
  });

  it('debe existir el workflow de GitHub Pages en .github/workflows/deploy.yml', () => {
    const deployPath = path.resolve(__dirname, '../../.github/workflows/deploy.yml');
    expect(fs.existsSync(deployPath)).toBe(true);
    const contenido = fs.readFileSync(deployPath, 'utf-8');
    expect(contenido).toContain('deploy-pages');
    expect(contenido).toContain('npm run build');
  });

  it('debe existir el workflow de Release en .github/workflows/release.yml', () => {
    const releasePath = path.resolve(__dirname, '../../.github/workflows/release.yml');
    expect(fs.existsSync(releasePath)).toBe(true);
    const contenido = fs.readFileSync(releasePath, 'utf-8');
    expect(contenido).toContain('action-gh-release');
    expect(contenido).toContain('electron-builder');
  });
});

describe('Documentación README para Usuarios Finales', () => {
  const readmePath = path.resolve(__dirname, '../../README.md');

  it('debe incluir enlaces destacados a Live Demo y Descarga de Ejecutable', () => {
    const contenido = fs.readFileSync(readmePath, 'utf-8');
    expect(contenido).toContain('https://sraxelito.github.io/human-text-suite/');
    expect(contenido).toContain('https://github.com/SrAxelito/human-text-suite/releases/latest');
  });

  it('debe presentar la guía de 3 pasos (Descargar, Abrir, Usar)', () => {
    const contenido = fs.readFileSync(readmePath, 'utf-8');
    expect(contenido).toContain('Paso 1: Descargar');
    expect(contenido).toContain('Paso 2: Abrir');
    expect(contenido).toContain('Paso 3: Usar');
  });

  it('debe encapsular la documentación técnica avanzada en secciones colapsables <details>', () => {
    const contenido = fs.readFileSync(readmePath, 'utf-8');
    expect(contenido).toContain('<details>');
    expect(contenido).toContain('</details>');
    expect(contenido).toContain('Arquitectura de Software y Código Fuente');
  });
});
