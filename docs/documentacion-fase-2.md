# Documentación Técnica Integrada: Fase 2 a 5 — Arquitectura de Combate y Entidades

Esta fase ha transformado el prototipo jugable en un sistema de juego robusto y extensible, introduciendo enemigos interactivos y una arquitectura de combate desacoplada basada en Patrones de Diseño Senior.

## Nueva Estructura de Archivos Central

| Módulo       | Ruta                                         | Propósito                                                        |
| :----------- | :------------------------------------------- | :--------------------------------------------------------------- |
| **Fábrica**  | `src/entidades/enemigos/FabricaEnemigos.ts`  | Registro dinámico y creación automatizada de enemigos.           |
|              | `src/entidades/enemigos/registroEnemigos.ts` | Hub de importaciones explícitas anti Tree-Shaking de Vite.       |
| **Enemigos** | `src/entidades/enemigos/EnemigoBase.ts`      | Clase abstracta con lógica de patrullaje, bordes y giros.        |
|              | `src/entidades/enemigos/Goomba.ts`           | Básico, camina y muere al ser pisado.                            |
|              | `src/entidades/enemigos/EnemigoVolador.ts`   | Sobrescritura física de Gravedad 0 y patrulla sobre abismos.     |
|              | `src/entidades/enemigos/EnemigoTanque.ts`    | Sistema multinivel: Sobrevive 1 golpe, se enfurece, muere al 2º. |
| **Sistemas** | `src/sistemas/SistemaDano.ts`                | Árbitro Global de reglas de combate y colisión cruzada.          |
|              | `src/sistemas/SistemaEventos.ts`             | Bus Singleton inter-escenas para Puntuación y Vidas.             |

---

## Arquitectura y Decisiones de Diseño

### 1. Desacoplamiento de Entidades (SistemaEventos)

**¿Por qué?:** Entidades con referencias cruzadas (el Jugador llamando al UI o los Enemigos buscando a la Escena) generan mallas inestables y acopladas.
**Cómo funciona:**

- Implementamos un Patrón EventBus. Cuando recoges una moneda o aplastas un _Goomba_, la entidad simplemente lo emite al vacío global: `SistemaEventos.obtener().emit(EVENTOS.PUNTUACION_SUMAR)`.
- El `SistemaPuntuacion` escucha en el fondo y se actualiza de manera completamente autónoma.

### 2. Patrón Factory y Principio Open/Closed (`FabricaEnemigos.ts`)

**¿Por qué?:** La `EscenaJuego` dependía de un `if/else if` enorme para decidir qué clase invocar.
**Solución Senior:**

- La Base del motor nunca importa un Enemigo. Se lee la propiedad `type` del JSON de **Tiled** y se invoca a `FabricaEnemigos.crear(tipo)`.
- Este sistema es infinitamente escalable: Añadir nuevos enemigos (como el _Volador_ o _Tanque_) solo requiere heredar la clase y anotarlos en `registroEnemigos.ts` (archivo central que protege contra el borrado de código inactivo en producción de **Vite**).

### 3. Árbitro de Físicas Dinámicas (`SistemaColisiones` y `SistemaDano`)

- **SistemaColisiones**: Maneja `Phaser.Physics.Arcade`. Solo detecta _overlap_ (interceptaciones huecas) y _collider_ (rebotes físicos rígidos). Al encontrar colisión de entidades, lanza el evento de interacción.
- **SistemaDano**: Las Reglas del Juego interactúan aquí:
  - ¿Mario cae desde arriba? Efectúa aplastamiento y expulsa _Knockback Y_.
  - ¿Dos enemigos idénticos (ej. terrestres inofensivos) chocan de frente? Emite a ambos un `cambiarDireccion()` sincronizado que ejecuta un salto vectorizado, repeliéndolos suavemente en sentido contrario para neutralizar bloqueos por bucles infinitos.
  - La gravedad del _EnemigoVolador_ es blindada dentro de su `update()` local para evitar que el Grupo Físico por defecto de la Escena sobreescriba su anulación antigravedad al heredarlo al Pool.

---

## Integración Visual (Tiled Map Editor)

Ya no usamos índices crudos en la Capa principal. Se migraron todos los objetos interactivos a **Mapas Vectoriales (_Object Layers_)** categorizados: `enemigos`, `monedas`, y `bloques`.

- **Instanciación Visual Matemáticamente Pura:** Tiled ancla las inserciones por rectángulo desde la _Esquina Inferior Izquierda_. Como Phaser proyecta la imagen desde su _Centro Absoluto_, se acopló una fórmula matemática en el _Parser_ de la Capa de Objetos de la Escena para recalibrar universalmente `+ (width / 2)` y `- (height / 2)`. Esto erradicó desincronización de cajas de choque entre el entorno dibujado y el renderizado físico final.

---

## 1. El Bus de Eventos (`SistemaEventos.ts`)

**El Problema:** Originalmente, las clases (como el Jugador o los Enemigos) tenían que comunicarse entre sí directamente. El `Goomba` le decía a la `Escena` local que sumara puntos, y el `Koopa` pateaba su concha afectando directamente la lógica de otras clases. Esto generaba un "Código Espagueti" difícil de mantener.

**La Solución:** Implementamos un **Patrón Singleton EventBus** a través de `SistemaEventos.ts`.

- **Por qué:** Desacopla completamente las entidades. Un `Jugador` ya no necesita saber que existe un `SistemaPuntuacion` ni un `SistemaDano`.
- **Cómo funciona:** Cuando recoges una moneda, la `Moneda` simplemente "grita" al vacío a través del Bus: `emit(EVENTOS.MONEDA_RECOGIDA)`. El `SistemaPuntuacion`, que está escuchando silenciosamente en otra parte del código, capta el grito y suma los puntos de manera autónoma.

---

## 2. Refactorización de Físicas y Daño (`SistemaColisiones.ts` y `SistemaDano.ts`)

**El Problema:** La lógica de quién mataba a quién (Muerte por pisado, choque lateral, concha asesina) estaba mezclada dentro del `Jugador` y los Enemigos, propiciando bugs y lógica duplicada. Además, los enemigos se quedaban atascados si chocaban entre sí.

**La Solución:**

- **SistemaColisiones:** Actúa como el motor puramente físico. Solo detecta "overlap" y "collider", y cuando dos entidades chocan, dispara un evento al `SistemaDano`.
- **SistemaDano:** Actúa como el "**Árbitro del Combate**".
  - Evalúa la física: ¿Tocó por arriba? (Aplastamiento). ¿Tocó de lado? (Daño).
  - Determina reacciones especiales: Si un `Goomba` y un `Tanque` chocan, instruye a ambos a ejecutar `cambiarDireccion()` para que reboten entre ellos elegantemente y no se atrapen en un bucle infinito.

---

## 3. Integración Avanzada con Tiled Map Editor

**El Problema:** Estábamos atados a codificar coordenadas (X, Y) o a tener una sola capa caótica de "objetos" obligando al motor a iterar todo para adivinar qué instanciar.

**La Solución:**

- Separamos Tiled en Sub-capas específicas (`enemigos`, `monedas`, `bloques`).
- Convertimos bloques interactivos a **Tile Objects**. Esto permite diseñar los niveles gráficamente arrastrando la textura del bloque al editor.
- **Offset Matemático Injectado:** Tiled ancla los TileObjects a la esquina inferior izquierda, mientras Phaser procesa desde el centro. En `crearObjetos()`, implementamos una fórmula geométrica que auto-alinea los bloques para que caigan pixel-perfectamente en la matriz de físicas.

---

## 4. Patrón Factory y Escalabilidad Cero-Fricción (`FabricaEnemigos.ts`)

**El Problema:** Instanciar enemigos requería una cadena enorme de `if (type === 'goomba') ... else if (type === 'koopa')` dentro de la Escena principal. Añadir un enemigo nuevo significaba modificar el archivo más vital del juego, violando el Principio Open/Closed.

**La Solución:**
Creamos `FabricaEnemigos.ts` acoplada a un `registroEnemigos.ts` blindado contra "Tree-Shaking" de Vite.

- **Cómo funciona:** La `EscenaJuego` lee la propiedad `type` del Tiled y se la tira a la Fábrica pidiendo la instancia (`FabricaEnemigos.crear`).
- **Por qué es vital:** Ahora puedes añadir 100 enemigos nuevos (como el `EnemigoVolador` sin gravedad o el `EnemigoTanque` multi-vida). Solo creas su clase individual, pones una línea en `registroEnemigos.ts`, dibujas el bloque en Tiled con la palabra 'tanque', y el juego lo materializa en pantalla sin tocar una sola línea del motor base.

---

## Resumen del Comportamiento de Entidades Actuales

| Entidad       | Herencia          | Comportamiento                                                                                                   | Evento al morir                              |
| ------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Jugador**   | Base pura         | Usa Máquina de Estados (Idle, Corriendo, Saltando).                                                              | `JUGADOR_SIN_VIDAS`                          |
| /             |                   | Sistema de Invencibilidad de 2 segundos al recibir daño. Crece con Hongos.                                       | `JUGADOR_SIN_VIDAS` hacia UI/Lógica final.   |
| ------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Goomba**    | `EnemigoBase`     | Camina, rebota en paredes y precipicios. Muere de un golpe.                                                      | `+100 Pts`                                   |
| ------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Koopa**     | `EnemigoBase`     | Al pisar se hace concha. Al patear se vuelve misil que aniquila otros enemigos.                                  | `+200 Pts`                                   |
| ------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Volador**   | `EnemigoBase`     | Inmune a gravedad (`allowGravity: false`). Patrulla aérea. Ignora precipicios.                                   | `+300 Pts`                                   |
| ------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Tanque**    | `EnemigoBase`     | `vidasRestantes: 2`. Primer golpe: Enfurece (1.8x Vel), rojo. Segundo golpe: Muere.                              | `+100` y `+300 Pts`                          |
| ------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Bloques**   | `Physics.Image`   | Dinámicos. Los interactivos expulsan power-ups.                                                                  | N/A                                          |
| ------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Hongos**    | `PowerUp`         | Escalan al Jugador y alteran hitbox para simular "Super Mario".                                                  | `+100 Pts`                                   |
| ------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |

> _Documentación actualizada tras la conclusión absoluta de todas las arquitecturas de combate, fábrica y mapeo dinámico._
