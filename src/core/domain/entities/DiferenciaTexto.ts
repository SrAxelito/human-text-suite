/**
 * Representa una porción individual de diferencia entre dos textos.
 */
export interface FragmentoDiferencia {
  tipo: 'igual' | 'agregado' | 'eliminado';
  valor: string;
  conteo: number;
}

/**
 * Resumen consolidado del visor diferencial (Diff View).
 */
export interface DiferenciaTexto {
  fragmentos: FragmentoDiferencia[];
  palabrasAgregadas: number;
  palabrasEliminadas: number;
  palabrasSinCambio: number;
  porcentajeSimilitud: number;
}
