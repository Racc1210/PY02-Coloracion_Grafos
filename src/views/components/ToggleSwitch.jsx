import React from "react";

/**
 * Componente ToggleSwitch
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.checked - Estado del toggle
 * @param {Function} props.onChange - Callback cuando cambia el estado
 * @param {boolean} [props.disabled=false] - Si el toggle está deshabilitado
 * @param {string} [props.label] - Etiqueta opcional del toggle
 * @param {string} [props.className] - Clases CSS adicionales
 */
export default function ToggleSwitch({
    checked,
    onChange,
    disabled = false,
    label,
    className = '',
}) {
    const handleToggle = () => {
        if (!disabled) {
            onChange(!checked);
        }
    };

    const estiloContenedor = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
    };

    const estiloSwitch = {
        position: 'relative',
        width: '48px',
        height: '24px',
        borderRadius: '12px',
        backgroundColor: checked
            ? 'var(--color-accent-blue)'
            : 'rgba(148, 163, 184, 0.3)',
        transition: 'background-color 0.3s ease',
        boxShadow: checked
            ? '0 0 8px rgba(59, 130, 246, 0.4)'
            : 'inset 0 1px 3px rgba(0, 0, 0, 0.3)',
    };

    const estiloCirculo = {
        position: 'absolute',
        top: '2px',
        left: checked ? '26px' : '2px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        transition: 'left 0.3s ease',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    };

    const estiloLabel = {
        fontSize: '0.85rem',
        color: 'var(--color-text-primary)',
        fontWeight: 'var(--font-medium)',
    };

    return (
        <div
            className={className}
            style={estiloContenedor}
            onClick={handleToggle}
            role="switch"
            aria-checked={checked}
            aria-disabled={disabled}
        >
            <div style={estiloSwitch}>
                <div style={estiloCirculo} />
            </div>
            {label && <span style={estiloLabel}>{label}</span>}
        </div>
    );
}
