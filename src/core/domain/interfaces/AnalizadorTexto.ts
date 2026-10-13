import { ResultadoAnalisis } from '../entities/ResultadoAnalisis';

export interface OpcionesAnalisis {
  sensibilidad?: number;
  incluirDetallesOraciones?: boolean;
  timeoutMs?: number;
}

/**
 * Contrato de servicio para el analizador de detección de IA.
 */
export interface AnalizadorTexto {
  analizar(texto: string, opciones?: OpcionesAnalisis): Promise<ResultadoAnalisis>;
}
