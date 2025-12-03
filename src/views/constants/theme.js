// src/constants/theme.js

/**
 * Constantes de tema para la aplicación
 * Colores del dark space theme
 */
export const THEME_COLORS = {
    // Backgrounds
    BG_PRIMARY: '#0f172a',
    BG_SECONDARY: '#1e293b',
    BG_TERTIARY: '#334155',

    // Borders
    BORDER_PRIMARY: '#475569',
    BORDER_SECONDARY: '#334155',

    // Text colors
    TEXT_PRIMARY: '#f1f5f9',
    TEXT_SECONDARY: '#e2e8f0',
    TEXT_MUTED: '#cbd5e1',
    TEXT_SUBTLE: '#94a3b8',
    TEXT_DISABLED: '#64748b',

    // Accent colors
    ACCENT_PRIMARY: '#7dd3fc',
    ACCENT_BLUE: '#3b82f6',
    ACCENT_SUCCESS: '#22c55e',
    ACCENT_SUCCESS_BG: '#10b981',
    ACCENT_SUCCESS_DARK: '#064e3b',
    ACCENT_ERROR: '#ef4444',
    ACCENT_ERROR_BG: '#7f1d1d',
    ACCENT_WARNING: '#f59e0b',
    ACCENT_WARNING_BG: '#78350f',

    // Interactive states
    SELECTED_BORDER: '#3b82f6',

    // Alert/Message backgrounds
    SUCCESS_BG_ALPHA: 'rgba(34, 197, 94, 0.1)',
    SUCCESS_BORDER: 'rgb(34, 197, 94)',
    WARNING_BG_ALPHA: 'rgba(234, 179, 8, 0.1)',
    WARNING_BORDER: 'rgb(234, 179, 8)',

    // Additional colors
    BLACK_ALPHA_LIGHT: 'rgba(0,0,0,0.2)',
    WHITE_ALPHA_LIGHT: 'rgba(255,255,255,0.1)',
    WHITE_ALPHA_MEDIUM: 'rgba(255,255,255,0.3)',
    WHITE_FULL: '#ffffff',

    // Edge/Node colors for SVG
    EDGE_SELECTED: 'rgba(125, 211, 252, 0.95)',
    EDGE_SELECTED_GLOW: 'rgba(125, 211, 252, 0.3)',
    EDGE_CONFLICT: 'rgba(248, 113, 113, 0.95)',
    EDGE_NORMAL: 'rgba(148, 163, 184',
    NODE_BORDER: '#020617',
    NODE_DEFAULT: '#e5e7eb',
};

/**
 * Constantes de espaciado
 */
export const SPACING = {
    XS: '4px',
    SM: '6px',
    MD: '8px',
    LG: '10px',
    XL: '12px',
    XXL: '16px',
};

/**
 * Constantes de márgenes para charts (valores numéricos)
 */
export const CHART_MARGIN = {
    TOP: 5,
    RIGHT: 10,
    LEFT: 0,
    BOTTOM: 20,
    LABEL_OFFSET: -15,
};

/**
 * Constantes de border radius
 */
export const BORDER_RADIUS = {
    SM: '4px',
    MD: '6px',
    LG: '8px',
};

/**
 * Constantes de tamaños de fuente
 */
export const FONT_SIZE = {
    XXS: '9px',
    XS: '10px',
    SM: '11px',
    MD: '12px',
    BASE: '13px',
    LG: '14px',
    XL: '16px',
    XXL: '20px',
};

/**
 * Constantes de peso de fuente
 */
export const FONT_WEIGHT = {
    NORMAL: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
};

/**
 * Constantes de transiciones
 */
export const TRANSITIONS = {
    FAST: 'all 0.2s ease',
    MEDIUM: 'all 0.3s ease',
};

/**
 * Constantes de z-index
 */
export const Z_INDEX = {
    CONTEXT_MENU: 999,
    MODAL: 1000,
};

/**
 * Constantes de opacidad
 */
export const OPACITY = {
    DISABLED: 0.3,
    FULL: 1,
};

/**
 * Constantes de dimensiones
 */
export const DIMENSIONS = {
    CHART_MIN_WIDTH: '300px',
    CHART_MIN_HEIGHT: '150px',
    CHART_WIDTH_SM: '350px',
    CHART_WIDTH_MD: '450px',
    CHART_HEIGHT_SM: '200px',
    CHART_HEIGHT_MD: '300px',
    ICON_SM: '16px',
    ICON_MD: '20px',
    STATS_COLUMN_MIN_WIDTH: '220px',
};

/**
 * Constantes de animación
 */
export const ANIMATION = {
    DELAY_SHORT: '300ms',
};

/**
 * Constantes de stroke/border width
 */
export const STROKE_WIDTH = {
    THIN: 1.5,
    NORMAL: 2,
    MEDIUM: 2.5,
    EXTRA_THICK: 12,
    SELECTION_GLOW_OFFSET: 6,
};

/**
 * Constantes de border width para CSS
 */
export const BORDER_WIDTH = {
    THIN: '1px',
    NORMAL: '2px',
    MEDIUM: '3px',
    THICK: '4px',
};

/**
 * Constantes de letter spacing
 */
export const LETTER_SPACING = {
    NORMAL: '0.05em',
};

/**
 * Constantes de radius para nodos
 */
export const NODE_RADIUS = {
    OFFSET_MEDIUM: 4,
    TEXT_OFFSET: 3,
};
