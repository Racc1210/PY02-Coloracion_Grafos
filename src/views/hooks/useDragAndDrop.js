/**
 * Hook personalizado para manejar drag and drop de nodos.
 * @hook
 * @param {React.RefObject} svgRef - Referencia al elemento SVG.
 * @param {Function} onCreateNodeAt - Callback para crear nodo en coordenadas.
 * @returns {Object} Event handlers de drag and drop.
 * @returns {Function} returns.handleDragStart - Inicia operación de arrastre.
 * @returns {Function} returns.handleDrop - Maneja event de soltar para crear nodo.
 * @returns {Function} returns.handleDragOver - Permite soltar previniendo default.
 */

import { obtenerPuntoSvgDesdeEvent } from "../utils/svgHelpers.js";

export function useDragAndDrop(svgRef, onCreateNodeAt) {
    const handleDragStart = (event) => {
        event.dataTransfer.setData('newNode', 'true');
        event.dataTransfer.effectAllowed = 'copy';
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const esNuevoNodo = event.dataTransfer.getData('newNode');
        if (esNuevoNodo === 'true') {
            const { normalizedX, normalizedY } = obtenerPuntoSvgDesdeEvent(event, svgRef);
            onCreateNodeAt?.(normalizedX, normalizedY);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    };

    return {
        handleDragStart,
        handleDrop,
        handleDragOver
    };
}
