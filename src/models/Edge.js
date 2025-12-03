/**
 * Representa una arista no dirigida que conecta dos nodos en el grafo.
 * @class
 */
export default class Edge {
  /**
   * Crea una nueva arista del grafo.
   * @param {number} sourceId - Identificador del nodo origen.
   * @param {number} targetId - Identificador del nodo destino.
   */
  constructor(sourceId, targetId) {
    /** @type {number} Identificador del nodo origen. */
    this.sourceId = sourceId;

    /** @type {number} Identificador del nodo destino. */
    this.targetId = targetId;
  }
}
