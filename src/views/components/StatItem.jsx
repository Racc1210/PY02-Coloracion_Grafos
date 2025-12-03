import React from "react";
import { THEME_COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, TRANSITIONS } from '../constants/theme.js';

/**
 * Componente StatItem para mostrar un item de estadística con label y valor
 * 
 * @component
 * @param {Object} props
 * @param {string} props.label - Etiqueta de la estadística
 * @param {string|number} props.value - Valor de la estadística
 * @param {boolean} [props.highlight=false] - Si el item debe destacarse
 * @param {string} [props.valueClass=''] - Clase CSS para identificar tipo de valor (success/error)
 */
export default function StatItem({ label, value, highlight = false, valueClass = '' }) {
    const getValueColor = () => {
        if (valueClass.includes('success')) return THEME_COLORS.ACCENT_SUCCESS_BG;
        if (valueClass.includes('error')) return THEME_COLORS.ACCENT_ERROR;
        return THEME_COLORS.TEXT_SECONDARY;
    };

    const estiloContenedor = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: `${SPACING.MD} ${SPACING.XL}`,
        borderRadius: BORDER_RADIUS.MD,
        background: highlight
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))'
            : 'transparent',
        border: highlight
            ? `1px solid ${THEME_COLORS.SELECTED_BORDER}33`
            : '1px solid transparent',
        transition: TRANSITIONS.FAST,
    };

    const estiloLabel = {
        fontSize: FONT_SIZE.MD,
        color: THEME_COLORS.TEXT_SUBTLE,
        fontWeight: FONT_WEIGHT.MEDIUM,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    };

    const estiloValor = {
        fontSize: FONT_SIZE.LG,
        color: getValueColor(),
        fontWeight: FONT_WEIGHT.SEMIBOLD,
        fontVariantNumeric: 'tabular-nums',
    };

    return (
        <div style={estiloContenedor}>
            <span style={estiloLabel}>{label}</span>
            <span style={estiloValor}>{value}</span>
        </div>
    );
}
