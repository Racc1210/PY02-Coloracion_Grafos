import { generarPaletaColores } from "../models/utils/colorPalette";
import { contarConflictosTotales } from "../models/utils/graphAnalysis.js";
import { ALGORITHM, GRAPH_CONSTRAINTS } from "../models/constants/index.js";
import {
  calcularImpactoRecoloracion,
  calcularProbabilidadExito,
  generarSugerenciasRecoloracion,
  analizarImpacto
} from "../models/utils/recolorAnalysis.js";
import LocalSearch from "../models/algorithms/LocalSearch.js";

/**
 * Administra algoritmos de coloración de grafos y operaciones relacionadas.
 * Maneja ejecución de coloración tanto síncrona como basada en Web Worker.
 * 
 * @class ColoringController
 */
export default class ColoringController {
  /**
   * Crea una nueva instancia de ColoringController.
   * 
   * @param {Graph} graph - Referencia al modelo del grafo.
   * @param {StateManager} stateManager - Referencia al state manager.
   * @param {WorkerManager} workerManager - Referencia al worker manager.
   */
  constructor(graph, stateManager, workerManager) {
    this.graph = graph;
    this.stateManager = stateManager;
    this.workerManager = workerManager;
  }

  /**
   * Aplica mapeo de colores a los nodos del grafo.
   * 
   * @param {Object} colorMap - Mapa de IDs de nodos a nombres de colores.
   */
  applyColoring(colorMap) {
    this.graph.nodos.forEach((nodo) => {
      nodo.color = colorMap ? colorMap[nodo.id] : null;
    });

    // Marcar que el grafo tiene coloración
    if (colorMap) {
      this.stateManager.markGraphAsColored();
    }
  }

  /**
   * Recolorea manualmente un nodo y calcula métricas de impacto.
   * 
   * @param {number} nodeId - ID del nodo a recolorear.
   * @param {string} newColor - Nombre del nuevo color ("blue", "red", "green", etc.).
   * @returns {Object} Métricas de recoloreo incluyendo conflictos y sugerencias.
   */
  manualRecolor(nodeId, newColor) {
    const nodo = this.graph.nodos.find(n => n.id === nodeId);
    if (!nodo) return null;

    const oldColor = nodo.color;
    const availableColors = generarPaletaColores(this.stateManager.numColors);

    // Calcular conflictos antes de recolorear
    const conflictsBefore = contarConflictosTotales(this.graph.nodos, this.graph.aristas);

    const impact = calcularImpactoRecoloracion(
      nodeId,
      newColor,
      this.graph.nodos,
      this.graph.aristas
    );

    // Aplicar nuevo color
    nodo.color = newColor;

    // Calcular conflictos después
    const conflictsAfter = contarConflictosTotales(this.graph.nodos, this.graph.aristas);
    const conflictDelta = conflictsAfter - conflictsBefore;

    // Calcular probabilidad de éxito
    const { probabilidad, conteoRecoloreables } = calcularProbabilidadExito(
      impact.vecinosConflictivos,
      availableColors,
      this.graph.aristas,
      this.graph.nodos,
      this.stateManager.numColors
    );

    // Generar sugerencias de recoloreo
    const recolorSuggestions = generarSugerenciasRecoloracion(
      impact.vecinosConflictivos,
      availableColors,
      this.graph.aristas,
      this.graph.nodos
    );

    // Analizar impacto
    const impactAnalysis = analizarImpacto(conflictsBefore, conflictsAfter);

    // Marcar cambios manuales y limpiar stats
    this.stateManager.markManualChange();

    // Notificar cambios (updateConflictEdges ocurre automáticamente en notify)
    this.stateManager.notify();

    return {
      nodeId,
      oldColor,
      newColor,
      conflictsBefore,
      conflictsAfter,
      conflictDelta,
      conflictingNeighbors: impact.vecinosConflictivos.map(nodo => nodo.id),
      conflictingNeighborsCount: impact.vecinosConflictivos.length,
      nodesToRecolor: impact.vecinosConflictivos.length,
      canRecolorCount: conteoRecoloreables,
      successProbability: Math.round(probabilidad * 100), // Porcentaje
      totalNeighbors: impact.vecinos.length,
      recolorSuggestions,
      kColors: this.stateManager.numColors,
      impactAnalysis
    };
  }

  /**
   * Inicia el algoritmo de búsqueda local dinámico con visualización paso a paso.
   * 
   * @param {Function} [onComplete=null] - Callback que recibe resultados cuando termina.
   */
  startLocalSearchDynamic(onComplete = null) {
    this.stopDynamicRun(true);

    if (this.graph.nodos.length === 0) {
      return;
    }

    // Resetear flag de cambios manuales al iniciar búsqueda local
    this.stateManager.resetManualChanges();

    // Crear instancia del algoritmo greedy
    const algo = new LocalSearch(this.graph, this.stateManager.numColors);
    const startTime = performance.now();

    // Configurar ejecución dinámica
    this.stateManager.dynamicRun = {
      algo,
      mode: 'local-search',
      running: true,
      timerId: null,
      delay: ALGORITHM.LOCAL_SEARCH_DELAY,
      startTime,
      algorithmLabel: 'Búsqueda Local',
      onComplete  // Almacenar callback
    };

    this.stateManager.setColoringStats({
      algorithm: 'Búsqueda Local',
      dynamic: true,
      isRunning: true,
      isPaused: false,
      attempts: 0,
      conflicts: algo.initialConflicts,
      progress: 0,
      showProgress: false, // No mostrar barra de progreso para búsqueda local
    });

    this.stateManager.notify();
    this._startDynamicLoop();
  }

  /**
   * Inicia el loop de ejecución dinámica para algoritmos.
   * Método privado - maneja ejecución paso a paso del algoritmo con actualizaciones visuales.
   * 
   * @private
   */
  _startDynamicLoop() {
    const run = this.stateManager.dynamicRun;
    if (!run) return;

    const { algo, delay, mode, iterations, speed, startTime, algorithmLabel } = run;

    if (run.timerId) {
      clearInterval(run.timerId);
      run.timerId = null;
    }

    const tick = () => {
      const current = this.stateManager.dynamicRun;
      if (!current || !current.running) return;

      const stepResult = algo.step();
      const { colors, conflictEdges, stats } = stepResult;
      const now = performance.now();

      this.applyColoring(colors);
      this.stateManager.setConflictEdges(conflictEdges || []);

      // Registrar intento en historial para gráfico (solo MonteCarlo)
      if (algorithmLabel === 'Monte Carlo') {
        this.stateManager.addAttemptToHistory({
          attemptNumber: stats.attempts,
          conflicts: stats.conflicts,
          success: stats.conflicts === 0,
          timestamp: now,
        });
      }

      // Estadísticas base
      const baseStats = {
        algorithm: algorithmLabel,
        dynamic: true,
        isRunning: current.running,
        isPaused: !current.running,
        attempts: stats.attempts,
        conflicts: stats.conflicts,
        timeMs: now - startTime,
        progress: stats.progress,
        mode,
        iterations,
        speed,
      };

      // Agregar estadísticas específicas del algoritmo
      if (algorithmLabel !== 'Búsqueda Local') {
        baseStats.meanConflicts = stats.meanConflicts;
        baseStats.successRate = stats.successRate;
      }

      this.stateManager.setColoringStats(baseStats);

      // Notificar basado en algoritmo
      if (algorithmLabel === 'Búsqueda Local' || stats.attempts % 50 === 0 || stepResult.done) {
        this.stateManager.notify();
      }

      if (stepResult.done) {
        // Agregar estadísticas finales para Búsqueda Local
        if (algorithmLabel === 'Búsqueda Local') {
          this.stateManager.coloringStats.success = stats.conflicts === 0;
          this.stateManager.coloringStats.conflictsReduced = stats.conflictsReduced;
          this.stateManager.coloringStats.improvement = stats.improvement;

          // Resetear flag si todos los conflictos fueron resueltos
          if (stats.conflicts === 0) {
            this.stateManager.resetManualChanges();
          }

          // Ejecutar callback con resultados si existe
          if (current.onComplete && typeof current.onComplete === 'function') {
            const resultSummary = {
              isLocalSearchResult: true,
              recoloredCount: stats.attempts,
              conflictsReduced: stats.conflictsReduced,
              improvement: stats.improvement,
              timeMs: now - startTime,
              finalConflicts: stats.conflicts,
              success: stats.conflicts === 0,
              recoloredNodes: stats.recoloredNodes || []
            };
            // Ejecutar callback en siguiente tick para evitar bloqueo
            setTimeout(() => current.onComplete(resultSummary), 100);
          }
        }

        this.stopDynamicRun(false);
        if (this.stateManager.coloringStats) {
          this.stateManager.coloringStats.isRunning = false;
          this.stateManager.coloringStats.isPaused = false;
          if (algorithmLabel === 'Búsqueda Local') {
            this.stateManager.coloringStats.dynamic = false;
          }
          this.stateManager.notify();
        }
      }
    };

    run.timerId = setInterval(tick, delay);
    tick();
  }

  /**
   * Inicia el algoritmo de coloración usando Web Worker.
   * 
   * @param {Object} options - Opciones de coloración.
   * @param {string} options.algorithm - Tipo de algoritmo ('lasvegas-dynamic' o 'montecarlo-dynamic').
   * @param {number} [options.numColors] - Número de colores a usar.
   * @param {number} [options.iterations] - Número de iteraciones (solo MonteCarlo).
   */
  startColoringWithWorker(options) {
    this.stopDynamicRun(true);

    // Actualizar numColors en StateManager
    const numColors = options.numColors || GRAPH_CONSTRAINTS.DEFAULT_COLORS;
    this.stateManager.setNumColors(numColors);

    if (this.workerManager.isWorkerRunning()) {
      this.workerManager.terminateWorker();
    }

    // Limpiar historial para nuevo gráfico
    this.stateManager.setAttemptsHistory([]);
    this.stateManager.resetManualChanges();

    this.workerManager.initWorker();
    this.workerManager.setWorkerRunning(true);

    const isLasVegas = options.algorithm === 'lasvegas-dynamic';
    const algorithmLabel = isLasVegas ? 'Las Vegas' : 'Monte Carlo';

    // Mostrar indicador de progreso
    this.stateManager.setColoringStats({
      algorithm: algorithmLabel,
      dynamic: true,
      isRunning: true,
      isPaused: false,
      attempts: 0,
      conflicts: 0,
      progress: 0,
      showProgress: true, // Mostrar barra de progreso para algoritmos probabilísticos
    });
    this.stateManager.notify();

    // Preparar datos del grafo
    const graphData = {
      nodes: this.graph.nodos.map(nodo => ({
        id: nodo.id,
        x: nodo.x,
        y: nodo.y
      })),
      edges: this.graph.aristas.map(arista => ({
        sourceId: arista.sourceId,
        targetId: arista.targetId
      }))
    };

    if (isLasVegas) {
      this.workerManager.postMessage({
        type: 'colorLasVegas',
        data: {
          graph: graphData,
          options: { maxAttempts: Infinity, numberOfColors: this.stateManager.numColors }
        }
      });
    } else {
      this.workerManager.postMessage({
        type: 'colorMonteCarlo',
        data: {
          graph: graphData,
          options: {
            iterations: options.iterations || 1000,
            numberOfColors: this.stateManager.numColors
          }
        }
      });
    }
  }

  /**
   * Inicia el algoritmo de coloración dinámico (Las Vegas o Monte Carlo).
   * Usa automáticamente Web Worker para mejor rendimiento.
   * 
   * @param {Object} options - Configuración de coloración.
   * @param {string} options.algorithm - Tipo de algoritmo ('lasvegas-dynamic' o 'montecarlo-dynamic').
   * @param {number} [options.iterations] - Número de muestras (solo MonteCarlo).
   * @param {number} [options.numColors] - Número de colores a usar.
   * @param {string} [options.speed] - Velocidad de ejecución ('fast' o 'slow').
   * @param {Function} [options.onNoSolutionFound] - Callback cuando no se encuentra solución.
   */
  startDynamicColoring(options) {
    this.stopDynamicRun(true);
    // Guardar callback en el state manager para usarlo después
    this.stateManager.onNoSolutionFoundCallback = options.onNoSolutionFound || null;
    // Siempre usar Web Worker para mejor rendimiento
    this.startColoringWithWorker(options);
  }

  /**
   * Detiene la ejecución del algoritmo dinámico.
   * 
   * @param {boolean} [clearStats=true] - Si limpiar las estadísticas de coloración.
   */
  stopDynamicRun(clearStats = true) {
    if (this.stateManager.dynamicRun && this.stateManager.dynamicRun.timerId) {
      clearInterval(this.stateManager.dynamicRun.timerId);
    }
    this.stateManager.dynamicRun = null;

    // Terminar worker si está corriendo para liberar memoria
    if (this.workerManager && this.workerManager.isWorkerRunning()) {
      this.workerManager.terminateWorker();
    }

    if (clearStats) {
      this.stateManager.setColoringStats(null);
      this.stateManager.setConflictEdges([]);
      this.stateManager.notify();
    }
  }
}
