import { AppStore, EstadoApp } from './state/AppStore';
import { Header } from './components/Header';
import { SampleSelector } from './components/SampleSelector';
import { DropzoneWord } from './components/DropzoneWord';
import { VisorTexto } from './components/VisorTexto';
import { MetricsDashboard } from './components/MetricsDashboard';
import { DiffViewer } from './components/DiffViewer';
import { ActionsToolbar } from './components/ActionsToolbar';
import { ExportModal } from './components/ExportModal';
import { ProgressBar } from './components/ProgressBar';
import { TemaService } from '../core/services/TemaService';
import { ReportExporter } from '../core/infrastructure/export/ReportExporter';

export class App {
  private store: AppStore;
  private temaService: TemaService;
  private rootElement: HTMLElement;
  private modalExportAbierto = false;
  private formatoExport: 'json' | 'markdown' = 'json';

  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;
    this.store = AppStore.obtenerInstancia();
    this.temaService = TemaService.obtenerInstancia();
    this.temaService.inicializar();
    this.temaService.suscribir(() => this.render(this.store.obtenerEstado()));
    this.store.suscribir((estado) => this.render(estado));
  }

  public render(estado: EstadoApp): void {
    const palabrasConteo = (estado.texto.match(/\S+/g) || []).length;
    const caracteresConteo = estado.texto.length;

    this.rootElement.innerHTML = `
      ${Header.render(this.temaService.obtenerTemaActual())}
      ${SampleSelector.render()}
      ${DropzoneWord.render(estado)}

      <main class="workspace-grid">
        <!-- Panel Izquierdo: Editor, Visor Limpio y Diff -->
        <section class="glass-panel">
          <div class="panel-header">
            <h2 class="panel-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Espacio de Redacción & Detección
            </h2>

            <div class="tab-nav">
              <button class="tab-btn ${estado.vistaActiva === 'editor' ? 'active' : ''}" id="tab-editor">
                Editor
              </button>
              <button class="tab-btn ${estado.vistaActiva === 'resaltado' ? 'active' : ''}" id="tab-resaltado" ${!estado.analisis ? 'disabled' : ''}>
                Visor con Margen
              </button>
              <button class="tab-btn ${estado.vistaActiva === 'diff' ? 'active' : ''}" id="tab-diff" ${!estado.humanizacion ? 'disabled' : ''}>
                Visor Diff
              </button>
            </div>
          </div>

          <div id="workspace-view-container">
            ${ProgressBar.render(estado.progresoLote)}
            ${this.renderVistaContenido(estado)}
          </div>

          <div class="editor-footer">
            <span>${palabrasConteo} palabras | ${caracteresConteo} caracteres</span>
            <span>Atajo: Presiona <strong>Ctrl + Enter</strong> para Analizar</span>
          </div>

          ${ActionsToolbar.render(estado)}
        </section>

        <!-- Panel Derecho: Tablero de Métricas -->
        <section class="glass-panel">
          <div class="panel-header">
            <h2 class="panel-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              Métricas & Diagnóstico
            </h2>
          </div>

          ${MetricsDashboard.render(estado.analisis)}
        </section>
      </main>

      <!-- Modal de exportación -->
      <div id="modal-container">
        ${this.modalExportAbierto ? ExportModal.render(estado.analisis, estado.humanizacion, this.formatoExport) : ''}
      </div>

      <!-- Notificaciones Toast -->
      <div class="toast-container" id="toast-container">
        ${
          estado.notificacion
            ? `<div class="toast toast-${estado.notificacion.tipo}">
                <span>${estado.notificacion.tipo === 'exito' ? '✅' : estado.notificacion.tipo === 'error' ? '❌' : 'ℹ️'}</span>
                <span>${estado.notificacion.mensaje}</span>
              </div>`
            : ''
        }
      </div>
    `;

    this.bindEvents(estado);
  }

  private renderVistaContenido(estado: EstadoApp): string {
    if (estado.vistaActiva === 'diff') {
      return DiffViewer.render(estado.humanizacion);
    }

    if (estado.vistaActiva === 'resaltado') {
      return VisorTexto.render(estado.analisis, estado.oracionSeleccionada);
    }

    // Por defecto: vista editor
    return `
      <div class="editor-container">
        <textarea
          id="main-text-input"
          class="text-input"
          placeholder="Escribe, pega texto o sube un archivo .docx para analizar o humanizar (admite español e inglés)..."
        >${this.escaparHtml(estado.texto)}</textarea>
      </div>
    `;
  }

  private bindEvents(estado: EstadoApp): void {
    Header.bindEvents(this.rootElement, this.temaService);
    SampleSelector.bindEvents(this.rootElement, this.store);
    DropzoneWord.bindEvents(this.rootElement, this.store);
    ProgressBar.bindEvents(this.rootElement, this.store);

    if (estado.vistaActiva === 'resaltado') {
      VisorTexto.bindEvents(this.rootElement, estado.analisis, (oracion) => {
        this.store.seleccionarOracion(oracion);
      });
    }

    ActionsToolbar.bindEvents(this.rootElement, this.store, () => {
      this.modalExportAbierto = true;
      this.render(this.store.obtenerEstado());
    });

    // Pestañas
    this.rootElement.querySelector('#tab-editor')?.addEventListener('click', () => {
      this.store.setVista('editor');
    });
    this.rootElement.querySelector('#tab-resaltado')?.addEventListener('click', () => {
      this.store.setVista('resaltado');
    });
    this.rootElement.querySelector('#tab-diff')?.addEventListener('click', () => {
      this.store.setVista('diff');
    });

    // Input del textarea
    const textarea = this.rootElement.querySelector<HTMLTextAreaElement>('#main-text-input');
    if (textarea) {
      textarea.addEventListener('input', (e) => {
        const target = e.target as HTMLTextAreaElement;
        this.store.setTexto(target.value);
      });

      // Atajo Ctrl+Enter para analizar
      textarea.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
          e.preventDefault();
          this.store.ejecutarAnalisis();
        }
      });
    }

    // Modal de exportación si está abierto
    if (this.modalExportAbierto) {
      const modalContainer = this.rootElement.querySelector<HTMLElement>('#modal-container')!;
      const contenido = this.formatoExport === 'json'
        ? ReportExporter.exportarJSON(estado.humanizacion || estado.analisis!)
        : ReportExporter.exportarMarkdown(estado.analisis!, estado.humanizacion);

      ExportModal.bindEvents(
        modalContainer,
        () => {
          this.modalExportAbierto = false;
          this.render(this.store.obtenerEstado());
        },
        (nuevoFormato) => {
          this.formatoExport = nuevoFormato;
          this.render(this.store.obtenerEstado());
        },
        contenido,
        this.formatoExport
      );
    }
  }

  private static escaparHtml(texto: string): string {
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private escaparHtml(texto: string): string {
    return App.escaparHtml(texto);
  }
}
