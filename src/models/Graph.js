import Node from "./Node";
import Edge from "./Edge";
import ForceDirectedLayout from "./ForceDirectedLayout";
import { GRAPH_CONSTRAINTS, LAYOUT_ITERATIONS } from "./constants/index.js";

/**
 * Representa una estructura de datos de grafo.
 * @class
 */
export default class Graph {
  /**
   * Crea un nuevo grafo vacío.
   */
  constructor() {
    /** @type {Array<Node>} Array de nodos del grafo. */
    this.nodos = [];

    /** @type {Array<Edge>} Array de aristas del grafo. */
    this.aristas = [];
  }

  /**
   * Agrega un nuevo nodo al grafo.
   * @param {number} x - Coordenada X normalizada (0-1)/(0%-100%).
   * @param {number} y - Coordenada Y normalizada (0-1)/(0%-100%).
   * @returns {Node} El nodo recién creado.
   * @throws {Error} Si se alcanza el límite máximo de nodos.
   */
  agregarNodo(x, y) {
    if (this.nodos.length >= GRAPH_CONSTRAINTS.MAX_NODES) {
      throw new Error(`Se alcanzó el máximo de ${GRAPH_CONSTRAINTS.MAX_NODES} nodos permitidos.`);
    }

    const siguienteIdNodo =
      this.nodos.length > 0
        ? this.nodos[this.nodos.length - 1].id + 1
        : 1;

    const nuevoNodo = new Node(siguienteIdNodo, x, y);
    this.nodos.push(nuevoNodo);
    return nuevoNodo;
  }

  /**
   * Agrega una arista entre dos nodos.
   * @param {number} sourceId - Identificador del nodo origen.
   * @param {number} targetId - Identificador del nodo destino.
   * @returns {Edge|null} La arista recién creada, o null si es inválida.
   */
  agregarArista(sourceId, targetId) {
    if (sourceId === targetId) return null;

    //evitar duplicados 
    const aristaExiste = this.aristas.some(
      (arista) =>
        (arista.sourceId === sourceId && arista.targetId === targetId) ||
        (arista.sourceId === targetId && arista.targetId === sourceId)
    );
    if (aristaExiste) return null;

    //crear nueva arista
    const nuevaArista = new Edge(sourceId, targetId);
    this.aristas.push(nuevaArista);
    return nuevaArista;
  }

  /**
   * Limpia todos los nodos y aristas del grafo.
   */
  resetear() {
    this.nodos = [];
    this.aristas = [];
  }

  /**
   * Actualiza la posición de un nodo.
   * @param {number} nodeId - Identificador del nodo a actualizar.
   * @param {number} x - Nueva coordenada X normalizada (0-1).
   * @param {number} y - Nueva coordenada Y normalizada (0-1).
   */
  actualizarPosicionNodo(nodeId, x, y) {
    const nodo = this.nodos.find((n) => n.id === nodeId);
    if (!nodo) return;
    nodo.x = x;
    nodo.y = y;
  }

  /**
   * Remueve una arista.
   * @param {number} sourceId - Identificador del primer nodo.
   * @param {number} targetId - Identificador del segundo nodo.
   */
  eliminarArista(sourceId, targetId) {
    this.aristas = this.aristas.filter(
      (arista) =>
        !(
          (arista.sourceId === sourceId && arista.targetId === targetId) ||
          (arista.sourceId === targetId && arista.targetId === sourceId)
        )
    );
  }

  /**
   * Remueve un nodo y todas sus aristas conectadas del grafo.
   * @param {number} nodeId - Identificador del nodo a eliminar.
   */
  eliminarNodo(nodeId) {
    // Remover el nodo
    this.nodos = this.nodos.filter((nodo) => nodo.id !== nodeId);

    // Remover todas las aristas conectadas a este nodo
    this.aristas = this.aristas.filter(
      (arista) => arista.sourceId !== nodeId && arista.targetId !== nodeId
    );
  }

  /**
   * Crea un grafo conectado aleatorio con el número especificado de nodos.
   * Usa posicionamiento basado en grilla con variación aleatoria y layout dirigido por fuerzas.
   * @param {number} numeroDeNodos - Número de nodos a generar.
   * @returns {Graph} Un nuevo grafo aleatorio conectado.
   * @throws {Error} Si numeroDeNodos está fuera del rango válido.
   * @static
   */
  static crearGrafoConectadoAleatorio(numeroDeNodos) {
    if (
      numeroDeNodos < GRAPH_CONSTRAINTS.MIN_RANDOM_NODES ||
      numeroDeNodos > GRAPH_CONSTRAINTS.MAX_NODES
    ) {
      throw new Error(
        `El número de nodos debe estar entre ${GRAPH_CONSTRAINTS.MIN_RANDOM_NODES} y ${GRAPH_CONSTRAINTS.MAX_NODES}.`
      );
    }

    const grafo = new Graph();

    // Distribuir nodos en grilla con variación aleatoria
    const columnas = Math.ceil(Math.sqrt(numeroDeNodos));
    const filas = Math.ceil(numeroDeNodos / columnas);

    const generarCoordenada = (col, fila, maxCol, maxFila) => {
      const xNorm = (col + 0.5 + (Math.random() - 0.5) * 0.8) / maxCol;
      const yNorm = (fila + 0.5 + (Math.random() - 0.5) * 0.8) / maxFila;
      return {
        x: 0.05 + xNorm * 0.9,
        y: 0.05 + yNorm * 0.9
      };
    };

    for (let i = 0; i < numeroDeNodos; i++) {
      const col = i % columnas;
      const fila = Math.floor(i / columnas);
      const { x, y } = generarCoordenada(col, fila, columnas, filas);
      grafo.agregarNodo(x, y);
    }

    // Crear árbol de expansión para conectar los nodos
    for (let i = 1; i < grafo.nodos.length; i++) {
      const nodoPrevio = grafo.nodos[Math.floor(Math.random() * i)];
      grafo.agregarArista(grafo.nodos[i].id, nodoPrevio.id);
    }

    // Agregar aristas extra aleatorias
    const extras = Math.floor(numeroDeNodos / 4);
    let agregadas = 0, intentos = 0, maxIntentos = numeroDeNodos * numeroDeNodos;

    while (agregadas < extras && intentos++ < maxIntentos) {
      const a = grafo.nodos[Math.floor(Math.random() * grafo.nodos.length)];
      const b = grafo.nodos[Math.floor(Math.random() * grafo.nodos.length)];
      if (a.id !== b.id && grafo.agregarArista(a.id, b.id)) {
        agregadas++;
      }
    }

    // Selección de iteraciones de layout
    const iteracionesLayout = numeroDeNodos < LAYOUT_ITERATIONS.SMALL_GRAPH_THRESHOLD
      ? LAYOUT_ITERATIONS.SMALL_GRAPH
      : numeroDeNodos < LAYOUT_ITERATIONS.MEDIUM_GRAPH_THRESHOLD
        ? LAYOUT_ITERATIONS.MEDIUM_GRAPH
        : LAYOUT_ITERATIONS.LARGE_GRAPH;

    grafo.aplicarLayoutFuerzas(iteracionesLayout);

    return grafo;
  }


  /**
   * Aplica el algoritmo de layout dirigido por fuerzas para posicionar nodos.
   * Usa el algoritmo de Fruchterman-Reingold para distribución natural de nodos.
   * @param {number} [iteraciones=600] - Número de iteraciones de la simulación.
   */
  aplicarLayoutFuerzas(iteraciones = 600) {
    const layout = new ForceDirectedLayout(1.0, 1.0);
    layout.aplicar(this.nodos, this.aristas, iteraciones);
  }

}
