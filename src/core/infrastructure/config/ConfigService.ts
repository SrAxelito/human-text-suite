import { ConfiguracionSistema } from '../../domain/interfaces/ConfiguracionSistema';

export class ConfigService implements ConfiguracionSistema {
  private static instancia: ConfigService;

  public appEnv: string;
  public appTitle: string;
  public umbralHumanoMax: number;
  public umbralAiMin: number;
  public pesoPerplejidad: number;
  public pesoBurstiness: number;
  public pesoCliches: number;
  public longitudMaximaTexto: number;
  public timeoutAnalisisMs: number;
  public aiModelProvider: string;
  public aiApiKey?: string;

  private constructor() {
    const env = this.cargarVariablesEntorno();

    this.appEnv = env.VITE_APP_ENV || 'production';
    this.appTitle = env.VITE_APP_TITLE || 'HumanTextSuite - Detector & Humanizador IA';
    this.umbralHumanoMax = Number(env.VITE_THRESHOLD_HUMAN_MAX) || 35;
    this.umbralAiMin = Number(env.VITE_THRESHOLD_AI_MIN) || 70;
    this.pesoPerplejidad = Number(env.VITE_PERPLEXITY_WEIGHT) || 0.40;
    this.pesoBurstiness = Number(env.VITE_BURSTINESS_WEIGHT) || 0.35;
    this.pesoCliches = Number(env.VITE_CLICHE_WEIGHT) || 0.25;
    this.longitudMaximaTexto = Number(env.VITE_MAX_TEXT_LENGTH) || 50000;
    this.timeoutAnalisisMs = Number(env.VITE_DEFAULT_ANALYSIS_TIMEOUT_MS) || 10000;
    this.aiModelProvider = env.VITE_AI_MODEL_PROVIDER || 'heuristic_local';
    this.aiApiKey = env.VITE_AI_API_KEY || '';
  }

  public static obtenerInstancia(): ConfigService {
    if (!ConfigService.instancia) {
      ConfigService.instancia = new ConfigService();
    }
    return ConfigService.instancia;
  }

  private cargarVariablesEntorno(): Record<string, string | undefined> {
    const valores: Record<string, string | undefined> = {};

    if (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env) {
      const metaEnv = (import.meta as unknown as { env: Record<string, string> }).env;
      Object.assign(valores, metaEnv);
    }

    if (typeof process !== 'undefined' && process.env) {
      Object.assign(valores, process.env);
    }

    return valores;
  }

  public actualizarConfiguracion(parcial: Partial<ConfiguracionSistema>): void {
    Object.assign(this, parcial);
  }
}
