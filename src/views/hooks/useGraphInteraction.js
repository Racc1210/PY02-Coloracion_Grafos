/**
 * Hook personalizado para manejar interacciones de nodos y aristas del grafo.
 * Maneja selección de nodos, selección de aristas, arrastre y operaciones de conexión.
 * @hook
 * @param {React.RefObject} svgRef - Referencia al elemento SVG.
 * @param {Function} onConnectNodes - Callback para conectar dos nodos.
 * @param {Function} onMoveNode - Callback para mover un nodo a nuevas coordenadas.
 * @returns {Object} Estado de interacción y event handlers.
 * @returns {number|null} returns.selectedNodeId - ID del nodo actualmente seleccionado.
 * @returns {Object|null} returns.selectedEdge - Objeto arista actualmente seleccionada.
 * @returns {Function} returns.handleNodeClick - Handler de click para nodos.
 * @returns {Function} returns.handleEdgeClick - Handler de click para aristas.
 * @returns {Function} returns.handleNodeMouseDown - Handler de mouse down para iniciar arrastre.
 * @returns {Function} returns.handleSvgMouseMove - Handler de movimiento de mouse para arrastrar.
 * @returns {Function} returns.handleSvgMouseUp - Handler de mouse up para finalizar arrastre/pan.
 * @returns {Function} returns.handleSvgMouseLeave - Handler de mouse leave para cancelar arrastre/pan.
 * @returns {Function} returns.handleSvgBackgroundClick - Handler de click en fondo para deseleccionar.
 * @returns {Function} returns.clearSelection - Función para limpiar todas las selecciones.
 */

import { useState } from "react";
import { obtenerPuntoSvgDesdeEvent } from "../utils/svgHelpers.js";

export function useGraphInteraction(svgRef, onConnectNodes, onMoveNode) {
    const [idNodoSeleccionado, setIdNodoSeleccionado] = useState(null);
    const [aristaSeleccionada, setAristaSeleccionada] = useState(null);
    const [idNodoArrastrado, setIdNodoArrastrado] = useState(null);

    const clearSelection = () => {
        setIdNodoSeleccionado(null);
        setAristaSeleccionada(null);
    };

    const handleNodeClick = (event, idNodo) => {
        event.stopPropagation();

        // Limpiar selección de arista al hacer click en un nodo
        setAristaSeleccionada(null);

        if (idNodoSeleccionado === null) {
            setIdNodoSeleccionado(idNodo);
        } else if (idNodoSeleccionado === idNodo) {
            setIdNodoSeleccionado(null);
        } else {
            onConnectNodes?.(idNodoSeleccionado, idNodo);
            setIdNodoSeleccionado(null);
        }
    };

    const handleEdgeClick = (event, arista) => {
        event.stopPropagation();

        // Limpiar selección de nodo al hacer click en una arista
        setIdNodoSeleccionado(null);

        // Alternar selección de arista
        if (aristaSeleccionada &&
            aristaSeleccionada.sourceId === arista.sourceId &&
            aristaSeleccionada.targetId === arista.targetId) {
            setAristaSeleccionada(null);
        } else {
            setAristaSeleccionada(arista);
        }
    };

    const handleNodeMouseDown = (event, idNodo) => {
        event.stopPropagation();
        setIdNodoArrastrado(idNodo);
    };

    const handleSvgMouseMove = (event, isPanning, panHandlers) => {
        if (idNodoArrastrado !== null) {
            const { normalizedX, normalizedY } = obtenerPuntoSvgDesdeEvent(event, svgRef);
            onMoveNode?.(idNodoArrastrado, normalizedX, normalizedY);
        } else if (isPanning) {
            panHandlers.handlePanMove(event);
        }
    };

    const handleSvgMouseUp = (panHandlers) => {
        setIdNodoArrastrado(null);
        panHandlers.stopPanning();
    };

    const handleSvgMouseLeave = (panHandlers) => {
        setIdNodoArrastrado(null);
        panHandlers.stopPanning();
    };

    const handleSvgBackgroundClick = (event) => {
        if (event.target === event.currentTarget) {
            clearSelection();
        }
    };

    return {
        selectedNodeId: idNodoSeleccionado,
        selectedEdge: aristaSeleccionada,
        handleNodeClick,
        handleEdgeClick,
        handleNodeMouseDown,
        handleSvgMouseMove,
        handleSvgMouseUp,
        handleSvgMouseLeave,
        handleSvgBackgroundClick,
        clearSelection
    };
}
