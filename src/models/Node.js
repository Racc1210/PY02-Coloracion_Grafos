// src/models/Node.js

/**
 * Representa un nodo en el grafo.
 * Los nodos tienen coordenadas normalizadas (0-1) para posicionamiento independiente del viewport.
 * @class
 */
export default class Node {
  /**
   * Crea un nuevo nodo del grafo.
   * @param {number} id - Identificador único del nodo.
   * @param {number} x - Posición X normalizada (0 a 1).
   * @param {number} y - Posición Y normalizada (0 a 1).
   */
  constructor(id, x, y) {
    /** @type {number} Identificador único del nodo. */
    this.id = id;

    /** @type {number} Coordenada X normalizada. */
    this.x = x;

    /** @type {number} Coordenada Y normalizada. */
    this.y = y;
  }
}
