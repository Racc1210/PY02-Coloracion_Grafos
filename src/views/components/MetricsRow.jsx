import React from "react";

/**
 * Componente MetricsRow para filas de métricas label/value
 * 
 * @component
 * @param {Object} props
 * @param {string} props.label - Etiqueta de la métrica
 * @param {React.ReactNode} props.value - Valor de la métrica
 * @param {React.ReactNode} props.children - Contenido personalizado como alternativa a value
 * @param {'good'|'bad'|'medium'|'highlight'|''} props.valueVariant - Variante de color para el valor
 * @param {boolean} props.large - Si es una fila grande
 * @param {string} props.className - Clases CSS adicionales
 */
export default function MetricsRow({
    label,
    value,
    children,
    valueVariant = '',
    large = false,
    className = '',
}) {
    const rowClass = `recolor-metrics__row ${large ? 'recolor-metrics__row--large' : ''} ${className}`;

    let valueClass = 'recolor-metrics__value';
    if (large) valueClass += ' recolor-metrics__value--large';
    if (valueVariant) valueClass += ` recolor-metrics__value--${valueVariant}`;

    return (
        <div className={rowClass}>
            <span className="recolor-metrics__label">{label}</span>
            <span className={valueClass}>{children || value}</span>
        </div>
    );
}
