import { generarPaletaColores } from '../utils/colorPalette.js';
import { evaluarColoracion } from '../utils/graphEvaluation.js';
import { ALGORITHM } from '../constants/index.js';

/**
 * Clase base abstracta para los algoritmos de coloración de grafos.
 * Provee funcionalidad compartida para los algoritmos Las Vegas y Monte Carlo.
 * @abstract
 * @class
 */
export default class BaseAlgorithm {
    /**
     * Crea una nueva instancia del algoritmo.
     * @param {Graph} graph - la instancia del grafo.
     * @param {Object} [options={}] - Opciones de configuración del algoritmo.
     * @param {number} [options.numberOfColors] - Número de colores a usar.
     */
    constructor(graph, options = {}) {
        /** @type {Array<Node>} Referencia a los nodos del grafo. */
        this.nodes = graph.nodos;

        /** @type {Array<Edge>} Referencia a las aristas del grafo. */
        this.edges = graph.aristas;

        /** @type {number} Número de colores disponibles. */
        this.numberOfColors = options.numberOfColors ?? 3;

        /** @type {Array<string>} Paleta de colores. */
        this.availableColors = generarPaletaColores(this.numberOfColors);

        /** @type {number} Número total de intentos realizados. */
        this.attempts = 0;

        /** @type {number} Suma acumulada de todos los conflictos encontrados. */
        this.totalConflicts = 0;

        /** @type {number} Número de coloraciones exitosas encontradas. */
        this.successCount = 0;

        /** @type {Object|null} Mejor coloración encontrada. */
        this.bestColors = {};

        /** @type {Object} Mejor resultado de evaluación con mínimo de conflictos. */
        this.bestEvaluation = { conflicts: Infinity, conflictEdges: [] };

        /** @type {boolean} flag de ejecucion del algoritmo. */
        this.finished = false;

        /** @type {Array<Object>} historial del intentos */
        this.attemptsHistory = [];
    }

    /**
     * Evalúa una coloración y cuenta los conflictos.
     * @param {Object} mapaColores - Mapa de nodeId -> color.
     * @returns {Object} Resultado de evaluación con conflicts y conflictEdges.
     * @protected
     */
    evaluarColoracion(mapaColores) {
        return evaluarColoracion(this.edges, mapaColores);
    }

    /**
     * Obtiene el número máximo de intentos permitidos.
     * Debe ser implementado por las subclases.
     * @returns {number} Máximo de intentos.
     * @abstract
     */
    obtenerMaximoIntentos() {
        throw new Error('obtenerMaximoIntentos() debe ser implementado por la subclase');
    }

    /**
     * Guarda un intento en el historial.
     * @param {number} conflictos - Número de conflictos en este intento.
     * @param {boolean} exito - Si el coloreo fue exitoso.
     * @protected
     */
    guardarIntentoEnHistorial(conflictos, exito) {
        this.attemptsHistory.push({
            attemptNumber: this.attempts,
            conflicts: conflictos,
            success: exito,
            timestamp: Date.now()
        });
    }

    /**
     * Actualiza la mejor solución encontrada hasta ahora si la actual es mejor.
     * @param {Object} colores - Asignación de colores.
     * @param {number} conflictos - Número de conflictos.
     * @param {Array} aristasConflicto - Aristas en conflicto.
     * @protected
     */
    actualizarMejorSolucion(colores, conflictos, aristasConflicto) {
        if (conflictos < this.bestEvaluation.conflicts) {
            this.bestEvaluation = { conflicts: conflictos, conflictEdges: aristasConflicto };
            this.bestColors = colores;
        }
    }

    /**
     * Actualiza las estadísticas acumuladas después de un intento.
     * @param {number} conflicts - Número de conflictos en este intento.
     * @param {boolean} success - Si este intento fue exitoso.
     * @protected
     */
    updateStatistics(conflicts, success) {
        this.attempts++;
        this.totalConflicts += conflicts;
        if (success) {
            this.successCount++;
        }
    }

    /**
     * Ejecuta el algoritmo completo con reporte de progreso.
     * @param {Function} progressCallback - Callback invocado periódicamente con actualizaciones de progreso.
     * @returns {Object} Resultado final con colors, conflictEdges y statistics.
     */
    run(progressCallback) {
        let lastStepResult = null;

        while (true) {
            lastStepResult = this.step();

            const shouldReportProgress = (this.attempts % ALGORITHM.BATCH_SIZE === 0) || lastStepResult.done;
            if (progressCallback && shouldReportProgress) {
                const progress = this.calculateProgress();
                progressCallback({
                    progress,
                    attempts: this.attempts,
                    conflicts: lastStepResult.stats.conflicts,
                    colors: lastStepResult.colors,
                    conflictEdges: lastStepResult.conflictEdges,
                    meanConflicts: lastStepResult.stats.meanConflicts,
                    successRate: lastStepResult.stats.successRate,
                    currentAttempt: lastStepResult.currentAttempt
                });
            }

            if (lastStepResult.done) break;
        }

        return {
            colors: lastStepResult.colors,
            conflictEdges: lastStepResult.conflictEdges,
            stats: {
                attempts: lastStepResult.stats.attempts,
                conflicts: lastStepResult.stats.conflicts,
                meanConflicts: lastStepResult.stats.meanConflicts,
                successRate: lastStepResult.stats.successRate,
            },
        };
    }

    /**
     * Calcula el progreso actual como una fracción 
     * Debe ser implementado por las subclases.
     * @returns {number} Fracción de progreso entre.
     * @abstract
     */
    calculateProgress() {
        throw new Error('calculateProgress() debe ser implementado por la subclase');
    }

    /**
     * Ejecuta un paso/iteración del algoritmo.
     * Debe ser implementado por las subclases.
     * @returns {Object} Resultado del paso con flag done, colors, conflictEdges y stats.
     * @abstract
     */
    step() {
        throw new Error('step() debe ser implementado por la subclase');
    }
}
