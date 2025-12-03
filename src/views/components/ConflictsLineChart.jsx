import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { THEME_COLORS, FONT_SIZE, BORDER_RADIUS, SPACING, DIMENSIONS, STROKE_WIDTH, CHART_MARGIN } from '../constants/theme.js';

const defaultMargin = { top: CHART_MARGIN.TOP, right: CHART_MARGIN.RIGHT, left: CHART_MARGIN.LEFT, bottom: CHART_MARGIN.BOTTOM };


function reducirMuestreoDatos(datos, puntosMaximos = 500) {
    if (!datos || datos.length <= puntosMaximos) return datos;

    const tamañoVentana = Math.ceil(datos.length / puntosMaximos);
    const reducido = [];

    for (let i = 0; i < datos.length; i += tamañoVentana) {
        const ventana = datos.slice(i, Math.min(i + tamañoVentana, datos.length));
        const conflictos = ventana.map(d => d.conflicts);

        reducido.push({
            attemptNumber: ventana[Math.floor(ventana.length / 2)].attemptNumber,
            conflicts: Math.round(conflictos.reduce((a, b) => a + b, 0) / conflictos.length),
        });
    }

    return reducido;
}

const tooltipContentStyle = {
    backgroundColor: THEME_COLORS.BG_PRIMARY,
    border: `1px solid ${THEME_COLORS.BORDER_SECONDARY}`,
    borderRadius: BORDER_RADIUS.SM,
    fontSize: FONT_SIZE.SM,
    padding: `${SPACING.SM} ${SPACING.LG}`,
};

const tooltipLabelStyle = {
    color: THEME_COLORS.ACCENT_PRIMARY,
    fontSize: FONT_SIZE.SM,
    fontWeight: '600',
};

const tooltipItemStyle = {
    color: THEME_COLORS.TEXT_SECONDARY,
};

/**
 * Componente ConflictsLineChart para mostrar gráfico de línea de conflictos
 * 
 * @component
 * @param {Object} props
 * @param {Array<{attemptNumber: number, conflicts: number}>} props.data - Datos de conflictos por intento
 * @param {number} [props.maxPoints=500] - Máximo de puntos a mostrar (downsampling)
 */
function ConflictsLineChart({
    data,
    maxPoints = 500,
}) {
    // Aplicar downsampling para mejor rendimiento
    const datosProcesados = useMemo(() => reducirMuestreoDatos(data, maxPoints), [data, maxPoints]);

    if (!datosProcesados || datosProcesados.length === 0) {
        return null;
    }

    return (
        <ResponsiveContainer width="100%" height="100%" minWidth={parseInt(DIMENSIONS.CHART_MIN_WIDTH)} minHeight={parseInt(DIMENSIONS.CHART_MIN_HEIGHT)}>
            <LineChart data={datosProcesados} margin={defaultMargin}>
                <XAxis
                    dataKey="attemptNumber"
                    stroke={THEME_COLORS.BORDER_PRIMARY}
                    tick={{ fill: THEME_COLORS.TEXT_DISABLED, fontSize: parseInt(FONT_SIZE.XS) }}
                    label={{
                        value: 'Intentos',
                        position: 'insideBottom',
                        offset: CHART_MARGIN.LABEL_OFFSET,
                        fill: THEME_COLORS.TEXT_SUBTLE,
                        fontSize: parseInt(FONT_SIZE.XS),
                    }}
                />
                <YAxis
                    stroke={THEME_COLORS.BORDER_PRIMARY}
                    tick={{ fill: THEME_COLORS.TEXT_DISABLED, fontSize: parseInt(FONT_SIZE.XS) }}
                    label={{
                        value: 'Conflictos',
                        angle: -90,
                        position: 'insideLeft',
                        fill: THEME_COLORS.TEXT_SUBTLE,
                        fontSize: parseInt(FONT_SIZE.XS),
                    }}
                />
                <Tooltip
                    contentStyle={tooltipContentStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                    formatter={(value) => [value, 'Conflictos']}
                />
                <Line
                    type="monotone"
                    dataKey="conflicts"
                    stroke={THEME_COLORS.DANGER_PRIMARY}
                    strokeWidth={STROKE_WIDTH.NORMAL}
                    dot={false}
                    isAnimationActive={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

// Memorizar para evitar re-renders innecesarios cuando los datos no cambian
export default React.memo(ConflictsLineChart);
