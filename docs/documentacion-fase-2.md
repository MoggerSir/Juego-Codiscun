# Documentación Técnica: Fase 2 — Enemigos y Combate Modular

Esta fase ha transformado el prototipo jugable en un sistema de juego extensible, introduciendo enemigos interactivos y una arquitectura de combate desacoplada.

## Nueva Estructura de Archivos

| Módulo        | Ruta                                    | Propósito                                                       |
| :---          | :---                                    | :---                                                            |
| **Enemigos**  | src/entidades/enemigos/EnemigoBase.ts`  | Clase abstracta con lógica de patrullaje y bordes.               |
|               | `src/entidades/enemigos/Goomba.ts`      | Enemigo básico (muere al ser pisado).                           |
|               | `src/entidades/enemigos/Koopa.ts`       | Enemigo complejo (lógica de concha/proyectil).                  |
|**Componentes**| `src/componentes/ComponenteSalud.ts`    | Gestión aislada de vidas y estado de muerte.                    |
|               | `src/entidades/jugador/ManejadorInvencibilidad.ts` | Control visual (Tween) y temporal de invencibilidad. |
| **Sistemas**  | `src/sistemas/SistemaDano.ts`           | Orquestador global de reglas de combate.                        |
| **UI**        | `src/ui/UI_Vidas.ts`                    | Representación visual reactiva del HUD.                         |

---

## Arquitectura y Decisiones de Diseño

### 1. Desacoplamiento de Combate (SistemaDano)
**¿Por qué?:** En la Fase 1, las colisiones ejecutaban lógica directamente. En la Fase 2, hemos separado la **Detección** de la **Decisión**.
- **`SistemaColisiones`**: Solo detecta que hubo un choque y emite un evento `colision:jugador-enemigo`. No sabe qué pasa después.
- **`SistemaDano`**: Recibe el evento y decide las reglas: "Si Mario cae desde arriba, el enemigo muere; si no, Mario recibe daño". Esto permite añadir escudos o power-ups sin tocar el sistema de colisiones.

### 2. Lógica Modular (Entity Component System Lite)
**¿Por qué?:** Para evitar "Clases Dios" (God Objects). La salud y la invencibilidad no son "Mario", son *capacidades* que Mario tiene.
- **`ComponenteSalud`**: Puede ser reutilizado en cualquier enemigo o jefe futuro simplemente instanciándolo.
- **`ManejadorInvencibilidad`**: Utiliza el sistema de tiempo de Phaser (`delayedCall`) en lugar de deltas en el `update`. Esto asegura que la duración sea exacta independientemente de los FPS del jugador.

### 3. Comunicación por Eventos Globales
**¿Por qué?:** La `EscenaUI` es totalmente independiente de la `EscenaJuego`. 
- Al usar `game.events.emit('salud:cambio', ...)`, permitimos que cualquier parte del código escuche y reaccione a los cambios de salud sin tener referencias directas entre clases, lo que facilita el mantenimiento.

---

## Integración con Tiled (Spawn de Enemigos)

Ya no usamos IDs estáticos en el mapa para los enemigos. Ahora utilizamos una **Object Layer** llamada `enemigos`.
- **Funcionamiento**: El código en `EscenaJuego.crearEnemigos()` itera sobre los objetos de esta capa.
- **Detección**: Lee la propiedad `type` del objeto (`goomba` o `koopa`) para decidir qué clase instanciar en las coordenadas `(x, y)` especificadas.

---

## Cómo usar este sistema para la Fase 3

### Para crear un nuevo enemigo:
1. Crea una clase que extienda de `EnemigoBase`.
2. Implementa `alSerPisado()`.
3. Añade el nuevo `"type"` en `EscenaJuego.crearEnemigos()`.

### Para implementar Power-Ups:
- Al recolectar un hongo, basta con llamar a `jugador.aumentarSalud()` o modificar el estado en el `ComponenteSalud`.

---
*Documentación generada para el equipo de desarrollo de ChavoGame.*
