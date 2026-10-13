export interface ConfiguracionSistema {
  appEnv: string;
  appTitle: string;
  umbralHumanoMax: number;
  umbralAiMin: number;
  pesoPerplejidad: number;
  pesoBurstiness: number;
  pesoCliches: number;
  longitudMaximaTexto: number;
  timeoutAnalisisMs: number;
  aiModelProvider: string;
  aiApiKey?: string;
}
