import React from "react";

/**
 * Componente PanelSection para secciones del panel de control
 * 
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido de la sección
 * @param {string} props.title - Título de la sección
 * @param {'green'|'danger'|''} props.titleVariant - Variante de color del título
 * @param {boolean} props.bordered - Si la sección tiene bordes
 * @param {string} props.text - Texto descriptivo opcional
 * @param {string} props.className - Clases CSS adicionales
 */
export default function PanelSection({
    children,
    title,
    titleVariant = '',
    bordered = true,
    text,
    className = '',
}) {
    const sectionClass = `control-panel__section ${bordered ? 'control-panel__section--bordered' : ''} ${className}`;

    let titleClass = 'control-panel__section-title';
    if (titleVariant) titleClass += ` control-panel__section-title--${titleVariant}`;

    return (
        <section className={sectionClass}>
            {title && <h3 className={titleClass}>{title}</h3>}
            {text && <p className="control-panel__section-text">{text}</p>}
            {children}
        </section>
    );
}
