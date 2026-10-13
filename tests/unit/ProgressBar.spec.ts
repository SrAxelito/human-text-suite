import { describe, it, expect, vi } from 'vitest';
import { ProgressBar } from '../../src/presentation/components/ProgressBar';
import { EventoProgresoLote } from '../../src/core/domain/interfaces/ProcesadorLotes';
import { AppStore } from '../../src/presentation/state/AppStore';

describe('ProgressBar - Componente Reactivo de Progreso por Lotes', () => {
  it('no debe renderizar nada si el progreso es nulo o está completado', () => {
    expect(ProgressBar.render(null)).toBe('');

    const eventoCompletado: EventoProgresoLote = {
      progreso: 100,
      fragmentoActual: 5,
      totalFragmentos: 5,
      tiempoEstimadoSegundos: 0,
      tiempoTranscurridoMs: 1200,
      estado: 'completado'
    };
    expect(ProgressBar.render(eventoCompletado)).toBe('');
  });

  it('debe renderizar la barra con porcentaje, bloque actual y botón de cancelación', () => {
    const eventoActivo: EventoProgresoLote = {
      progreso: 60,
      fragmentoActual: 3,
      totalFragmentos: 5,
      tiempoEstimadoSegundos: 4,
      tiempoTranscurridoMs: 2500,
      estado: 'procesando',
      mensaje: 'Analizando bloque 3 de 5...'
    };

    const html = ProgressBar.render(eventoActivo);

    expect(html).toContain('batch-progress-banner');
    expect(html).toContain('60%');
    expect(html).toContain('Bloque 3 de 5');
    expect(html).toContain('~4s restantes');
    expect(html).toContain('id="btn-cancelar-lote"');
    expect(html).toContain('Cancelar análisis');
  });

  it('debe vincular el evento click del botón cancelar con store.cancelarAnalisis', () => {
    let clickHandler: ((e: any) => void) | null = null;
    const fakeBtn = {
      addEventListener: (evt: string, cb: (e: any) => void) => {
        if (evt === 'click') clickHandler = cb;
      }
    };

    const fakeContainer = {
      querySelector: (selector: string) => {
        if (selector === '#btn-cancelar-lote') return fakeBtn;
        return null;
      }
    } as unknown as HTMLElement;

    const store = AppStore.obtenerInstancia();
    const spyCancelar = vi.spyOn(store, 'cancelarAnalisis').mockImplementation(() => {});

    ProgressBar.bindEvents(fakeContainer, store);
    expect(clickHandler).not.toBeNull();

    // Simular click
    clickHandler!({ preventDefault: () => {} });
    expect(spyCancelar).toHaveBeenCalledTimes(1);

    spyCancelar.mockRestore();
  });
});
