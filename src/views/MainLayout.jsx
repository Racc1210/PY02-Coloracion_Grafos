import React, { useState } from "react";
import ControlPanelView from "./ControlPanelView";
import GraphCanvasView from "./GraphCanvasView";
import ColorIncrementModal from "./components/ColorIncrementModal.jsx";
import { useGraphContext } from "../controllers/GraphContext.jsx";
import { GRAPH_CONSTRAINTS } from "./constants/index.js";
import { ANIMATION } from "./constants/theme.js";

/**
 * Componente de layout principal que coordina el panel de control y la vista del canvas del grafo.
 * @component
 */
export default function MainLayout() {
  // Acceder al estado del grafo y acciones desde el Context
  const { graphState, actions } = useGraphContext();

  // Estado local de UI
  const [recolorResult, setRecolorResult] = useState(null);
  const [pinnedRecolorResult, setPinnedRecolorResult] = useState(false);

  // Estado para el modal de incremento de colores
  const [modalIncrementoColores, setModalIncrementoColores] = useState({
    isOpen: false,
    currentColors: 0,
    maxColors: GRAPH_CONSTRAINTS.MAX_COLORS,
    attempts: 0,
    algorithm: '',
    originalOptions: null
  });

  //Event handlers
  const handleGenerateRandomGraph = (nodeCount) => {
    setRecolorResult(null);
    setPinnedRecolorResult(false);
    actions.generateRandomGraph(nodeCount);
  };

  const handleReset = () => {
    setRecolorResult(null);
    setPinnedRecolorResult(false);
    actions.resetGraph();
  };

  const handleClearColors = () => {
    setRecolorResult(null);
    setPinnedRecolorResult(false);
    actions.clearColors();
  };

  const handleReorganize = () => {
    setRecolorResult(null);
    setPinnedRecolorResult(false);
    actions.reorganizeLayout();
  };

  const handleColorGraph = (opciones) => {
    setRecolorResult(null);
    setPinnedRecolorResult(false);
    if (
      opciones.algorithm === "lasvegas-dynamic" ||
      opciones.algorithm === "montecarlo-dynamic"
    ) {
      // Agregar callback para manejar cuando no se encuentra solución
      const opcionesConCallback = {
        ...opciones,
        onNoSolutionFound: opciones.autoIncrementColors
          ? (stats) => {
            // Si está habilitado el incremento automático, mostrar modal
            setModalIncrementoColores({
              isOpen: true,
              currentColors: opciones.numColors,
              maxColors: GRAPH_CONSTRAINTS.MAX_COLORS,
              attempts: stats.attempts,
              algorithm: opciones.algorithm === "montecarlo-dynamic" ? "Monte Carlo" : "Las Vegas",
              originalOptions: opciones
            });
          }
          : null
      };
      actions.startDynamicColoring(opcionesConCallback);
    }
  };

  const handleRetryWithMoreColors = () => {
    const { originalOptions, currentColors } = modalIncrementoColores;
    setModalIncrementoColores({ ...modalIncrementoColores, isOpen: false });

    // Reintentar con un color más
    const nuevasOpciones = {
      ...originalOptions,
      numColors: currentColors + 1
    };

    // delay para que se cierre el modal antes de empezar
    setTimeout(() => {
      handleColorGraph(nuevasOpciones);
    }, parseInt(ANIMATION.DELAY_SHORT));
  };

  const handleCancelIncrement = () => {
    setModalIncrementoColores({ ...modalIncrementoColores, isOpen: false });
  };

  const handleManualRecolor = (idNodo, nuevoColor) => {
    return actions.manualRecolor(idNodo, nuevoColor);
  };

  const handleLocalSearch = () => {
    setRecolorResult(null);
    setPinnedRecolorResult(false);
    actions.startLocalSearch((resultado) => {
      // Callback ejecutado cuando la búsqueda local se completa
      setRecolorResult(resultado);
      setPinnedRecolorResult(true);
    });
  };

  return (
    <div className="app-root">
      <main className="graph-layout">
        <aside className="graph-layout__sidebar">
          <ControlPanelView
            maxNodes={GRAPH_CONSTRAINTS.MAX_NODES}
            currentNodes={graphState.nodos.length}
            nodes={graphState.nodos}
            edges={graphState.aristas}
            onGenerateRandomGraph={handleGenerateRandomGraph}
            onReset={handleReset}
            onClearColors={handleClearColors}
            onReorganize={handleReorganize}
            onColorGraph={handleColorGraph}
            coloringStats={graphState.coloringStats}
            onLocalSearch={handleLocalSearch}
            hasManualChanges={graphState.hasManualChanges}
            hasColoredGraph={graphState.hasColoredGraph}
            conflictsCount={graphState.conflictEdges.length}
          />
        </aside>

        <section className="graph-layout__canvas">
          <GraphCanvasView
            graph={graphState}
            onConnectNodes={actions.connectNodes}
            onMoveNode={actions.moveNode}
            onDeleteEdge={actions.deleteEdge}
            onDeleteNode={actions.deleteNode}
            onManualRecolor={handleManualRecolor}
            onCreateNodeAt={actions.createNode}
            attemptsHistory={graphState.attemptsHistory}
            recolorResult={recolorResult}
            setRecolorResult={setRecolorResult}
            pinnedRecolorResult={pinnedRecolorResult}
            setPinnedRecolorResult={setPinnedRecolorResult}
          />
        </section>
      </main>

      {/* Modal de incremento de colores */}
      <ColorIncrementModal
        isOpen={modalIncrementoColores.isOpen}
        currentColors={modalIncrementoColores.currentColors}
        maxColors={modalIncrementoColores.maxColors}
        attempts={modalIncrementoColores.attempts}
        algorithm={modalIncrementoColores.algorithm}
        onRetryWithMoreColors={handleRetryWithMoreColors}
        onCancel={handleCancelIncrement}
      />
    </div>
  );
}
