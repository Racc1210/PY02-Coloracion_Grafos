// Constantes de la capa modelo

// RESTRICCIONES DEL GRAFO
export const GRAPH_CONSTRAINTS = {
    MAX_NODES: 150,
    MIN_RANDOM_NODES: 60,
    MIN_COLORS: 3,
    MAX_COLORS: 10,
    DEFAULT_COLORS: 3
};

// LAYOUT ITERATIONS
export const LAYOUT_ITERATIONS = {
    SMALL_GRAPH_THRESHOLD: 80,
    MEDIUM_GRAPH_THRESHOLD: 120,
    SMALL_GRAPH: 250,
    MEDIUM_GRAPH: 300,
    LARGE_GRAPH: 350
};

// FORCE DIRECTED LAYOUT CONSTANTS
export const FORCE_DIRECTED = {
    K_MULTIPLIER: 0.7,
    COOLING_RATE: 0.95,
    TEMPERATURE_FACTOR: 0.1,
    POSITION_MIN: 0.02,
    POSITION_MAX: 0.98
};

// ALGORITHM CONFIGURATION 
export const ALGORITHM = {
    BATCH_SIZE: 50,
    LOCAL_SEARCH_DELAY: 150
};

export const COLOR_PALETTE = {
    NAMES: ["blue", "red", "green", "yellow", "purple", "orange", "cyan", "magenta", "lime", "pink"]
};
