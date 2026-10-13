import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TemaService, ModoTema } from '../../src/core/services/TemaService';
import { Header } from '../../src/presentation/components/Header';

describe('TemaService - Gestión y Persistencia de Modo Claro / Oscuro', () => {
  let fakeStorage: Record<string, string> = {};

  beforeEach(() => {
    fakeStorage = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => fakeStorage[key] || null,
      setItem: (key: string, val: string) => {
        fakeStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete fakeStorage[key];
      },
      clear: () => {
        fakeStorage = {};
      }
    });
  });

  it('debe iniciar con modo oscuro por defecto o recuperar el valor de localStorage', () => {
    const temaService = TemaService.obtenerInstancia();
    temaService.establecerTema('oscuro');
    expect(temaService.obtenerTemaActual()).toBe('oscuro');

    temaService.establecerTema('claro');
    expect(temaService.obtenerTemaActual()).toBe('claro');
    expect(fakeStorage[TemaService.CLAVE_STORAGE]).toBe('claro');
  });

  it('debe alternar entre claro y oscuro correctamente', () => {
    const temaService = TemaService.obtenerInstancia();
    temaService.establecerTema('oscuro');

    const res1 = temaService.alternarTema();
    expect(res1).toBe('claro');
    expect(temaService.obtenerTemaActual()).toBe('claro');
    expect(fakeStorage[TemaService.CLAVE_STORAGE]).toBe('claro');

    const res2 = temaService.alternarTema();
    expect(res2).toBe('oscuro');
    expect(temaService.obtenerTemaActual()).toBe('oscuro');
    expect(fakeStorage[TemaService.CLAVE_STORAGE]).toBe('oscuro');
  });

  it('debe notificar a los suscriptores cuando el tema cambia', () => {
    const temaService = TemaService.obtenerInstancia();
    const llamadas: ModoTema[] = [];

    const desuscribir = temaService.suscribir((tema) => {
      llamadas.push(tema);
    });

    temaService.establecerTema('claro');
    temaService.establecerTema('oscuro');

    expect(llamadas).toContain('claro');
    expect(llamadas).toContain('oscuro');

    desuscribir();
  });
});

describe('Header - Botón de Configuración y Alternador de Tema', () => {
  it('debe renderizar el botón de engranaje y el interruptor con el estado de tema correspondiente', () => {
    const htmlOscuro = Header.render('oscuro');
    expect(htmlOscuro).toContain('btn-settings-toggle');
    expect(htmlOscuro).toContain('settings-dropdown');
    expect(htmlOscuro).toContain('btn-theme-toggle');
    expect(htmlOscuro).toContain('Modo Oscuro');
    expect(htmlOscuro).not.toContain('theme-switch-active');

    const htmlClaro = Header.render('claro');
    expect(htmlClaro).toContain('Modo Claro');
    expect(htmlClaro).toContain('theme-switch-active');
  });

  it('debe alternar la visibilidad del menú al hacer clic en el engranaje y cambiar de tema al accionar el switch', () => {
    const temaService = TemaService.obtenerInstancia();
    temaService.establecerTema('oscuro');

    const clickListeners: Record<string, Function> = {};
    const fakeDropdown = {
      style: { display: 'none' },
      contains: () => false
    };

    const fakeSettingsBtn = {
      setAttribute: vi.fn(),
      addEventListener: (evt: string, cb: Function) => {
        if (evt === 'click') clickListeners['settings'] = cb;
      },
      contains: () => false
    };

    const fakeThemeBtn = {
      classList: {
        toggle: vi.fn()
      },
      setAttribute: vi.fn(),
      addEventListener: (evt: string, cb: Function) => {
        if (evt === 'click') clickListeners['theme'] = cb;
      }
    };

    const fakeThemeDesc = {
      textContent: 'Modo Oscuro'
    };

    const fakeContainer = {
      querySelector: (sel: string) => {
        if (sel === '#btn-settings-toggle') return fakeSettingsBtn;
        if (sel === '#settings-dropdown') return fakeDropdown;
        if (sel === '#btn-theme-toggle') return fakeThemeBtn;
        if (sel === '#theme-current-desc') return fakeThemeDesc;
        return null;
      }
    } as unknown as HTMLElement;

    Header.bindEvents(fakeContainer, temaService);

    // 1. Simular clic en engranaje para abrir menú
    expect(clickListeners['settings']).toBeDefined();
    clickListeners['settings']({ stopPropagation: () => {} });
    expect(fakeDropdown.style.display).toBe('flex');
    expect(fakeSettingsBtn.setAttribute).toHaveBeenCalledWith('aria-expanded', 'true');

    // 2. Simular clic en switch de tema
    expect(clickListeners['theme']).toBeDefined();
    clickListeners['theme']({ stopPropagation: () => {} });
    expect(temaService.obtenerTemaActual()).toBe('claro');
    expect(fakeThemeBtn.classList.toggle).toHaveBeenCalledWith('theme-switch-active', true);
    expect(fakeThemeDesc.textContent).toBe('Modo Claro');
  });
});
