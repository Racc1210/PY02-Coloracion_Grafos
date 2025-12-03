import BaseAlgorithm from './BaseAlgorithm.js';
import { coloracionAleatoria, calcularEstadisticasAlgoritmo } from '../utils/graphEvaluation.js';

/**
 * Algoritmo Las Vegas para colorear grafos.
 * Genera coloraciones aleatorias hasta encontrar una válida.
 * Garantiza que la respuesta que de (si del todo da una respuesta) sea valida.
 * @extends BaseAlgorithm
 * @class
 */
export default class LasVegas extends BaseAlgorithm {
  /**
   * Crea una nueva instancia del algoritmo Las Vegas.
   * @param {Graph} graph - El grafo a colorear.
   * @param {Object} [options={}] - Opciones del algoritmo.
   * @param {number} [options.maxAttempts=Infinity] - Número máximo de intentos.
   * @param {number} [options.numberOfColors] - Número de colores.
   */
  constructor(graph, options = {}) {
    super(graph, options);

    /** @type {number} Número máximo de intentos de coloración. */
    this.maxAttempts = options.maxAttempts ?? Infinity;
  }

  /**
   * @inheritdoc
   */
  obtenerMaximoIntentos() {
    return this.maxAttempts;
  }

  /**
   * @inheritdoc
   */
  calculateProgress() {
    return this.maxAttempts === Infinity ? 0 : this.attempts / this.maxAttempts;
  }

  /**
   * Ejecuta una iteración de Las Vegas.
   * @returns {Object} Resultado del paso con flag done, colors, edges y estadísticas.
   * @override
   */
  step() {
    if (this.finished || this.attempts >= this.maxAttempts) {
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

    const attempt = {
      colors,
      success: evalResult.conflicts === 0,
      conflicts: evalResult.conflicts,
      conflictEdges: evalResult.conflictEdges,
    };

    this.updateStatistics(attempt.conflicts, attempt.success);
    this.guardarIntentoEnHistorial(attempt.conflicts, attempt.success);
    this.actualizarMejorSolucion(attempt.colors, attempt.conflicts, attempt.conflictEdges);

    if (attempt.success) this.finished = true;

    const stats = calcularEstadisticasAlgoritmo(
      this.attempts,
      this.successCount,
      this.totalConflicts,
      this.bestEvaluation.conflicts,
      this.obtenerMaximoIntentos()
    );

    return {
      done: this.finished || this.attempts >= this.maxAttempts,
      colors: this.bestColors || attempt.colors,
      conflictEdges: this.bestEvaluation.conflictEdges,
      stats,
      currentAttempt: {
        conflicts: attempt.conflicts,
        success: attempt.success
      }
    };
  }
}