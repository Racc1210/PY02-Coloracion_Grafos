/**
 * Hook personalizado para manejar menú contextual de recoloración de nodos.
 * Maneja visualización del menú de click derecho y selección de color.
 * @hook
 * @param {Function} onManualRecolor - Callback para recolorear manualmente un nodo.
 * @returns {Object} Estado del menu contextual y event handlers.
 * @returns {Object|null} returns.contextMenu - Datos del menú {nodeId, x, y} o null si está cerrado.
 * @returns {Function} returns.setContextMenu - Función para actualizar estado del menú.
 * @returns {Function} returns.handleNodeContextMenu - Handler de click derecho para nodos.
 * @returns {Function} returns.handleColorSelect - Handler para selección de color.
 * @returns {Function} returns.handleCloseContextMenu - Handler para cerrar menú.
 */

import { useState } from "react";

export function useContextMenu(onManualRecolor) {
    const [menuContextual, setMenuContextual] = useState(null);

    const handleNodeContextMenu = (event, idNodo) => {
        event.preventDefault();
        event.stopPropagation();

        setMenuContextual({
            nodeId: idNodo,
            x: event.clientX,
            y: event.clientY
        });
    };

    const handleColorSelect = (color, setRecolorResult) => {
        if (!menuContextual) return;

        const resultado = onManualRecolor?.(menuContextual.nodeId, color);
        if (resultado) {
            setRecolorResult(resultado);
        }
        setMenuContextual(null);
    };

    const handleCloseContextMenu = () => {
        setMenuContextual(null);
    };

    return {
        contextMenu: menuContextual,
        setContextMenu: setMenuContextual,
        handleNodeContextMenu,
        handleColorSelect,
        handleCloseContextMenu
    };
}
