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
});
