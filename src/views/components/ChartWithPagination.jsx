import React, { useState } from "react";
import ConflictsLineChart from "./ConflictsLineChart.jsx";
import Pagination from "./Pagination.jsx";
import { THEME_COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, DIMENSIONS, LETTER_SPACING } from '../constants/theme.js';

const ITEMS_PER_PAGE = 100;

/**
 * Componente de gráfico paginado para mostrar evolución de conflictos
 * en la grafica. 
 * 
 * @component
 * @param {Object} props
 * @param {Array<{attemptNumber: number, conflicts: number}>} props.attemptsHistory - Historial completo de intentos con conflictos
 */
function ChartWithPagination({ attemptsHistory = [] }) {
    const [paginaActual, setPaginaActual] = useState(1);

    const totalPaginas = Math.ceil(attemptsHistory.length / ITEMS_PER_PAGE);
    const indiceInicio = (paginaActual - 1) * ITEMS_PER_PAGE;
    const indiceFin = Math.min(indiceInicio + ITEMS_PER_PAGE, attemptsHistory.length);
    const datosActuales = attemptsHistory.slice(indiceInicio, indiceFin);

    return (
        <div style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            minWidth: DIMENSIONS.CHART_WIDTH_SM,
            width: DIMENSIONS.CHART_WIDTH_MD,
            minHeight: DIMENSIONS.CHART_HEIGHT_MD,
        }}>
            <div style={{
                fontSize: FONT_SIZE.SM,
                fontWeight: FONT_WEIGHT.SEMIBOLD,
                color: THEME_COLORS.ACCENT_PRIMARY,
                marginBottom: SPACING.SM,
                textTransform: 'uppercase',
                letterSpacing: LETTER_SPACING.NORMAL,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <span>Evolución de Conflictos</span>
                <span style={{ fontSize: FONT_SIZE.XS, fontWeight: FONT_WEIGHT.NORMAL, textTransform: 'none' }}>
                    Pág. {paginaActual} / {totalPaginas}
                </span>
            </div>

            <div style={{
                height: DIMENSIONS.CHART_HEIGHT_SM,
                width: '100%',
                marginBottom: SPACING.SM,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {datosActuales && datosActuales.length > 0 ? (
                    <ConflictsLineChart data={datosActuales} maxPoints={100} />
                ) : (
                    <div style={{
                        color: THEME_COLORS.TEXT_DISABLED,
                        fontSize: FONT_SIZE.SM,
                        fontStyle: 'italic',
                    }}>
                        Esperando datos...
                    </div>
                )}
            </div>

            <Pagination
                currentPage={paginaActual}
                totalPages={totalPaginas}
                onPageChange={setPaginaActual}
                startIndex={indiceInicio}
                endIndex={indiceFin}
                showRange={true}
            />

            <div style={{
                fontSize: FONT_SIZE.XXS,
                color: THEME_COLORS.TEXT_DISABLED,
                marginTop: SPACING.XS,
                textAlign: 'center',
                fontStyle: 'italic',
            }}>
                {attemptsHistory.length.toLocaleString()} intentos totales
            </div>
        </div>
    );
}

export default ChartWithPagination;
