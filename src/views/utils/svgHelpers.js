/**
 * Utilidades helper para visualización SVG del grafo.
 * @module svgHelpers
 */

import { COLOR_PALETTE, VIEWBOX_CONFIG, VISUALIZATION, ZOOM_LIMITS } from "../constants/index.js";
import { THEME_COLORS, STROKE_WIDTH, NODE_RADIUS } from "../constants/theme.js";

const MAPA_COLORES = COLOR_PALETTE.HEX_MAP;

/**
 * Convierte coordenadas del event de mouse a coordenadas SVG normalizadas.
 * @param {MouseEvent} event - Event de mouse con clientX y clientY.
 * @param {React.RefObject} svgRef - Referencia al elemento SVG.
 * @returns {{normalizedX: number, normalizedY: number}} Coordenadas normalizadas (rango 0-1).
 */
export function obtenerPuntoSvgDesdeEvent(event, svgRef) {
    const svg = svgRef.current;
    if (!svg) return { normalizedX: 0, normalizedY: 0 };

    const punto = svg.createSVGPoint();
    punto.x = event.clientX;
    punto.y = event.clientY;

    const puntoSvg = punto.matrixTransform(svg.getScreenCTM().inverse());

    // Normalizar basado en el espacio de coordenadas base
    let normalizedX = puntoSvg.x / VIEWBOX_CONFIG.BASE_WIDTH;
    let normalizedY = puntoSvg.y / VIEWBOX_CONFIG.BASE_HEIGHT;

    normalizedX = Math.min(Math.max(normalizedX, 0), 1);
    normalizedY = Math.min(Math.max(normalizedY, 0), 1);

    return { normalizedX, normalizedY };
}

/**
 * Calcula viewBox dinámico basado en cantidad de nodos.
 * @param {Object} grafo - Objeto grafo conteniendo nodos y aristas.
 * @param {number} nivelZoom - Nivel de zoom actual (1.0 = 100%).
 * @param {Object} pan - Posición de pan con offsets x e y.
 * @returns {{viewBoxX: number, viewBoxY: number, viewBoxWidth: number, viewBoxHeight: number}} Dimensiones del viewBox.
 */
export function calcularViewBox(grafo, nivelZoom, pan) {
    const cantidadNodos = grafo.nodos.length;
    let anchoViewBoxBase, altoViewBoxBase;

    if (cantidadNodos <= VIEWBOX_CONFIG.SMALL_THRESHOLD) {
        anchoViewBoxBase = VIEWBOX_CONFIG.BASE_WIDTH * VIEWBOX_CONFIG.SMALL_SCALE;
        altoViewBoxBase = VIEWBOX_CONFIG.BASE_HEIGHT * VIEWBOX_CONFIG.SMALL_SCALE;
    } else if (cantidadNodos <= VIEWBOX_CONFIG.MEDIUM_THRESHOLD) {
        anchoViewBoxBase = VIEWBOX_CONFIG.BASE_WIDTH * VIEWBOX_CONFIG.MEDIUM_SCALE;
        altoViewBoxBase = VIEWBOX_CONFIG.BASE_HEIGHT * VIEWBOX_CONFIG.MEDIUM_SCALE;
    } else {
        anchoViewBoxBase = VIEWBOX_CONFIG.BASE_WIDTH * VIEWBOX_CONFIG.LARGE_SCALE;
        altoViewBoxBase = VIEWBOX_CONFIG.BASE_HEIGHT * VIEWBOX_CONFIG.LARGE_SCALE;
    }

    let centroContenidoX = VIEWBOX_CONFIG.BASE_WIDTH / 2;
    let centroContenidoY = VIEWBOX_CONFIG.BASE_HEIGHT / 2;

    if (grafo.nodos.length > 0) {
        const coordenadasX = grafo.nodos.map(nodo => nodo.x * VIEWBOX_CONFIG.BASE_WIDTH);
        const coordenadasY = grafo.nodos.map(nodo => nodo.y * VIEWBOX_CONFIG.BASE_HEIGHT);
        const minimoX = Math.min(...coordenadasX);
        const maximoX = Math.max(...coordenadasX);
        const minimoY = Math.min(...coordenadasY);
        const maximoY = Math.max(...coordenadasY);

        centroContenidoX = (minimoX + maximoX) / 2;
        centroContenidoY = (minimoY + maximoY) / 2;
    }

    const viewBoxWidth = anchoViewBoxBase / nivelZoom;
    const viewBoxHeight = altoViewBoxBase / nivelZoom;

    const viewBoxX = centroContenidoX - viewBoxWidth / 2 - pan.x;
    const viewBoxY = centroContenidoY - viewBoxHeight / 2 - pan.y;

    return { viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight };
}

/**
 * Construye un set de aristas en conflicto para búsqueda rápida.
 * @param {Array<Object>} aristasConflicto - Array de aristas con conflictos de color.
 * @returns {Set<string>} Set de claves de arista en formato "sourceId-targetId".
 */
export function construirConjuntoConflictos(aristasConflicto) {
    const conjuntoConflictos = new Set();
    (aristasConflicto || []).forEach((arista) => {
        const clave1 = `${arista.sourceId}-${arista.targetId}`;
        const clave2 = `${arista.targetId}-${arista.sourceId}`;
        conjuntoConflictos.add(clave1);
        conjuntoConflictos.add(clave2);
    });
    return conjuntoConflictos;
}

/**
 * Renderiza una arista SVG.
 * @param {Object} arista - Objeto arista con sourceId y targetId.
 * @param {number} indice - Índice para key de React.
 * @param {Object} grafo - Objeto grafo conteniendo nodos.
 * @param {Set<string>} conjuntoConflictos - Set de claves de aristas en conflicto.
 * @param {Object|null} aristaSeleccionada - Objeto arista actualmente seleccionada.
 * @param {number} nivelZoom - Nivel de zoom actual.
 * @param {Function} onEdgeClick - Handler de click para arista.
 * @returns {React.ReactElement|null} Elemento grupo SVG con visualización de arista o null.
 */
export function renderizarArista(arista, indice, grafo, conjuntoConflictos, aristaSeleccionada, nivelZoom, onEdgeClick) {
    const origen = grafo.nodos.find((nodo) => nodo.id === arista.sourceId);
    const destino = grafo.nodos.find((nodo) => nodo.id === arista.targetId);
    if (!origen || !destino) return null;

    const clave = `${arista.sourceId}-${arista.targetId}`;
    const esConflicto = conjuntoConflictos.has(clave);
    const estaSeleccionada = aristaSeleccionada &&
        ((aristaSeleccionada.sourceId === arista.sourceId && aristaSeleccionada.targetId === arista.targetId) ||
            (aristaSeleccionada.sourceId === arista.targetId && aristaSeleccionada.targetId === arista.sourceId));

    // Ajustar visibilidad según zoom
    const mostrarAristas = nivelZoom >= ZOOM_LIMITS.MIN;
    const opacidadArista = VISUALIZATION.EDGE_OPACITY;
    const anchoArista = VISUALIZATION.EDGE_WIDTH;

    if (!mostrarAristas && !esConflicto && !estaSeleccionada) return null;

    const x1 = origen.x * VIEWBOX_CONFIG.BASE_WIDTH;
    const y1 = origen.y * VIEWBOX_CONFIG.BASE_HEIGHT;
    const x2 = destino.x * VIEWBOX_CONFIG.BASE_WIDTH;
    const y2 = destino.y * VIEWBOX_CONFIG.BASE_HEIGHT;

    // Determinar color y ancho de arista
    let colorTrazo, anchoTrazo;
    if (estaSeleccionada) {
        colorTrazo = THEME_COLORS.EDGE_SELECTED;
        anchoTrazo = VISUALIZATION.CONFLICT_EDGE_WIDTH + 1;
    } else if (esConflicto) {
        colorTrazo = THEME_COLORS.EDGE_CONFLICT;
        anchoTrazo = VISUALIZATION.CONFLICT_EDGE_WIDTH;
    } else {
        colorTrazo = `${THEME_COLORS.EDGE_NORMAL}, ${opacidadArista})`;
        anchoTrazo = anchoArista;
    }

    return (
        <g key={indice}>
            <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="transparent"
                strokeWidth={STROKE_WIDTH.EXTRA_THICK}
                onClick={(event) => onEdgeClick(event, arista)}
                style={{
                    cursor: 'pointer',
                    pointerEvents: 'stroke'
                }}
            />
            <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={colorTrazo}
                strokeWidth={anchoTrazo}
                style={{ pointerEvents: 'none' }}
            />
            {estaSeleccionada && (
                <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={THEME_COLORS.EDGE_SELECTED_GLOW}
                    strokeWidth={anchoTrazo + STROKE_WIDTH.SELECTION_GLOW_OFFSET}
                    style={{ pointerEvents: 'none' }}
                />
            )}
        </g>
    );
}

/**
 * Renderiza un nodo SVG con círculo y etiqueta de texto.
 * Muestra anillo de selección y ajusta visibilidad de texto según zoom.
 * @param {Object} nodo - Objeto nodo con id, x, y, y color.
 * @param {number|null} idNodoSeleccionado - ID del nodo actualmente seleccionado.
 * @param {number} nivelZoom - Nivel de zoom actual.
 * @param {Object} grafo - Objeto grafo completo (para determinar densidad).
 * @param {Object} handlers - Objeto conteniendo event handlers.
 * @param {Function} handlers.onNodeClick - Handler de click.
 * @param {Function} handlers.onNodeContextMenu - Handler de context menu.
 * @param {Function} handlers.onNodeMouseDown - Handler de mouse down para arrastre.
 * @returns {React.ReactElement} Elemento grupo SVG con visualización de nodo.
 */
export function renderizarNodo(nodo, idNodoSeleccionado, nivelZoom, grafo, handlers) {
    const { onNodeClick, onNodeContextMenu, onNodeMouseDown } = handlers;

    const colorBase = nodo.color
        ? MAPA_COLORES[nodo.color] || THEME_COLORS.NODE_DEFAULT
        : THEME_COLORS.NODE_DEFAULT;

    // Tamaño fijo de nodos
    const radioBase = VISUALIZATION.NODE_RADIUS;
    const tamanoFuente = VISUALIZATION.FONT_SIZE;
    const estaSeleccionado = idNodoSeleccionado === nodo.id;
    const mostrarTexto = nivelZoom >= 0.6 || estaSeleccionado;

    const coordX = nodo.x * VIEWBOX_CONFIG.BASE_WIDTH;
    const coordY = nodo.y * VIEWBOX_CONFIG.BASE_HEIGHT;

    const radioHitbox = radioBase * 1.5;

    return (
        <g key={nodo.id}>
            <circle
                cx={coordX}
                cy={coordY}
                r={radioHitbox}
                fill="transparent"
                onClick={(event) => onNodeClick(event, nodo.id)}
                onContextMenu={(event) => onNodeContextMenu(event, nodo.id)}
                onMouseDown={(event) => onNodeMouseDown(event, nodo.id)}
                style={{
                    cursor: 'pointer',
                    pointerEvents: 'fill'
                }}
            />
            {estaSeleccionado && (
                <circle
                    cx={coordX}
                    cy={coordY}
                    r={radioBase + NODE_RADIUS.OFFSET_MEDIUM}
                    fill="none"
                    stroke={THEME_COLORS.WHITE_FULL}
                    strokeWidth={STROKE_WIDTH.MEDIUM}
                    style={{ pointerEvents: 'none' }}
                />
            )}
            <circle
                cx={coordX}
                cy={coordY}
                r={radioBase}
                fill={colorBase}
                stroke={THEME_COLORS.NODE_BORDER}
                strokeWidth={STROKE_WIDTH.THIN}
                style={{ pointerEvents: 'none' }}
            />
            {mostrarTexto && (
                <text
                    x={coordX}
                    y={coordY - (radioBase + NODE_RADIUS.TEXT_OFFSET)}
                    fontSize={tamanoFuente}
                    textAnchor="middle"
                    fill={THEME_COLORS.NODE_DEFAULT}
                    style={{ pointerEvents: 'none' }}
                >
                    {nodo.id}
                </text>
            )}
        </g>
    );
}
