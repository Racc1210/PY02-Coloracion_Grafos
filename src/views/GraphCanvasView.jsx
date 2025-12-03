import React, { useState, useRef, useEffect } from "react";
import { COLOR_PALETTE, GRAPH_CONSTRAINTS } from "./constants/index.js";
import { calcularViewBox, construirConjuntoConflictos, renderizarArista, renderizarNodo } from "./utils/svgHelpers.js";
import { useGraphInteraction } from "./hooks/useGraphInteraction.js";
import { useZoomPan } from "./hooks/useZoomPan.js";
import { useContextMenu } from "./hooks/useContextMenu.js";
import { useDragAndDrop } from "./hooks/useDragAndDrop.js";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts.js";
import StatsColumn from "./components/StatsColumn.jsx";
import ChartWithPagination from "./components/ChartWithPagination.jsx";
import Button from "./components/Button.jsx";
import MetricsRow from "./components/MetricsRow.jsx";
import MetricsSection from "./components/MetricsSection.jsx";
import { THEME_COLORS, SPACING, FONT_SIZE, DIMENSIONS, BORDER_RADIUS, BORDER_WIDTH, Z_INDEX } from './constants/theme.js';

// Constantes
const MAPA_COLORES = COLOR_PALETTE.HEX_MAP;

/**
 * Componente de vista de canvas de grafo interactivo con renderizado SVG
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.graph - Estructura de datos del grafo con nodos y aristas
 * @param {Function} props.onConnectNodes - Callback para conectar dos nodos
 * @param {Function} props.onMoveNode - Callback cuando se mueve un nodo
 * @param {Function} props.onDeleteEdge - Callback para eliminar una arista
 * @param {Function} props.onDeleteNode - Callback para eliminar un nodo
 * @param {Function} props.onManualRecolor - Callback para recolorear manualmente un nodo
 * @param {Function} props.onCreateNodeAt - Callback para crear nodo en posición
 * @param {Array} props.attemptsHistory - Historial de intentos de coloración
 * @param {Object} props.recolorResult - Resultado de la operación de recoloración
 * @param {Function} props.setRecolorResult - Setter para el resultado de recoloración
 * @param {boolean} props.pinnedRecolorResult - Si el panel de resultados está anclado
 * @param {Function} props.setPinnedRecolorResult - Setter para el estado de anclaje
 */
export default function GraphCanvasView({
  graph,
  onConnectNodes,
  onMoveNode,
  onDeleteEdge,
  onDeleteNode,
  onManualRecolor,
  onCreateNodeAt,
  attemptsHistory,
  recolorResult,
  setRecolorResult,
  pinnedRecolorResult,
  setPinnedRecolorResult,
}) {
  // Refs para elementos DOM
  const svgRef = useRef(null);
  const statsOverlayRef = useRef(null);

  // Estado local
  const [mostrarStats, setMostrarStats] = useState(false);

  // Hooks personalizados para manejo de interacción
  const zoomPan = useZoomPan();
  const interaccion = useGraphInteraction(svgRef, onConnectNodes, onMoveNode);
  const contextMenuHook = useContextMenu(onManualRecolor);
  const dragDrop = useDragAndDrop(svgRef, onCreateNodeAt);

  // Estado de ejecución del algoritmo
  const estaEjecutando = graph.coloringStats?.dynamic && graph.coloringStats?.isRunning;

  // Atajos de teclado para eliminación
  useKeyboardShortcuts({
    selectedNodeId: interaccion.selectedNodeId,
    selectedEdge: interaccion.selectedEdge,
    onDeleteNode,
    onDeleteEdge,
    onClearSelection: interaccion.clearSelection,
    isEnabled: !estaEjecutando && !contextMenuHook.contextMenu
  });

  // Auto-mostrar overlay cuando se inicia algoritmo de coloración
  useEffect(() => {
    if (graph.coloringStats && graph.coloringStats.dynamic) {
      setMostrarStats(true);
    }
  }, [graph.coloringStats]);

  // Construir set de aristas en conflicto y calcular viewBox
  const conjuntoConflictos = construirConjuntoConflictos(graph.conflictEdges);
  const { viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight } = calcularViewBox(
    graph,
    zoomPan.zoomLevel,
    zoomPan.pan
  );

  // Handlers combinados
  const handleEdgeClick = (event, arista) => {
    contextMenuHook.setContextMenu(null);
    if (!pinnedRecolorResult) {
      setRecolorResult(null);
    }
    interaccion.handleEdgeClick(event, arista);
  };

  const handleNodeClick = (event, idNodo) => {
    contextMenuHook.setContextMenu(null);
    if (!pinnedRecolorResult) {
      setRecolorResult(null);
    }
    interaccion.handleNodeClick(event, idNodo);
  };

  const handleNodeContextMenu = (event, idNodo) => {
    if (!pinnedRecolorResult) {
      setRecolorResult(null);
    }
    contextMenuHook.handleNodeContextMenu(event, idNodo);
  };

  const handleSvgBackgroundClick = (event) => {
    interaccion.handleSvgBackgroundClick(event);
    if (event.target === event.currentTarget) {
      contextMenuHook.setContextMenu(null);
      if (!pinnedRecolorResult) {
        setRecolorResult(null);
      }
    }
  };

  const handleBackgroundMouseDown = (event) => {
    if (event.target === event.currentTarget) {
      zoomPan.startPanning(event);
    }
  };

  // Estado de creación de nodos
  const siguienteIdNodo = graph.nodos.length > 0 ? graph.nodos[graph.nodos.length - 1].id + 1 : 1;
  const estaEnLimiteNodos = graph.nodos.length >= GRAPH_CONSTRAINTS.MAX_NODES;
  const creacionNodoDeshabilitada = estaEnLimiteNodos || estaEjecutando;
  const tooltipCreacionNodo = estaEjecutando
    ? 'No se pueden añadir nodos durante la ejecución'
    : estaEnLimiteNodos
      ? `Límite de ${GRAPH_CONSTRAINTS.MAX_NODES} nodos alcanzado`
      : `Arrastra para añadir nodo #${siguienteIdNodo}`;

  return (
    <div className="graph-canvas">
      <div className="graph-canvas__toolbar">
        <div
          className={`graph-canvas__add-node-button ${creacionNodoDeshabilitada ? 'graph-canvas__add-node-button--disabled' : ''}`}
          draggable={!creacionNodoDeshabilitada}
          onDragStart={creacionNodoDeshabilitada ? undefined : dragDrop.handleDragStart}
          title={tooltipCreacionNodo}
        >
          <div className="graph-canvas__add-node-circle">
            <span className="graph-canvas__add-node-number">{siguienteIdNodo}</span>
          </div>
          <div className="graph-canvas__add-node-plus">{estaEnLimiteNodos ? '×' : '+'}</div>
        </div>
        <div className="graph-canvas__toolbar-divider" />

        {graph.coloringStats && (
          <>
            <Button
              variant="icon"
              active={mostrarStats}
              onClick={() => setMostrarStats(!mostrarStats)}
              title={mostrarStats ? "Ocultar estadísticas" : "Mostrar estadísticas"}
            >
              <img src={`${process.env.PUBLIC_URL}/estadisticas.svg`} alt="Stats" style={{ width: DIMENSIONS.ICON_MD, height: DIMENSIONS.ICON_MD }} />
            </Button>
            <div className="graph-canvas__toolbar-divider" />
          </>
        )}
        <Button variant="icon" onClick={zoomPan.handleZoomIn} title="Acercar">+</Button>
        <div className="graph-canvas__zoom-level">{Math.round(zoomPan.zoomLevel * 100)}%</div>
        <Button variant="icon" onClick={zoomPan.handleZoomOut} title="Alejar">-</Button>
        <Button variant="icon" onClick={zoomPan.handleZoomReset} title="Restablecer">⊙</Button>
      </div>

      {/* Stats Overlay - Muestra estadísticas de ejecución del algoritmo */}
      {mostrarStats && graph.coloringStats && (() => {
        const esMonteCarlo = graph.coloringStats.algorithm &&
          graph.coloringStats.algorithm.toLowerCase().includes('monte');
        const tituloStats = graph.coloringStats.isRunning
          ? '⏳ Ejecutando...'
          : graph.coloringStats.conflicts === 0
            ? '✓ Éxito'
            : '⚠ Resultados';

        return (
          <div ref={statsOverlayRef} className="graph-canvas__stats-overlay">
            <div className="graph-canvas__stats-header">
              <span className="graph-canvas__stats-title">{tituloStats}</span>
              <Button variant="icon" className="graph-canvas__stats-close" onClick={() => setMostrarStats(false)}>✕</Button>
            </div>
            <div className="graph-canvas__stats-content" style={{
              display: esMonteCarlo ? 'flex' : 'block',
              gap: SPACING.XL
            }}>
              {/* Columna de estadísticas */}
              <div style={{
                flex: esMonteCarlo ? '0 0 auto' : '1',
                minWidth: esMonteCarlo ? DIMENSIONS.STATS_COLUMN_MIN_WIDTH : 'auto'
              }}>
                <StatsColumn coloringStats={graph.coloringStats} />
              </div>

              {/* Gráfico en tiempo real para Monte Carlo - Segunda columna */}
              {esMonteCarlo && <ChartWithPagination attemptsHistory={attemptsHistory} />}
            </div>
          </div>
        );
      })()}

      <div className="graph-canvas__container" onDrop={dragDrop.handleDrop} onDragOver={dragDrop.handleDragOver}>
        <svg
          ref={svgRef}
          className="graph-canvas__svg"
          viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ cursor: zoomPan.isPanning ? 'grabbing' : 'grab' }}
          onClick={handleSvgBackgroundClick}
          onMouseDown={handleBackgroundMouseDown}
          onMouseMove={(event) => interaccion.handleSvgMouseMove(event, zoomPan.isPanning, zoomPan)}
          onMouseUp={() => interaccion.handleSvgMouseUp(zoomPan)}
          onMouseLeave={() => interaccion.handleSvgMouseLeave(zoomPan)}
        >
          {graph.aristas.map((arista, index) => renderizarArista(arista, index, graph, conjuntoConflictos, interaccion.selectedEdge, zoomPan.zoomLevel, handleEdgeClick))}
          {graph.nodos.map((nodo) => renderizarNodo(nodo, interaccion.selectedNodeId, zoomPan.zoomLevel, graph, {
            onNodeClick: handleNodeClick,
            onNodeContextMenu: handleNodeContextMenu,
            onNodeMouseDown: interaccion.handleNodeMouseDown
          }))}
        </svg>
      </div>

      {contextMenuHook.contextMenu && (
        <>
          <div className="context-menu-overlay" onClick={contextMenuHook.handleCloseContextMenu} />
          <div className="context-menu" style={{ position: 'fixed', left: contextMenuHook.contextMenu.x, top: contextMenuHook.contextMenu.y, zIndex: Z_INDEX.CONTEXT_MENU }}>
            <div className="context-menu__title">Recolorear Nodo {contextMenuHook.contextMenu.nodeId}</div>
            {Object.entries(MAPA_COLORES).map(([nombreColor, hexColor]) => (
              <Button
                key={nombreColor}
                variant="icon"
                className={`context-menu__item context-menu__item--${nombreColor}`}
                onClick={() => contextMenuHook.handleColorSelect(nombreColor, setRecolorResult)}
              >
                <span className="context-menu__color-dot" style={{ background: hexColor }} />
                {nombreColor.charAt(0).toUpperCase() + nombreColor.slice(1)}
              </Button>
            ))}
          </div>
        </>
      )}

      {recolorResult && (
        <div className="recolor-metrics">
          <div style={{ display: 'flex', gap: SPACING.XS, position: 'absolute', top: SPACING.XL, right: SPACING.XL }}>
            <Button
              variant="icon"
              className="recolor-metrics__close"
              onClick={() => setPinnedRecolorResult(!pinnedRecolorResult)}
              title={pinnedRecolorResult ? "Desfijar panel" : "Fijar panel"}
              style={{ fontSize: FONT_SIZE.XL }}
            >
            </Button>
            <Button
              variant="icon"
              className="recolor-metrics__close"
              onClick={() => { setRecolorResult(null); setPinnedRecolorResult(false); }}
              title="Cerrar panel"
            >
              ×
            </Button>
          </div>
          <h4 className="recolor-metrics__title">
            {recolorResult.isLocalSearchResult ? 'Resultado de Búsqueda Local' : 'Análisis de Recoloración'}
          </h4>
          <div className="recolor-metrics__content">
            {recolorResult.isLocalSearchResult ? (
              <>
                <MetricsSection title="Resumen de Optimización">
                  {recolorResult.passNumber && recolorResult.passNumber > 1 && (
                    <MetricsRow
                      label="Pasadas ejecutadas:"
                      value={`${recolorResult.passNumber}`}
                      valueVariant="highlight"
                    />
                  )}
                  <MetricsRow
                    label="Nodos recoloreados:"
                    value={`${recolorResult.recoloredCount}`}
                    valueVariant="highlight"
                  />
                  <MetricsRow
                    label="Conflictos eliminados:"
                    value={`${recolorResult.conflictsReduced}`}
                    valueVariant={recolorResult.conflictsReduced > 0 ? 'good' : ''}
                  />
                  <MetricsRow
                    label="Mejora:"
                    value={`${recolorResult.improvement}%`}
                    valueVariant={recolorResult.improvement > 0 ? 'good' : ''}
                  />
                  <MetricsRow
                    label="Tiempo:"
                    value={`${(recolorResult.timeMs / 1000).toFixed(2)}s`}
                  />
                </MetricsSection>

                {/* Avisos según resultado */}
                {recolorResult.finalConflicts === 0 && (
                  <div className="recolor-metrics__hint" style={{
                    marginTop: SPACING.MD,
                    padding: SPACING.SM,
                    background: THEME_COLORS.SUCCESS_BG_ALPHA,
                    borderLeft: `${BORDER_WIDTH.MEDIUM} solid ${THEME_COLORS.SUCCESS_BORDER}`,
                    color: THEME_COLORS.SUCCESS_BORDER
                  }}>
                    Coloración válida sin conflictos
                  </div>
                )}

                {recolorResult.finalConflicts > 0 && recolorResult.improvement === 0 && (
                  <div className="recolor-metrics__hint" style={{
                    marginTop: SPACING.MD,
                    padding: SPACING.SM,
                    background: THEME_COLORS.WARNING_BG_ALPHA,
                    borderLeft: `${BORDER_WIDTH.MEDIUM} solid ${THEME_COLORS.WARNING_BORDER}`,
                    color: THEME_COLORS.WARNING_BORDER
                  }}>
                    Quedan {recolorResult.finalConflicts} conflictos. Es necesario recolorear o aumentar la cantidad de colores.
                  </div>
                )}

                {recolorResult.finalConflicts > 0 && recolorResult.improvement > 0 && recolorResult.improvement < 100 && (
                  <div className="recolor-metrics__hint" style={{
                    marginTop: SPACING.MD,
                    padding: SPACING.SM,
                    background: THEME_COLORS.WARNING_BG_ALPHA,
                    borderLeft: `${BORDER_WIDTH.MEDIUM} solid ${THEME_COLORS.WARNING_BORDER}`,
                    color: THEME_COLORS.WARNING_BORDER
                  }}>
                    Quedan {recolorResult.finalConflicts} conflictos. Es necesario recolorear o aumentar la cantidad de colores.
                  </div>
                )}
                {recolorResult.recoloredNodes && recolorResult.recoloredNodes.length > 0 && (
                  <MetricsSection title="Cambios Realizados">
                    <div style={{
                      maxHeight: DIMENSIONS.CHART_MIN_HEIGHT,
                      overflowY: 'auto',
                      fontSize: FONT_SIZE.XS,
                      padding: SPACING.SM,
                      background: THEME_COLORS.BLACK_ALPHA_LIGHT,
                      borderRadius: BORDER_RADIUS.SM
                    }}>
                      {recolorResult.recoloredNodes.map((cambio, index) => (
                        <div key={index} style={{
                          padding: `${SPACING.XS} 0`,
                          borderBottom: index < recolorResult.recoloredNodes.length - 1 ? `${BORDER_WIDTH.THIN} solid ${THEME_COLORS.WHITE_ALPHA_LIGHT}` : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: SPACING.SM
                        }}>
                          <span style={{ color: THEME_COLORS.TEXT_PRIMARY, minWidth: '60px' }}>Nodo #{cambio.nodeId}:</span>
                          <div style={{
                            width: DIMENSIONS.ICON_SM,
                            height: DIMENSIONS.ICON_SM,
                            borderRadius: '50%',
                            background: MAPA_COLORES[cambio.oldColor] || THEME_COLORS.TEXT_SECONDARY,
                            border: `${BORDER_WIDTH.NORMAL} solid ${THEME_COLORS.WHITE_ALPHA_MEDIUM}`
                          }} />
                          <span style={{ color: THEME_COLORS.TEXT_SECONDARY }}>→</span>
                          <div style={{
                            width: DIMENSIONS.ICON_SM,
                            height: DIMENSIONS.ICON_SM,
                            borderRadius: '50%',
                            background: MAPA_COLORES[cambio.newColor] || THEME_COLORS.ACCENT_PRIMARY,
                            border: `${BORDER_WIDTH.NORMAL} solid ${THEME_COLORS.WHITE_ALPHA_MEDIUM}`
                          }} />
                        </div>
                      ))}
                    </div>
                  </MetricsSection>
                )}
              </>
            ) : (
              <>
                <MetricsSection>
                  <MetricsRow label="Nodo:" value={`#${recolorResult.nodeId}`} />
                  <MetricsRow label="Cambio:">
                    <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.SM }}>
                      <div style={{
                        width: DIMENSIONS.ICON_SM,
                        height: DIMENSIONS.ICON_SM,
                        borderRadius: '50%',
                        background: MAPA_COLORES[recolorResult.oldColor] || '#666',
                        border: `${BORDER_WIDTH.NORMAL} solid ${THEME_COLORS.WHITE_ALPHA_MEDIUM}`
                      }} />
                      <span style={{ color: THEME_COLORS.TEXT_SECONDARY }}>→</span>
                      <div style={{
                        width: DIMENSIONS.ICON_SM,
                        height: DIMENSIONS.ICON_SM,
                        borderRadius: '50%',
                        background: MAPA_COLORES[recolorResult.newColor] || THEME_COLORS.ACCENT_PRIMARY,
                        border: `${BORDER_WIDTH.NORMAL} solid ${THEME_COLORS.WHITE_ALPHA_MEDIUM}`
                      }} />
                    </div>
                  </MetricsRow>
                  <MetricsRow label="Colores disponibles (k):" value={recolorResult.kColors} />
                </MetricsSection>
              </>
            )}
            {!recolorResult.isLocalSearchResult && (
              <>
                <MetricsSection title="Impacto en Conflictos">
                  <MetricsRow
                    label="Total de conflictos:"
                    value={`${recolorResult.conflictsBefore} → ${recolorResult.conflictsAfter} ${recolorResult.conflictDelta !== 0 ? `(${recolorResult.conflictDelta > 0 ? '+' : ''}${recolorResult.conflictDelta})` : ''}`}
                    valueVariant={recolorResult.conflictDelta > 0 ? 'bad' : recolorResult.conflictDelta < 0 ? 'good' : ''}
                  />
                  <MetricsRow
                    label="Cambio porcentual:"
                    value={`${recolorResult.impactAnalysis.improved ? 'Mejora: ' : ''}${recolorResult.impactAnalysis.worsened ? 'Empeora: ' : ''}${recolorResult.impactAnalysis.neutral ? 'Sin cambio' : ''}${!recolorResult.impactAnalysis.neutral ? `${Math.abs(recolorResult.impactAnalysis.changePercent)}%` : ''}`}
                    valueVariant={recolorResult.impactAnalysis.improved ? 'good' : recolorResult.impactAnalysis.worsened ? 'bad' : ''}
                  />
                </MetricsSection>
                <MetricsSection title="Nodos a Recolorear">
                  <MetricsRow
                    label="Vecinos en conflicto:"
                    value={`${recolorResult.nodesToRecolor} nodos`}
                    valueVariant="highlight"
                  />
                  <MetricsRow
                    label="Pueden recolorearse sin conflicto:"
                    value={`${recolorResult.canRecolorCount} de ${recolorResult.nodesToRecolor}`}
                  />
                </MetricsSection>
                <MetricsSection highlight>
                  <MetricsRow
                    label="Probabilidad de éxito:"
                    value={`${recolorResult.successProbability}%`}
                    valueVariant={recolorResult.successProbability >= 80 ? 'good' : recolorResult.successProbability >= 50 ? 'medium' : 'bad'}
                    large
                  />
                  <div className="recolor-metrics__hint">
                    {recolorResult.successProbability >= 80 && 'Alta probabilidad de resolver conflictos'}
                    {recolorResult.successProbability >= 50 && recolorResult.successProbability < 80 && 'Probabilidad media, considere usar búsqueda local'}
                    {recolorResult.successProbability < 50 && 'Baja probabilidad, use búsqueda local o aumente k'}
                  </div>
                </MetricsSection>
                {recolorResult.recolorSuggestions && recolorResult.recolorSuggestions.length > 0 && (
                  <MetricsSection title="Sugerencias de Recoloración">
                    <div className="recolor-metrics__suggestions">
                      {recolorResult.recolorSuggestions.slice(0, 3).map((suggestion, index) => (
                        <div key={index} className="recolor-metrics__suggestion">
                          <div className="recolor-metrics__suggestion-header">Nodo #{suggestion.idNodo}</div>
                          <div className="recolor-metrics__suggestion-colors">Colores sugeridos: {suggestion.coloresSugeridos?.join(', ') || 'N/A'}</div>
                        </div>
                      ))}
                      {recolorResult.recolorSuggestions.length > 3 && (
                        <div className="recolor-metrics__hint">+{recolorResult.recolorSuggestions.length - 3} nodos más...</div>
                      )}
                    </div>
                  </MetricsSection>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
