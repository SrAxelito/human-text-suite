import { OracionAnalizada } from './OracionAnalizada';
import { ClasificacionIA } from '../enums/ClasificacionIA';

/**
 * Representa un párrafo analizado con su desglose de oraciones.
 */
export interface ParrafoAnalizado {
  indice: number;
  texto: string;
  inicio: number;
  fin: number;
  probabilidadIA: number;
  clasificacion: ClasificacionIA;
  oraciones: OracionAnalizada[];
}
