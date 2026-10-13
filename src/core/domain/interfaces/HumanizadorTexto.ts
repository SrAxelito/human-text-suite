import { ModoHumanizacion } from '../enums/ModoHumanizacion';
import { ResultadoHumanizacion } from '../entities/ResultadoHumanizacion';

export interface OpcionesHumanizacion {
  preservarFormato?: boolean;
  variarCadencia?: boolean;
  eliminarCliches?: boolean;
  timeoutMs?: number;
}

/**
 * Contrato de servicio para el motor de reescritura y humanización de texto.
 */
export interface HumanizadorTexto {
  humanizar(
    texto: string,
    modo?: ModoHumanizacion,
    opciones?: OpcionesHumanizacion
  ): Promise<ResultadoHumanizacion>;
}
