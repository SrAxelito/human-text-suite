import { ResultadoAnalisis, OracionAnalizada, ClasificacionIA } from '../../core/domain';

export class VisorTexto {
  public static render(
    analisis: ResultadoAnalisis | null,
    oracionSeleccionada: OracionAnalizada | null = null
  ): string {
    if (!analisis || analisis.oraciones.length === 0) {
      return `
        <div class="visor-vacio">
          <p>No hay oraciones analizadas aún.</p>
          <span style="font-size: 0.825rem; color: var(--text-muted); margin-top: 4px;">
            Escribe en el editor o sube un documento Word para visualizar el mapa de sospecha.
          </span>
        </div>
      `;
    }

    // Renderizado estructurado por párrafos para mantener la coherencia tipográfica
    const parrafosHtml = analisis.parrafos.map((parrafo) => {
      // Determinar la clasificación predominante en el párrafo para el Gutter Margin Marker
      const maxProb = parrafo.oraciones.length > 0
        ? Math.max(...parrafo.oraciones.map((o) => o.probabilidadIA))
        : parrafo.probabilidadIA;

      let claseGutter = 'gutter-human';
      let iconoGutter = '●';
      if (maxProb >= 70) {
        claseGutter = 'gutter-ai';
        iconoGutter = '▲';
      } else if (maxProb >= 35) {
        claseGutter = 'gutter-mixed';
        iconoGutter = '◆';
      }

      // Render de las oraciones dentro del párrafo con subrayados sutiles y baja opacidad
      const oracionesHtml = parrafo.oraciones.map((o) => {
        let claseSubrayado = 'sentence-subtle-human';
        if (o.clasificacion === ClasificacionIA.ALTAMENTE_PROBABLE_IA) {
          claseSubrayado = 'sentence-subtle-ai';
        } else if (o.clasificacion === ClasificacionIA.MIXTO_DUDOSO) {
          claseSubrayado = 'sentence-subtle-mixed';
        }

        const estaActiva = oracionSeleccionada?.indice === o.indice ? 'sentence-activa' : '';

        return `
          <span
            class="sentence-clean ${claseSubrayado} ${estaActiva}"
            data-sentence-id="${o.indice}"
            tabindex="0"
            role="button"
            aria-label="Oración ${o.indice + 1}: ${o.probabilidadIA}% probabilidad IA"
          >${this.escaparHtml(o.texto)}</span>
        `;
      }).join(' ');

      return `
        <div class="parrafo-bloque" data-parrafo-idx="${parrafo.indice}">
          <!-- Gutter / Indicador lateral en el margen -->
          <div class="gutter-columna">
            <div
              class="gutter-marker ${claseGutter}"
              title="Párrafo ${parrafo.indice + 1}: Máx. ${maxProb}% IA"
            >
              <span class="gutter-pin">${iconoGutter}</span>
            </div>
          </div>

          <!-- Cuerpo de texto legible y sin saturación -->
          <div class="parrafo-texto">
            ${oracionesHtml}
          </div>
        </div>
      `;
    });

    // Tarjeta de inspección contextual (si hay oración activa)
    const oracionActiva = oracionSeleccionada || analisis.oraciones[0];
    const tarjetaInspeccion = this.renderTarjetaInspeccion(oracionActiva);

    return `
      <div class="visor-contenedor-redisenado">
        <!-- Columna de Lectura Limpia -->
        <div class="visor-flujo-lectura">
          ${parrafosHtml.join('')}
        </div>

        <!-- Panel Lateral / Tarjeta de Inspección Contextual fija y no intrusiva -->
        <aside class="panel-inspeccion-lateral" id="panel-inspeccion-lateral">
          ${tarjetaInspeccion}
        </aside>
      </div>
    `;
  }

  public static renderTarjetaInspeccion(oracion: OracionAnalizada | null): string {
    if (!oracion) {
      return `
        <div class="tarjeta-inspeccion-vacia">
          <p>Selecciona una oración del texto para examinar sus métricas detalladas.</p>
        </div>
      `;
    }

    let badgeClase = 'badge-human';
    let categoriaTexto = 'Probablemente humano';
    if (oracion.clasificacion === ClasificacionIA.ALTAMENTE_PROBABLE_IA) {
      badgeClase = 'badge-ai';
      categoriaTexto = 'Altamente probable de IA';
    } else if (oracion.clasificacion === ClasificacionIA.MIXTO_DUDOSO) {
      badgeClase = 'badge-mixed';
      categoriaTexto = 'Mixto / Dudoso';
    }

    const marcasHtml = oracion.marcasDetectadas.length > 0
      ? `
        <div class="tarjeta-marcas-seccion">
          <span class="tarjeta-subtitulo">Huellas Detectadas (${oracion.marcasDetectadas.length})</span>
          <div class="tarjeta-tags-contenedor">
            ${oracion.marcasDetectadas.map((m) => `<span class="tag-cliche">${this.escaparHtml(m)}</span>`).join('')}
          </div>
        </div>
      `
      : '';

    return `
      <div class="tarjeta-inspeccion-activa">
        <div class="tarjeta-header">
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <span class="tarjeta-oracion-idx">Oración #${oracion.indice + 1}</span>
            <span class="tarjeta-score-badge ${badgeClase}">
              ${oracion.probabilidadIA}% IA
            </span>
          </div>
          <span class="tarjeta-categoria-label">${categoriaTexto}</span>
        </div>

        <div class="tarjeta-quote">
          "${this.escaparHtml(oracion.texto)}"
        </div>

        <div class="tarjeta-metricas-mini">
          <div class="mini-stat">
            <span class="mini-stat-label">Longitud</span>
            <span class="mini-stat-val">${oracion.conteoPalabras} palabras</span>
          </div>
          <div class="mini-stat">
            <span class="mini-stat-label">Perplejidad Local</span>
            <span class="mini-stat-val">${oracion.perplejidadLocal}/100</span>
          </div>
        </div>

        <div class="tarjeta-diagnostico-box">
          <span class="tarjeta-subtitulo">Diagnóstico</span>
          <p class="tarjeta-diagnostico-texto">${this.escaparHtml(oracion.diagnostico)}</p>
        </div>

        ${marcasHtml}
      </div>
    `;
  }

  public static bindEvents(
    container: HTMLElement,
    analisis: ResultadoAnalisis | null,
    onSelectOracion: (oracion: OracionAnalizada) => void
  ): void {
    if (!analisis) return;

    const sentenceSpans = container.querySelectorAll<HTMLElement>('.sentence-clean');
    sentenceSpans.forEach((span) => {
      const idx = Number(span.getAttribute('data-sentence-id'));
      const oracion = analisis.oraciones[idx];
      if (!oracion) return;

      // Navegación y selección exclusiva por clic (sin auto-scroll en hover)
      span.addEventListener('click', (event) => {
        event.stopPropagation();
        sentenceSpans.forEach((s) => s.classList.remove('sentence-activa'));
        span.classList.add('sentence-activa');
        onSelectOracion(oracion);

        if (typeof span.scrollIntoView === 'function') {
          span.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });

    const gutterMarkers = container.querySelectorAll<HTMLElement>('.gutter-marker');
    gutterMarkers.forEach((marker) => {
      marker.addEventListener('click', (event) => {
        event.stopPropagation();
        const bloque = marker.closest('.parrafo-bloque');
        const firstSentence = bloque?.querySelector<HTMLElement>('.sentence-clean');
        if (firstSentence) {
          const idx = Number(firstSentence.getAttribute('data-sentence-id'));
          const oracion = analisis.oraciones[idx];
          sentenceSpans.forEach((s) => s.classList.remove('sentence-activa'));
          firstSentence.classList.add('sentence-activa');

          if (oracion) {
            onSelectOracion(oracion);
          }

          // Desplazamiento suave hacia la primera oración del párrafo correspondiente
          if (typeof firstSentence.scrollIntoView === 'function') {
            firstSentence.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });
    });
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
