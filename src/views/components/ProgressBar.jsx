import React from "react";
import { THEME_COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, TRANSITIONS } from '../constants/theme.js';

/**
 * Componente ProgressBar para barras de progreso reutilizables
 * 
 * @component
 * @param {Object} props
 * @param {number} props.progress - Progreso actual (0-1)
 * @param {boolean} props.showLabel - Si se muestra la etiqueta de porcentaje
 * @param {string} props.className - Clases CSS adicionales
 */
export default function ProgressBar({
    progress = 0,
    showLabel = true,
    className = '',
}) {
    const progressPercent = (progress * 100).toFixed(1);

    const estiloWrapper = {
        marginTop: SPACING.XL,
        display: 'flex',
        flexDirection: 'column',
        gap: SPACING.SM,
    };

    const estiloBarraContenedor = {
        width: '100%',
        height: SPACING.MD,
        backgroundColor: `${THEME_COLORS.BG_PRIMARY}99`,
        borderRadius: BORDER_RADIUS.SM,
        overflow: 'hidden',
        border: `1px solid ${THEME_COLORS.BORDER_SECONDARY}33`,
        position: 'relative',
    };

    const estiloBarraRelleno = {
        height: '100%',
        width: `${progressPercent}%`,
        background: `linear-gradient(90deg, ${THEME_COLORS.ACCENT_BLUE} 0%, #60a5fa 100%)`,
        borderRadius: BORDER_RADIUS.SM,
        transition: TRANSITIONS.MEDIUM,
        boxShadow: progressPercent > 0 ? '0 0 8px rgba(59, 130, 246, 0.5)' : 'none',
    };

    const estiloLabel = {
        fontSize: FONT_SIZE.XS,
        color: THEME_COLORS.TEXT_SUBTLE,
        textAlign: 'center',
        fontWeight: FONT_WEIGHT.SEMIBOLD,
        fontVariantNumeric: 'tabular-nums',
    };

    return (
        <div style={estiloWrapper} className={className}>
            <div style={estiloBarraContenedor}>
                <div style={estiloBarraRelleno} />
            </div>
            {showLabel && (
                <div style={estiloLabel}>
                    {progressPercent}%
                </div>
            )}
        </div>
    );
}
