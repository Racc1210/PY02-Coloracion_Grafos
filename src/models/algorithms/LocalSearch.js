import { generarPaletaColores } from "../utils/colorPalette";
import { obtenerAristasConflicto, contarConflictosConColor } from "../utils/graphAnalysis";

/**
 * Algoritmo greedy de Búsqueda Local para optimización de coloración de grafos.
 * Mejora de forma iterativa la coloración existente recoloreando nodos en conflicto
 * para minimizar conflictos usando decisiones locales greedy.
 * @class
 */
export default class LocalSearch {
    /**
     * Crea un nuevo optimizador de búsqueda local.
     * @param {Graph} graph - El grafo con una coloración inicial.
     * @param {number} numberOfColors - Número de colores disponibles.
     */
    constructor(graph, numberOfColors) {
        /** @type {Graph} Referencia al grafo siendo optimizado. */
        this.graph = graph;

        /** @type {number} Número de colores disponibles para recolorear. */
        this.numberOfColors = numberOfColors;

        /** @type {Array<string>} Paleta de colores disponible. */
        this.colorPalette = generarPaletaColores(numberOfColors);

        /** @type {Object} Asignación actual de colores (nodeId -> color). */
        this.colors = {};

        /** @type {Array} Aristas actualmente en conflicto. */
        this.conflictEdges = [];

        /** @type {Array<number>} IDs de nodos involucrados en conflictos. */
        this.conflictingNodes = [];

        /** @type {number} Índice del nodo actual siendo procesado. */
        this.currentIndex = 0;

        /** @type {number} Número de nodos recoloreados en la pasada actual. */
        this.recoloredCount = 0;

        /** @type {number} Total de nodos recoloreados. */
        this.totalRecoloredCount = 0;

        /** @type {Array<Object>} Historial de recoleo de nodos. */
        this.recoloredNodes = [];

        /** @type {number} Conteo inicial de conflictos al inicio. */
        this.initialConflicts = 0;

        /** @type {boolean} Si el algoritmo ha completado. */
        this.done = false;

        /** @type {number} Número de pasada actual. */
        this.passNumber = 1;

        // Copiar coloración actual del grafo
        this.graph.nodos.forEach(nodo => {
            this.colors[nodo.id] = nodo.color;
        });

        // Calcular conflictos iniciales
        this.conflictEdges = obtenerAristasConflicto(this.graph.nodos, this.graph.aristas);
        this.initialConflicts = this.conflictEdges.length;

        this._actualizarNodosConflictivos();

    }

    /**
     * Encuentra el mejor color para un nodo que minimiza conflictos con vecinos.
     * Usa estrategia greedy: prueba todos los colores disponibles y elige el mejor.
     * @param {number} nodeId - Identificador del nodo a recolorear.
     * @returns {Object} Resultado con bestColor, minimumConflicts y flag wasImproved.
     */
    encontrarMejorColor(nodeId) {
        const currentColor = this.colors[nodeId];
        let bestColor = currentColor;
        let minimumConflicts = contarConflictosConColor(nodeId, currentColor, this.graph.aristas, this.colors);

        for (const color of this.colorPalette) {
            if (color === currentColor) continue;

            const conflictsWithColor = contarConflictosConColor(nodeId, color, this.graph.aristas, this.colors);

            if (conflictsWithColor < minimumConflicts) {
                minimumConflicts = conflictsWithColor;
                bestColor = color;
            }
        }

        return {
            bestColor,
            minimumConflicts,
            wasImproved: bestColor !== currentColor
        };
    }

    /**
     * Ejecuta un paso del algoritmo de búsqueda local.
     * Procesa un nodo en conflicto por paso, intentando mejorar su color.
     * @returns {Object} Resultado del paso con colors, conflictEdges, flag done y estadísticas.
     */
    step() {
        if (this.done) {
            return this._obtenerResultadoPaso();
        }

        if (this.currentIndex >= this.conflictingNodes.length) {
            const currentConflicts = this.conflictEdges.length;

            if (currentConflicts === 0) {
                this.done = true;
                return this._obtenerResultadoPaso();
            }

            if (this.recoloredCount === 0) {
                this.done = true;
                return this._obtenerResultadoPaso();
            }

            this.passNumber++;
            this.currentIndex = 0;
            this.recoloredCount = 0;

            this._actualizarNodosConflictivos();
        }

        const nodeId = this.conflictingNodes[this.currentIndex];
        const { bestColor, wasImproved } = this.encontrarMejorColor(nodeId);

        if (wasImproved) {
            const oldColor = this.colors[nodeId];
            this.colors[nodeId] = bestColor;
            this.recoloredCount++;
            this.totalRecoloredCount++;

            this.recoloredNodes.push({
                nodeId,
                oldColor,
                newColor: bestColor
            });
        }

        this.currentIndex++;
        this.actualizarConflictos();

        return this._obtenerResultadoPaso();
    }

    /**
     * Actualiza las aristas en conflicto después de recolorear.
     * @private
     */
    actualizarConflictos() {
        const originalColors = {};
        this.graph.nodos.forEach(nodo => {
            originalColors[nodo.id] = nodo.color;
            nodo.color = this.colors[nodo.id];
        });

        this.conflictEdges = obtenerAristasConflicto(this.graph.nodos, this.graph.aristas);

        this.graph.nodos.forEach(nodo => {
            nodo.color = originalColors[nodo.id];
        });
    }

    /**
     * Genera el objeto de resultado para el paso actual.
     * @returns {Object} Resultado del paso con colors, conflicts, progress y estadísticas.
     * @private
     */
    _obtenerResultadoPaso() {
        const currentConflicts = this.conflictEdges.length;
        const conflictsReduced = this.initialConflicts - currentConflicts;
        const progress = this.initialConflicts > 0
            ? conflictsReduced / this.initialConflicts
            : 1;

        return {
            colors: { ...this.colors },
            conflictEdges: [...this.conflictEdges],
            done: this.done,
            stats: {
                attempts: this.totalRecoloredCount,
                conflicts: currentConflicts,
                progress: Math.min(progress, 1),
                initialConflicts: this.initialConflicts,
                conflictsReduced: conflictsReduced,
                improvement: this.initialConflicts > 0
                    ? Math.round((conflictsReduced / this.initialConflicts) * 100)
                    : 0,
                recoloredNodes: [...this.recoloredNodes],
                passNumber: this.passNumber
            }
        };
    }

    /**
     * Actualiza lista de nodos en conflicto.
     * @private
     */
    _actualizarNodosConflictivos() {
        const conflictingNodesSet = new Set();
        for (const edge of this.conflictEdges) {
            conflictingNodesSet.add(edge.sourceId);
            conflictingNodesSet.add(edge.targetId);
        }
        this.conflictingNodes = Array.from(conflictingNodesSet);
    }
}
