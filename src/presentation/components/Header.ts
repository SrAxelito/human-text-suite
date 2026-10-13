import { TemaService, ModoTema } from '../../core/services/TemaService';

export class Header {
  public static render(temaActual: ModoTema = 'oscuro'): string {
    const esClaro = temaActual === 'claro';

    return `
      <header class="app-header">
        <div class="brand-wrapper">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div>
            <h1 class="brand-title">HumanTextSuite</h1>
            <p class="brand-subtitle">Detector probabilístico de IA & Motor de Humanización v1.2.0</p>
          </div>
        </div>

        <div class="header-status">
          <div class="badge-engine">
            <span class="badge-pulse"></span>
            Motor Heurístico & N-Gramas Activo
          </div>

          <!-- Botón de configuración y menú selector de tema en la esquina superior derecha -->
          <div class="settings-menu-container" id="settings-menu-container">
            <button
              class="btn-icon-settings"
              id="btn-settings-toggle"
              type="button"
              title="Configuración de interfaz y temas"
              aria-label="Abrir configuración y selector de tema"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>

            <div class="settings-dropdown" id="settings-dropdown" style="display: none;">
              <div class="settings-dropdown-header">
                <span class="settings-dropdown-title">Configuración</span>
              </div>

              <div class="theme-option-row">
                <div class="theme-option-info">
                  <span class="theme-option-title">Tema Visual</span>
                  <span class="theme-option-desc" id="theme-current-desc">
                    ${esClaro ? 'Modo Claro' : 'Modo Oscuro'}
                  </span>
                </div>

                <button
                  class="theme-switch-btn ${esClaro ? 'theme-switch-active' : ''}"
                  id="btn-theme-toggle"
                  type="button"
                  role="switch"
                  aria-checked="${esClaro}"
                  title="Alternar entre modo claro y modo oscuro"
                >
                  <span class="theme-switch-icon" aria-hidden="true">🌙</span>
                  <span class="theme-switch-handle"></span>
                  <span class="theme-switch-icon" aria-hidden="true">☀️</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    `;
  }

  public static bindEvents(container: HTMLElement, temaService?: TemaService): void {
    const service = temaService || TemaService.obtenerInstancia();
    const btnToggleSettings = container.querySelector<HTMLButtonElement>('#btn-settings-toggle');
    const dropdown = container.querySelector<HTMLElement>('#settings-dropdown');
    const btnToggleTheme = container.querySelector<HTMLButtonElement>('#btn-theme-toggle');
    const themeDesc = container.querySelector<HTMLElement>('#theme-current-desc');

    if (!btnToggleSettings || !dropdown) return;

    // Abrir/cerrar menú desplegable al hacer clic en el engranaje
    btnToggleSettings.addEventListener('click', (e) => {
      e.stopPropagation();
      const estaAbierto = dropdown.style.display !== 'none';
      dropdown.style.display = estaAbierto ? 'none' : 'flex';
      btnToggleSettings.setAttribute('aria-expanded', String(!estaAbierto));
    });

    // Cerrar menú al hacer clic fuera
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (e) => {
        const target = e.target as Node;
        if (!dropdown.contains(target) && !btnToggleSettings.contains(target)) {
          dropdown.style.display = 'none';
          btnToggleSettings.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Alternar tema al hacer clic en el interruptor
    btnToggleTheme?.addEventListener('click', (e) => {
      e.stopPropagation();
      const nuevoTema = service.alternarTema();
      const esClaro = nuevoTema === 'claro';

      btnToggleTheme.classList.toggle('theme-switch-active', esClaro);
      btnToggleTheme.setAttribute('aria-checked', String(esClaro));

      if (themeDesc) {
        themeDesc.textContent = esClaro ? 'Modo Claro' : 'Modo Oscuro';
      }
    });
  }
}
