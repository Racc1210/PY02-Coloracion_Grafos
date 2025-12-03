import BaseAlgorithm from './BaseAlgorithm.js';
import { coloracionAleatoria, calcularEstadisticasAlgoritmo } from '../utils/graphEvaluation.js';

/**
 * Algoritmo Monte Carlo para colorear grafos.
 * retorna la mejor encontrada.
 * Provee soluciones aproximadas con tiempo de ejecución garantizado.
 * @extends BaseAlgorithm
 * @class
 */
export default class MonteCarlo extends BaseAlgorithm {
  /**
   * Crea una nueva instancia del algoritmo Monte Carlo.
   * @param {Graph} graph - El grafo a colorear.
   * @param {Object} [options={}] - Opciones del algoritmo.
   * @param {number} [options.iterations=1000] - Número de muestras a generar.
   * @param {number} [options.numberOfColors] - Número de colores.
   */
  constructor(graph, options = {}) {
    super(graph, options);

    /** @type {number} Número total de iteraciones. */
    this.iterations = options.iterations ?? 1000;
  }

  /**
   * @inheritdoc
   */
  obtenerMaximoIntentos() {
    return this.iterations;
  }

  /**
   * @inheritdoc
   */
  calculateProgress() {
    return this.iterations > 0 ? this.attempts / this.iterations : 0;
  }

  /**
   * Ejecuta una iteración de Monte Carlo.
   * @returns {Object} Resultado del paso con flag done, colors, edges y estadísticas.
   * @override
   */
  step() {
    if (this.finished || this.attempts >= this.iterations) {
      this.finished = true;
      const stats = calcularEstadisticasAlgoritmo(
        this.attempts,
        this.successCount,
        this.totalConflicts,
        this.bestEvaluation.conflicts,
        this.obtenerMaximoIntentos()
      );
      return {
        done: true,
        colors: this.bestColors || {},
        conflictEdges: this.bestEvaluation.conflictEdges,
        stats,
        currentAttempt: {
          conflicts: this.bestEvaluation.conflicts,
          success: this.bestEvaluation.conflicts === 0
        }
      };
    }

    const colors = coloracionAleatoria(this.nodes, this.availableColors);
    const evalResult = this.evaluarColoracion(colors);
    const { conflicts, conflictEdges } = evalResult;
    const success = conflicts === 0;

    this.updateStatistics(conflicts, success);
    this.guardarIntentoEnHistorial(conflicts, success);

    // Actualizar si encontramos una mejor solución
    if (conflicts < this.bestEvaluation.conflicts) {
      this.actualizarMejorSolucion(colors, conflicts, conflictEdges);
    }

    const stats = calcularEstadisticasAlgoritmo(
      this.attempts,
      this.successCount,
      this.totalConflicts,
      this.bestEvaluation.conflicts,
      this.obtenerMaximoIntentos()
    );

    return {
      done: this.finished || this.attempts >= this.iterations,
      colors: this.bestColors || {},
      conflictEdges: this.bestEvaluation.conflictEdges,
      stats,
      currentAttempt: {
        conflicts,
        success
      }
    };
  }
}
