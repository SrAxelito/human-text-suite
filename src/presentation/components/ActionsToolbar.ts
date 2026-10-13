import { ModoHumanizacion } from '../../core/domain';
import { AppStore, EstadoApp } from '../state/AppStore';

export class ActionsToolbar {
  public static render(estado: EstadoApp): string {
    const { modo, estaCargando, cargandoMensaje } = estado;

    return `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="mode-selector-wrapper">
          <span class="mode-selector-label">Nivel de intervención del humanizador:</span>
          <div class="mode-grid">
            <div class="mode-card ${modo === ModoHumanizacion.LIGERO ? 'active' : ''}" data-mode="${ModoHumanizacion.LIGERO}">
              <span class="mode-title">🌱 Ligero</span>
              <span class="mode-desc">Sinonimia sutil, ajuste de puntuación y suavizado de conectores.</span>
            </div>
            <div class="mode-card ${modo === ModoHumanizacion.EQUILIBRADO ? 'active' : ''}" data-mode="${ModoHumanizacion.EQUILIBRADO}">
              <span class="mode-title">⚖️ Equilibrado</span>
              <span class="mode-desc">Reordenamiento sintáctico y alternancia de longitud de frases.</span>
            </div>
            <div class="mode-card ${modo === ModoHumanizacion.PROFUNDO ? 'active' : ''}" data-mode="${ModoHumanizacion.PROFUNDO}">
              <span class="mode-title">🔥 Profundo</span>
              <span class="mode-desc">Paráfrasis exhaustiva y reestructuración radical del ritmo.</span>
            </div>
          </div>
        </div>

        <div class="actions-toolbar">
          <button class="btn btn-primary" id="btn-analizar" ${estaCargando ? 'disabled' : ''}>
            ${estaCargando ? '<span class="spinner"></span>' : '🔍'}
            <span>Analizar Texto</span>
          </button>

          <button class="btn btn-magic" id="btn-humanizar" ${estaCargando ? 'disabled' : ''}>
            ${estaCargando ? '<span class="spinner"></span>' : '✨'}
            <span>Humanizar Contenido</span>
          </button>

          <button class="btn btn-secondary" id="btn-copiar">
            📋 Copiar Resultado
          </button>

          <button class="btn btn-secondary" id="btn-exportar">
            📤 Exportar Reporte
          </button>

          <button class="btn btn-danger" id="btn-limpiar" style="margin-left: auto;">
            🗑️ Limpiar
          </button>
        </div>

        ${estaCargando ? `<div style="font-size: 0.8rem; color: #a5b4fc; display: flex; align-items: center; gap: 0.5rem;"><span class="spinner"></span> ${cargandoMensaje}</div>` : ''}
      </div>
    `;
  }

  public static bindEvents(container: HTMLElement, store: AppStore, onOpenExport: () => void): void {
    // Modo de selección
    container.querySelectorAll<HTMLElement>('.mode-card').forEach((card) => {
      card.addEventListener('click', () => {
        const modo = card.getAttribute('data-mode') as ModoHumanizacion;
        if (modo) {
          store.setModo(modo);
        }
      });
    });

    // Botones de acción
    const btnAnalizar = container.querySelector<HTMLButtonElement>('#btn-analizar');
    btnAnalizar?.addEventListener('click', () => store.ejecutarAnalisis());

    const btnHumanizar = container.querySelector<HTMLButtonElement>('#btn-humanizar');
    btnHumanizar?.addEventListener('click', () => store.ejecutarHumanizacion());

    const btnCopiar = container.querySelector<HTMLButtonElement>('#btn-copiar');
    btnCopiar?.addEventListener('click', async () => {
      const estado = store.obtenerEstado();
      const textoACopiar = estado.humanizacion
        ? estado.humanizacion.textoHumanizado
        : estado.texto;

      if (!textoACopiar) {
        store.mostrarToast('No hay texto para copiar.', 'error');
        return;
      }

      try {
        await navigator.clipboard.writeText(textoACopiar);
        store.mostrarToast('¡Texto copiado al portapapeles!', 'exito');
      } catch {
        store.mostrarToast('No se pudo acceder al portapapeles.', 'error');
      }
    });

    const btnExportar = container.querySelector<HTMLButtonElement>('#btn-exportar');
    btnExportar?.addEventListener('click', onOpenExport);

    const btnLimpiar = container.querySelector<HTMLButtonElement>('#btn-limpiar');
    btnLimpiar?.addEventListener('click', () => store.limpiar());
  }
}
