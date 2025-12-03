import React from "react";
import StatItem from "./StatItem.jsx";
import { formatearTiempo } from "../utils/formatters.js";

/**
 * Componente StatsColumn para mostrar columna de estadísticas de coloración
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.coloringStats - Objeto con las estadísticas de coloración
 * @param {string} props.coloringStats.algorithm - Nombre del algoritmo usado
 * @param {number} [props.coloringStats.iterations] - Número de iteraciones
 * @param {number} props.coloringStats.attempts - Intentos o muestras
 * @param {number} props.coloringStats.conflicts - Número de conflictos
 * @param {number} [props.coloringStats.successRate] - Tasa de éxito
 * @param {number} [props.coloringStats.meanConflicts] - Conflictos promedio
 * @param {number} [props.coloringStats.timeMs] - Tiempo de ejecución en milisegundos
 */
export default function StatsColumn({ coloringStats }) {
    const isMonteCarlo = coloringStats.algorithm?.toLowerCase().includes('monte');
    const isLasVegas = coloringStats.algorithm?.toLowerCase().includes('vegas');

    return (
        <div>
            <StatItem
                label="Algoritmo"
                value={coloringStats.algorithm}
            />

            {isMonteCarlo && coloringStats.iterations && (
                <StatItem
                    label="Iteraciones"
                    value={coloringStats.iterations}
                />
            )}

            <StatItem
                label={isLasVegas ? 'Intentos' : 'Muestras'}
                value={coloringStats.attempts || 0}
            />

            <StatItem
                label="Conflictos"
                value={coloringStats.conflicts || 0}
                highlight={true}
                valueClass={coloringStats.conflicts === 0 ? 'graph-canvas__stat-value--success' : 'graph-canvas__stat-value--error'}
            />

            {typeof coloringStats.successRate === "number" && isMonteCarlo && (
                <StatItem
                    label="Tasa de éxito"
                    value={`${(coloringStats.successRate * 100).toFixed(6)}%`}
                />
            )}

            {typeof coloringStats.meanConflicts === "number" && isMonteCarlo && (
                <StatItem
                    label="Conflictos promedio"
                    value={coloringStats.meanConflicts.toFixed(2)}
                />
            )}

            {coloringStats.timeMs !== undefined && (
                <StatItem
                    label="Tiempo"
                    value={formatearTiempo(coloringStats.timeMs)}
                />
            )}
        </div>
    );
}
