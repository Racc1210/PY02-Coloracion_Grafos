// Web Worker (Module) para ejecutar algoritmos de coloración en background
/* eslint-disable no-restricted-globals */

import Graph from '../../models/Graph.js';
import LasVegas from '../../models/algorithms/LasVegas.js';
import MonteCarlo from '../../models/algorithms/MonteCarlo.js';

// Worker Message Handler 
self.onmessage = function (e) {
  const { type, data } = e.data;

  try {
    if (type === 'colorLasVegas') {
      const graph = new Graph();
      graph.nodos = data.graph.nodes;
      graph.aristas = data.graph.edges;

      const options = data.options || {};

      const startTime = performance.now();
      const algo = new LasVegas(graph, options);

      // Rastrear último índice enviado para enviar solo incrementos
      let ultimoIndiceEnviado = 0;

      // Callback de progreso - enviar solo nuevos intentos
      const progressCallback = (data) => {
        const currentTime = performance.now();

        // Obtener solo los intentos nuevos desde el último reporte
        const nuevosIntentos = algo.attemptsHistory.slice(ultimoIndiceEnviado);
        ultimoIndiceEnviado = algo.attemptsHistory.length;

        self.postMessage({
          type: 'colorProgress',
          progress: data.progress,
          attempts: data.attempts,
          conflicts: data.conflicts,
          colors: data.colors,
          conflictEdges: data.conflictEdges,
          meanConflicts: data.meanConflicts,
          successRate: data.successRate,
          timeMs: currentTime - startTime,
          currentAttempt: data.currentAttempt,
          newAttempts: nuevosIntentos  // Solo los nuevos intentos
        });
      };

      const result = algo.run(progressCallback);
      const endTime = performance.now();

      self.postMessage({
        type: 'colorComplete',
        algorithm: 'Las Vegas',
        result: {
          colors: result.colors,
          conflictEdges: result.conflictEdges,
          stats: {
            ...result.stats,
            timeMs: endTime - startTime
          },
          attemptsHistory: algo.attemptsHistory
        }
      });
    }

    if (type === 'colorMonteCarlo') {
      const graph = new Graph();
      graph.nodos = data.graph.nodes;
      graph.aristas = data.graph.edges;

      const options = data.options || {};

      const startTime = performance.now();
      const algo = new MonteCarlo(graph, options);

      // Rastrear último índice enviado para enviar solo incrementos
      let ultimoIndiceEnviado = 0;

      // Callback de progreso - enviar solo nuevos intentos
      const progressCallback = (data) => {
        const currentTime = performance.now();

        // Obtener solo los intentos nuevos desde el último reporte
        const nuevosIntentos = algo.attemptsHistory.slice(ultimoIndiceEnviado);
        ultimoIndiceEnviado = algo.attemptsHistory.length;

        self.postMessage({
          type: 'colorProgress',
          progress: data.progress,
          attempts: data.attempts,
          conflicts: data.conflicts,
          colors: data.colors,
          conflictEdges: data.conflictEdges,
          meanConflicts: data.meanConflicts,
          successRate: data.successRate,
          timeMs: currentTime - startTime,
          currentAttempt: data.currentAttempt,
          newAttempts: nuevosIntentos  // Solo los nuevos intentos
        });
      };

      const result = algo.run(progressCallback);
      const endTime = performance.now();

      self.postMessage({
        type: 'colorComplete',
        algorithm: 'Monte Carlo',
        result: {
          colors: result.colors,
          conflictEdges: result.conflictEdges,
          stats: {
            ...result.stats,
            timeMs: endTime - startTime
          },
          attemptsHistory: algo.attemptsHistory
        }
      });
    }

  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message,
      stack: error.stack
    });
  }
};
