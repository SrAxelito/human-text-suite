export interface ReemplazoConector {
  patron: RegExp;
  ligero: string[];
  equilibrado: string[];
  profundo: string[];
}

export class Dictionaries {
  /**
   * Mapeo de conectores formales y de LLM a alternativas naturales por nivel de intensidad.
   */
  public static readonly REEMPLAZOS_CONECTORES: ReemplazoConector[] = [
    {
      patron: /\ben resumen\b/gi,
      ligero: ['en síntesis', 'en pocas palabras'],
      equilibrado: ['en pocas palabras', 'a grandes rasgos', 'en definitiva'],
      profundo: ['al fin y al cabo', 'en plata', 'mirándolo con perspectiva']
    },
    {
      patron: /\ben conclusi[oó]n\b/gi,
      ligero: ['para concluir', 'en definitiva'],
      equilibrado: ['en definitiva', 'al final de cuentas', 'dicho esto'],
      profundo: ['a fin de cuentas', 'al final del camino', 'en resumidas cuentas']
    },
    {
      patron: /\bes fundamental destacar que\b/gi,
      ligero: ['vale notar que', 'conviene destacar que'],
      equilibrado: ['un punto clave es que', 'conviene no perder de vista que'],
      profundo: ['lo cierto es que', 'algo que salta a la vista es que', 'aquí lo que cuenta es que']
    },
    {
      patron: /\bes fundamental destacar\b/gi,
      ligero: ['conviene resaltar', 'vale notar'],
      equilibrado: ['un punto clave es', 'vale la pena subrayar'],
      profundo: ['lo cierto es', 'no hay que perder de vista']
    },
    {
      patron: /\bes imperativo se[nñ]alar que\b/gi,
      ligero: ['es oportuno señalar que', 'conviene recalcar que'],
      equilibrado: ['resulta esencial tener claro que', 'hay que tener presente que'],
      profundo: ['no podemos ignorar que', 'la realidad es que']
    },
    {
      patron: /\bpor consiguiente\b/gi,
      ligero: ['por lo tanto', 'de este modo'],
      equilibrado: ['de ahí que', 'así las cosas', 'por ello'],
      profundo: ['por eso mismo', 'con esto en mente', 'como consecuencia']
    },
    {
      patron: /\ben [uú]ltima instancia\b/gi,
      ligero: ['en definitiva', 'al final'],
      equilibrado: ['a la larga', 'a la hora de la verdad'],
      profundo: ['al fin y al cabo', 'cuando todo se resume', 'al final del día']
    },
    {
      patron: /\bjuega un papel crucial\b/gi,
      ligero: ['cumple un rol importante', 'resulta muy relevante'],
      equilibrado: ['marca una diferencia notable', 'resulta decisivo'],
      profundo: ['pesa con fuerza', 'inclina la balanza', 'es determinante']
    },
    {
      patron: /\bdesempe[nñ]a un rol fundamental\b/gi,
      ligero: ['tiene un papel clave', 'resulta primordial'],
      equilibrado: ['es una pieza central', 'pesa bastante'],
      profundo: ['marca el ritmo', 'es el corazón del asunto']
    },
    {
      patron: /\bcabe (?:se[nñ]alar|destacar|resaltar) que\b/gi,
      ligero: ['vale notar que', 'conviene recordar que'],
      equilibrado: ['un detalle no menor es que', 'no está de más decir que'],
      profundo: ['la verdad sea dicha', 'hay algo curioso:']
    },
    {
      patron: /\bno cabe duda de que\b/gi,
      ligero: ['sin duda', 'es indudable que'],
      equilibrado: ['queda claro que', 'es evidente que'],
      profundo: ['a todas luces', 'está a la vista que']
    },
    {
      patron: /\ben un mundo cada vez m[aá]s (?:complejo|digital|competitivo)\b/gi,
      ligero: ['en el entorno actual', 'hoy en día'],
      equilibrado: ['en el panorama contemporáneo', 'en los tiempos que corren'],
      profundo: ['con el ritmo que llevamos hoy', 'en medio de tanta velocidad']
    },
    // Inglés
    {
      patron: /\bin conclusion\b/gi,
      ligero: ['in summary', 'to conclude'],
      equilibrado: ['all in all', 'in the end'],
      profundo: ['at the end of the day', 'bottom line']
    },
    {
      patron: /\bit is important to note that\b/gi,
      ligero: ['it is worth noting that', 'we should observe that'],
      equilibrado: ['a key takeaway is that', 'keep in mind that'],
      profundo: ['what really matters here is that', 'the truth is']
    },
    {
      patron: /\bdelve into\b/gi,
      ligero: ['explore', 'examine'],
      equilibrado: ['dig into', 'take a closer look at'],
      profundo: ['unpack', 'get into the weeds of']
    },
    {
      patron: /\ba testament to\b/gi,
      ligero: ['proof of', 'evidence of'],
      equilibrado: ['a clear sign of', 'a reflection of'],
      profundo: ['living proof that', 'shows just how']
    }
  ];

  /**
   * Mapeo de léxico hiperformal y muletillas LLM a expresiones orgánicas.
   */
  public static readonly REEMPLAZOS_LEXICOS: Array<{
    patron: RegExp;
    alternativas: string[];
  }> = [
    { patron: /\bintr[ií]nsecamente\b/gi, alternativas: ['por naturaleza', 'de por sí', 'esencialmente'] },
    { patron: /\bhol[ií]stico\b/gi, alternativas: ['integral', 'global', 'completo'] },
    { patron: /\bhol[ií]stica\b/gi, alternativas: ['integral', 'global', 'completa'] },
    { patron: /\bmultifac[eé]tico\b/gi, alternativas: ['con varias aristas', 'diverso', 'complejo'] },
    { patron: /\bmultifac[eé]tica\b/gi, alternativas: ['con varias aristas', 'diversa', 'variada'] },
    { patron: /\bsin[eé]rgico\b/gi, alternativas: ['articulado', 'conjunto', 'coordinado'] },
    { patron: /\bsin[eé]rgica\b/gi, alternativas: ['articulada', 'conjunta', 'coordinada'] },
    { patron: /\bparadigma\b/gi, alternativas: ['enfoque', 'modelo', 'perspectiva'] },
    { patron: /\bcatalizador\b/gi, alternativas: ['impulso', 'motor', 'detonante'] },
    { patron: /\bvanguardia\b/gi, alternativas: ['primera línea', 'frente innovador', 'referente'] },
    { patron: /\binquebrantable\b/gi, alternativas: ['firme', 'sólido', 'constante'] },
    { patron: /\bindiscutiblemente\b/gi, alternativas: ['sin rodeos', 'a las claras', 'con total certeza'] },
    { patron: /\bun tapiz de\b/gi, alternativas: ['un mosaico de', 'una mezcla de', 'una trama de'] },
    { patron: /\btapestry\b/gi, alternativas: ['fabric', 'mosaic', 'blend'] },
    { patron: /\bcrucial\b/gi, alternativas: ['clave', 'decisivo', 'fundamental'] }
  ];

  /**
   * Retorna una alternativa determinista o pseudoaleatoria reproducible.
   */
  public static seleccionarOpcion(opciones: string[], semilla: number): string {
    if (opciones.length === 0) return '';
    const indice = Math.abs(semilla) % opciones.length;
    return opciones[indice];
  }
}
