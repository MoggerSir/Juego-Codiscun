# Codiscun — Juego Educativo (Mario Style)

Este es un videojuego de plataformas 2D inspirado en Mario Bros, desarrollado con fines educativos y de sensibilización sobre la prevención de **ITS/VIH**.

## Objetivo

El proyecto busca ofrecer una herramienta interactiva y lúdica para informar y educar sobre la salud sexual, integrando mecánicas de juego clásicas (saltar, recolectar, evitar obstáculos) con un trasfondo educativo orientado al impacto social.

## Tecnologías

El proyecto está construido sobre un stack web moderno y escalable:

- **Motor**: [Phaser 3](https://phaser.io/) (Framework de juegos 2D profesional)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) (Tipado estático para robustez)
- **Bundler**: [Vite](https://vitejs.dev/) (Entorno de desarrollo rápido)
- **Móvil**: [Capacitor](https://capacitorjs.com/) (Para exportar nativamente a Android e iOS)
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

- `src/`: Contiene todo el código fuente.
  - `entidades/`: Jugador, enemigos y objetos interactivos.
  - `escenas/`: Diferentes pantallas (Menú, Juego, UI, Game Over).
  - `sistemas/`: Lógica global desacoplada (Audio, Colisiones, Guardado).
  - `componentes/`: Lógica modular reutilizable (Salud, Invencibilidad).
  - `utilidades/`: Helpers y Bus de Eventos global.
- `assets/`: Recursos de audio, imágenes (sprites) y mapas (tilemaps).
- `docs/`: Documentación detallada por fases del proyecto.
  - `CONTEXTO-PROYECTO.md`: Referencia técnica completa.
  - `FASE-2-ENEMIGOS.md`: Guía de implementación de combate y patrullaje.

---
