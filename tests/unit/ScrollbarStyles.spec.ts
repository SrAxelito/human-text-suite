import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Scrollbar - Estilización y Compatibilidad de Barra de Desplazamiento Personalizada', () => {
  const cssPath = path.resolve(__dirname, '../../src/presentation/styles/index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  it('debe definir tokens de color y tamaño para el riel (track) y tirador (thumb)', () => {
    expect(cssContent).toContain('--scrollbar-width:');
    expect(cssContent).toContain('--scrollbar-track:');
    expect(cssContent).toContain('--scrollbar-thumb:');
    expect(cssContent).toContain('--scrollbar-thumb-hover:');
    expect(cssContent).toContain('--scrollbar-thumb-active:');
  });

  it('debe configurar un ancho fino entre 6px y 8px', () => {
    const match = cssContent.match(/--scrollbar-width:\s*(\d+)px/);
    expect(match).not.toBeNull();
    const width = Number(match![1]);
    expect(width).toBeGreaterThanOrEqual(6);
    expect(width).toBeLessThanOrEqual(8);
  });

  it('debe aplicar estilos universales con scrollbar-width y pseudoelementos webkit con bordes redondeados', () => {
    expect(cssContent).toContain('scrollbar-width: thin');
    expect(cssContent).toContain('scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track)');
    expect(cssContent).toContain('::-webkit-scrollbar');
    expect(cssContent).toContain('::-webkit-scrollbar-track');
    expect(cssContent).toContain('::-webkit-scrollbar-thumb');
    expect(cssContent).toContain('border-radius: var(--radius-full)');
  });

  it('debe contar con transiciones suaves de hover y active en el tirador', () => {
    expect(cssContent).toContain('::-webkit-scrollbar-thumb:hover');
    expect(cssContent).toContain('::-webkit-scrollbar-thumb:active');
    expect(cssContent).toContain('transition: background-color');
  });
});
