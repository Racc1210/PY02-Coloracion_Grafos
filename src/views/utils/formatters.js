/**
 * Utilidades de formateo de datos para presentación.
 * Proporciona funciones para formatear números, tiempo, porcentajes y conteos.
 * @module formatters
 */

/**
 * Formatea números grandes con separadores de miles.
 * @param {number} numero - Número a formatear.
 * @returns {string} Número formateado.
 * @example
 */
export function formatearNumero(numero) {
    return numero.toLocaleString();
}

/**
 * Formatea tiempo en milisegundos o segundos según magnitud.
 * @param {number} tiempoEnMilisegundos - Tiempo en milisegundos.
 * @returns {string} String de tiempo formateado.
 * @example
 */
export function formatearTiempo(tiempoEnMilisegundos) {
    if (tiempoEnMilisegundos >= 1000) {
        return `${(tiempoEnMilisegundos / 1000).toFixed(2)} s`;
    }
    return `${tiempoEnMilisegundos.toFixed(0)} ms`;
}

