/**
 * Hook personalizado para manejar atajos de teclado.
 * Maneja eliminación de nodos y aristas seleccionadas.
 * @hook
 * @param {Object} opciones - Opciones de configuración.
 * @param {number|null} opciones.selectedNodeId - ID del nodo actualmente seleccionado.
 * @param {Object|null} opciones.selectedEdge - Arista actualmente seleccionada.
 * @param {Function} opciones.onDeleteNode - Callback para eliminar un nodo.
 * @param {Function} opciones.onDeleteEdge - Callback para eliminar una arista.
 * @param {Function} opciones.onClearSelection - Callback para limpiar selecciones.
 * @param {boolean} opciones.isEnabled - Si los atajos de teclado están habilitados.
 */

import { useEffect } from "react";

export function useKeyboardShortcuts({
    selectedNodeId,
    selectedEdge,
    onDeleteNode,
    onDeleteEdge,
    onClearSelection,
    isEnabled = true
}) {
    useEffect(() => {
        if (!isEnabled) return;

        const handleKeyDown = (evento) => {
            // Eliminar con Backspace o Delete
            if (evento.key === 'Backspace' || evento.key === 'Delete') {
                evento.preventDefault();

                if (selectedNodeId !== null) {
                    onDeleteNode?.(selectedNodeId);
                    onClearSelection?.();
                } else if (selectedEdge !== null) {
                    onDeleteEdge?.(selectedEdge.sourceId, selectedEdge.targetId);
                    onClearSelection?.();
                }
            }

            // Escape para limpiar selección
            if (evento.key === 'Escape') {
                onClearSelection?.();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedNodeId, selectedEdge, onDeleteNode, onDeleteEdge, onClearSelection, isEnabled]);
}
