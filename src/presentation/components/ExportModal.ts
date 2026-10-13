import { ResultadoAnalisis, ResultadoHumanizacion } from '../../core/domain';
import { ReportExporter } from '../../core/infrastructure/export/ReportExporter';

export class ExportModal {
  public static render(
    analisis: ResultadoAnalisis | null,
    humanizacion: ResultadoHumanizacion | null,
    formato: 'json' | 'markdown' = 'json'
  ): string {
    if (!analisis) {
      return `
        <div class="modal-overlay" id="export-modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Exportar Reporte</h3>
              <button class="btn btn-secondary" id="btn-cerrar-modal">✕</button>
            </div>
            <div class="modal-body" style="font-family: var(--font-sans); text-align: center; padding: 2rem;">
              No hay datos para exportar. Analiza un texto primero.
            </div>
          </div>
        </div>
      `;
    }

    const contenido = formato === 'json'
      ? ReportExporter.exportarJSON(humanizacion || analisis)
      : ReportExporter.exportarMarkdown(analisis, humanizacion);

    return `
      <div class="modal-overlay" id="export-modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <h3 style="font-family: var(--font-display); font-size: 1.15rem;">Exportar Reporte</h3>
              <div class="tab-nav">
                <button class="tab-btn ${formato === 'json' ? 'active' : ''}" id="btn-export-json">JSON</button>
                <button class="tab-btn ${formato === 'markdown' ? 'active' : ''}" id="btn-export-md">Markdown</button>
              </div>
            </div>
            <button class="btn btn-secondary" id="btn-cerrar-modal" style="padding: 0.3rem 0.6rem;">✕</button>
          </div>

          <div class="modal-body" id="modal-report-text">${this.escaparHtml(contenido)}</div>

          <div class="modal-footer">
            <button class="btn btn-secondary" id="btn-copiar-reporte">
              📋 Copiar
            </button>
            <button class="btn btn-primary" id="btn-descargar-reporte">
              💾 Descargar Archivo
            </button>
          </div>
        </div>
      </div>
    `;
  }

  public static bindEvents(
    container: HTMLElement,
    onClose: () => void,
    onChangeFormat: (fmt: 'json' | 'markdown') => void,
    contenido: string,
    formato: 'json' | 'markdown'
  ): void {
    const overlay = container.querySelector('#export-modal-overlay');
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) onClose();
    });

    container.querySelector('#btn-cerrar-modal')?.addEventListener('click', onClose);

    container.querySelector('#btn-export-json')?.addEventListener('click', () => onChangeFormat('json'));
    container.querySelector('#btn-export-md')?.addEventListener('click', () => onChangeFormat('markdown'));

    container.querySelector('#btn-copiar-reporte')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(contenido);
        alert('Reporte copiado al portapapeles.');
      } catch {
        alert('No se pudo copiar el reporte.');
      }
    });

    container.querySelector('#btn-descargar-reporte')?.addEventListener('click', () => {
      const blob = new Blob([contenido], { type: formato === 'json' ? 'application/json' : 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `human-text-report-${Date.now()}.${formato === 'json' ? 'json' : 'md'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  private static escaparHtml(texto: string): string {
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
