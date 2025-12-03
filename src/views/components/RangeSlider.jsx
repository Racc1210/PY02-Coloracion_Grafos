import React from "react";

/**
 * Componente RangeSlider reutilizable
 * 
 * @component
 * @param {Object} props
 * @param {string} props.label - Etiqueta del slider
 * @param {number} props.value - Valor actual
 * @param {number} props.min - Valor mínimo
 * @param {number} props.max - Valor máximo
 * @param {number} props.step - Incremento del slider
 * @param {Function} props.onChange - Manejador de cambio
 * @param {boolean} props.disabled - Si está deshabilitado
 * @param {Function} props.formatValue - Función para formatear el valor mostrado
 * @param {string} props.className - Clases CSS adicionales
 */
export default function RangeSlider({
    label,
    value,
    min,
    max,
    step = 1,
    onChange,
    disabled = false,
    formatValue,
    className = '',
    style,
}) {
    const handleChange = (e) => {
        const newValue = Number(e.target.value);
        onChange?.(newValue);
    };

    // Formatear valor si hay función de formato, sino usar valor directo
    const displayValue = formatValue ? formatValue(value) : value;

    return (
        <div className={`control-panel__field ${className}`} style={style}>
            <label className="control-panel__field-label">
                {label}: <strong>{displayValue}</strong>
            </label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                className="control-panel__slider"
                disabled={disabled}
            />
        </div>
    );
}
