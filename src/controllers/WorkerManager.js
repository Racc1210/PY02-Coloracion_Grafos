/**
 * Administra el ciclo de vida y comunicación del Web Worker para procesamiento en segundo plano.
 * Maneja cómputo de layout y algoritmos de coloración para grafos grandes.
 * 
 * @class WorkerManager
 */
export default class WorkerManager {
  /**
   * Crea una nueva instancia de WorkerManager.
   * 
   * @param {StateManager} stateManager - Referencia al state manager.
   * @param {Function} applyColoringCallback - Callback para aplicar coloración al grafo.
   */
  constructor(stateManager, applyColoringCallback) {
    this.stateManager = stateManager;
    this.applyColoring = applyColoringCallback;
    this.worker = null;
    this.workerRunning = false;
  }

  /**
   * Inicializa el Web Worker para procesamiento en segundo plano.
   */
  initWorker() {
    if (this.worker) return;

    this.worker = new Worker(
      new URL('../controllers/workers/GraphWorker.js', import.meta.url),
      { type: 'module' }
    );

    this.worker.onmessage = (event) => {
      this._handleWorkerMessage(event);
    };

    this.worker.onerror = (error) => {
      console.error('Worker error:', error);
      this.workerRunning = false;
      this.stateManager.setColoringStats(null);
      this.stateManager.notify();
    };
  }

  /**
   * Maneja los mensajes recibidos del Web Worker.
   * 
   * @private
   * @param {MessageEvent} event - Evento de mensaje del worker.
   */
  _handleWorkerMessage(event) {
    const { type, ...data } = event.data;

    switch (type) {
      case 'colorProgress':
        this._handleColorProgress(data);
        break;
      case 'colorComplete':
        this._handleColorComplete(data);
        break;
      case 'error':
        this._handleError(data);
        break;
      default:
        console.warn('Unknown worker message type:', type);
    }
  }

  /**
   * Maneja actualizaciones de progreso de coloración del worker.
   * 
   * @private
   * @param {Object} data - Datos de progreso con colors y estadísticas.
   */
  _handleColorProgress(data) {
    if (!this.stateManager.coloringStats) return;

    // Actualizar estadísticas
    this.stateManager.coloringStats.attempts = data.attempts;
    this.stateManager.coloringStats.conflicts = data.conflicts;
    this.stateManager.coloringStats.progress = data.progress;

    // Actualizar estadísticas adicionales en tiempo real
    if (typeof data.meanConflicts !== 'undefined') {
      this.stateManager.coloringStats.meanConflicts = data.meanConflicts;
    }
    if (typeof data.successRate !== 'undefined') {
      this.stateManager.coloringStats.successRate = data.successRate;
    }
    if (typeof data.timeMs !== 'undefined') {
      this.stateManager.coloringStats.timeMs = data.timeMs;
    }

    // Aplicar colores intermedios y conflictEdges para actualizaciones en tiempo real
    if (data.colors) {
      this.applyColoring(data.colors);
    }
    if (data.conflictEdges) {
      this.stateManager.setConflictEdges(data.conflictEdges);
    }

    // Registrar en historial para gráfico
    if (data.newAttempts && data.newAttempts.length > 0) {
      // Agregar solo los nuevos intentos 
      this.stateManager.addAttemptsToHistoryBatch(data.newAttempts);
    }

    const deberiaForzarNotificacion = data.attempts % 50 === 0;
    this.stateManager.notify(deberiaForzarNotificacion);
  }

  /**
   * Maneja la finalización de coloración del worker.
   * 
   * @private
   * @param {Object} data - Resultado final de coloración y estadísticas.
   */
  _handleColorComplete(data) {
    // Aplicar resultado de coloración
    this.applyColoring(data.result.colors);
    this.stateManager.setConflictEdges(data.result.conflictEdges || []);

    // El historial ya fue acumulado incrementalmente durante el progreso
    // Solo se usa attemptsHistory como fallback si no hubo progreso reportado
    if (data.result.attemptsHistory && this.stateManager.attemptsHistory.length === 0) {
      this.stateManager.setAttemptsHistory([...data.result.attemptsHistory]);
    }

    const estadisticasFinales = {
      algorithm: data.algorithm,
      dynamic: false,
      isRunning: false,
      isPaused: false,
      attempts: data.result.stats.attempts,
      conflicts: data.result.stats.conflicts,
      meanConflicts: data.result.stats.meanConflicts,
      successRate: data.result.stats.successRate,
      timeMs: data.result.stats.timeMs,
      progress: 1,
    };

    this.stateManager.setColoringStats(estadisticasFinales);

    // Verificar si no se encontró solución válida  y ejecutar callback
    const noSeEncontroSolucion = data.result.stats.conflicts > 0;
    if (noSeEncontroSolucion && this.stateManager.onNoSolutionFoundCallback) {
      // Ejecutar callback en siguiente tick para permitir que la UI se actualice primero
      setTimeout(() => {
        if (this.stateManager.onNoSolutionFoundCallback) {
          this.stateManager.onNoSolutionFoundCallback(estadisticasFinales);
          // Limpiar callback después de usarlo
          this.stateManager.onNoSolutionFoundCallback = null;
        }
      }, 500);
    }

    this.workerRunning = false;

    // Terminar worker para liberar memoria
    this.terminateWorker();

    this.stateManager.notify(true);
  }

  /**
   * Maneja errores del worker.
   * 
   * @private
   * @param {Object} data - Datos del error.
   */
  _handleError(data) {
    console.error('Worker error:', data.error);
    this.workerRunning = false;
    this.terminateWorker();
    this.stateManager.setColoringStats(null);
    this.stateManager.notify(true);
  }

  /**
   * Termina el Web Worker y limpia los recursos.
   */
  terminateWorker() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.workerRunning = false;
    }
  }

  /**
   * Verifica si el worker está actualmente ejecutándose.
   * 
   * @returns {boolean} True si el worker está ejecutándose.
   */
  isWorkerRunning() {
    return this.workerRunning;
  }

  /**
   * Establece el estado de ejecución del worker.
   * 
   * @param {boolean} running - Estado de ejecución.
   */
  setWorkerRunning(running) {
    this.workerRunning = running;
  }

  /**
   * Envía un mensaje al worker.
   * 
   * @param {Object} message - Objeto de mensaje para enviar al worker.
   */
  postMessage(message) {
    if (!this.worker) {
      this.initWorker();
    }
    this.worker.postMessage(message);
  }
}
