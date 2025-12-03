// src/views/constants/index.js
// View layer constants - UI configuration and display parameters

// ===== UI CONSTRAINTS (shared with Model for validation) =====
export const GRAPH_CONSTRAINTS = {
    MAX_NODES: 150,
    MIN_RANDOM_NODES: 60,
    MIN_COLORS: 3,
    MAX_COLORS: 10
};

// ===== ITERATION LIMITS =====
export const ITERATION_LIMITS = {
    MIN_ITERATIONS: 10000,
    MAX_ITERATIONS: 10000000,
    STEP_ITERATIONS: 10000
};

// ===== COLOR PALETTE =====
export const COLOR_PALETTE = {
    NAMES: ["blue", "red", "green", "yellow", "purple", "orange", "cyan", "magenta", "lime", "pink"],
    HEX_MAP: {
        blue: "#38bdf8",
        red: "#ef4444",
        green: "#22c55e",
        yellow: "#facc15",
        purple: "#a855f7",
        orange: "#fb923c",
        cyan: "#22d3ee",
        magenta: "#e879f9",
        lime: "#84cc16",
        pink: "#f472b6"
    }
};

// ===== VIEWBOX SCALING =====
export const VIEWBOX_CONFIG = {
    BASE_WIDTH: 3000,
    BASE_HEIGHT: 1000,
    SMALL_THRESHOLD: 80,    // <= 80 nodes
    MEDIUM_THRESHOLD: 110,  // <= 110 nodes
    SMALL_SCALE: 0.7,       // <= 80 nodes
    MEDIUM_SCALE: 0.6,      // 81-110 nodes
    LARGE_SCALE: 0.5        // >= 111 nodes
};

// ===== VISUALIZATION =====
export const VISUALIZATION = {
    NODE_RADIUS: 8,
    FONT_SIZE: 12,
    EDGE_WIDTH: 2,
    EDGE_OPACITY: 0.6,
    CONFLICT_EDGE_WIDTH: 2.5
};

// ===== ZOOM LIMITS =====
export const ZOOM_LIMITS = {
    MIN: 0.5,
    MAX: 3,
    STEP: 0.2,
    DEFAULT: 1
};
