import { EventoProgresoLote } from '../../core/domain/interfaces/ProcesadorLotes';
import { AppStore } from '../state/AppStore';

/**
 * Componente reactivo para visualizar el avance del procesamiento por fragmentos en tiempo real,
 * tiempo estimado y control de cancelación inmediata.
 */
export class ProgressBar {
  public static render(progreso: EventoProgresoLote | null): string {
    if (!progreso || progreso.estado === 'completado') {
      return '';
    }

    const {
      progreso: porcentaje,
      fragmentoActual,
      totalFragmentos,
      tiempoEstimadoSegundos,
      mensaje
    } = progreso;

    const textoTiempo =
      tiempoEstimadoSegundos > 0
        ? `~${tiempoEstimadoSegundos}s restantes`
        : 'Calculando tiempo...';

    return `
      <div
        class="batch-progress-banner"
        id="batch-progress-banner"
        role="progressbar"
        aria-valuenow="${porcentaje}"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div class="batch-progress-header">
          <div class="batch-progress-info">
            <span class="batch-pulse-dot"></span>
            <span class="batch-progress-title">Procesamiento por Lotes Asíncrono</span>
            <span class="batch-badge">Bloque ${fragmentoActual} de ${totalFragmentos}</span>
          </div>

          <div class="batch-progress-actions">
            <span class="batch-eta">${textoTiempo}</span>
            <button
              class="btn-cancelar-lote"
              id="btn-cancelar-lote"
              type="button"
              title="Abortar el análisis en curso"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              <span>Cancelar análisis</span>
            </button>
          </div>
        </div>

        <div class="batch-progress-track">
          <div class="batch-progress-fill" style="width: ${Math.max(2, Math.min(100, porcentaje))}%;">
            <div class="batch-progress-glow"></div>
          </div>
        </div>

        <div class="batch-progress-footer">
          <span class="batch-progress-msg">${mensaje || 'Analizando fragmentos...'}</span>
          <span class="batch-progress-pct">${porcentaje}%</span>
        </div>
      </div>
    `;
  }

  public static bindEvents(container: HTMLElement, store: AppStore): void {
    const btnCancelar = container.querySelector<HTMLButtonElement>('#btn-cancelar-lote');
    btnCancelar?.addEventListener('click', (e) => {
      e.preventDefault();
      store.cancelarAnalisis();
    });
  }
}
