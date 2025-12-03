import React, { useState } from "react";
import { GRAPH_CONSTRAINTS, ITERATION_LIMITS } from "./constants/index.js";
import { OPACITY, TRANSITIONS } from "./constants/theme.js";
import { validarOpcionesColoracion, validarSinNodosAislados } from "./utils/validations.js";
import { formatearNumero } from "./utils/formatters.js";
import Button from "./components/Button.jsx";
import RangeSlider from "./components/RangeSlider.jsx";
import ToggleGroup from "./components/ToggleGroup.jsx";
import ToggleSwitch from "./components/ToggleSwitch.jsx";
import ProgressBar from "./components/ProgressBar.jsx";
import PanelSection from "./components/PanelSection.jsx";
import Modal from "./components/Modal.jsx";

/**
 * Construye opciones de coloración basadas en el tipo de algoritmo
 */
function construirOpcionesColoracion(usarMonteCarlo, cantidadColores, iteraciones) {
  return {
    numColors: cantidadColores,
    algorithm: usarMonteCarlo ? "montecarlo-dynamic" : "lasvegas-dynamic",
    iterations: usarMonteCarlo ? Number(iteraciones) : undefined
  };
}

/**
 * Determina configuración del botón principal basado en el estado actual
 */
function obtenerConfiguracionBotonPrincipal(esDinamico, estaEjecutando, tieneCambiosManuales, tieneGrafoColoreado) {
  if (esDinamico && estaEjecutando) {
    return { variant: 'danger', label: 'Detener', action: 'stop' };
  }

  if (tieneCambiosManuales && tieneGrafoColoreado && !estaEjecutando) {
    return { variant: 'warning', label: 'Búsqueda Local', action: 'localSearch' };
  }

  return { variant: 'primary', label: 'Colorear grafo', action: 'color' };
}

/**
 * Componente de vista de panel de control para operaciones de grafo y algoritmos
 * @component
 * @param {Object} props
 * @param {number} props.maxNodes - Número máximo de nodos permitidos
 * @param {number} props.currentNodes - Número actual de nodos en el grafo
 * @param {Array} props.nodes - Array de objetos nodo en el grafo
 * @param {Array} props.edges - Array de objetos arista en el grafo
 * @param {Function} props.onGenerateRandomGraph - Callback para generar grafo aleatorio
 * @param {Function} props.onReset - Callback to reset the graph
 * @param {Function} props.onClearColors - Callback to clear colors
 * @param {Function} props.onReorganize - Callback to reorganize nodes
 * @param {Function} props.onColorGraph - Callback to start coloring
 * @param {Object} props.coloringStats - Statistics from coloring algorithm
 * @param {Function} props.onLocalSearch - Callback for local search
 * @param {boolean} props.hasManualChanges - If user made manual changes
 * @param {boolean} props.hasColoredGraph - If graph has been colored
 * @param {number} props.conflictsCount - Number of conflicts in current coloring
 */
export default function ControlPanelView({
  maxNodes,
  currentNodes,
  nodes,
  edges,
  onGenerateRandomGraph,
  onReset,
  onClearColors,
  onReorganize,
  onColorGraph,
  coloringStats,
  onLocalSearch,
  hasManualChanges,
  hasColoredGraph,
  conflictsCount,
}) {
  const [nodosAleatorios, setNodosAleatorios] = useState(GRAPH_CONSTRAINTS.MIN_RANDOM_NODES);

  // Opciones de coloración
  const [usarMonteCarlo, setUsarMonteCarlo] = useState(false); // false = Las Vegas, true = Monte Carlo
  const [iteraciones, setIteraciones] = useState(ITERATION_LIMITS.MIN_ITERATIONS);
  const [numeroColores, setNumeroColores] = useState(GRAPH_CONSTRAINTS.MIN_COLORS);
  const [incrementoAutomaticoColores, setIncrementoAutomaticoColores] = useState(true); // Incremento automático de colores

  // Modal state para advertencias
  const [estadoModal, setEstadoModal] = useState({ isOpen: false, message: '' });

  const handleGenerateClick = () => {
    let cantidadNodos = Number(nodosAleatorios);
    if (Number.isNaN(cantidadNodos)) return;
    if (cantidadNodos < 1) cantidadNodos = 1;
    if (cantidadNodos > maxNodes) cantidadNodos = maxNodes;
    onGenerateRandomGraph?.(cantidadNodos);
  };

  const handleResetClick = () => {
    onReset?.();
  };

  const handleColorClick = () => {
    // Validar nodos aislados
    const validacionNodosAislados = validarSinNodosAislados(nodes, edges);
    if (!validacionNodosAislados.valid) {
      setEstadoModal({ isOpen: true, message: validacionNodosAislados.error });
      return;
    }

    const cantidadColores = Number(numeroColores);
    const opciones = construirOpcionesColoracion(usarMonteCarlo, cantidadColores, iteraciones);

    // Validar opciones de coloración
    const validacion = validarOpcionesColoracion(opciones);
    if (!validacion.valid) {
      setEstadoModal({ isOpen: true, message: validacion.errors.join("\n") });
      return;
    }

    // Iniciar coloración con opciones validadas
    onColorGraph?.({
      algorithm: opciones.algorithm,
      speed: "fast",
      numColors: cantidadColores,
      autoIncrementColors: incrementoAutomaticoColores, // Pasar opción de incremento automático
      ...(usarMonteCarlo && { iterations: opciones.iterations })
    });
  };

  const handleLocalSearchClick = () => {
    // Validar nodos aislados
    const validacionNodosAislados = validarSinNodosAislados(nodes, edges);
    if (!validacionNodosAislados.valid) {
      setEstadoModal({ isOpen: true, message: validacionNodosAislados.error });
      return;
    }

    // Ejecutar búsqueda local
    onLocalSearch?.();
  };

  // Estado de algoritmo dinámico
  const esDinamico = coloringStats && coloringStats.dynamic;
  const esBusquedaLocal = coloringStats?.algorithm === 'Búsqueda Local';
  const progreso = esDinamico ? coloringStats.progress || 0 : 0;
  const estaEjecutando = esDinamico && coloringStats.isRunning;

  // Configuración del botón principal
  const configuracionBoton = obtenerConfiguracionBotonPrincipal(esDinamico, estaEjecutando, hasManualChanges, hasColoredGraph);
  const deberMostrarBarraProgreso = esDinamico && !esBusquedaLocal;
  const deberDeshabilitarBotonPrincipal = currentNodes === 0 || (hasManualChanges && hasColoredGraph && !estaEjecutando && conflictsCount === 0);

  return (
    <div className="control-panel">
      {/* Título */}
      <h2 className="control-panel__title">Panel de Control</h2>

      {/* Estadísticas de nodos */}
      <div className="control-panel__stats">
        <div className="control-panel__stats-main">
          <span className="control-panel__stats-label">Nodos</span>
          <span className="control-panel__stats-value">
            {currentNodes} / {maxNodes}
          </span>
        </div>
      </div>

      {/* Grafo aleatorio */}
      <PanelSection title="Grafo aleatorio" titleVariant="green">
        <RangeSlider
          label="Cantidad de nodos"
          value={nodosAleatorios}
          min={GRAPH_CONSTRAINTS.MIN_RANDOM_NODES}
          max={maxNodes}
          step={1}
          onChange={setNodosAleatorios}
          disabled={esDinamico && estaEjecutando}
        />

        <Button
          variant="success"
          onClick={handleGenerateClick}
          disabled={esDinamico && estaEjecutando}
        >
          Generar grafo aleatorio
        </Button>
      </PanelSection>

      {/* Coloración de grafos */}
      <PanelSection title="Coloración">
        {/* Número de colores */}
        <RangeSlider
          label="Número de colores"
          value={numeroColores}
          min={GRAPH_CONSTRAINTS.MIN_COLORS}
          max={GRAPH_CONSTRAINTS.MAX_COLORS}
          step={1}
          onChange={setNumeroColores}
          disabled={esDinamico && estaEjecutando}
        />

        {/* Tipo de algoritmo */}
        <div className="control-panel__field">
          <label className="control-panel__field-label">Algoritmo</label>
          <ToggleGroup
            options={[
              { value: false, label: 'Las Vegas' },
              { value: true, label: 'Monte Carlo' }
            ]}
            value={usarMonteCarlo}
            onChange={setUsarMonteCarlo}
            disabled={esDinamico && estaEjecutando}
          />
          <p className="control-panel__field-hint">
            {usarMonteCarlo ? 'Iteraciones limitadas' : 'Busca solución válida'}
          </p>
        </div>

        {/* Iteraciones solo para Monte Carlo */}
        <RangeSlider
          label="Iteraciones"
          value={iteraciones}
          min={ITERATION_LIMITS.MIN_ITERATIONS}
          max={ITERATION_LIMITS.MAX_ITERATIONS}
          step={ITERATION_LIMITS.STEP_ITERATIONS}
          onChange={setIteraciones}
          disabled={esDinamico && estaEjecutando}
          formatValue={formatearNumero}
          className=""
          style={{
            opacity: usarMonteCarlo ? OPACITY.FULL : OPACITY.DISABLED,
            pointerEvents: usarMonteCarlo ? 'auto' : 'none',
            transition: TRANSITIONS.FAST
          }}
        />

        {/* Opción de incremento automático de colores - Solo para Monte Carlo */}
        <div
          className="control-panel__field"
          style={{
            opacity: usarMonteCarlo ? OPACITY.FULL : OPACITY.DISABLED,
            pointerEvents: usarMonteCarlo ? 'auto' : 'none',
            transition: TRANSITIONS.FAST
          }}
        >
          <ToggleSwitch
            checked={incrementoAutomaticoColores}
            onChange={setIncrementoAutomaticoColores}
            disabled={!usarMonteCarlo || (esDinamico && estaEjecutando)}
            label="Extensión automática de colores"
          />
        </div>

        <Button
          variant={configuracionBoton.variant}
          onClick={
            configuracionBoton.action === 'stop' ? onClearColors :
              configuracionBoton.action === 'localSearch' ? handleLocalSearchClick :
                handleColorClick
          }
          disabled={deberDeshabilitarBotonPrincipal}
        >
          {configuracionBoton.label}
        </Button>

        {/* Progress bar - Only for probabilistic algorithms (Las Vegas, Monte Carlo), NOT for local search */}
        {deberMostrarBarraProgreso && <ProgressBar progress={progreso} />}
      </PanelSection>

      {/* Reorganizar Layout */}
      <PanelSection
        title="Reorganizar"
      >
        <Button
          variant="secondary"
          onClick={() => onReorganize?.()}
          disabled={currentNodes === 0 || (esDinamico && estaEjecutando)}
        >
          Reorganizar layout
        </Button>
      </PanelSection>

      {/* Reiniciar */}
      <PanelSection title="Reiniciar" titleVariant="danger">
        <Button
          variant="danger"
          onClick={handleResetClick}
          disabled={esDinamico && estaEjecutando}
        >
          Reiniciar grafo
        </Button>
      </PanelSection>

      {/* Modal para advertencias y errores */}
      <Modal
        isOpen={estadoModal.isOpen}
        onClose={() => setEstadoModal({ isOpen: false, message: '' })}
        title="Advertencia"
        variant="warning"
        confirmText="Entendido"
      >
        {estadoModal.message}
      </Modal>
    </div>
  );
}
