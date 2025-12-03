import React, { useRef, useEffect } from 'react';
import Button from './Button';
import { SPACING, FONT_SIZE, FONT_WEIGHT, THEME_COLORS } from '../constants/theme.js';

/**
 * Componente de paginación reutilizable con auto-repeat en botones individuales
 * 
 * @component
 * @param {Object} props
 * @param {number} props.currentPage - Página actual
 * @param {number} props.totalPages - Total de páginas
 * @param {Function} props.onPageChange - Callback cuando cambia la página
 * @param {number} props.startIndex - Índice inicial del rango mostrado
 * @param {number} props.endIndex - Índice final del rango mostrado
 * @param {boolean} [props.showRange=false] - Si mostrar el indicador de rango
 */
export default function Pagination({ currentPage, totalPages, onPageChange, startIndex, endIndex, showRange = false }) {
    const intervalRef = useRef(null);

    const irAPrimeraPagina = () => onPageChange(1);
    const irAUltimaPagina = () => onPageChange(totalPages);
    const irAPaginaAnterior = () => onPageChange(anterior => Math.max(1, anterior - 1));
    const irAPaginaSiguiente = () => onPageChange(anterior => Math.min(totalPages, anterior + 1));

    const handleMouseDown = (accion) => {
        accion();
        intervalRef.current = setInterval(accion, 150);
    };

    const handleMouseUp = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return (
        <div style={{
            display: 'flex',
            gap: SPACING.SM,
            justifyContent: 'center',
            alignItems: 'center',
            padding: `${SPACING.SM} 0`,
        }}>
            <Button
                variant="secondary"
                onClick={irAPrimeraPagina}
                disabled={currentPage === 1}
                style={{
                    padding: `${SPACING.XS} ${SPACING.SM}`,
                    fontSize: '16px',
                    minWidth: '32px',
                    fontWeight: FONT_WEIGHT.BOLD,
                    lineHeight: '1'
                }}
            >
                ««
            </Button>
            <Button
                variant="secondary"
                onMouseDown={() => handleMouseDown(irAPaginaAnterior)}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                disabled={currentPage === 1}
                style={{
                    padding: `${SPACING.XS} ${SPACING.SM}`,
                    fontSize: '18px',
                    minWidth: '32px',
                    fontWeight: FONT_WEIGHT.BOLD,
                    lineHeight: '1'
                }}
            >
                ‹
            </Button>

            {showRange && (
                <div style={{
                    fontSize: FONT_SIZE.SM,
                    color: THEME_COLORS.TEXT_PRIMARY,
                    minWidth: '90px',
                    textAlign: 'center',
                    fontWeight: FONT_WEIGHT.MEDIUM,
                    padding: `${SPACING.XS} ${SPACING.SM}`,
                    backgroundColor: THEME_COLORS.BG_PRIMARY,
                    borderRadius: '4px',
                    border: `1px solid ${THEME_COLORS.BORDER_SECONDARY}`
                }}>
                    {startIndex + 1}-{endIndex}
                </div>
            )}

            <Button
                variant="secondary"
                onMouseDown={() => handleMouseDown(irAPaginaSiguiente)}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                disabled={currentPage === totalPages}
                style={{
                    padding: `${SPACING.XS} ${SPACING.SM}`,
                    fontSize: '18px',
                    minWidth: '32px',
                    fontWeight: FONT_WEIGHT.BOLD,
                    lineHeight: '1'
                }}
            >
                ›
            </Button>
            <Button
                variant="secondary"
                onClick={irAUltimaPagina}
                disabled={currentPage === totalPages}
                style={{
                    padding: `${SPACING.XS} ${SPACING.SM}`,
                    fontSize: '16px',
                    minWidth: '32px',
                    fontWeight: FONT_WEIGHT.BOLD,
                    lineHeight: '1'
                }}
            >
                »»
            </Button>
        </div>
    );
}
