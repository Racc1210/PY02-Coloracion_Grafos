import React from "react";
import { THEME_COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, TRANSITIONS } from '../constants/theme.js';

/**
 * Componente Button reutilizable con múltiples variantes
 * 
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido del botón
 * @param {'primary'|'secondary'|'danger'|'success'|'warning'|'icon'} props.variant - Variante de estilo
 * @param {boolean} props.disabled - Si el botón está deshabilitado
 * @param {Function} props.onClick - Manejador de click
 * @param {string} props.className - Clases CSS adicionales
 * @param {string} props.title - Tooltip del botón
 * @param {string} props.type - Tipo de botón (button, submit)
 * @param {boolean} props.active - Si el botón está activo (para botones toggle)
 * @param {React.CSSProperties} props.style - Estilos inline adicionales
 */
export default function Button({
    children,
    variant = 'primary',
    disabled = false,
    onClick,
    className = '',
    title,
    type = 'button',
    active = false,
    style
}) {
    // Configuración de colores por variante
    const variantStyles = {
        primary: {
            background: `linear-gradient(135deg, ${THEME_COLORS.ACCENT_BLUE} 0%, #2563eb 100%)`,
            border: `2px solid ${THEME_COLORS.ACCENT_BLUE}`,
            color: THEME_COLORS.TEXT_PRIMARY,
            hoverShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
        },
        secondary: {
            background: 'transparent',
            border: `2px solid ${THEME_COLORS.BORDER_SECONDARY}`,
            color: THEME_COLORS.TEXT_SUBTLE,
            hoverShadow: '0 4px 12px rgba(148, 163, 184, 0.2)',
        },
        danger: {
            background: `linear-gradient(135deg, ${THEME_COLORS.ACCENT_ERROR} 0%, #dc2626 100%)`,
            border: `2px solid ${THEME_COLORS.ACCENT_ERROR}`,
            color: THEME_COLORS.TEXT_PRIMARY,
            hoverShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
        },
        success: {
            background: `linear-gradient(135deg, ${THEME_COLORS.ACCENT_SUCCESS_BG} 0%, #059669 100%)`,
            border: `2px solid ${THEME_COLORS.ACCENT_SUCCESS_BG}`,
            color: THEME_COLORS.TEXT_PRIMARY,
            hoverShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
        },
        warning: {
            background: `linear-gradient(135deg, ${THEME_COLORS.ACCENT_WARNING} 0%, #d97706 100%)`,
            border: `2px solid ${THEME_COLORS.ACCENT_WARNING}`,
            color: THEME_COLORS.TEXT_PRIMARY,
            hoverShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
        },
        icon: {
            background: `${THEME_COLORS.BG_SECONDARY}cc`,
            border: `2px solid ${THEME_COLORS.BORDER_SECONDARY}`,
            color: THEME_COLORS.TEXT_SUBTLE,
            hoverShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
        }
    };

    const variantStyle = variantStyles[variant] || variantStyles.primary;

    // Estilos base para todos los botones
    const estiloBase = {
        padding: variant === 'icon' ? SPACING.MD : `${SPACING.MD} ${SPACING.XXL}`,
        borderRadius: BORDER_RADIUS.MD,
        fontWeight: FONT_WEIGHT.MEDIUM,
        fontSize: variant === 'icon' ? FONT_SIZE.XL : FONT_SIZE.LG,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: TRANSITIONS.FAST,
        width: variant === 'icon' ? 'auto' : '100%',
        minWidth: variant === 'icon' ? '40px' : 'auto',
        background: variantStyle.background,
        border: variantStyle.border,
        color: variantStyle.color,
        opacity: disabled ? 0.5 : 1,
        transform: 'translateY(0)',
        boxShadow: active ? variantStyle.hoverShadow : 'none',
        ...style
    };

    // Estado hover - manejado por onMouseEnter/onMouseLeave
    const [isHovering, setIsHovering] = React.useState(false);

    const estiloConHover = !disabled && isHovering ? {
        ...estiloBase,
        transform: 'translateY(-2px)',
        boxShadow: variantStyle.hoverShadow,
    } : estiloBase;

    return (
        <button
            type={type}
            className={className}
            disabled={disabled}
            onClick={onClick}
            title={title}
            style={estiloConHover}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {children}
        </button>
    );
}
