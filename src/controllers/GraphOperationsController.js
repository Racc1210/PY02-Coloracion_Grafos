import Graph from "../models/Graph";

/**
 * Maneja operaciones CRUD para nodos y aristas del grafo.
 * Administra modificaciones de estructura del grafo y operaciones básicas.
 * 
 * @class GraphOperationsController
 */
export default class GraphOperationsController {
  /**
   * Crea una nueva instancia de GraphOperationsController.
   * 
   * @param {Graph} graph - Referencia al modelo del grafo.
   * @param {StateManager} stateManager - Referencia al state manager.
   * @param {Function} stopDynamicRunCallback - Callback para detener ejecución dinámica.
   */
  constructor(graph, stateManager, stopDynamicRunCallback) {
    this.graph = graph;
    this.stateManager = stateManager;
    this.stopDynamicRun = stopDynamicRunCallback;
  }

  /**
   * Crea un nuevo nodo en las coordenadas especificadas.
   * 
   * @param {number} x - Coordenada x normalizada (0-1).
   * @param {number} y - Coordenada y normalizada (0-1).
   */
  createManualNode(x, y) {
    this.stopDynamicRun(true);
    this.graph.agregarNodo(x, y);
    this.stateManager.notify();
  }

  /**
   * Conecta dos nodos con una arista.
   * Marca el grafo como modificado manualmente si está coloreado.
   * 
   * @param {number} sourceId - ID del nodo origen.
   * @param {number} targetId - ID del nodo destino.
   */
  connectNodes(sourceId, targetId) {
    this.stopDynamicRun(false); // false para preservar coloración
    this.graph.agregarArista(sourceId, targetId);

    // Marcar como cambio manual y limpiar stats si hay coloración activa
    if (this.stateManager.hasColoredGraph) {
      this.stateManager.markManualChange();
    }

    this.stateManager.notify();
  }

  /**
   * Genera un grafo conectado aleatorio.
   * 
   * @param {number} numNodes - Número de nodos a generar.
   */
  generateRandomGraph(numNodes) {
    this.stopDynamicRun(true);
    this.graph = Graph.crearGrafoConectadoAleatorio(numNodes);
    this.stateManager.graph = this.graph;
    this.stateManager.resetManualChanges();
    this.stateManager.notify();
  }

  /**
   * Limpia todos los colores de los nodos sin remover la estructura del grafo.
   */
  clearColors() {
    this.stopDynamicRun(true);

    // Solo remover colores de los nodos
    this.graph.nodos.forEach(nodo => {
      nodo.color = null;
    });

    this.stateManager.resetColoringState();
    this.stateManager.notify();
  }

  /**
   * Resetea el grafo completo a estado vacío.
   */
  resetGraph() {
    this.stopDynamicRun(true);
    this.graph.resetear();
    this.stateManager.resetManualChanges();
    this.stateManager.notify();
  }

  /**
   * Mueve un nodo a nuevas coordenadas.
   * 
   * @param {number} nodeId - ID del nodo a mover.
   * @param {number} x - Nueva coordenada x normalizada (0-1).
   * @param {number} y - Nueva coordenada y normalizada (0-1).
   */
  moveNode(nodeId, x, y) {
    this.graph.actualizarPosicionNodo(nodeId, x, y);
    this.stateManager.notify();
  }

  /**
   * Elimina una arista entre dos nodos.
   * Marca el grafo como modificado manualmente si está coloreado.
   * 
   * @param {number} sourceId - ID del nodo origen.
   * @param {number} targetId - ID del nodo destino.
   */
  deleteEdge(sourceId, targetId) {
    this.stopDynamicRun(false); // false para preservar coloración
    this.graph.eliminarArista(sourceId, targetId);

    // Marcar como cambio manual y limpiar stats si hay coloración activa
    if (this.stateManager.hasColoredGraph) {
      this.stateManager.markManualChange();
    }

    this.stateManager.notify();
  }

  /**
   * Elimina un nodo y todas sus aristas conectadas.
   * Marca el grafo como modificado manualmente si está coloreado.
   * 
   * @param {number} nodeId - ID del nodo a eliminar.
   */
  deleteNode(nodeId) {
    this.stopDynamicRun(false); // false para preservar coloración
    this.graph.eliminarNodo(nodeId);

    // Marcar como cambio manual y limpiar stats si hay coloración activa
    if (this.stateManager.hasColoredGraph) {
      this.stateManager.markManualChange();
    }

    this.stateManager.notify();
  }
}
