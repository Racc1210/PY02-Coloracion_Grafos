import React from "react";
import { THEME_COLORS, SPACING, FONT_SIZE } from "../constants/theme.js";

/**
 * Componente CloseButton simple para cerrar paneles/modales
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onClick - Manejador de click
 * @param {string} props.title - Tooltip
 * @param {React.CSSProperties} props.style - Estilos adicionales
 * @param {string} props.className - Clases CSS adicionales
 */
export default function CloseButton({ onClick, title = "Cerrar", style, className = '' }) {
    const defaultStyle = {
        background: 'none',
        border: 'none',
        color: THEME_COLORS.TEXT_SUBTLE,
        fontSize: FONT_SIZE.XXL,
        cursor: 'pointer',
        padding: `0 ${SPACING.XS}`,
        lineHeight: '1',
        ...style
    };

    return (
        <button
            onClick={onClick}
            title={title}
            style={defaultStyle}
            className={className}
        >
            ×
        </button>
    );
}
