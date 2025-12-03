/**
 * Administra la reorganización del layout del grafo usando algoritmos dirigidos por fuerzas.
 * Maneja cómputo de layout tanto síncrono como basado en Web Worker.
 * 
 * @class LayoutController
 */
export default class LayoutController {
  /**
   * Crea una nueva instancia de LayoutController.
   * 
   * @param {Graph} graph - Referencia al modelo del grafo.
   * @param {StateManager} stateManager - Referencia al state manager.
   * @param {WorkerManager} workerManager - Referencia al worker manager.
   * @param {Function} stopDynamicRunCallback - Callback para detener ejecución dinámica.
   */
  constructor(graph, stateManager, workerManager, stopDynamicRunCallback) {
    this.graph = graph;
    this.stateManager = stateManager;
    this.workerManager = workerManager;
    this.stopDynamicRun = stopDynamicRunCallback;
  }

  /**
   * Reorganiza el layout del grafo usando algoritmo dirigido por fuerzas.
   * Ejecuta de forma síncrona sin mostrar overlay.
   */
  reorganizeLayout() {
    this.stopDynamicRun(true);

    // Ejecutar reorganización de forma síncrona sin overlay
    this.graph.aplicarLayoutFuerzas();
    this.stateManager.notify();
  }
}
