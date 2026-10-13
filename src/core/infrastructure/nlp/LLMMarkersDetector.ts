export interface MarcadorDetectado {
  marcador: string;
  categoria: 'conector_academico' | 'muletilla_llm' | 'estructura_formulaica';
  posicion: number;
}

export class LLMMarkersDetector {
  // Conectores hiper-formales y de relleno muy recurrentes en modelos de lenguaje
  private static readonly CLICHES_CONECTORES = [
    'en resumen',
    'en conclusion',
    'en conclusión',
    'es fundamental destacar',
    'es imperativo señalar',
    'es crucial comprender',
    'cabe señalar',
    'cabe destacar',
    'cabe resaltar',
    'es importante tener en cuenta',
    'por consiguiente',
    'no cabe duda de que',
    'en ultima instancia',
    'en última instancia',
    'a fin de cuentas',
    'en este sentido',
    'a modo de conclusion',
    'a modo de conclusión',
    'juega un papel crucial',
    'desempeña un rol fundamental',
    'en un mundo cada vez mas',
    'en un mundo cada vez más',
    'en el vertiginoso mundo',
    'delve into',
    'it is important to note',
    'in conclusion',
    'furthermore',
    'moreover',
    'a testament to',
    'in today\'s fast-paced world',
    'it goes without saying that'
  ];

  // Palabras muletilla comúnmente sobreutilizadas por LLMs
  private static readonly MULETILLAS_LLM = [
    'intrínsecamente',
    'intrinsecamente',
    'holístico',
    'holistico',
    'multifacético',
    'multifacetico',
    'sinérgico',
    'sinergico',
    'paradigma',
    'vanguardia',
    'catalizador',
    'inquebrantable',
    'meticuloso',
    'crucial',
    'fundamentalmente',
    'indiscutiblemente',
    'un tapiz',
    'tapestry',
    'multifaceted',
    'beacon',
    'leverage',
    'orchestrate'
  ];

  // Patrones sintácticos formulaicos
  private static readonly PATRONES_FORMULAICOS: Array<{ regex: RegExp; nombre: string }> = [
    { regex: /por un lado[\s\S]*?por otro lado/i, nombre: 'Estructura antitética binaria (Por un lado / Por otro lado)' },
    { regex: /no solo[\s\S]*?sino también/i, nombre: 'Estructura copulativa enfática (No solo... sino también)' },
    { regex: /en primer lugar[\s\S]*?en segundo lugar/i, nombre: 'Estructura ordinal formulaica' },
    { regex: /on the one hand[\s\S]*?on the other hand/i, nombre: 'Antithetical binary structure' },
    { regex: /not only[\s\S]*?but also/i, nombre: 'Emphatic copulative pattern' }
  ];

  /**
   * Escanea el texto en busca de huellas artificiales, clichés y estructuras formulaicas.
   */
  public static detectarMarcadores(texto: string): {
    clichesDetectados: MarcadorDetectado[];
    densidadCliches: number;
    probabilidadIASugerida: number;
    detallesPatrones: string[];
  } {
    if (!texto || texto.trim().length === 0) {
      return { clichesDetectados: [], densidadCliches: 0, probabilidadIASugerida: 15, detallesPatrones: [] };
    }

    const textoMin = texto.toLowerCase();
    const clichesDetectados: MarcadorDetectado[] = [];
    const detallesPatrones: string[] = [];

    // 1. Escaneo de conectores clichés
    for (const conector of LLMMarkersDetector.CLICHES_CONECTORES) {
      let pos = textoMin.indexOf(conector);
      while (pos !== -1) {
        clichesDetectados.push({
          marcador: conector,
          categoria: 'conector_academico',
          posicion: pos
        });
        pos = textoMin.indexOf(conector, pos + conector.length);
      }
    }

    // 2. Escaneo de muletillas de LLM
    for (const muletilla of LLMMarkersDetector.MULETILLAS_LLM) {
      const regex = new RegExp(`\\b${muletilla}\\b`, 'gi');
      let match: RegExpExecArray | null;
      while ((match = regex.exec(texto)) !== null) {
        clichesDetectados.push({
          marcador: match[0],
          categoria: 'muletilla_llm',
          posicion: match.index
        });
      }
    }

    // 3. Escaneo de estructuras formulaicas
    for (const patron of LLMMarkersDetector.PATRONES_FORMULAICOS) {
      if (patron.regex.test(texto)) {
        detallesPatrones.push(patron.nombre);
        clichesDetectados.push({
          marcador: patron.nombre,
          categoria: 'estructura_formulaica',
          posicion: 0
        });
      }
    }

    // Cálculo de densidad: con relación al total de palabras aproximado
    const palabrasAprox = Math.max(1, (texto.match(/\S+/g) || []).length);
    const conteoMarcadores = clichesDetectados.length;
    // Densidad porcentual normalizada (un marcador cada 20 palabras es densidad altísima)
    const ratio = conteoMarcadores / (palabrasAprox / 25);
    const densidadCliches = Math.min(100, Math.round(ratio * 35));

    // Probabilidad sugerida por presencia de clichés:
    // 0 marcadores = ~15%
    // 1 marcador = ~45%
    // 2 marcadores = ~70%
    // 3+ marcadores = 85% - 95%
    let probIA = 15;
    if (conteoMarcadores === 1) probIA = 45;
    else if (conteoMarcadores === 2) probIA = 68;
    else if (conteoMarcadores >= 3) probIA = Math.min(95, 75 + conteoMarcadores * 5);

    return {
      clichesDetectados,
      densidadCliches,
      probabilidadIASugerida: probIA,
      detallesPatrones
    };
  }

  /**
   * Evalúa si una oración específica contiene huellas artificiales.
   */
  public static evaluarOracion(textoOracion: string): {
    marcas: string[];
    factorPenalizacion: number;
  } {
    const textoMin = textoOracion.toLowerCase();
    const marcas: string[] = [];
    let factorPenalizacion = 0;

    for (const conector of LLMMarkersDetector.CLICHES_CONECTORES) {
      if (textoMin.includes(conector)) {
        marcas.push(`Conector cliché: "${conector}"`);
        factorPenalizacion += 22;
      }
    }

    for (const muletilla of LLMMarkersDetector.MULETILLAS_LLM) {
      const regex = new RegExp(`\\b${muletilla}\\b`, 'i');
      if (regex.test(textoOracion)) {
        marcas.push(`Muletilla LLM: "${muletilla}"`);
        factorPenalizacion += 16;
      }
    }

    return {
      marcas,
      factorPenalizacion: Math.min(60, factorPenalizacion)
    };
  }
}
