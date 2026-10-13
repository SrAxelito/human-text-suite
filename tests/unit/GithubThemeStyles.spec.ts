import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('GitHub Primer Theme & Style Consistency', () => {
  const cssPath = path.resolve(__dirname, '../../src/presentation/styles/index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  it('debe definir la paleta de colores de GitHub en modo oscuro (:root)', () => {
    expect(cssContent).toContain('--bg-primary: #0d1117');
    expect(cssContent).toContain('--bg-secondary: #161b22');
    expect(cssContent).toContain('--border-subtle: #30363d');
    expect(cssContent).toContain('--radius-sm: 6px');
    expect(cssContent).toContain('--radius-md: 6px');
  });

  it('debe definir la paleta de colores de GitHub en modo claro ([data-theme="claro"])', () => {
    expect(cssContent).toContain('--bg-primary: #f6f8fa');
    expect(cssContent).toContain('--bg-card: #ffffff');
    expect(cssContent).toContain('--border-subtle: #d0d7de');
    expect(cssContent).toContain('--accent-link: #0969da');
  });

  it('debe implementar Segmented Controls de GitHub para la navegación de pestañas', () => {
    expect(cssContent).toContain('.tab-nav');
    expect(cssContent).toContain('.tab-btn');
    expect(cssContent).toContain('.tab-btn.active');
    expect(cssContent).toContain('display: inline-flex');
  });

  it('debe garantizar coherencia visual en editor y barra de estado', () => {
    // El contenedor del editor debe usar --bg-card y borde de 1px
    expect(cssContent).toContain('.editor-container');
    expect(cssContent).toContain('background: var(--bg-card)');
    // La barra inferior debe usar --bg-secondary con texto secundario
    expect(cssContent).toContain('.editor-footer');
    expect(cssContent).toContain('background: var(--bg-secondary)');
  });

  it('debe estilar la tarjeta de diagnóstico como alerta informativa de GitHub', () => {
    expect(cssContent).toContain('.diagnostic-card');
    expect(cssContent).toContain('#ddf4ff');
    expect(cssContent).toContain('#54aeff');
  });
});
