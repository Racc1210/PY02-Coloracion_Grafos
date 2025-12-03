import Graph from "../models/Graph";
import StateManager from "./StateManager.js";
import WorkerManager from "./WorkerManager.js";
import GraphOperationsController from "./GraphOperationsController.js";
import LayoutController from "./LayoutController.js";
import ColoringController from "./ColoringController.js";

/**
 * Controlador principal del grafo que orquesta todas las operaciones relacionadas con el grafo.
 * Actúa como fachada coordinando StateManager, WorkerManager y controladores especializados.
 * 
 * @class GraphController
 */
export default class GraphController {
  /**
   * Crea una nueva instancia de GraphController.
   * Inicializa el modelo del grafo y todos los controladores especializados.
   */
  constructor() {
    this.graph = new Graph();

    // Inicializar state manager
    this.stateManager = new StateManager(this.graph);

    // Inicializar coloring controller primero (necesario para otros)
    this.coloringController = new ColoringController(
      this.graph,
      this.stateManager,
      null // WorkerManager será configurado después de la inicialización
    );

    // Inicializar worker manager con callback de coloración
    this.workerManager = new WorkerManager(
      this.stateManager,
      this.coloringController.applyColoring.bind(this.coloringController)
    );

    // Actualizar referencia de workerManager en coloringController
    this.coloringController.workerManager = this.workerManager;

    // Inicializar otros controladores con stopDynamicRun del coloringController
    const stopDynamicRun = this.coloringController.stopDynamicRun.bind(this.coloringController);

    this.graphOps = new GraphOperationsController(
      this.graph,
      this.stateManager,
      stopDynamicRun
    );

    this.layoutController = new LayoutController(
      this.graph,
      this.stateManager,
      this.workerManager,
      stopDynamicRun
    );
  }


  /**
   * Obtiene el snapshot del estado actual del grafo.
   * 
   * @returns {Object} Estado actual incluyendo nodes, edges, stats y flags.
   */
  getSnapshot() {
    return this.stateManager.getSnapshot();
  }

  /**
   * Suscribe un listener a los cambios de estado.
   * 
   * @param {Function} listener - Función callback para recibir actualizaciones de estado.
   * @returns {Function} Función para desuscribirse.
   */
  subscribe(listener) {
    return this.stateManager.subscribe(listener);
  }

  /**
   * Crea un nuevo nodo en las coordenadas especificadas.
   * 
   * @param {number} x - Coordenada x normalizada (0-1).
   * @param {number} y - Coordenada y normalizada (0-1).
   */
  createManualNode(x, y) {
    this.graphOps.createManualNode(x, y);
  }

  /**
   * Conecta dos nodos con una arista.
   * 
   * @param {number} sourceId - ID del nodo origen.
   * @param {number} targetId - ID del nodo destino.
   */
  connectNodes(sourceId, targetId) {
    this.graphOps.connectNodes(sourceId, targetId);
  }

  /**
   * Genera un grafo conectado aleatorio.
   * 
   * @param {number} numNodes - Número de nodos a generar.
   */
  generateRandomGraph(numNodes) {
    this.graphOps.generateRandomGraph(numNodes);
    // Actualizar referencia del grafo en caso de que haya sido reemplazado
    this.graph = this.stateManager.graph;
    this._updateGraphReferences();
  }

  /**
   * Limpia todos los colores de los nodos sin remover la estructura del grafo.
   */
  clearColors() {
    this.graphOps.clearColors();
  }

  /**
   * Resetea el grafo completo a estado vacío.
   */
  resetGraph() {
    this.graphOps.resetGraph();
  }

  /**
   * Mueve un nodo a nuevas coordenadas.
   * 
   * @param {number} nodeId - ID del nodo a mover.
   * @param {number} x - Nueva coordenada x normalizada (0-1).
   * @param {number} y - Nueva coordenada y normalizada (0-1).
   */
  moveNode(nodeId, x, y) {
    this.graphOps.moveNode(nodeId, x, y);
  }

  /**
   * Elimina una arista entre dos nodos.
   * 
   * @param {number} sourceId - ID del nodo origen.
   * @param {number} targetId - ID del nodo destino.
   */
  deleteEdge(sourceId, targetId) {
    this.graphOps.deleteEdge(sourceId, targetId);
  }

  /**
   * Elimina un nodo y todas sus aristas conectadas.
   * 
   * @param {number} nodeId - ID del nodo a eliminar.
   */
  deleteNode(nodeId) {
    this.graphOps.deleteNode(nodeId);
  }

  /**
   * Reorganiza el layout del grafo usando algoritmo dirigido por fuerzas.
   */
  reorganizeLayout() {
    this.layoutController.reorganizeLayout();
  }

  /**
   * Recolorea manualmente un nodo y calcula métricas de impacto.
   * 
   * @param {number} nodeId - ID del nodo a recolorear.
   * @param {string} newColor - Nombre del nuevo color.
   * @returns {Object} Métricas de recoloreo incluyendo conflictos y sugerencias.
   */
  manualRecolor(nodeId, newColor) {
    return this.coloringController.manualRecolor(nodeId, newColor);
  }

  /**
   * Inicia el algoritmo de búsqueda local dinámico con visualización paso a paso.
   * 
   * @param {Function} [onComplete=null] - Callback que recibe resultados cuando termina.
   */
  startLocalSearchDynamic(onComplete = null) {
    this.coloringController.startLocalSearchDynamic(onComplete);
  }

  /**
   * Inicia el algoritmo de coloración dinámico (Las Vegas o Monte Carlo).
   * 
   * @param {Object} options - Configuración de coloración.
   */
  startDynamicColoring(options) {
    this.coloringController.startDynamicColoring(options);
  }


  /**
   * Actualiza las referencias del grafo en todos los controladores después de reemplazo del grafo.
   * 
   * @private
   */
  _updateGraphReferences() {
    this.layoutController.graph = this.graph;
    this.coloringController.graph = this.graph;
    this.graphOps.graph = this.graph;
  }
}
