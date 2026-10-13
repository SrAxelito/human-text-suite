# HumanTextSuite 🧠✨
### Detector de Texto Generado por IA, Corrección de Estilo y Motor de Humanización de Contenido

![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)
![Coverage](https://img.shields.io/badge/coverage->92%25-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Architecture](https://img.shields.io/badge/architecture-Clean%20Architecture-purple.svg)

---

## 📋 1. Visión General del Proyecto

**HumanTextSuite** es una solución de ingeniería de software diseñada desde cero para la detección estadística y probabilística de texto sintético generado por Modelos de Lenguaje Grande (LLMs como ChatGPT, Claude, Gemini, etc.), combinada con temas visuales claro/oscuro, scrollbar estilizado, navegación optimizada por clic, segmentación inteligente para documentos extensos, importación de documentos Word (.docx), un motor desacoplado de reescritura, humanización de contenido y reanálisis comparativo cuantitativo (*Diff View*).

### Novedades en v1.3.0:
- **Navegación Exclusiva por Clic en el Visor:** Eliminación del auto-scroll y saltos de pantalla al pasar el cursor sobre oraciones o indicadores; navegación fluida (*smooth scroll*) y actualización de la tarjeta de inspección activadas únicamente mediante clic explícito.
- **Barra de Desplazamiento Personalizada (*Custom Scrollbar*):** Riel (*track*) y tirador (*thumb*) discretos de 7px con bordes redondeados y transiciones dinámicas al interactuar, compatibles con todos los paneles y contenedores con scroll.
- **Selector de Modo Claro / Oscuro con Botón de Engranaje:** Menú de configuración en la esquina superior derecha con interruptor animado (sol/luna), paletas completas adaptadas para óptimo contraste en ambos modos y persistencia automática en `localStorage` mediante `TemaService`.

### Novedades en v1.2.0:
- **Segmentación Semántica Inteligente (`ChunkingService`):** Algoritmo de fragmentación en bloques seguros (10.000 a 15.000 caracteres o ~2.500 palabras) respetando límites de párrafos (`\n\n`), encabezados y oraciones sin cortar palabras a la mitad, preservando el 100% de los offsets de caracteres del documento original.
- **Procesador Asíncrono en Cola (`BatchProcessingService`):** Orquestador secuencial que despacha bloques controladamente sin congelar el hilo principal ni saturar la memoria, con soporte para reintentos granulares y tolerancia a fallos.
- **Consolidación Ponderada Global (`MetricasAggregator`):** Cálculo ponderado de probabilidades de autoría y recálculo de cadencia (*burstiness*), perplejidad y diversidad léxica a escala completa del documento con remapeo continuo de oraciones y párrafos.
- **Barra de Progreso Reactiva & Renderizado Progresivo en UI:** Componente flotante que refleja en tiempo real el porcentaje de avance, contador de bloques ("Bloque 3 de 8"), tiempo estimado restante y botón para cancelar el análisis limpiamente en cualquier instante.
- **Levantamiento del Límite de 50.000 Caracteres:** Configuración escalable hasta 5.000.000 de caracteres para analizar tesis, libros e informes extensos.

### Novedades en v1.1.0:
- **Importador de Documentos Word (`DocumentReaderService`):** Parsing estructural y sanitización de archivos `.docx` de hasta 15 MB con dropzone interactivo de arrastrar y soltar.
- **Rediseño Visual Limpio con Marcadores en el Margen (*Gutter Markers*):** Franja lateral con pines discretos (Verde, Ámbar, Rojo/Coral) y subrayados tenues que garantizan una lectura óptima.
- **Tarjeta de Inspección Contextual Flotante:** Panel interactivo al pasar el cursor o hacer clic sobre cualquier oración con desglose de perplejidad, longitud y motivo diagnóstico.

A diferencia de detectores basados en llamadas a APIs opacas, **HumanTextSuite** implementa un motor estadístico local autónomo basado en:
1. **Perplejidad y Entropía Cruzada:** Modelo de N-gramas y transiciones subléxicas.
2. **Cadencia y Burstiness:** Medición de varianza y coeficiente de variación ($CV$) en la longitud y ritmo oracional.
3. **Huellas y Clichés de LLM:** Detección de conectores hiper-formales, muletillas académicas y estructuras binarias formulaicas.
4. **Pipeline de Humanización Multimodo:** 3 niveles de agresividad (*Ligero*, *Equilibrado*, *Profundo*) con reanálisis automático instantáneo para verificar la reducción matemática del score sintético.

---

## 🏛️ 2. Arquitectura de Software (Clean Architecture)

El proyecto sigue estrictamente los principios de **Arquitectura Limpia**, garantizando un desacoplamiento total entre las reglas de negocio, los algoritmos analíticos y la interfaz de usuario:

```
src/
├── core/
│   ├── domain/                         # CAPA DE DOMINIO (Reglas de negocio puras)
│   │   ├── entities/                   # Entidades tipadas (MetricasDeteccion, OracionAnalizada, etc.)
│   │   ├── enums/                      # Enums (ClasificacionIA, ModoHumanizacion)
│   │   ├── errors/                     # Excepciones de dominio (ErrorTextoVacio, ErrorTextoExcedeLimite)
│   │   └── interfaces/                 # Contratos de servicio (AnalizadorTexto, HumanizadorTexto, SegmentadorTexto)
│   ├── infrastructure/                 # CAPA DE INFRAESTRUCTURA (Algoritmos e I/O)
│   │   ├── config/                     # ConfigService singleton centralizado
│   │   ├── nlp/                        # Algoritmos NLP (Tokenizer, SentenceSplitter, NGramLanguageModel,
│   │   │                               # PerplexityCalculator, BurstinessCalculator, LLMMarkersDetector)
│   │   ├── rewriting/                  # Pipeline de reescritura (Dictionaries, VocabularyReplacer,
│   │   │                               # SentenceRestructurer, CadenceVariator)
│   │   ├── diff/                       # DiffEngine (cálculo de adiciones/eliminaciones)
│   │   └── export/                     # ReportExporter (JSON / Markdown)
│   └── services/                       # CAPA DE SERVICIOS / APLICACIÓN (Casos de uso)
│       ├── DetectorService.ts          # Orquestador del análisis y scoring de IA
│       └── HumanizadorService.ts       # Orquestador de reescritura y reanálisis automático
└── presentation/                       # CAPA DE PRESENTACIÓN / UI
    ├── components/                     # Componentes modulares (Header, TextEditor, SentenceHighlighter,
    │                                   # MetricsDashboard, DiffViewer, ActionsToolbar, ExportModal)
    ├── state/                          # AppStore (gestor reactivo de estado con patrón Observer)
    ├── styles/                         # index.css (Design system con glassmorphism y paleta HSL/Dark)
    └── App.ts                          # Ensamblador principal de la interfaz
```

---

## 🔬 3. Fundamentos Algorítmicos y Matemáticos

### 3.1. Perplejidad ($PPL$) y Entropía Cruzada
La perplejidad cuantifica qué tan "sorprendido" se encuentra un modelo probabilístico ante una secuencia de texto:

$$PPL(W) = \exp\left( - \frac{1}{N} \sum_{i=1}^N \ln P(w_i \mid w_{i-1}, \dots) \right)$$

- **Textos de LLMs:** Al generar texto seleccionando tokens con alta probabilidad condicional (baja entropía), exhiben una perplejidad baja y predecible.
- **Textos Humanos:** Incorporan giros coloquiales, léxico variado y transiciones inesperadas, resultando en perplejidad y entropía altas.

### 3.2. Cadencia y Variabilidad (*Burstiness*)
El ritmo humano natural alterna oraciones breves y contundentes con oraciones compuestas y subordinadas. Los LLMs tienden a generar oraciones con longitud homogénea (16–22 palabras).

El sistema calcula:
- Media de longitud: $\mu = \frac{1}{k}\sum l_i$
- Desviación estándar: $\sigma = \sqrt{\frac{1}{k}\sum (l_i - \mu)^2}$
- **Coeficiente de Variación:** $CV = \frac{\sigma}{\mu}$

$$CV < 0.25 \implies \text{Monotonía extrema (Patrón característico de LLM)}$$
$$CV > 0.50 \implies \text{Alta asimetría y variación (Patrón orgánico humano)}$$

### 3.3. Detección de Huellas de LLM y Conectores Clichés
Se analiza la densidad de más de 45 conectores y estructuras formulaicas recurrentes en español e inglés:
- *Conectores hiper-formales:* "en resumen", "es fundamental destacar que", "por consiguiente", "en última instancia", "juega un papel crucial", "cabe señalar que".
- *Muletillas académicas:* "intrínsecamente", "paradigma", "holístico", "sinérgico", "multifacético", "catalizador", "indiscutiblemente".
- *Paralelismos formulaicos:* Estructuras binarias rígidas ("Por un lado... Por otro lado...", "No solo... sino también...").

### 3.4. Ensamble Ponderado y Calibración
El puntaje global de probabilidad de autoría sintética ($Score_{AI} \in [1, 99]$) combina las tres dimensiones con factores de ensamble cruzado:

$$Score_{AI} = w_{ppl} \cdot S_{ppl} + w_{burst} \cdot S_{burst} + w_{cliche} \cdot S_{cliche} + \Delta_{lex}$$

Categorías resultantes:
- **Altamente probable de IA:** $Score \ge 70\%$ (Rojo 🔴)
- **Mixto / Dudoso:** $35\% \le Score < 70\%$ (Amarillo 🟡)
- **Probablemente humano:** $Score < 35\%$ (Verde 🟢)

---

## ⚡ 4. Pipeline de Humanización y Reanálisis Automático

El motor de reescritura (`HumanizadorService`) ejecuta un flujo de tres fases:
1. **Desarticulación Sintáctica (`SentenceRestructurer`):** Quiebra paralelismos forzados y fragmenta oraciones de longitud monótona.
2. **Sustitución Léxica Multimodo (`VocabularyReplacer`):** Reemplaza conectores artificiales por transiciones naturales según el nivel seleccionado:
   - **Modo Ligero:** Ajustes sutiles de puntuación y sinonimia suave.
   - **Modo Equilibrado:** Reordenamiento sintáctico y alternancia rítmica moderada.
   - **Modo Profundo:** Paráfrasis exhaustiva, desarticulación completa del ritmo discursivo y máxima naturalidad.
3. **Modulación de Cadencia (`CadenceVariator`):** Inyecta incisos orgánicos y variedad de pausas.
4. **Reanálisis Automático:** Reinyecta el texto transformado a `DetectorService` para verificar matemáticamente la disminución de la probabilidad sintética.
5. **Visor Diferencial (`DiffEngine`):** Calcula tokens agregados (+), eliminados (-) y similitud porcentual.

---

## 🚀 5. Instalación y Ejecución Local

### Prerrequisitos
- Node.js >= 18.0.0 (probado en Node.js v20 LTS y v22)
- npm >= 9.0.0

### Instalación de dependencias
```bash
npm install
```

### Ejecutar servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible localmente en `http://localhost:5173`.

### Compilar para producción
```bash
npm run build
```

### Previsualizar compilación de producción
```bash
npm run preview
```

---

## 🧪 6. Suite de Pruebas Automatizadas y Cobertura

El proyecto cuenta con 32 pruebas automatizadas distribuidas en pruebas unitarias, de integración y de tolerancia a fallos.

### Ejecutar las pruebas
```bash
npm test
```

### Ejecutar con reporte de cobertura de código
```bash
npm run test:coverage
```

### Métricas de Cobertura Obtenidas
| Capa / Módulo | Declaraciones (Stmts) | Ramas (Branch) | Funciones (Funcs) | Líneas (Lines) |
|---|---|---|---|---|
| **Capa de Dominio** (`core/domain`) | **100%** | **100%** | **100%** | **100%** |
| **Capa de Servicios** (`core/services`) | **98.11%** | **91.07%** | **100%** | **98.11%** |
| **Capa de Infraestructura** (`core/infrastructure`) | **95.8%** | **83.3%** | **98.0%** | **95.8%** |
| **Total Global del Proyecto** | **96.73%** | **85.17%** | **98.07%** | **96.73%** |

*(Supera con creces el umbral exigido de $\ge 85\%$ en servicios y dominio).*

---

## 📦 7. Scripts del Proyecto (`package.json`)

- `npm run dev`: Inicia el servidor de desarrollo Vite con Hot Module Replacement (HMR).
- `npm run build`: Valida tipos TypeScript y genera los paquetes optimizados en `/dist`.
- `npm run preview`: Previsualiza localmente el build de producción.
- `npm test`: Ejecuta las pruebas automatizadas con Vitest.
- `npm run test:coverage`: Ejecuta la suite y genera reporte gráfico de cobertura V8.

---

## 📄 8. Licencia
Este proyecto está licenciado bajo los términos de la Licencia MIT.
