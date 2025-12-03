// src/controllers/StateManager.js
import { obtenerAristasConflicto } from "../models/utils/graphAnalysis.js";
import { GRAPH_CONSTRAINTS } from "../models/constants/index.js";

/**
 * Administra el estado de la aplicación e implementa el patrón Observer para actualizaciones de estado.
 * Coordina la sincronización de estado entre el controlador y los componentes de UI.
 * 
 * @class StateManager
 */
export default class StateManager {
  /**
   * Crea una nueva instancia de StateManager.
   * 
   * @param {Graph} graph - Referencia al modelo del grafo.
   */
  constructor(graph) {
    this.graph = graph;
    this.listeners = new Set();

    // Estado de coloración
    this.coloringStats = null;
    this.conflictEdges = [];
    this.numColors = GRAPH_CONSTRAINTS.DEFAULT_COLORS; // Número de colores disponibles (3-10)
    this.attemptsHistory = []; // Historial para gráfico de MonteCarlo
    this.hasManualChanges = false; // Detecta recoloreo manual
    this.hasColoredGraph = false; // Flag indicando si el grafo tiene coloración

    // Throttling para notificaciones
    this._ultimaNotificacion = null;
    this._notificacionPendiente = null;

    // Estado de ejecución dinámica (cualquier algoritmo)
    this.dynamicRun = null; // { algo, mode, iterations, speed, delay, running, timerId, startTime, algorithmLabel }
  }

  /**
   * Obtiene el snapshot del estado actual del grafo.
   * 
   * @returns {Object} Estado actual incluyendo nodos, aristas, stats y flags.
   */
  getSnapshot() {
    return {
      nodos: [...this.graph.nodos],
      aristas: [...this.graph.aristas],
      coloringStats: this.coloringStats,
      conflictEdges: [...this.conflictEdges],
      attemptsHistory: this.attemptsHistory || [],
      hasManualChanges: this.hasManualChanges,
      hasColoredGraph: this.hasColoredGraph,
    };
  }

  /**
   * Suscribe un listener a los cambios de estado.
   * 
   * @param {Function} listener - Función callback para recibir actualizaciones de estado.
   * @returns {Function} Función para desuscribirse.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifica a todos los listeners de cambios de estado.
   * Actualiza automáticamente las aristas en conflicto si la coloración está activa o el grafo tiene coloración.
   * @param {boolean} [force=false] - Si true, notifica inmediatamente sin throttling.
   */
  notify(force = false) {
    const ahora = performance.now();
    if (!force && this._ultimaNotificacion && (ahora - this._ultimaNotificacion) < 50) {
      if (this._notificacionPendiente) {
        clearTimeout(this._notificacionPendiente);
      }
      this._notificacionPendiente = setTimeout(() => {
        this._notificacionPendiente = null;
        this.notify(true);
      }, 50);
      return;
    }

    this._ultimaNotificacion = ahora;

    // Actualizar conflictos automáticamente si el grafo tiene coloración
    if (this.hasColoredGraph) {
      this.conflictEdges = obtenerAristasConflicto(this.graph.nodos, this.graph.aristas);
    }

    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  /**
   * Resetea el estado de coloración a valores iniciales.
   */
  resetColoringState() {
    this.coloringStats = null;
    this.conflictEdges = [];
    this.attemptsHistory = [];
    this.hasManualChanges = false;
    this.hasColoredGraph = false;
  }



  /**
   * Actualiza el número de colores disponibles para colorear.
   * 
   * @param {number} numColors - Número de colores (3-10).
   */
  setNumColors(numColors) {
    this.numColors = numColors;
  }

  /**
   * Marca el grafo como que tiene cambios manuales.
   * Limpia stats pero mantiene aristas en conflicto (serán recalculadas en notify).
   */
  markManualChange() {
    this.hasManualChanges = true;
    this.coloringStats = null;
    this.attemptsHistory = [];
    // Mantener conflictEdges - serán actualizadas en notify()
  }

  /**
   * Resetea el flag de cambios manuales.
   */
  resetManualChanges() {
    this.hasManualChanges = false;
  }

  /**
   * Establece las estadísticas de coloración.
   * 
   * @param {Object} stats - Objeto de estadísticas de coloración.
   */
  setColoringStats(stats) {
    this.coloringStats = stats;
  }

  /**
   * Actualiza el array de aristas en conflicto.
   * 
   * @param {Array} conflictEdges - Array de objetos de aristas en conflicto.
   */
  setConflictEdges(conflictEdges) {
    this.conflictEdges = conflictEdges;
  }

  /**
   * Agrega un intento al historial (gráfico de MonteCarlo).
   * 
   * @param {Object} attempt - Datos del intento con attemptNumber, conflicts, success, timestamp.
   */
  addAttemptToHistory(attempt) {
    this.attemptsHistory.push(attempt);
  }

  /**
   * Agrega múltiples intentos al historial de una vez (optimización batch).
   * 
   * @param {Array<Object>} attempts - Array de intentos a agregar.
   */
  addAttemptsToHistoryBatch(attempts) {
    if (attempts && attempts.length > 0) {
      this.attemptsHistory.push(...attempts);
    }
  }

  /**
   * Establece el historial completo de intentos.
   * 
   * @param {Array} history - Array de objetos de intentos.
   */
  setAttemptsHistory(history) {
    this.attemptsHistory = history;
    // Si se limpia el historial, limpiar timeout pendiente
    if (history.length === 0 && this._notificacionPendiente) {
      clearTimeout(this._notificacionPendiente);
      this._notificacionPendiente = null;
      this._ultimaNotificacion = null;
    }
  }

  /**
   * Marca que el grafo ha sido coloreado.
   */
  markGraphAsColored() {
    this.hasColoredGraph = true;
  }
}
