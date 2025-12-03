/**
 * Graph Context - Mediador entre Controlador y Vistas
 * sin imports directos del controlador en las vistas.
 * @module GraphContext
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import GraphController from './GraphController.js';

/**
 * Objeto de contexto para estado del grafo y operaciones.
 * @type {React.Context}
 */
const GraphContext = createContext(null);

/**
 * Hook personalizado para acceder al contexto del grafo.
 * 
 * @hook
 * @returns {Object} Valor del contexto del grafo con estado y acciones.
 * @throws {Error} Si se usa fuera de GraphProvider.
 */
export function useGraphContext() {
    const context = useContext(GraphContext);
    if (!context) {
        throw new Error('useGraphContext must be used within a GraphProvider');
    }
    return context;
}

/**
 * Componente Graph Provider.
 * Envuelve la aplicación y provee estado del grafo y operaciones a todos los hijos.
 * Crea una instancia única de GraphController y se suscribe a los cambios de estado.
 * 
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos que necesitan el contexto del grafo.
 */
export function GraphProvider({ children }) {
    // Crear instancia del controlador una vez al montar
    const [controller] = useState(() => new GraphController());

    // Suscribirse a actualizaciones de estado del controlador
    const [graphState, setGraphState] = useState(() => controller.getSnapshot());

    useEffect(() => {
        // Suscribirse a cambios de estado del controlador
        const unsubscribe = controller.subscribe(setGraphState);

        // Limpiar suscripción al desmontar
        return unsubscribe;
    }, [controller]);

    /**
     * Acciones de operaciones del grafo expuestas a los componentes.
     * Todas las acciones están memoizadas para prevenir re-renders innecesarios.
     */
    const actions = {
        // Operaciones de Grafo

        /**
         * Crea un nuevo nodo en las coordenadas especificadas.
         * @param {number} x - Coordenada x normalizada (0-1).
         * @param {number} y - Coordenada y normalizada (0-1).
         */
        createNode: useCallback((x, y) => {
            controller.createManualNode(x, y);
        }, [controller]),

        /**
         * Conecta dos nodos con una arista.
         * @param {number} sourceId - ID del nodo origen.
         * @param {number} targetId - ID del nodo destino.
         */
        connectNodes: useCallback((sourceId, targetId) => {
            controller.connectNodes(sourceId, targetId);
        }, [controller]),

        /**
         * Mueve un nodo a nuevas coordenadas.
         * @param {number} nodeId - ID del nodo a mover.
         * @param {number} x - Nueva coordenada x normalizada (0-1).
         * @param {number} y - Nueva coordenada y normalizada (0-1).
         */
        moveNode: useCallback((nodeId, x, y) => {
            controller.moveNode(nodeId, x, y);
        }, [controller]),

        /**
         * Elimina una arista entre dos nodos.
         * @param {number} sourceId - ID del nodo origen.
         * @param {number} targetId - ID del nodo destino.
         */
        deleteEdge: useCallback((sourceId, targetId) => {
            controller.deleteEdge(sourceId, targetId);
        }, [controller]),

        /**
         * Elimina un nodo y todas sus aristas conectadas.
         * @param {number} nodeId - ID del nodo a eliminar.
         */
        deleteNode: useCallback((nodeId) => {
            controller.deleteNode(nodeId);
        }, [controller]),

        /**
         * Genera un grafo conectado aleatorio.
         * @param {number} numberOfNodes - Número de nodos a generar.
         */
        generateRandomGraph: useCallback((numberOfNodes) => {
            controller.generateRandomGraph(numberOfNodes);
        }, [controller]),

        /**
         * Limpia todos los colores de los nodos sin remover la estructura del grafo.
         */
        clearColors: useCallback(() => {
            controller.clearColors();
        }, [controller]),

        /**
         * Resetea el grafo completo a estado vacío.
         */
        resetGraph: useCallback(() => {
            controller.resetGraph();
        }, [controller]),

        // Operaciones de Layout

        /**
         * Reorganiza el layout del grafo usando algoritmo dirigido por fuerzas.
         */
        reorganizeLayout: useCallback(() => {
            controller.reorganizeLayout();
        }, [controller]),

        // Operaciones de Coloración 

        /**
         * Recolorea manualmente un nodo y calcula métricas de impacto.
         * @param {number} nodeId - ID del nodo a recolorear.
         * @param {string} newColor - Nombre del nuevo color.
         * @returns {Object} Métricas de recoloreo incluyendo conflictos y sugerencias.
         */
        manualRecolor: useCallback((nodeId, newColor) => {
            return controller.manualRecolor(nodeId, newColor);
        }, [controller]),

        /**
         * Inicia el algoritmo de coloración dinámico (Las Vegas o Monte Carlo).
         * @param {Object} options - Configuración de coloración.
         * @param {string} options.algorithm - Tipo de algoritmo.
         * @param {number} [options.numColors] - Número de colores a usar.
         * @param {number} [options.iterations] - Número de iteraciones (Monte Carlo).
         */
        startDynamicColoring: useCallback((options) => {
            controller.startDynamicColoring(options);
        }, [controller]),

        /**
         * Inicia el algoritmo de búsqueda local con visualización paso a paso.
         * @param {Function} [onComplete] - Callback que recibe resultados cuando termina.
         */
        startLocalSearch: useCallback((onComplete) => {
            controller.startLocalSearchDynamic(onComplete);
        }, [controller]),
    };

    // Valor de contexto provisto a todos los hijos
    const contextValue = {
        graphState,
        actions,
    };

    return (
        <GraphContext.Provider value={contextValue}>
            {children}
        </GraphContext.Provider>
    );
}
