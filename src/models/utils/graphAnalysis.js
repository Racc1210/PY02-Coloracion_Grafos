/**
 * Funciones de utilidad para análisis de grafos.
 * análisis de vecinos y detección de conflictos.
 * @module graphAnalysis
 */

/**
 * Construye un mapa de nodos por id para acceso rápido.
 * @param {Array<Node>} nodos - Array de nodos del grafo.
 * @returns {Map<number, Node>} Mapa de nodos por id.
 */
function crearMapaNodos(nodos) {
    return new Map(nodos.map(n => [n.id, n]));
}

/**
 * Verifica si existe una arista entre los nodos.
 * @param {Edge} arista - Arista a evaluar.
 * @param {number} idNodo - Identificador del nodo.
 * @returns {boolean} True si la arista conecta con el nodo y False si no.
 */
function esVecino(arista, idNodo) {
    return arista.sourceId === idNodo || arista.targetId === idNodo;
}

/**
 * Verifica si una arista está en conflicto.
 * @param {Edge} arista - Arista a evaluar.
 * @param {Map<number, Node>} nodoMap - Mapa de nodos por id.
 * @returns {boolean} True si la arista está en conflicto.
 */
function esConflicto(arista, nodoMap) {
    const origen = nodoMap.get(arista.sourceId);
    const destino = nodoMap.get(arista.targetId);
    return origen && destino && origen.color && destino.color && origen.color === destino.color;
}

/**
 * Obtiene todos los nodos vecinos de un nodo.
 * @param {number} idNodo - Identificador del nodo.
 * @param {Array<Edge>} aristas - Array de aristas del grafo.
 * @param {Array<Node>} nodos - Array de nodos del grafo.
 * @returns {Array<Node>} Array de nodos vecinos.
 */
export function obtenerVecinosNodo(idNodo, aristas, nodos) {
    const nodoMap = crearMapaNodos(nodos);
    const idsVecinos = new Set();

    for (const arista of aristas) {
        if (arista.sourceId === idNodo) idsVecinos.add(arista.targetId);
        else if (arista.targetId === idNodo) idsVecinos.add(arista.sourceId);
    }

    return Array.from(idsVecinos)
        .map(id => nodoMap.get(id))
        .filter(Boolean);
}

/**
 * Obtiene los colores de todos los nodos vecinos.
 * @param {number} idNodo - Identificador del nodo.
 * @param {Array<Edge>} aristas - Array de aristas del grafo.
 * @param {Array<Node>} nodos - Array de nodos del grafo.
 * @returns {Set<string>} Set que contines los colores de los nodos vecinos.
 */
export function obtenerColoresVecinos(idNodo, aristas, nodos) {
    const vecinos = obtenerVecinosNodo(idNodo, aristas, nodos);
    return new Set(vecinos.filter(nodo => nodo.color).map(nodo => nodo.color));
}



/**
 * Cuenta el número total de conflictos en el grafo.
 * @param {Array<Node>} nodos - Array de nodos del grafo.
 * @param {Array<Edge>} aristas - Array de aristas del grafo.
 * @returns {number} Número total de aristas en conflicto.
 */
export function contarConflictosTotales(nodos, aristas) {
    const nodoMap = crearMapaNodos(nodos);
    return aristas.filter(arista => esConflicto(arista, nodoMap)).length;
}

/**
 * Obtiene todas las aristas con conflictos de coloración.
 * @param {Array<Node>} nodos - Array de nodos del grafo.
 * @param {Array<Edge>} aristas - Array de aristas del grafo.
 * @returns {Array<Object>} Array de objetos de aristas en conflicto con sourceId y targetId.
 */
export function obtenerAristasConflicto(nodos, aristas) {
    const nodoMap = crearMapaNodos(nodos);
    return aristas
        .filter(arista => esConflicto(arista, nodoMap))
        .map(arista => ({ sourceId: arista.sourceId, targetId: arista.targetId }));
}

/**
 * Cuenta los conflictos que un nodo tendría si se le asigna un color específico.
 * @param {number} idNodo - Identificador del nodo.
 * @param {string} color - Color a evaluar.
 * @param {Array<Edge>} aristas - Array de aristas del grafo.
 * @param {Object} colores - Objeto que mapea id de nodo a color {nodeId: color}.
 * @returns {number} Número de conflictos con el color especificado.
 */
export function contarConflictosConColor(idNodo, color, aristas, colores) {
    const idsVecinos = aristas
        .filter(arista => esVecino(arista, idNodo))
        .map(arista => arista.sourceId === idNodo ? arista.targetId : arista.sourceId);

    return idsVecinos.filter(idVecino => colores[idVecino] === color).length;
}


