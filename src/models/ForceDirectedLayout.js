import { FORCE_DIRECTED } from "./constants/index.js";

/**
 * Implementa el algoritmo de layout dirigido por fuerzas de Fruchterman-Reingold.
 * @class
 */
export default class ForceDirectedLayout {
    /**
     * Crea un nuevo layout dirigido por fuerzas.
     * @param {number} [width=1.0] - Ancho del área de layout.
     * @param {number} [height=1.0] - Alto del área de layout.
     */
    constructor(width = 1.0, height = 1.0) {
        /** @type {number} Ancho del área de layout. */
        this.width = width;

        /** @type {number} Alto del área de layout. */
        this.height = height;

        /** @type {number} Área total para cálculos de fuerzas. */
        this.area = width * height;
    }

    /**
     * Aplica el algoritmo de layout dirigido por fuerzas para posicionar nodos.
     * @param {Array<Node>} nodos - Array de nodos a posicionar.
     * @param {Array<Edge>} aristas - Array de aristas que conectan nodos.
     * @param {number} [iteraciones=200] - Número de iteraciones de la simulación.
     */
    aplicar(nodos, aristas, iteraciones = 200) {
        const numeroDeNodos = nodos.length;
        const distanciaOptima = Math.sqrt(this.area / numeroDeNodos) * FORCE_DIRECTED.K_MULTIPLIER;
        let temperatura = this.width * FORCE_DIRECTED.TEMPERATURE_FACTOR;
        const tasaEnfriamiento = FORCE_DIRECTED.COOLING_RATE;

        for (let indiceIteracion = 0; indiceIteracion < iteraciones; indiceIteracion++) {
            this.calcularFuerzasRepulsivas(nodos, distanciaOptima);
            this.calcularFuerzasAtractivas(nodos, aristas, distanciaOptima);
            this.aplicarFuerzas(nodos, temperatura);
            temperatura *= tasaEnfriamiento;
        }

        nodos.forEach(nodo => {
            delete nodo.forceX;
            delete nodo.forceY;
        });
    }

    /**
     * Calcula la distancia segura entre dos puntos, evitando división por cero.
     * @param {number} deltaX - Diferencia en coordenadas X.
     * @param {number} deltaY - Diferencia en coordenadas Y.
     * @returns {Object} Objeto con propiedades deltaX, deltaY y distancia.
     * @private
     */
    _calcularDistanciaSegura(deltaX, deltaY) {
        if (deltaX === 0 && deltaY === 0) {
            return {
                deltaX: (Math.random() - 0.5) * 0.01,
                deltaY: (Math.random() - 0.5) * 0.01,
                distancia: 0.01
            };
        }
        return {
            deltaX,
            deltaY,
            distancia: Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        };
    }

    /**
     * Calcula fuerzas repulsivas entre todos los pares de nodos.
     * @param {Array<Node>} nodos - Array de nodos.
     * @param {number} distanciaOptima - Distancia óptima entre nodos.
     * @private
     */
    calcularFuerzasRepulsivas(nodos, distanciaOptima) {
        for (let i = 0; i < nodos.length; i++) {
            nodos[i].forceX = 0;
            nodos[i].forceY = 0;

            for (let j = 0; j < nodos.length; j++) {
                if (i === j) continue;

                const { deltaX, deltaY, distancia } = this._calcularDistanciaSegura(
                    nodos[i].x - nodos[j].x,
                    nodos[i].y - nodos[j].y
                );

                const fuerzaRepulsiva = (distanciaOptima * distanciaOptima) / distancia;

                nodos[i].forceX += (deltaX / distancia) * fuerzaRepulsiva;
                nodos[i].forceY += (deltaY / distancia) * fuerzaRepulsiva;
            }
        }
    }

    /**
     * Calcula fuerzas atractivas a lo largo de las aristas.
     * Fórmula: Fuerza = distancia² / distanciaOptima
     * @param {Array<Node>} nodos - Array de nodos.
     * @param {Array<Edge>} aristas - Array de aristas.
     * @param {number} distanciaOptima - Distancia óptima entre nodos.
     * @private
     */
    calcularFuerzasAtractivas(nodos, aristas, distanciaOptima) {
        const nodoMap = new Map(nodos.map(n => [n.id, n]));

        for (const arista of aristas) {
            const nodoOrigen = nodoMap.get(arista.sourceId);
            const nodoDestino = nodoMap.get(arista.targetId);

            if (!nodoOrigen || !nodoDestino) continue;

            const { deltaX, deltaY, distancia } = this._calcularDistanciaSegura(
                nodoDestino.x - nodoOrigen.x,
                nodoDestino.y - nodoOrigen.y
            );

            const fuerzaAtractiva = (distancia * distancia) / distanciaOptima;

            const fuerzaX = (deltaX / distancia) * fuerzaAtractiva;
            const fuerzaY = (deltaY / distancia) * fuerzaAtractiva;

            nodoOrigen.forceX += fuerzaX;
            nodoOrigen.forceY += fuerzaY;
            nodoDestino.forceX -= fuerzaX;
            nodoDestino.forceY -= fuerzaY;
        }
    }

    /**
     * Aplica fuerzas acumuladas a las posiciones de los nodos.
     * @param {Array<Node>} nodos - Array de nodos.
     * @param {number} temperatura - Temperatura actual (controla el desplazamiento máximo).
     * @private
     */
    aplicarFuerzas(nodos, temperatura) {
        for (const nodo of nodos) {
            const fuerzaX = nodo.forceX;
            const fuerzaY = nodo.forceY;
            const magnitudFuerza = Math.sqrt(fuerzaX * fuerzaX + fuerzaY * fuerzaY) || 0.001;

            const desplazamiento = Math.min(magnitudFuerza, temperatura);

            nodo.x += (fuerzaX / magnitudFuerza) * desplazamiento;
            nodo.y += (fuerzaY / magnitudFuerza) * desplazamiento;

            // Mantener nodos dentro de los límites
            nodo.x = Math.max(
                FORCE_DIRECTED.POSITION_MIN,
                Math.min(FORCE_DIRECTED.POSITION_MAX, nodo.x)
            );
            nodo.y = Math.max(
                FORCE_DIRECTED.POSITION_MIN,
                Math.min(FORCE_DIRECTED.POSITION_MAX, nodo.y)
            );
        }
    }
}
