import { OracionAnalizada, ClasificacionIA } from '../../core/domain';

export class SentenceHighlighter {
  public static render(oraciones: OracionAnalizada[]): string {
    if (!oraciones || oraciones.length === 0) {
      return `<p style="color: var(--text-muted); font-style: italic;">No hay oraciones analizadas aún. Haz clic en "Analizar".</p>`;
    }

    const htmlOraciones = oraciones.map((o) => {
      let claseClasif = 'sentence-human';
      let icono = '🟢';
      if (o.clasificacion === ClasificacionIA.ALTAMENTE_PROBABLE_IA) {
        claseClasif = 'sentence-ai';
        icono = '🔴';
      } else if (o.clasificacion === ClasificacionIA.MIXTO_DUDOSO) {
        claseClasif = 'sentence-mixed';
        icono = '🟡';
      }

      const marcasHtml = o.marcasDetectadas.length > 0
        ? `<div style="margin-top: 4px; color: #f87171;"><strong>Huellas:</strong> ${o.marcasDetectadas.join(', ')}</div>`
        : '';

      return `
        <span class="highlight-sentence ${claseClasif}" data-sentence-idx="${o.indice}">
          ${this.escaparHtml(o.texto)}
          <span class="sentence-tooltip">
            <strong>${icono} ${o.probabilidadIA}% Probabilidad IA</strong><br/>
            <span>Palabras: ${o.conteoPalabras} | Perplejidad: ${o.perplejidadLocal}/100</span><br/>
            <span style="color: var(--text-secondary);">${this.escaparHtml(o.diagnostico)}</span>
            ${marcasHtml}
          </span>
        </span>
      `;
    });

    return `
      <div class="highlight-panel">
        ${htmlOraciones.join(' ')}
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
