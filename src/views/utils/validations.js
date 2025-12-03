/**
 * Utilidades de validación para entradas de usuario.
 * Proporciona funciones para validar opciones de coloración, rangos de nodos y rangos numéricos.
 * @module validations
 */

import { GRAPH_CONSTRAINTS } from '../constants/index.js';

/**
 * Valida opciones de coloración de grafo antes de ejecutar un algoritmo.
 * @param {Object} opciones - Opciones de coloración a validar.
 * @param {number} opciones.numColors - Número de colores (k).
 * @param {string} opciones.algorithm - Nombre del algoritmo seleccionado.
 * @param {number} [opciones.iterations] - Número de iteraciones (solo Monte Carlo).
 * @returns {{valid: boolean, errors: Array<string>}} Resultado de validación con mensajes de error.
 */
export function validarOpcionesColoracion(opciones) {
    const errores = [];

    // Validar número de colores
    if (
        !opciones.numColors ||
        opciones.numColors < GRAPH_CONSTRAINTS.MIN_COLORS ||
        opciones.numColors > GRAPH_CONSTRAINTS.MAX_COLORS
    ) {
        errores.push(
            `El número de colores debe estar entre ${GRAPH_CONSTRAINTS.MIN_COLORS} y ${GRAPH_CONSTRAINTS.MAX_COLORS}.`
        );
    }

    // Validar iteraciones para Monte Carlo
    if (opciones.algorithm === 'montecarlo-dynamic') {
        if (!opciones.iterations || opciones.iterations < 1) {
            errores.push('Las iteraciones deben ser un número entero positivo.');
        }
    }

    return {
        valid: errores.length === 0,
        errors: errores,
    };
}

/**
 * Valida que el grafo no tenga nodos aislados.
 * Los algoritmos requieren que todos los nodos estén conectados.
 * @param {Array<Node>} nodos - Array de nodos del grafo.
 * @param {Array<Edge>} aristas - Array de aristas del grafo.
 * @returns {{valid: boolean, error: string|null, isolatedCount: number}} Resultado de validación con mensaje de error.
 */
export function validarSinNodosAislados(nodos, aristas) {
    const nodosAislados = nodos.filter(nodo => {
        return aristas.every(arista => arista.sourceId !== nodo.id && arista.targetId !== nodo.id);
    });

    if (nodosAislados.length > 0) {
        return {
            valid: false,
            error: `Existen ${nodosAislados.length} nodo${nodosAislados.length > 1 ? 's' : ''} aislado${nodosAislados.length > 1 ? 's' : ''} (sin conexiones). Los algoritmos requieren que todos los nodos estén conectados.`,
            isolatedCount: nodosAislados.length
        };
    }

    return { valid: true, error: null, isolatedCount: 0 };
}

