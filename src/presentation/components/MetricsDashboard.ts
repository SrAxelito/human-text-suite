import { ResultadoAnalisis, ClasificacionIA } from '../../core/domain';

export class MetricsDashboard {
  public static render(analisis: ResultadoAnalisis | null): string {
    if (!analisis) {
      return `
        <div class="metrics-panel">
          <div class="gauge-hero">
            <svg class="gauge-svg" viewBox="0 0 100 100">
              <circle class="gauge-bg" cx="50" cy="50" r="40" />
            </svg>
            <div class="gauge-center-text">
              <span class="gauge-score gauge-score-empty">--</span>
              <span class="gauge-label">Sin Analizar</span>
            </div>
            <div class="category-banner category-waiting">
              Esperando texto
            </div>
          </div>

          <div class="diagnostic-card">
            <div class="diagnostic-title">
              💡 Instrucciones
            </div>
            <div class="diagnostic-body">
              Pega un texto en el editor y haz clic en <strong>"Analizar"</strong> para calcular la perplejidad, burstiness y huellas sintéticas.
            </div>
          </div>
        </div>
      `;
    }

    const { probabilidadGlobalIA, clasificacionGlobal, etiquetaClasificacion, metricas, diagnosticoResumen } = analisis;

    // Colores y propiedades del Gauge
    let colorTrazo = 'var(--color-human)';
    let claseBanner = 'category-human';
    let iconoBanner = '🟢';

    if (clasificacionGlobal === ClasificacionIA.ALTAMENTE_PROBABLE_IA) {
      colorTrazo = 'var(--color-ai)';
      claseBanner = 'category-ai';
      iconoBanner = '🔴';
    } else if (clasificacionGlobal === ClasificacionIA.MIXTO_DUDOSO) {
      colorTrazo = 'var(--color-mixed)';
      claseBanner = 'category-mixed';
      iconoBanner = '🟡';
    }

    // Perímetro del círculo r=40 es 2 * pi * 40 ≈ 251.32
    const perimetro = 251.32;
    const offset = perimetro - (probabilidadGlobalIA / 100) * perimetro;

    return `
      <div class="metrics-panel">
        <div class="gauge-hero">
          <svg class="gauge-svg" viewBox="0 0 100 100">
            <circle class="gauge-bg" cx="50" cy="50" r="40" />
            <circle
              class="gauge-fill"
              cx="50"
              cy="50"
              r="40"
              stroke="${colorTrazo}"
              stroke-dasharray="${perimetro}"
              stroke-dashoffset="${offset}"
            />
          </svg>
          <div class="gauge-center-text">
            <span class="gauge-score" style="color: ${colorTrazo};">${probabilidadGlobalIA}%</span>
            <span class="gauge-label">Probabilidad IA</span>
          </div>

          <div class="category-banner ${claseBanner}">
            <span>${iconoBanner}</span>
            <span>${etiquetaClasificacion}</span>
          </div>
        </div>

        <div class="metric-cards-grid">
          <div class="metric-card">
            <div class="metric-card-header">
              <span class="metric-name">Perplejidad</span>
              <span class="metric-value">${metricas.perplejidad}/100</span>
            </div>
            <div class="metric-bar-bg">
              <div class="metric-bar-fill" style="width: ${metricas.perplejidad}%; background: #6366f1;"></div>
            </div>
            <span class="metric-note">Predictibilidad de tokens (PPL: ${metricas.perplejidadCruda})</span>
          </div>

          <div class="metric-card">
            <div class="metric-card-header">
              <span class="metric-name">Burstiness</span>
              <span class="metric-value">${metricas.burstiness}/100</span>
            </div>
            <div class="metric-bar-bg">
              <div class="metric-bar-fill" style="width: ${metricas.burstiness}%; background: #10b981;"></div>
            </div>
            <span class="metric-note">Variabilidad de cadencia (CV: ${metricas.coeficienteVariacion})</span>
          </div>

          <div class="metric-card">
            <div class="metric-card-header">
              <span class="metric-name">Huellas LLM</span>
              <span class="metric-value">${metricas.clichesDetectados.length}</span>
            </div>
            <div class="metric-bar-bg">
              <div class="metric-bar-fill" style="width: ${Math.min(100, metricas.densidadCliches)}%; background: #f43f5e;"></div>
            </div>
            <span class="metric-note">Densidad de clichés: ${metricas.densidadCliches}%</span>
          </div>

          <div class="metric-card">
            <div class="metric-card-header">
              <span class="metric-name">Diversidad Léxica</span>
              <span class="metric-value">${metricas.diversidadLexica}%</span>
            </div>
            <div class="metric-bar-bg">
              <div class="metric-bar-fill" style="width: ${metricas.diversidadLexica}%; background: #38bdf8;"></div>
            </div>
            <span class="metric-note">Type-Token Ratio (TTR)</span>
          </div>
        </div>

        <div class="diagnostic-card">
          <div class="diagnostic-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            Diagnóstico Explicativo
          </div>
          <div class="diagnostic-body">
            ${diagnosticoResumen}
          </div>
        </div>
      </div>
    `;
  }
}
