import { describe, it, expect } from 'vitest';
import { BatchProcessingService } from '../../src/core/services/BatchProcessingService';
import { EventoProgresoLote } from '../../src/core/domain/interfaces/ProcesadorLotes';
import { ErrorProcesoCancelado, ErrorTextoVacio } from '../../src/core/domain/errors/ErroresDominio';

describe('BatchProcessingService - Orquestador Asíncrono de Procesamiento por Lotes', () => {
  it('debe arrojar ErrorTextoVacio si el texto está en blanco', async () => {
    const service = new BatchProcessingService();
    await expect(service.procesarDocumento('')).rejects.toThrow(ErrorTextoVacio);
  });

  it('debe procesar directamente un texto que no supera el umbral sin segmentar', async () => {
    const service = new BatchProcessingService();
    const eventos: EventoProgresoLote[] = [];

    const textoCorto = 'Este es un texto corto que no supera el umbral configurado de caracteres.';
    const resultado = await service.procesarDocumento(textoCorto, {
      umbralDirectoCaracteres: 500,
      onProgreso: (e) => eventos.push(e)
    });

    expect(resultado).toBeDefined();
    expect(resultado.textoOriginal).toBe(textoCorto);
    expect(eventos.length).toBeGreaterThanOrEqual(2);
    expect(eventos[0].progreso).toBe(0);
    expect(eventos[eventos.length - 1].progreso).toBe(100);
    expect(eventos[eventos.length - 1].estado).toBe('completado');
  });

  it('debe segmentar y procesar secuencialmente emitiendo eventos de progreso', async () => {
    const service = new BatchProcessingService();
    const eventos: EventoProgresoLote[] = [];

    // Generar texto que supera el umbral
    const parrafo = 'En este contexto, es fundamental destacar que la inteligencia artificial evoluciona rápidamente. Cada oración presenta una estructura clara y concisa.\n\n';
    const textoLargo = parrafo.repeat(150); // ~24,000 caracteres

    const resultado = await service.procesarDocumento(textoLargo, {
      umbralDirectoCaracteres: 10000,
      onProgreso: (e) => eventos.push(e)
    });

    expect(resultado).toBeDefined();
    expect(resultado.textoOriginal).toBe(textoLargo);
    expect(eventos.length).toBeGreaterThan(2);

    // Debe haber reportado progreso secuencial
    const porcentajes = eventos.map((e) => e.progreso);
    expect(porcentajes[porcentajes.length - 1]).toBe(100);

    const estados = eventos.map((e) => e.estado);
    expect(estados).toContain('iniciando');
    expect(estados).toContain('procesando');
    expect(estados).toContain('completado');
  });

  it('debe soportar cancelación mediante AbortSignal sin dejar procesos colgados', async () => {
    const service = new BatchProcessingService();
    const controller = new AbortController();

    const parrafo = 'Oracion de prueba para validar cancelacion limpia en el orquestador. '.repeat(30) + '\n\n';
    const textoLargo = parrafo.repeat(100);

    let llamadasProgreso = 0;
    const promesa = service.procesarDocumento(textoLargo, {
      umbralDirectoCaracteres: 5000,
      signal: controller.signal,
      onProgreso: () => {
        llamadasProgreso++;
        if (llamadasProgreso >= 2) {
          controller.abort();
        }
      }
    });

    await expect(promesa).rejects.toThrow(ErrorProcesoCancelado);
  });
});
