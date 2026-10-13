import { AppStore, EstadoApp } from '../state/AppStore';

export class DropzoneWord {
  public static render(estado: EstadoApp): string {
    const { documentoWord, estaCargando } = estado;

    if (documentoWord) {
      const tamanoKb = (documentoWord.tamanoBytes / 1024).toFixed(1);
      const tamanoDisplay = documentoWord.tamanoBytes > 1024 * 1024
        ? `${(documentoWord.tamanoBytes / (1024 * 1024)).toFixed(2)} MB`
        : `${tamanoKb} KB`;

      return `
        <div class="word-loaded-banner">
          <div class="word-file-info">
            <div class="word-icon-badge">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 17.5L7 11.5h1.6l.8 3.8.9-3.8H12l.9 3.8.8-3.8h1.6l-1.5 6h-1.6l-.8-3.3-.8 3.3H8.5z"/>
              </svg>
            </div>
            <div>
              <div class="word-file-name">${this.escaparHtml(documentoWord.nombre)}</div>
              <div class="word-file-meta">
                <span>${tamanoDisplay}</span> • <span>${documentoWord.totalParrafos} párrafos</span> • <span>${documentoWord.totalPalabras} palabras</span>
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="badge-status-analyzed">
              <span class="badge-pulse-mini"></span> Documento Activo
            </span>
            <button class="btn-discard-doc" id="btn-descartar-doc" title="Descartar documento y limpiar editor">
              ✕ Descartar
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="word-dropzone ${estaCargando ? 'dropzone-disabled' : ''}" id="word-dropzone">
        <input
          type="file"
          id="word-file-input"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style="display: none;"
          ${estaCargando ? 'disabled' : ''}
        />
        <div class="dropzone-content">
          <div class="dropzone-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div class="dropzone-text">
            <span class="dropzone-title">Arrastra y suelta tu documento Word (.docx) aquí</span>
            <span class="dropzone-subtitle">o <button type="button" class="dropzone-browse-btn" id="btn-browse-word">explora tus archivos</button> (máx. 15 MB)</span>
          </div>
        </div>
      </div>
    `;
  }

  public static bindEvents(container: HTMLElement, store: AppStore): void {
    const dropzone = container.querySelector<HTMLElement>('#word-dropzone');
    const fileInput = container.querySelector<HTMLInputElement>('#word-file-input');
    const browseBtn = container.querySelector<HTMLButtonElement>('#btn-browse-word');
    const discardBtn = container.querySelector<HTMLButtonElement>('#btn-descartar-doc');

    if (discardBtn) {
      discardBtn.addEventListener('click', () => {
        store.descartarDocumento();
      });
    }

    if (!dropzone || !fileInput) return;

    // Abrir explorador al hacer clic
    dropzone.addEventListener('click', (e) => {
      if (e.target !== browseBtn) {
        fileInput.click();
      }
    });

    browseBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        store.cargarDocumentoWord(file);
        fileInput.value = '';
      }
    });

    // Drag & Drop
    ['dragenter', 'dragover'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dropzone-dragover');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dropzone-dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        store.cargarDocumentoWord(file);
      }
    });
  }

  private static escaparHtml(texto: string): string {
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
