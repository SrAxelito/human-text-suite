/**
 * Errores específicos del dominio para el motor de detección y humanización.
 */
export class ErrorDominioTexto extends Error {
  constructor(mensaje: string, public readonly codigo: string) {
    super(mensaje);
    this.name = 'ErrorDominioTexto';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ErrorTextoVacio extends ErrorDominioTexto {
  constructor(mensaje = 'El texto proporcionado está vacío o solo contiene espacios en blanco.') {
    super(mensaje, 'TEXTO_VACIO');
  }
}

export class ErrorTextoExcedeLimite extends ErrorDominioTexto {
  constructor(limiteMaximo: number, longitudActual: number) {
    super(
      `El texto supera la longitud máxima permitida de ${limiteMaximo} caracteres (actual: ${longitudActual}).`,
      'TEXTO_EXCEDE_LIMITE'
    );
  }
}

export class ErrorTimeoutAnalisis extends ErrorDominioTexto {
  constructor(timeoutMs: number) {
    super(
      `El análisis del texto excedió el tiempo límite estipulado de ${timeoutMs}ms.`,
      'TIMEOUT_ANALISIS'
    );
  }
}

export class ErrorModoInvalido extends ErrorDominioTexto {
  constructor(modo: string) {
    super(`El modo de humanización '${modo}' no es reconocido.`, 'MODO_INVALIDO');
  }
}
