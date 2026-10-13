import { ResultadoAnalisis } from '../../domain/entities/ResultadoAnalisis';
import { ResultadoHumanizacion } from '../../domain/entities/ResultadoHumanizacion';

export class ReportExporter {
  /**
   * Exporta el resultado de análisis o humanización a JSON formateado.
   */
  public static exportarJSON(datos: ResultadoAnalisis | ResultadoHumanizacion): string {
    return JSON.stringify(datos, null, 2);
  }

  /**
   * Genera un reporte legible en formato Markdown.
   */
  public static exportarMarkdown(
    analisis: ResultadoAnalisis,
    humanizacion?: ResultadoHumanizacion | null
  ): string {
    const fecha = new Date(analisis.timestamp).toLocaleString();
    let md = `# Reporte de Análisis - HumanTextSuite\n\n`;
    md += `**Fecha:** ${fecha}\n`;
    md += `**Diagnóstico Global:** ${analisis.etiquetaClasificacion} (${analisis.probabilidadGlobalIA}%)\n\n`;

    md += `## Métricas Estadísticas\n`;
    md += `- **Perplejidad Normalizada:** ${analisis.metricas.perplejidad}/100\n`;
    md += `- **Cadencia / Burstiness:** ${analisis.metricas.burstiness}/100 (CV: ${analisis.metricas.coeficienteVariacion})\n`;
    md += `- **Diversidad Léxica (TTR):** ${analisis.metricas.diversidadLexica}%\n`;
    md += `- **Densidad de Clichés:** ${analisis.metricas.densidadCliches}%\n`;
    md += `- **Total de Oraciones:** ${analisis.metricas.totalOraciones}\n`;
    md += `- **Total de Palabras:** ${analisis.metricas.totalPalabras}\n\n`;

    md += `## Diagnóstico Detallado\n`;
    md += `${analisis.diagnosticoResumen}\n\n`;

    if (analisis.metricas.clichesDetectados.length > 0) {
      md += `### Huellas Sintéticas Detectadas\n`;
      for (const c of analisis.metricas.clichesDetectados) {
        md += `- **"${c.marcador}"** (${c.categoria})\n`;
      }
      md += `\n`;
    }

    if (humanizacion) {
      md += `## Resultados de la Humanización\n`;
      md += `- **Modo de Intervención:** ${humanizacion.modo}\n`;
      md += `- **Probabilidad IA Previa:** ${humanizacion.analisisPrevio.probabilidadGlobalIA}%\n`;
      md += `- **Probabilidad IA Posterior:** ${humanizacion.analisisPosterior.probabilidadGlobalIA}%\n`;
      md += `- **Reducción Lograda:** -${humanizacion.reduccionProbabilidadIA} puntos porcentuales\n`;
      md += `- **Similitud Semántica Estimada:** ${humanizacion.diferencias.porcentajeSimilitud}%\n\n`;

      md += `### Texto Humanizado\n`;
      md += `> ${humanizacion.textoHumanizado.replace(/\n/g, '\n> ')}\n\n`;

      md += `### Transformaciones Aplicadas\n`;
      for (const t of humanizacion.transformacionesAplicadas) {
        md += `- ${t}\n`;
      }
      md += `\n`;
    }

    return md;
  }
}
