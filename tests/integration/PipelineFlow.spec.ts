import { describe, it, expect } from 'vitest';
import { DetectorService } from '../../src/core/services/DetectorService';
import { HumanizadorService } from '../../src/core/services/HumanizadorService';
import { ModoHumanizacion } from '../../src/core/domain/enums/ModoHumanizacion';
import { ClasificacionIA } from '../../src/core/domain/enums/ClasificacionIA';
import { ReportExporter } from '../../src/core/infrastructure/export/ReportExporter';

describe('Flujo de Integración Completo (Detección -> Humanización -> Diff -> Reanálisis)', () => {
  const detector = new DetectorService();
  const humanizador = new HumanizadorService(detector);

  const MUESTRA_ENSAYO_SINTETICO = `
En resumen, la transformación digital desempeña un rol fundamental en las instituciones académicas modernas.
Es fundamental destacar que este paradigma permite estructurar metodologías pedagógicas adaptativas de alta calidad.
Por consiguiente, los docentes e investigadores deben adoptar herramientas analíticas para enriquecer la experiencia formativa.
En última instancia, el impacto de los entornos virtuales resulta indiscutiblemente positivo para democratizar el conocimiento.
No solo optimiza los tiempos de aprendizaje, sino también potencia la retención conceptual de los estudiantes universitarios.
  `.trim();

  it('debe ejecutar el ciclo de vida completo reduciendo el puntaje de IA y generando diff coherente', async () => {
    // 1. Detección inicial
    const analisisInicial = await detector.analizar(MUESTRA_ENSAYO_SINTETICO);
    expect(analisisInicial.probabilidadGlobalIA).toBeGreaterThanOrEqual(70);
    expect(analisisInicial.clasificacionGlobal).toBe(ClasificacionIA.ALTAMENTE_PROBABLE_IA);

    // 2. Humanización con reanálisis automático integrado
    const resultadoHumanizado = await humanizador.humanizar(
      MUESTRA_ENSAYO_SINTETICO,
      ModoHumanizacion.PROFUNDO
    );

    // 3. Validación de reducción y preservación de tipos
    expect(resultadoHumanizado.analisisPrevio.probabilidadGlobalIA).toBe(analisisInicial.probabilidadGlobalIA);
    expect(resultadoHumanizado.analisisPosterior.probabilidadGlobalIA).toBeLessThan(analisisInicial.probabilidadGlobalIA);
    expect(resultadoHumanizado.reduccionProbabilidadIA).toBeGreaterThanOrEqual(15);

    // 4. Validación del Diff View
    expect(resultadoHumanizado.diferencias.palabrasAgregadas).toBeGreaterThan(0);
    expect(resultadoHumanizado.diferencias.palabrasEliminadas).toBeGreaterThan(0);
    expect(resultadoHumanizado.diferencias.palabrasSinCambio).toBeGreaterThan(0);
    expect(resultadoHumanizado.diferencias.porcentajeSimilitud).toBeGreaterThan(30);

    // 5. Validación de exportación a JSON y Markdown
    const reporteJSON = ReportExporter.exportarJSON(resultadoHumanizado);
    expect(reporteJSON).toContain('textoHumanizado');
    expect(reporteJSON).toContain('reduccionProbabilidadIA');

    const reporteMD = ReportExporter.exportarMarkdown(analisisInicial, resultadoHumanizado);
    expect(reporteMD).toContain('# Reporte de Análisis - HumanTextSuite');
    expect(reporteMD).toContain('## Resultados de la Humanización');
  });
});
