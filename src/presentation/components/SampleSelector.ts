import { AppStore } from '../state/AppStore';

export class SampleSelector {
  public static render(): string {
    return `
      <div class="samples-bar">
        <span class="samples-label">Cargar textos de prueba:</span>
        <button class="sample-chip" data-sample="ia">
          🤖 Muestra IA (Sintética con clichés)
        </button>
        <button class="sample-chip" data-sample="humano">
          ✍️ Muestra Humana (Crónica con alta cadencia)
        </button>
        <button class="sample-chip" data-sample="mixto">
          ⚖️ Muestra Mixta / Dudosa
        </button>
      </div>
    `;
  }

  public static bindEvents(container: HTMLElement, store: AppStore): void {
    container.querySelectorAll<HTMLButtonElement>('.sample-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tipo = btn.getAttribute('data-sample') as 'ia' | 'humano' | 'mixto';
        if (tipo) {
          store.cargarMuestra(tipo);
        }
      });
    });
  }
}
