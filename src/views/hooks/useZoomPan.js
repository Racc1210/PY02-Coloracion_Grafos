/**
 * Hook personalizado para manejar interacciones de zoom y pan en canvas SVG.
 * @hook
 * @returns {Object} Estado de zoom y pan con event handlers.
 * @returns {number} returns.zoomLevel - Nivel de zoom actual (1.0 = 100%).
 * @returns {Object} returns.pan - Posición de pan actual {x, y}.
 * @returns {boolean} returns.isPanning - Si el panning está actualmente activo.
 * @returns {Function} returns.handleZoomIn - Incrementa nivel de zoom por paso.
 * @returns {Function} returns.handleZoomOut - Decrementa nivel de zoom por paso.
 * @returns {Function} returns.handleZoomReset - Resetea zoom a default y pan a origen.
 * @returns {Function} returns.startPanning - Inicia panning (botón medio del mouse).
 * @returns {Function} returns.handlePanMove - Maneja movimiento del mouse durante pan.
 * @returns {Function} returns.stopPanning - Finaliza operación de panning.
 */

import { useState } from "react";
import { ZOOM_LIMITS } from "../constants/index.js";

export function useZoomPan() {
    const [nivelZoom, setNivelZoom] = useState(ZOOM_LIMITS.DEFAULT);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [estaPanneando, setEstaPanneando] = useState(false);
    const [inicioPan, setInicioPan] = useState({ x: 0, y: 0 });

    const handleZoomIn = () => {
        setNivelZoom(anterior => Math.min(anterior + ZOOM_LIMITS.STEP, ZOOM_LIMITS.MAX));
    };

    const handleZoomOut = () => {
        setNivelZoom(anterior => Math.max(anterior - ZOOM_LIMITS.STEP, ZOOM_LIMITS.MIN));
    };

    const handleZoomReset = () => {
        setNivelZoom(ZOOM_LIMITS.DEFAULT);
        setPan({ x: 0, y: 0 });
    };

    const startPanning = (event) => {
        // Solo permitir panning con botón medio del mouse
        if (event.button === 1) {
            event.preventDefault();
            setEstaPanneando(true);
            setInicioPan({ x: event.clientX, y: event.clientY });
        }
    };

    const handlePanMove = (event) => {
        if (estaPanneando) {
            const deltaX = event.clientX - inicioPan.x;
            const deltaY = event.clientY - inicioPan.y;
            setPan({ x: pan.x + deltaX, y: pan.y + deltaY });
            setInicioPan({ x: event.clientX, y: event.clientY });
        }
    };

    const stopPanning = () => {
        setEstaPanneando(false);
    };

    return {
        zoomLevel: nivelZoom,
        pan,
        isPanning: estaPanneando,
        handleZoomIn,
        handleZoomOut,
        handleZoomReset,
        startPanning,
        handlePanMove,
        stopPanning
    };
}
