import {
  ModoHumanizacion,
  ResultadoAnalisis,
  ResultadoHumanizacion,
  OracionAnalizada,
  MetadatosDocumento,
  EventoProgresoLote,
  ErrorProcesoCancelado
} from '../../core/domain';
import { DetectorService } from '../../core/services/DetectorService';
import { HumanizadorService } from '../../core/services/HumanizadorService';
import { DocumentReaderService } from '../../core/services/DocumentReaderService';
import { BatchProcessingService } from '../../core/services/BatchProcessingService';

export interface EstadoApp {
  texto: string;
  analisis: ResultadoAnalisis | null;
  humanizacion: ResultadoHumanizacion | null;
  documentoWord: MetadatosDocumento | null;
  modo: ModoHumanizacion;
  estaCargando: boolean;
  cargandoMensaje: string;
  progresoLote: EventoProgresoLote | null;
  vistaActiva: 'editor' | 'resaltado' | 'diff';
  oracionSeleccionada: OracionAnalizada | null;
  notificacion: { mensaje: string; tipo: 'info' | 'exito' | 'error' } | null;
}

export type ListenerEstado = (estado: EstadoApp) => void;

export class AppStore {
  private static instancia: AppStore;
  private detectorService: DetectorService;
  private humanizadorService: HumanizadorService;
  private documentReaderService: DocumentReaderService;
  private batchProcessingService: BatchProcessingService;
  private abortControllerAnalisis: AbortController | null = null;
  private listeners: Set<ListenerEstado> = new Set();

  private estado: EstadoApp = {
    texto: '',
    analisis: null,
    humanizacion: null,
    documentoWord: null,
    modo: ModoHumanizacion.EQUILIBRADO,
    estaCargando: false,
    cargandoMensaje: '',
    progresoLote: null,
    vistaActiva: 'editor',
    oracionSeleccionada: null,
    notificacion: null
  };

  private constructor() {
    this.detectorService = new DetectorService();
    this.humanizadorService = new HumanizadorService(this.detectorService);
    this.documentReaderService = new DocumentReaderService();
    this.batchProcessingService = new BatchProcessingService(this.detectorService);
  }

  public static obtenerInstancia(): AppStore {
    if (!AppStore.instancia) {
      AppStore.instancia = new AppStore();
    }
    return AppStore.instancia;
  }

  public obtenerEstado(): Readonly<EstadoApp> {
    return this.estado;
  }

  public suscribir(listener: ListenerEstado): () => void {
    this.listeners.add(listener);
    listener(this.estado);
    return () => this.listeners.delete(listener);
  }

  private notificar(): void {
    for (const listener of this.listeners) {
      listener(this.estado);
    }
  }

  public setTexto(texto: string): void {
    this.estado.texto = texto;
    this.notificar();
  }

  public setModo(modo: ModoHumanizacion): void {
    this.estado.modo = modo;
    this.notificar();
  }

  public setVista(vista: 'editor' | 'resaltado' | 'diff'): void {
    this.estado.vistaActiva = vista;
    this.notificar();
  }

  public seleccionarOracion(oracion: OracionAnalizada | null): void {
    this.estado.oracionSeleccionada = oracion;
    this.notificar();
  }

  public mostrarToast(mensaje: string, tipo: 'info' | 'exito' | 'error' = 'info'): void {
    this.estado.notificacion = { mensaje, tipo };
    this.notificar();

    setTimeout(() => {
      if (this.estado.notificacion?.mensaje === mensaje) {
        this.estado.notificacion = null;
        this.notificar();
      }
    }, 3200);
  }

  public cancelarAnalisis(): void {
    if (this.abortControllerAnalisis) {
      this.abortControllerAnalisis.abort();
      this.abortControllerAnalisis = null;
    }
    this.batchProcessingService.cancelar();
    this.estado.estaCargando = false;
    this.estado.progresoLote = null;
    this.estado.cargandoMensaje = '';
    this.mostrarToast('Análisis cancelado por el usuario.', 'info');
    this.notificar();
  }

  public async cargarDocumentoWord(archivo: File): Promise<void> {
    this.estado.estaCargando = true;
    this.estado.cargandoMensaje = `Extrayendo texto de "${archivo.name}"...`;
    this.notificar();

    this.abortControllerAnalisis = new AbortController();

    try {
      const resultadoLectura = await this.documentReaderService.leerDocumento(archivo);
      this.estado.documentoWord = resultadoLectura.metadatos;
      this.estado.texto = resultadoLectura.texto;
      this.estado.humanizacion = null;
      this.estado.vistaActiva = 'resaltado';

      this.mostrarToast(
        `Documento cargado (${resultadoLectura.metadatos.totalParrafos} párrafos, ${resultadoLectura.metadatos.totalPalabras} palabras). Analizando...`,
        'info'
      );

      const resultadoAnalisis = await this.batchProcessingService.procesarDocumento(
        resultadoLectura.texto,
        {
          signal: this.abortControllerAnalisis.signal,
          onProgreso: (evento) => {
            this.estado.progresoLote = evento;
            this.estado.cargandoMensaje = evento.mensaje || '';
            if (evento.resultadoAcumulado) {
              this.estado.analisis = evento.resultadoAcumulado;
            }
            this.notificar();
          }
        }
      );

      this.estado.analisis = resultadoAnalisis;
      this.mostrarToast(
        `Análisis completado: ${resultadoAnalisis.etiquetaClasificacion} (${resultadoAnalisis.probabilidadGlobalIA}%)`,
        'exito'
      );
    } catch (err: unknown) {
      if (err instanceof ErrorProcesoCancelado) {
        this.mostrarToast('Análisis cancelado por el usuario.', 'info');
      } else {
        const msg = err instanceof Error ? err.message : 'Error al procesar el archivo Word';
        this.mostrarToast(msg, 'error');
      }
    } finally {
      this.abortControllerAnalisis = null;
      this.estado.estaCargando = false;
      this.estado.progresoLote = null;
      this.estado.cargandoMensaje = '';
      this.notificar();
    }
  }

  public descartarDocumento(): void {
    if (this.estado.estaCargando) {
      this.cancelarAnalisis();
    }
    this.estado.documentoWord = null;
    this.estado.texto = '';
    this.estado.analisis = null;
    this.estado.humanizacion = null;
    this.estado.vistaActiva = 'editor';
    this.mostrarToast('Documento descartado y editor reiniciado.', 'info');
    this.notificar();
  }

  public async ejecutarAnalisis(): Promise<void> {
    if (!this.estado.texto.trim()) {
      this.mostrarToast('Por favor introduce un texto para analizar.', 'error');
      return;
    }

    this.abortControllerAnalisis = new AbortController();
    this.estado.estaCargando = true;
    this.estado.cargandoMensaje = 'Iniciando análisis...';
    this.notificar();

    try {
      const res = await this.batchProcessingService.procesarDocumento(this.estado.texto, {
        signal: this.abortControllerAnalisis.signal,
        onProgreso: (evento) => {
          this.estado.progresoLote = evento;
          this.estado.cargandoMensaje = evento.mensaje || '';
          if (evento.resultadoAcumulado) {
            this.estado.analisis = evento.resultadoAcumulado;
            if (this.estado.vistaActiva === 'editor') {
              this.estado.vistaActiva = 'resaltado';
            }
          }
          this.notificar();
        }
      });

      this.estado.analisis = res;
      this.estado.vistaActiva = 'resaltado';
      this.mostrarToast(`Análisis completado: ${res.etiquetaClasificacion}`, 'exito');
    } catch (err: unknown) {
      if (err instanceof ErrorProcesoCancelado) {
        this.mostrarToast('Análisis cancelado por el usuario.', 'info');
      } else {
        const msg = err instanceof Error ? err.message : 'Error al analizar texto';
        this.mostrarToast(msg, 'error');
      }
    } finally {
      this.abortControllerAnalisis = null;
      this.estado.estaCargando = false;
      this.estado.progresoLote = null;
      this.estado.cargandoMensaje = '';
      this.notificar();
    }
  }

  public async ejecutarHumanizacion(): Promise<void> {
    if (!this.estado.texto.trim()) {
      this.mostrarToast('Introduce un texto para humanizar.', 'error');
      return;
    }

    this.estado.estaCargando = true;
    this.estado.cargandoMensaje = `Reestructurando cadencia en modo ${this.estado.modo}...`;
    this.notificar();

    try {
      const res = await this.humanizadorService.humanizar(this.estado.texto, this.estado.modo);
      this.estado.humanizacion = res;
      this.estado.analisis = res.analisisPosterior;
      this.estado.vistaActiva = 'diff';
      this.mostrarToast(
        `Humanización completada: -${res.reduccionProbabilidadIA}% probabilidad IA`,
        'exito'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al humanizar el texto';
      this.mostrarToast(msg, 'error');
    } finally {
      this.estado.estaCargando = false;
      this.estado.cargandoMensaje = '';
      this.notificar();
    }
  }

  public limpiar(): void {
    this.estado.texto = '';
    this.estado.documentoWord = null;
    this.estado.analisis = null;
    this.estado.humanizacion = null;
    this.estado.vistaActiva = 'editor';
    this.estado.oracionSeleccionada = null;
    this.mostrarToast('Editor reiniciado.', 'info');
    this.notificar();
  }

  public cargarMuestra(tipo: 'ia' | 'humano' | 'mixto'): void {
    let muestra = '';
    if (tipo === 'ia') {
      muestra =
        'En resumen, la inteligencia artificial juega un papel crucial en la transformación digital contemporánea. ' +
        'Es fundamental destacar que este paradigma holístico permite a las organizaciones automatizar procesos ' +
        'complejos con una precisión sin precedentes. ' +
        'Por consiguiente, resulta indispensable adoptar soluciones innovadoras para maximizar la competitividad. ' +
        'En última instancia, el impacto de estas herramientas resulta indiscutiblemente positivo para la sociedad. ' +
        'No solo agiliza el flujo de trabajo, sino también redefine las competencias estratégicas del futuro.';
    } else if (tipo === 'humano') {
      muestra =
        'Ayer por la tarde me escapé un rato al parque del centro. Hacía un viento helado. ' +
        'Me senté en una banca de madera con un café tibio en la mano, viendo a un par de perros correr ' +
        'desesperados tras una pelota desinflada mientras las hojas secas crujían bajo las ruedas de las bicicletas. ' +
        'A veces uno solo necesita respirar, apagar las pantallas por media hora y dejar que la mente divague ' +
        'sin ninguna prisa ni objetivo en particular. ' +
        '¿A poco no es genial desconectar de vez en cuando?';
    } else {
      muestra =
        'La evolución tecnológica plantea desafíos interesantes para cualquier equipo moderno. ' +
        'En resumen, es fundamental destacar que las herramientas de automatización mejoran la productividad. ' +
        'Sin embargo, cuando hablé con los desarrolladores del equipo, me confesaron que todavía pasan horas ' +
        'peleando con errores tontos de configuración. Al final, no todo se resuelve con un algoritmo mágico.';
    }

    this.estado.texto = muestra;
    this.estado.documentoWord = null;
    this.estado.analisis = null;
    this.estado.humanizacion = null;
    this.estado.vistaActiva = 'editor';
    this.mostrarToast(`Muestra "${tipo.toUpperCase()}" cargada. Haz clic en "Analizar".`, 'info');
    this.notificar();
  }
}
