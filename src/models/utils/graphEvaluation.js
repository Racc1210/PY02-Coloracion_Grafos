/**
 * Utilidades de evaluación de coloreo de grafos.
 * Provee funciones para evaluar calidad de coloración y generar coloraciones.
 * @module graphEvaluation
 */

/**
 * Evalúa una coloración de grafo contando conflictos.
 * @param {Array<Edge>} aristas - Array de aristas del grafo.
 * @param {Object} mapaColores - Mapa de IDs de nodos a colores {nodeId: color}.
 * @returns {Object} Resultado de evaluación con conteo de conflictos y array de aristas en conflicto.
 */
export function evaluarColoracion(aristas, mapaColores) {
    let conflictos = 0;
    const aristasConflicto = [];

    for (const arista of aristas) {
        const primerColor = mapaColores[arista.sourceId];
        const segundoColor = mapaColores[arista.targetId];
        if (primerColor && segundoColor && primerColor === segundoColor) {
            conflictos++;
            aristasConflicto.push({
                sourceId: arista.sourceId,
                targetId: arista.targetId,
            });
        }
    }

    return { conflicts: conflictos, conflictEdges: aristasConflicto };
}

/**
 * Genera una coloración aleatoria para todos los nodos.
 * @param {Array<Node>} nodos - Array de nodos del grafo a colorear.
 * @param {Array<string>} coloresDisponibles - Array de nombres de colores disponibles.
 * @returns {Object} Mapa de colores.
 */
export function coloracionAleatoria(nodos, coloresDisponibles) {
    const colores = {};
    for (const nodo of nodos) {
        const color = coloresDisponibles[Math.floor(Math.random() * coloresDisponibles.length)];
        colores[nodo.id] = color;
    }
    return colores;
}

/**
 * Calcula métricas estadísticas para el rendimiento del algoritmo.
 * @param {number} intentos - Número de intentos realizados.
 * @param {number} conteoExitos - Número de intentos exitosos.
 * @param {number} totalConflictos - Suma acumulada de todos los conflictos a través de los intentos.
 * @param {number} mejoresConflictos - Conflictos mínimos encontrados.
 * @param {number} maxIntentos - Intentos máximos permitidos.
 * @returns {Object} Objeto de estadísticas con intentos, conflictos, media, tasa de éxito y progreso.
 */
export function calcularEstadisticasAlgoritmo(
    intentos,
    conteoExitos,
    totalConflictos,
    mejoresConflictos,
    maxIntentos
) {
    const conflictosPromedio = intentos > 0 ? totalConflictos / intentos : 0;
    const tasaExito = intentos > 0 ? conteoExitos / intentos : 0;
    const progreso = maxIntentos > 0 ? Math.min(intentos / maxIntentos, 1) : 1;

    return {
        attempts: intentos,
        conflicts: mejoresConflictos === Infinity ? 0 : mejoresConflictos,
        meanConflicts: conflictosPromedio,
        successRate: tasaExito,
        progress: progreso
    };
}
