/**
 * Utilidades de generación de paleta de colores.
 * Provee funciones para generar paletas de colores para el colore de grafos.
 * @module colorPalette
 */

import { COLOR_PALETTE } from '../constants/index.js';

/**
 * Genera una paleta de colores con el número especificado de colores.
 * @param {number} numeroColores - Número de colores a incluir (3-10).
 * @returns {Array<string>} Array de nombres de colores.
 */
export function generarPaletaColores(numeroColores) {
    return COLOR_PALETTE.NAMES.slice(0, numeroColores);
}
