import { ResultadoHumanizacion } from '../../core/domain';

export class DiffViewer {
  public static render(humanizacion: ResultadoHumanizacion | null): string {
    if (!humanizacion) {
      return `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <p>No se ha ejecutado ninguna humanización todavía.</p>
          <p style="font-size: 0.85rem; margin-top: 0.5rem;">Haz clic en <strong>"Humanizar Contenido"</strong> para generar la comparación diferencial.</p>
        </div>
      `;
    }

    const { analisisPrevio, analisisPosterior, reduccionProbabilidadIA, diferencias, transformacionesAplicadas } = humanizacion;

    // Renderizado del contenido enriquecido con diff
    const htmlDiff = diferencias.fragmentos.map((f) => {
      if (f.tipo === 'agregado') {
        return `<span class="diff-added">${this.escaparHtml(f.valor)}</span>`;
      }
      if (f.tipo === 'eliminado') {
        return `<span class="diff-removed">${this.escaparHtml(f.valor)}</span>`;
      }
      return `<span>${this.escaparHtml(f.valor)}</span>`;
    }).join('');

    const htmlTransformaciones = transformacionesAplicadas.map((t) => `
      <li style="margin-bottom: 4px; font-size: 0.8rem; color: var(--text-secondary);">${this.escaparHtml(t)}</li>
    `).join('');

    return `
      <div class="diff-container">
        <div class="diff-hero-banner">
          <div class="diff-hero-stats">
            <div class="diff-stat-item">
              <span class="diff-stat-label">Antes (IA)</span>
              <span class="diff-stat-val" style="color: var(--color-ai);">${analisisPrevio.probabilidadGlobalIA}%</span>
            </div>
            <div style="font-size: 1.5rem; color: var(--text-muted);">➔</div>
            <div class="diff-stat-item">
              <span class="diff-stat-label">Después (Humanizado)</span>
              <span class="diff-stat-val" style="color: var(--color-human);">${analisisPosterior.probabilidadGlobalIA}%</span>
            </div>
          </div>

          <div class="diff-stat-item" style="text-align: right;">
            <span class="diff-stat-label">Reducción de IA</span>
            <span class="diff-stat-val" style="color: #34d399;">-${reduccionProbabilidadIA}%</span>
          </div>
        </div>

        <div class="diff-panels-grid">
          <div class="diff-box">
            <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.75rem; color: #f87171;">
              Original (Con huellas sintéticas)
            </div>
            <div style="color: var(--text-secondary);">
              ${this.escaparHtml(humanizacion.textoOriginal)}
            </div>
          </div>

          <div class="diff-box">
            <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.75rem; color: #34d399;">
              Humanizado (Cadencia orgánica)
            </div>
            <div style="color: var(--text-primary);">
              ${this.escaparHtml(humanizacion.textoHumanizado)}
            </div>
          </div>
        </div>

        <div style="margin-top: 1rem;">
          <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.5rem; color: var(--text-secondary);">
            Visor Diferencial Consolidado (Diff View)
          </div>
          <div class="diff-content-wrapper">
            ${htmlDiff}
          </div>
        </div>

        <div class="diff-transformations-card">
          <div class="diff-transformations-title">
            Transformaciones Sintácticas Aplicadas (${transformacionesAplicadas.length})
          </div>
          <ul style="padding-left: 1.25rem;">
            ${htmlTransformaciones}
          </ul>
        </div>
      </div>
    `;
  }

  private static escaparHtml(texto: string): string {
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
