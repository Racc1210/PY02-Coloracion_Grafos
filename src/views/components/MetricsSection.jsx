import React from "react";

/**
 * Componente MetricsSection para secciones del panel de métricas
 * 
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido de la sección
 * @param {string} props.title - Título opcional de la sección
 * @param {boolean} props.highlight - Si la sección está destacada
 * @param {string} props.className - Clases CSS adicionales
 */
export default function MetricsSection({
    children,
    title,
    highlight = false,
    className = '',
}) {
    const claseSeccion = `recolor-metrics__section ${highlight ? 'recolor-metrics__section--highlight' : ''} ${className}`;

    return (
        <div className={claseSeccion}>
            {title && (
                <div className="recolor-metrics__section-title">{title}</div>
            )}
            {children}
        </div>
    );
}
