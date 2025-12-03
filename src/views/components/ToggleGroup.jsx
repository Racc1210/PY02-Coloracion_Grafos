import React, { useState } from "react";
import { THEME_COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, TRANSITIONS } from '../constants/theme.js';

/**
 * Componente ToggleGroup para selector de opciones tipo toggle button
 * 
 * @component
 * @param {Object} props
 * @param {Array<{value: any, label: string}>} props.options - Opciones disponibles
 * @param {any} props.value - Valor seleccionado actualmente
 * @param {Function} props.onChange - Manejador de cambio
 * @param {boolean} props.disabled - Si está deshabilitado
 * @param {string} props.className - Clases CSS adicionales
 */
export default function ToggleGroup({
    options,
    value,
    onChange,
    disabled = false,
    className = '',
}) {
    const [hoverIndex, setHoverIndex] = useState(null);

    const estiloGrupo = {
        display: 'flex',
        gap: SPACING.MD,
        padding: SPACING.XS,
        background: `${THEME_COLORS.BG_PRIMARY}99`,
        borderRadius: BORDER_RADIUS.LG,
        border: `1px solid ${THEME_COLORS.BORDER_SECONDARY}33`,
    };

    const getEstiloOpcion = (isActive, index) => {
        const baseStyle = {
            flex: 1,
            padding: `${SPACING.MD} ${SPACING.XL}`,
            border: 'none',
            borderRadius: BORDER_RADIUS.MD,
            fontSize: FONT_SIZE.LG,
            fontWeight: FONT_WEIGHT.MEDIUM,
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: TRANSITIONS.FAST,
            opacity: disabled ? 0.5 : 1,
        };

        if (isActive) {
            return {
                ...baseStyle,
                background: `linear-gradient(135deg, ${THEME_COLORS.ACCENT_BLUE} 0%, #2563eb 100%)`,
                color: THEME_COLORS.TEXT_PRIMARY,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                transform: 'translateY(-1px)',
            };
        }

        if (hoverIndex === index && !disabled) {
            return {
                ...baseStyle,
                background: `${THEME_COLORS.BG_TERTIARY}cc`,
                color: THEME_COLORS.TEXT_SECONDARY,
                transform: 'translateY(-1px)',
            };
        }

        return {
            ...baseStyle,
            background: `${THEME_COLORS.BG_SECONDARY}80`,
            color: THEME_COLORS.TEXT_SUBTLE,
        };
    };

    return (
        <div style={estiloGrupo} className={className}>
            {options.map((option, index) => {
                const isActive = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        style={getEstiloOpcion(isActive, index)}
                        onClick={() => !disabled && onChange?.(option.value)}
                        onMouseEnter={() => setHoverIndex(index)}
                        onMouseLeave={() => setHoverIndex(null)}
                        disabled={disabled}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
