# Documentación de la Fase 1 — Prototipo Jugable

Este documento detalla la implementación de la **Fase 1**, donde se consolidó el núcleo jugable: movimiento del personaje, sistema de físicas avanzadas, colisiones con el entorno y la estructura del primer nivel.

---

## 1. Entidades del Jugador

Se implementó una arquitectura modular para el personaje principal, separando la lógica de entrada, estados y animaciones.

### Clase Jugador
- **Archivo:** [src/entidades/jugador/Jugador.ts](../src/entidades/jugador/Jugador.ts)
- **Descripción:** Clase principal que extiende de `Phaser.Physics.Arcade.Sprite`. Gestiona el cuerpo físico (hitbox optimizada de 24x40) y orquestra los componentes de control y estado.

### Sistema de Control e Input
- **Archivo:** [src/entidades/jugador/ControlJugador.ts](../src/entidades/jugador/ControlJugador.ts)
- **Implementación:** 
  - Centraliza las teclas (Flechas y Espacio).
  - Incluye **Jump Buffering** (100ms) para mejorar la responsividad del salto al presionar la tecla justo antes de tocar el suelo.
  - Gestión de limpieza automática (`shutdown`) para evitar fugas de memoria.

### Máquina de Estados y Movimiento
- **Archivo:** [src/entidades/jugador/EstadosJugador.ts](../src/entidades/jugador/EstadosJugador.ts)
- **Mejoras de Game Feel:**
  - **Coyote Time:** Margen de 120ms para saltar después de dejar una plataforma.
  - **Aceleración Gradual:** Uso de aceleración física en lugar de velocidad instantánea para un movimiento más orgánico.
  - **Salto Variable:** La altura del salto depende de cuánto tiempo se mantenga presionada la tecla (gravedad dinámica).

### Animaciones del Jugador
- **Archivo:** [src/animaciones/AnimacionesJugador.ts](../src/animaciones/AnimacionesJugador.ts)
- **Descripción:** Centraliza la creación de animaciones (`idle`, `correr`, `saltar`) separándolas de la lógica de escena.

---

## 2. Sistemas y Físicas

Se crearon clases estáticas y servicios para manejar las reglas del mundo.

### Sistema de Físicas
- **Archivo:** [src/sistemas/SistemaFisicas.ts](../src/sistemas/SistemaFisicas.ts)
- **Descripción:** Configura la gravedad global y provee utilidades como el manejo de knockback.

### Sistema de Colisiones
- **Archivo:** [src/sistemas/SistemaColisiones.ts](../src/sistemas/SistemaColisiones.ts)
- **Descripción:** Gestiona el registro de colisiones entre el jugador y las capas de tiles del mapa.

---

## 3. Nivel y Mundo

### Tilemap (Nivel 1)
- **Archivo:** [assets/tilemaps/nivel-01.json](../assets/tilemaps/nivel-01.json)
- **Descripción:** Nivel diseñado con 50x20 tiles. Estructurado visualmente en el JSON para facilitar su edición manual por parte del equipo. Incluye capas de fondo, plataformas y objetos de spawn.

### Escena de Juego
- **Archivo:** [src/escenas/EscenaJuego.ts](../src/escenas/EscenaJuego.ts)
- **Implementación:** Ensambla todos los componentes. Configura la **Cámara** con un seguimiento suave (`lerp: 0.1`) y límites restringidos al tamaño del mapa.

---

## 4. Gestión de Assets Provisionales

Para permitir el desarrollo sin arte final, se implementó generación procedimental:

- **Archivo:** [src/escenas/EscenaCarga.ts](../src/escenas/EscenaCarga.ts)
- **Funcionalidad:** Genera automáticamente texturas (`Graphics`) para el Tileset y un Spritesheet de 5 frames para el jugador, inyectándolos directamente en el cache de texturas de Phaser.

---

## 5. Verificación de Éxito

1. **Construcción:** `npm run build` genera el proyecto sin errores de TypeScript.
2. **Gameplay:**
   - El jugador aparece en el spawn correcto.
   - El movimiento horizontal es fluido (aceleración/fricción).
   - El salto se siente responsivo (Buffer y Coyote Time verificados).
   - La cámara sigue al jugador horizontalmente sin mostrar el vacío.

---

**Estado:** ✅ FASE 1 COMPLETADA
