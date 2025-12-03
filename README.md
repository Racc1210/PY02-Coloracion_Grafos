# Proyecto 2 - Coloración de Grafos con Algoritmos Probabilísticos

## Instituto Tecnológico de Costa Rica

**Profesor:** Joss Pecou Johnson 

**Curso:** Análisis de Algoritmos

**Segundo semestre de 2025 - Grupo 60**

## Integrantes del grupo

- Roymar Castillo Carvajal
- Dilan Zamora Sánchez

---

## Descripción del Proyecto

Aplicación web interactiva para visualizar y comparar algoritmos probabilísticos aplicados al problema de coloración de grafos. El sistema permite crear grafos personalizados, generar grafos aleatorios, y aplicar diferentes estrategias algorítmicas para encontrar soluciones válidas o aproximadas.

### Problema de Coloración de Grafos

El problema consiste en asignar colores a los vértices de un grafo de manera que **ningún par de vértices adyacentes** (conectados por una arista) compartan el mismo color.

---

## Tecnologías Utilizadas

### Frontend

- **React 19** - Biblioteca de JavaScript para construcción de interfaces de usuario modernas
- **React Scripts** - Herramientas de construcción, desarrollo y testing
- **Recharts** - Biblioteca de visualización de datos para gráficos interactivos
- **HTML5 Canvas/SVG** - Renderizado de grafos con zoom, pan y drag-and-drop
- **CSS3** - Sistema de diseño con variables CSS, temas dark mode y animaciones

### Lenguajes de Programación

- **JavaScript (ES6+)** - Lenguaje principal con características modernas
- **JSX** - Sintaxis extendida de JavaScript para React

### Herramientas de Desarrollo

- **npm** - Gestor de paquetes y dependencias
- **Git & GitHub** - Control de versiones y colaboración
- **GitHub Pages** - Despliegue automatizado de la aplicación
- **ESLint** - Análisis estático de código
- **Jest & React Testing Library** - Framework de testing

### Arquitectura y Patrones de Diseño

- **Patrón MVC (Model-View-Controller)**:
  - **Modelos**: Clases para Graph, Node, Edge, ForceDirectedLayout y algoritmos (LasVegas, MonteCarlo, LocalSearch)
  - **Vistas**: 15+ componentes React reutilizables con hooks personalizados
  - **Controladores**: GraphController, ColoringController, StateManager, WorkerManager, GraphContext
  
- **Web Workers** - Procesamiento paralelo para algoritmos intensivos sin bloquear la UI
- **Context API** - Gestión de estado global compartido
- **Custom Hooks** - Encapsulación de lógica reutilizable (useState, useEffect, useCallback, useRef, useMemo)
- **Responsive Design** - Interfaz adaptable a diferentes tamaños de pantalla

### Algoritmos Implementados

#### Algoritmos Probabilísticos

1. **Las Vegas** - Algoritmo probabilístico que garantiza corrección
   - Genera coloraciones aleatorias hasta encontrar una válida
   - No tiene límite de tiempo, pero la solución es siempre correcta
   - Útil cuando se requiere garantía de validez

2. **Monte Carlo** - Algoritmo probabilístico con tiempo acotado
   - Genera N muestras aleatorias y retorna la mejor encontrada
   - Tiempo de ejecución garantizado (determinista)
   - Puede devolver soluciones aproximadas (con conflictos)
   - Útil cuando el tiempo es más importante que la perfección

#### Algoritmo de Optimización

3. **Local Search (Búsqueda Local Greedy)**
   - Optimiza una coloración existente de forma iterativa
   - Recolorea nodos en conflicto con decisiones greedy locales
   - Mejora soluciones aproximadas de Monte Carlo
   - Permite intervención manual del usuario

#### Algoritmo de Layout

4. **Fruchterman-Reingold (Force-Directed Layout)**
   - Sistema de fuerzas de repulsión y atracción
   - Posiciona nodos automáticamente para visualización clara
   - Adaptativo según densidad del grafo (100-500 iteraciones)
   - Evita superposición de nodos

---

## Bibliotecas

### Recharts

La biblioteca **Recharts** se utiliza específicamente para:
- **LineChart**: Visualización de evolución de conflictos en tiempo real
- **ResponsiveContainer**: Gráficos responsivos que se adaptan al contenedor
- **XAxis/YAxis**: Ejes configurables con etiquetas personalizadas
- **Tooltip**: Información contextual al pasar el mouse sobre puntos de datos
- Downsampling automático para manejar datasets grandes (>500 puntos)

---

## Ejecución del Programa

### Acceso Directo (Recomendado)

Puede acceder a la aplicación desplegada en:
```
https://racc1210.github.io/PY02-Coloracion_Grafos/
```

### Ejecución Local

#### Requisitos Previos
- **Node.js** (v14 o superior)
- **npm** (incluido con Node.js)

#### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Divan27/PY02-Coloracion_Grafos.git
cd PY02-Coloracion_Grafos
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en modo desarrollo**
```bash
npm start
```
La aplicación se abrirá automáticamente en `http://localhost:3000`

4. **Construir para producción** (opcional)
```bash
npm run build
```

5. **Desplegar a GitHub Pages** (opcional)
```bash
npm run deploy
```

---

## Instrucciones de Uso

### Paso 1: Crear o Generar un Grafo

#### Opción A: Construcción Manual
1. **Agregar Nodos**: Click en el canvas para crear nodos individuales
2. **Conectar Nodos**: 
   - Click en un nodo origen
   - Click en un nodo destino
   - Se creará una arista entre ambos
3. **Mover Nodos**: Arrastrar nodos para reorganizar visualmente
4. **Eliminar Elementos**:
   - Click derecho sobre un nodo → Eliminar
   - Click en una arista + tecla Delete → Eliminar arista
   - Tecla Delete sobre nodo seleccionado → Eliminar nodo

#### Opción B: Generación Aleatoria
1. Usar el slider "Cantidad de nodos" (60-150 nodos)
2. Click en "Generar grafo aleatorio"
3. El sistema crea un grafo conectado con:
   - Distribución inicial en grilla con variación aleatoria
   - Árbol de expansión que garantiza conectividad
   - 15% de aristas adicionales para complejidad
   - Layout automático Fruchterman-Reingold

#### Controles Adicionales
- **Reorganizar**: Aplica layout de fuerzas al grafo actual
- **Limpiar colores**: Elimina coloración manteniendo estructura
- **Reiniciar**: Borra todo el grafo

### Paso 2: Configurar el Algoritmo de Coloración

#### Parámetros Principales

1. **Número de Colores** (3-10 colores)
   - Define la paleta disponible
   - **Incremento Automático**: Si está activado, añade un color automáticamente cuando el algoritmo no encuentra solución

2. **Selección de Algoritmo**
   - **Las Vegas**: Garantiza coloración válida, tiempo variable
   - **Monte Carlo**: Tiempo fijo, mejor aproximación posible

3. **Iteraciones (Solo Monte Carlo)**
   - Rango: 10,000 - 10,000,000 iteraciones
   - Más iteraciones = mejor calidad, más tiempo
   - Recomendado: 50,000-100,000 para grafos medianos

### Paso 3: Ejecutar el Algoritmo

1. Click en **"Colorear grafo"**
2. El algoritmo se ejecuta en un Web Worker (sin congelar la interfaz)
3. Se muestra en tiempo real:
   - Progreso de la ejecución
   - Número de intentos realizados
   - Intentos exitosos (sin conflictos)
   - Conflictos actuales
   - Gráfico de evolución de conflictos

4. **Durante la Ejecución**:
   - Botón cambia a **"Detener"** (rojo)
   - Se puede pausar/detener en cualquier momento
   - La interfaz permanece responsiva

### Paso 4: Visualización de Resultados

#### Panel de Estadísticas (Overlay Superior Izquierdo)
- **Tiempo de ejecución**: Duración total del algoritmo
- **Intentos realizados**: Total de coloraciones generadas
- **Intentos exitosos**: Coloraciones sin conflictos
- **Conflictos actuales**: Aristas con nodos del mismo color
- **Conflictos promedio**: Media de conflictos por intento
- **Probabilidad de éxito**: Porcentaje de intentos válidos
- **Gráfico de evolución**: Visualización paginada de conflictos a lo largo del tiempo

#### Indicadores Visuales
- **Aristas rojas gruesas**: Conflicto detectado (mismo color)
- **Números en nodos**: Identificador único del nodo
- **Colores de nodos**: Coloración actual asignada

### Paso 5: Optimización con Búsqueda Local

Si la solución tiene conflictos (común en Monte Carlo):

1. Aparece el botón **"Búsqueda Local"** (amarillo)
2. Click para iniciar optimización iterativa
3. El algoritmo:
   - Identifica nodos en conflicto
   - Recolorea con el color que minimiza conflictos
   - Repite hasta eliminar todos los conflictos
4. Se muestra retroalimentación visual de cada cambio

#### Optimización Manual
- **Click derecho sobre un nodo** → Menú contextual
- Seleccionar color alternativo manualmente
- El sistema muestra impacto del cambio:
  - Conflictos eliminados
  - Conflictos nuevos
  - Porcentaje de mejora/empeoramiento

### Paso 6: Herramientas de Navegación

- **Zoom**: Scroll del mouse o botones +/-
- **Pan**: Click y arrastrar el fondo del canvas
- **Ocultar/Mostrar Estadísticas**: Toggle en esquina superior izquierda
- **Resultados Anclados**: Pin para mantener análisis de recoloreo visible

---
### Complejidad del Problema

El problema de coloración de grafos es **NP-Completo**, lo que significa:
- No existe algoritmo polinomial conocido que lo resuelva para grafos generales
- Determinar el número cromático (mínimo de colores) es computacionalmente intratable para grafos grandes
- Los algoritmos probabilísticos ofrecen un trade-off práctico entre tiempo y calidad

---

## Características Técnicas Avanzadas

### Arquitectura MVC

```
src/
├── models/              # Capa de Modelo (Lógica de Negocio)
│   ├── Graph.js         # Estructura de datos principal
│   ├── Node.js          # Representación de nodos
│   ├── Edge.js          # Representación de aristas
│   ├── ForceDirectedLayout.js  # Algoritmo de layout
│   ├── algorithms/      # Algoritmos de coloración
│   │   ├── BaseAlgorithm.js
│   │   ├── LasVegas.js
│   │   ├── MonteCarlo.js
│   │   └── LocalSearch.js
│   └── utils/           # Utilidades de evaluación
│       ├── graphEvaluation.js
│       ├── graphAnalysis.js
│       └── colorPalette.js
│
├── views/               # Capa de Vista
│   ├── MainLayout.jsx   # Layout principal
│   ├── ControlPanelView.jsx  # Panel de controles
│   ├── GraphCanvasView.jsx   # Canvas de visualización
│   ├── components/      # 15+ componentes reutilizables
│   ├── hooks/           # 5 custom hooks
│   └── utils/           # Helpers de SVG y formateo
│
└── controllers/         # Capa de Controlador (Coordinación)
    ├── GraphController.js      # Operaciones del grafo
    ├── ColoringController.js   # Ejecución de algoritmos
    ├── StateManager.js         # Gestión de estado
    ├── WorkerManager.js        # Administración de Web Workers
    └── GraphContext.jsx        # Context API para estado global
```
---
