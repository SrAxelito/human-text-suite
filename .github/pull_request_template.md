## 📌 Tipo de Cambio
Marca con una `x` las opciones aplicables:

- [ ] `feat`: Nueva funcionalidad o característica.
- [ ] `fix`: Corrección de un defecto o bug.
- [ ] `refactor`: Refactorización de código sin cambios en funcionalidad externa.
- [ ] `perf`: Optimización de rendimiento o consumo de recursos.
- [ ] `docs`: Cambios o adición de documentación.
- [ ] `test`: Adición o actualización de pruebas automatizadas.
- [ ] `chore`: Tareas de mantenimiento, dependencias o configuración CI/CD.

---

## 📝 Descripción Funcional
<!-- Explica de forma concisa el objetivo de este cambio, el contexto del problema y la solución adoptada. -->

### ¿Qué se hizo?
- 

### ¿Por qué se hizo?
- 

---

## 🏛️ Módulos / Componentes Modificados
Indica los módulos afectados según la Arquitectura Limpia del proyecto:

- [ ] **Dominio (`src/core/domain/`):** Entidades, enums, contratos/interfaces o excepciones de negocio.
- [ ] **Infraestructura (`src/core/infrastructure/`):** Algoritmos NLP (perplejidad, burstiness), DiffEngine, reescritura, exportación o configuración.
- [ ] **Servicios de Aplicación (`src/core/services/`):** DetectorService, HumanizadorService, ChunkingService, BatchProcessingService, DocumentReaderService, MetricasAggregator.
- [ ] **Presentación / UI (`src/presentation/`):** Componentes visuales, AppStore, estilos CSS (`index.css`), temas claro/oscuro (GitHub Primer).
- [ ] **Escritorio / Electron (`electron/`):** Proceso principal (`main.cjs`), empaquetado o integración con el sistema operativo.
- [ ] **Scripts y CI/CD (`.github/`, scripts de inicio):** Workflows de GitHub Actions, `iniciar.bat`/`iniciar.sh`, etc.

---

## 🧪 Pruebas y Evidencias
<!-- Describe cómo se validaron los cambios e incluye capturas de pantalla o logs si aplica. -->

- **Pasos para reproducir/probar:**
  1. 
- **Evidencias (capturas / logs / cobertura):**

---

## ✅ Checklist de Calidad
Antes de solicitar revisión, confirma que cumples con los siguientes puntos:

- [ ] Mi código sigue la guía de estilo y principios de arquitectura limpia del proyecto.
- [ ] La compilación TypeScript y Vite pasa exitosamente (`npm run build`).
- [ ] La suite de pruebas unitarias pasa al 100% (`npm test`).
- [ ] Se mantiene o incrementa la cobertura de código (`npm run test:coverage`).
- [ ] No se introducen advertencias ni errores en la consola del navegador o entorno Electron.
- [ ] Los mensajes de commit siguen la convención Conventional Commits (`tipo(alcance): mensaje`).
- [ ] La documentación (`README.md` o documentación interna) ha sido actualizada si aplica.
