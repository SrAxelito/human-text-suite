/**
 * Modos de agresividad para el pipeline de humanización y reescritura.
 */
export enum ModoHumanizacion {
  /**
   * Ajustes mínimos: suavizado de conectores, puntuación natural y sinonimia sutil.
   */
  LIGERO = 'LIGERO',

  /**
   * Ajustes moderados: reordenamiento sintáctico, alternancia de longitud y transición conversacional.
   */
  EQUILIBRADO = 'EQUILIBRADO',

  /**
   * Reestructuración profunda: reformulación exhaustiva, ruptura radical de patrones sintéticos y cadencia asimétrica.
   */
  PROFUNDO = 'PROFUNDO'
}

export function obtenerDetalleModo(modo: ModoHumanizacion): {
  nombre: string;
  descripcion: string;
  intensidad: number;
} {
  switch (modo) {
    case ModoHumanizacion.LIGERO:
      return {
        nombre: 'Ligero',
        descripcion: 'Ajustes sutiles de conectores, puntuación orgánica y sinonimia controlada.',
        intensidad: 1
      };
    case ModoHumanizacion.EQUILIBRADO:
      return {
        nombre: 'Equilibrado',
        descripcion: 'Reordenamiento sintáctico, alternancia de ritmo y desarticulación de clichés LLM.',
        intensidad: 2
      };
    case ModoHumanizacion.PROFUNDO:
      return {
        nombre: 'Profundo',
        descripcion: 'Paráfrasis exhaustiva, cadencia discursiva asimétrica y máxima naturalidad humana.',
        intensidad: 3
      };
  }
}
