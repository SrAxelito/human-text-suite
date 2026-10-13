/**
 * Modos de tema visual soportados por la aplicación.
 */
export type ModoTema = 'oscuro' | 'claro';

/**
 * Servicio singleton encargado de gestionar el tema visual de la aplicación,
 * su persistencia en almacenamiento local y la sincronización con el DOM.
 */
export class TemaService {
  private static instancia: TemaService;
  public static readonly CLAVE_STORAGE = 'human-text-suite-theme';
  private temaActual: ModoTema = 'oscuro';
  private listeners: Set<(tema: ModoTema) => void> = new Set();

  private constructor() {
    this.temaActual = this.recuperarTemaInicial();
  }

  public static obtenerInstancia(): TemaService {
    if (!TemaService.instancia) {
      TemaService.instancia = new TemaService();
    }
    return TemaService.instancia;
  }

  /**
   * Retorna el tema activo actual ('oscuro' | 'claro').
   */
  public obtenerTemaActual(): ModoTema {
    return this.temaActual;
  }

  /**
   * Establece un nuevo tema, lo persiste en localStorage y actualiza el DOM.
   */
  public establecerTema(tema: ModoTema): void {
    this.temaActual = tema;
    this.guardarEnStorage(tema);
    this.aplicarEnDOM(tema);
    this.notificar();
  }

  /**
   * Alterna entre modo claro y modo oscuro.
   */
  public alternarTema(): ModoTema {
    const nuevoTema: ModoTema = this.temaActual === 'oscuro' ? 'claro' : 'oscuro';
    this.establecerTema(nuevoTema);
    return nuevoTema;
  }

  /**
   * Suscribe un callback a los cambios de tema.
   */
  public suscribir(listener: (tema: ModoTema) => void): () => void {
    this.listeners.add(listener);
    listener(this.temaActual);
    return () => this.listeners.delete(listener);
  }

  /**
   * Aplica el tema almacenado al cargar la aplicación.
   */
  public inicializar(): void {
    this.aplicarEnDOM(this.temaActual);
  }

  private recuperarTemaInicial(): ModoTema {
    try {
      if (typeof localStorage !== 'undefined') {
        const guardado = localStorage.getItem(TemaService.CLAVE_STORAGE) as ModoTema | null;
        if (guardado === 'claro' || guardado === 'oscuro') {
          return guardado;
        }
      }
      if (typeof window !== 'undefined' && window.matchMedia) {
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
          return 'claro';
        }
      }
    } catch {
      // Ignorar errores en entornos de pruebas sin window/storage
    }
    return 'oscuro';
  }

  private guardarEnStorage(tema: ModoTema): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(TemaService.CLAVE_STORAGE, tema);
      }
    } catch {
      // Ignorar errores de storage
    }
  }

  private aplicarEnDOM(tema: ModoTema): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.setAttribute('data-theme', tema);

    if (document.body) {
      document.body.classList.remove('theme-claro', 'theme-oscuro');
      document.body.classList.add(`theme-${tema}`);
    }
  }

  private notificar(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.temaActual);
      } catch (err) {
        console.warn('Error en listener de tema:', err);
      }
    }
  }
}
