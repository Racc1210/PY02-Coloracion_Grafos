/**
 * Utilidades de análisis de recoloración.
 * Analiza como afecta a el grafo la recoloración de nodos.
 * @module recolorAnalysis
 */

import { obtenerVecinosNodo, obtenerColoresVecinos } from './graphAnalysis.js';

/**
 * Calcula el impacto de recolorear un nodo con un nuevo color.
 * @param {number} idNodo - Identificador del nodo a recolorear.
 * @param {string} nuevoColor - Nuevo color a asignar.
 * @param {Array<Node>} nodos - Array de nodos del grafo.
 * @param {Array<Edge>} aristas - Array de aristas del grafo.
 * @returns {Object} Análisis de impacto con información de vecinos y conflictos.
 */
export function calcularImpactoRecoloracion(idNodo, nuevoColor, nodos, aristas) {
    const vecinos = obtenerVecinosNodo(idNodo, aristas, nodos);

    const vecinosConflictivos = vecinos.filter(nodo => nodo.color === nuevoColor);

    return {
        vecinos: vecinos,
        vecinosConflictivos: vecinosConflictivos,
        conteoNuevosConflictos: vecinosConflictivos.length,
    };
}

/**
 * Calcula la probabilidad de recolorear exitosamente vecinos en conflicto.
 * @param {Array<Node>} vecinosConflictivos - Array de vecinos con conflictos de color.
 * @param {Array<string>} coloresDisponibles - Array de colores disponibles.
 * @param {Array<Edge>} aristas - Array de aristas del grafo.
 * @param {Array<Node>} nodos - Array de nodos del grafo.
 * @param {number} numeroColores - Número total de colores disponibles.
 * @returns {Object} Cálculo de probabilidad de éxito y conteo recoloreable.
 */
export function calcularProbabilidadExito(vecinosConflictivos, coloresDisponibles, aristas, nodos, numeroColores) {
    if (vecinosConflictivos.length === 0) {
        return { probabilidad: 1.0, conteoRecoloreables: 0 };
    }

    let cantidadRecoloreables = 0;

    for (const vecino of vecinosConflictivos) {
        const coloresVecino = obtenerColoresVecinos(vecino.id, aristas, nodos);
        const coloresAlternativos = coloresDisponibles.filter(color => !coloresVecino.has(color));

        if (coloresAlternativos.length > 0) {
            cantidadRecoloreables++;
        }
    }

    const probBase = cantidadRecoloreables / Math.max(vecinosConflictivos.length, 1);
    const factorColor = 0.7 + 0.3 * (numeroColores / 10);
    const probabilidad = Math.min(probBase * factorColor, 1.0);

    return {
        probabilidad: probabilidad,
        conteoRecoloreables: cantidadRecoloreables
    };
}

/**
 * Genera sugerencias de color para vecinos en conflicto.
 * @param {Array<Node>} vecinosConflictivos - Array de vecinos con conflictos de color.
 * @param {Array<string>} coloresDisponibles - Array de colores disponibles.
 * @param {Array<Edge>} aristas - Array de aristas del grafo.
 * @param {Array<Node>} nodos - Array de nodos del grafo.
 * @returns {Array<Object>} Array de objetos de sugerencia con ID de nodo, color actual y alternativas.
 */
export function generarSugerenciasRecoloracion(vecinosConflictivos, coloresDisponibles, aristas, nodos) {
    const sugerencias = [];

    for (const vecino of vecinosConflictivos) {
        const coloresVecino = obtenerColoresVecinos(vecino.id, aristas, nodos);
        const coloresSugeridos = coloresDisponibles.filter(color => !coloresVecino.has(color));

        if (coloresSugeridos.length > 0) {
            const vecinosDelVecino = obtenerVecinosNodo(vecino.id, aristas, nodos);
            const cantidadConflictos = vecinosDelVecino.filter(nodo => nodo.color === vecino.color).length;

            sugerencias.push({
                idNodo: vecino.id,
                colorActual: vecino.color,
                coloresSugeridos: coloresSugeridos,
                conteoConflictos: cantidadConflictos
            });
        }
    }

    return sugerencias;
}

/**
 * Analiza el impacto de una operación de recoloración comparando conteos de conflictos.
 * @param {number} conflictosAntes - Número de conflictos antes de recolorear.
 * @param {number} conflictosDespues - Número de conflictos después de recolorear.
 * @returns {Object} Análisis de impacto con estado de mejora y porcentaje de cambio.
 */
export function analizarImpacto(conflictosAntes, conflictosDespues) {
    const deltaConflictos = conflictosDespues - conflictosAntes;

    return {
        improved: deltaConflictos < 0,
        worsened: deltaConflictos > 0,
        neutral: deltaConflictos === 0,
        changePercent: conflictosAntes > 0
            ? Math.round((deltaConflictos / conflictosAntes) * 100)
            : (deltaConflictos > 0 ? 100 : 0)
    };
}
