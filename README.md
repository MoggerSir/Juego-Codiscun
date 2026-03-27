# Codiscun — Juego Educativo (Mario Style)

Este es un videojuego de plataformas 2D inspirado en Mario Bros, desarrollado con fines educativos y de sensibilización sobre la prevención de **ITS/VIH**.

## Objetivo

El proyecto busca ofrecer una herramienta interactiva y lúdica para informar y educar sobre la salud sexual, integrando mecánicas de juego clásicas (saltar, recolectar, evitar obstáculos) con un trasfondo educativo orientado al impacto social.

## Tecnologías

El proyecto está construido sobre un stack web moderno y escalable:

- **Motor**: [Phaser 3](https://phaser.io/) (Framework de juegos 2D profesional)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) (Tipado estático para robustez)
- **Bundler**: [Vite](https://vitejs.dev/) (Entorno de desarrollo rápido)
- **Móvil**: [Capacitor](https://capacitorjs.com/) (Para exportar nativamente a Android)
- **Niveles**: [Tiled](https://www.mapeditor.org/) (Editor de mapas basado en tiles)

## Cómo correr el proyecto

Asegúrate de tener [Node.js](https://nodejs.org/) instalado.

1. **Instalar dependencias**:
   ```bash
   npm install
   ```
2. **Ejecutar en desarrollo**:

   ```bash
   npm run dev
   ```

   Accede a `http://localhost:5173` (o el puerto que indique la terminal).

3. **Generar versión de producción**:
   ```bash
   npm run build
   ```

## Estructura del Proyecto

```text
juego-mario-empresa/
│
├── index.html                           # HTML base — contiene div#game-container
├── package.json
├── tsconfig.json
├── vite.config.ts                       # Configuración de Vite y Alias de paths
├── capacitor.config.ts                  # Configuración para exportar a Android
├── .gitignore
├── README.md                            # Guía principal del proyecto
│
├── publico/                             # Assets estáticos (sin procesar por Vite)
│   ├── favicon/
│   └── fuentes/                         # Tipografías personalizadas
│
├── src/
│   ├── main.ts                          # Punto de entrada (inicializa Phaser.Game)
│   ├── configuracion-juego.ts           # Configuración (resolución, física, escenas)
│   │
│   ├── componentes/                     # Lógica modular desacoplada (Senior Architecture)
│   │   ├── ComponenteSalud.ts           # Gestión de vidas (Jugador/Enemigos)
│   │   ├── ComponenteInvencibilidad.ts  # Lógica de tiempo de invulnerabilidad
│   │   └── VisualInvencibilidad.ts      # Efectos visuales de parpadeo (Tweens)
│   │
│   ├── escenas/                         # Cada pantalla del juego es una escena
│   │   ├── EscenaCarga.ts               # Preload de assets y carga de progreso
│   │   ├── EscenaMenu.ts                # Menú principal
│   │   ├── EscenaJuego.ts               # Gameplay principal
│   │   ├── EscenaUI.ts                  # HUD (vidas, monedas, tiempo)
│   │   ├── EscenaGameOver.ts            # Pantalla de derrota
│   │   └── EscenaVictoria.ts            # Pantalla de nivel completado
│   │
│   ├── entidades/                       # Objetivos del juego con lógica propia
│   │   ├── jugador/
│   │   │   ├── Jugador.ts               # Clase principal del héroe
│   │   │   ├── EstadosJugador.ts        # Máquina de estados (idle, saltando, etc.)
│   │   │   └── ControlJugador.ts        # Mapeo de inputs (teclado/touch)
│   │   ├── enemigos/
│   │   │   ├── EnemigoBase.ts           # Clase abstracta con IA proactiva
│   │   │   ├── Goomba.ts                # Enemigo básico patrullero
│   │   │   └── Koopa.ts                 # Enemigo con mecánica de concha
│   │   └── objetos/
│   │       ├── Moneda.ts
│   │       └── Bandera.ts               # Meta del nivel
│   │
│   ├── sistemas/                        # Servicios globales coordinadores
│   │   ├── SistemaColisiones.ts         # Registro central de detección física
│   │   ├── SistemaDano.ts               # Árbitro de combate y Knockback
│   │   └── SistemaEventos.ts            # Bus de eventos específico de escenas
│   │
│   ├── constantes/                      # Valores estáticos (Física, Assets, IDs)
│   ├── tipos/                           # Interfaces y tipos TypeScript
│   └── utilidades/
│       ├── EventBus.ts                  # BUS GLOBAL DE EVENTOS (EVENTOS constantes)
│       └── plataforma.ts                # Detección de Web vs Android
│
├── assets/
│   ├── sprites/                         # Imágenes y atlas de personajes
│   ├── tilemaps/                        # Mapas .json de Tiled
│   ├── tilesets/                        # Tiles usados en los mapas
│   ├── audio/                           # Música y efectos de sonido
│   └── ui/                              # Botones e iconos del HUD
│
└── android/                             # Archivos nativos generados por Capacitor
```

---
