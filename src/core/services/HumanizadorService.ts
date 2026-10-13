import {
  HumanizadorTexto,
  ModoHumanizacion,
  OpcionesHumanizacion,
  ResultadoHumanizacion,
  ErrorTextoVacio,
  ErrorTextoExcedeLimite
} from '../domain';
import { DetectorService } from './DetectorService';
import { VocabularyReplacer } from '../infrastructure/rewriting/VocabularyReplacer';
import { SentenceRestructurer } from '../infrastructure/rewriting/SentenceRestructurer';
import { CadenceVariator } from '../infrastructure/rewriting/CadenceVariator';
import { DiffEngine } from '../infrastructure/diff/DiffEngine';
import { ConfigService } from '../infrastructure/config/ConfigService';

export class HumanizadorService implements HumanizadorTexto {
  private detectorService: DetectorService;
  private config: ConfigService;

  constructor(detectorService?: DetectorService, config?: ConfigService) {
    this.detectorService = detectorService || new DetectorService();
    this.config = config || ConfigService.obtenerInstancia();
  }

  public async humanizar(
    texto: string,
    modo: ModoHumanizacion = ModoHumanizacion.EQUILIBRADO,
    opciones?: OpcionesHumanizacion
  ): Promise<ResultadoHumanizacion> {
    const inicioTiempo = performance.now();

    // 1. Validaciones de entrada
    if (!texto || texto.trim().length === 0) {
      throw new ErrorTextoVacio();
    }

    if (texto.length > this.config.longitudMaximaTexto) {
      throw new ErrorTextoExcedeLimite(this.config.longitudMaximaTexto, texto.length);
    }

    // 2. Análisis inicial previo de la autoría IA
    const analisisPrevio = await this.detectorService.analizar(texto);

    // 3. Canalización de Reescritura (Pipeline)
    const todasLasTransformaciones: string[] = [];

    // Paso A: Desarticulación y reestructuración sintáctica
    const paso1 = SentenceRestructurer.reestructurarSintaxis(texto, modo);
    todasLasTransformaciones.push(...paso1.transformaciones);

    // Paso B: Sustitución de conectores y léxico predecible
    const paso2 = VocabularyReplacer.reemplazarVocabulario(paso1.textoReestructurado, modo);
    todasLasTransformaciones.push(...paso2.transformaciones);

    // Paso C: Variación de cadencia y ritmo discursivo
    let textoTransformado = paso2.textoTransformado;
    if (opciones?.variarCadencia !== false) {
      const paso3 = CadenceVariator.modularCadencia(textoTransformado, modo);
      todasLasTransformaciones.push(...paso3.transformaciones);
      textoTransformado = paso3.textoModulado;
    }

    // Si no se aplicó ninguna transformación porque el texto ya era natural
    if (todasLasTransformaciones.length === 0) {
      todasLasTransformaciones.push('El texto original ya cuenta con una cadencia natural y léxico orgánico.');
    }

    // 4. Reanálisis automático del texto humanizado
    const analisisPosterior = await this.detectorService.analizar(textoTransformado);

    // 5. Comparador diferencial (Diff View)
    const diferencias = DiffEngine.calcularDiferencias(texto, textoTransformado);

    // 6. Cálculo de reducción de probabilidad
    const reduccionProbabilidadIA = Math.max(
      0,
      analisisPrevio.probabilidadGlobalIA - analisisPosterior.probabilidadGlobalIA
    );

    const finTiempo = performance.now();

    return {
      textoOriginal: texto,
      textoHumanizado: textoTransformado,
      modo,
      analisisPrevio,
      analisisPosterior,
      reduccionProbabilidadIA,
      diferencias,
      transformacionesAplicadas: todasLasTransformaciones,
      tiempoProcesamientoMs: Math.round((finTiempo - inicioTiempo) * 100) / 100
    };
  }
}
