# 🎮 FASE 1 — Prototipo Jugable
### Juego tipo Mario Bros — Movimiento, físicas y primer nivel

---

> **Nota para el agente de IA:** Este documento es una guía base. Si identificas mejores patrones, optimizaciones o enfoques más robustos para cualquier punto, tienes margen para mejorar el plan. Documenta cualquier decisión que se aparte de lo descrito aquí con un comentario en el código explicando el porqué.

---

## Índice

1. [Objetivo de la fase](#1-objetivo-de-la-fase)
2. [Prerequisitos](#2-prerequisitos)
3. [Orden de implementación](#3-orden-de-implementación)
4. [Paso 1 — Tilemap base con Tiled](#4-paso-1--tilemap-base-con-tiled)
5. [Paso 2 — EscenaCarga](#5-paso-2--escenacarga)
6. [Paso 3 — Jugador](#6-paso-3--jugador)
7. [Paso 4 — ControlJugador](#7-paso-4--controljugador)
8. [Paso 5 — EstadosJugador](#8-paso-5--estadosjugador)
9. [Paso 6 — SistemaFisicas](#9-paso-6--sistemafisicas)
10. [Paso 7 — SistemaColisiones](#10-paso-7--sistemacolisiones)
11. [Paso 8 — EscenaJuego](#11-paso-8--escenajuego)
12. [Paso 9 — Cámara](#12-paso-9--cámara)
13. [Paso 10 — Tipos e interfaces](#13-paso-10--tipos-e-interfaces)
14. [Paso 11 — Constantes de la fase](#14-paso-11--constantes-de-la-fase)
15. [Ajuste del salto — lo más importante](#15-ajuste-del-salto--lo-más-importante)
16. [Assets placeholder](#16-assets-placeholder)
17. [Checklist de verificación](#17-checklist-de-verificación)
18. [Errores comunes](#18-errores-comunes)
19. [Margen de mejora para el agente](#19-margen-de-mejora-para-el-agente)

---

## 1. Objetivo de la fase

Al terminar esta fase debe existir un personaje jugable en un nivel funcional. Sin arte final, sin enemigos, sin audio, sin UI. Solo el núcleo del juego funcionando bien.

**Criterio de salida concreto:**
- El personaje corre hacia izquierda y derecha con animación
- El personaje salta y cae con gravedad realista
- El salto se siente responsivo (sin flotar, sin caer como piedra)
- El personaje colisiona correctamente con el suelo, paredes y plataformas
- La cámara sigue al personaje horizontalmente
- No hay forma de saltar infinitamente (solo desde el suelo)
- El nivel tiene inicio, plataformas intermedias y una zona final visible

---

## 2. Prerequisitos

- Fase 0 completada y verificada
- `npm run dev` corre sin errores
- Tiled Map Editor instalado en la máquina del dev encargado de niveles
- Assets placeholder listos (ver sección 16)

---

## 3. Orden de implementación

El orden importa. Cada paso depende del anterior.

```
1. Tilemap base en Tiled → exportar nivel-01.json
2. EscenaCarga           → preload de todos los assets de la fase
3. Constantes            → constantes-fisica.ts y constantes-assets.ts actualizados
4. Tipos                 → interfaces de jugador y nivel
5. SistemaFisicas        → configuración de física Arcade
6. Jugador               → clase base con sprite y body
7. ControlJugador        → inputs de teclado
8. EstadosJugador        → máquina de estados
9. SistemaColisiones     → registro de colisiones
10. EscenaJuego          → ensambla todo
11. Cámara               → follow y bounds
12. Ajuste fino del salto → hasta que se sienta bien
```

---

## 4. Paso 1 — Tilemap base con Tiled

### ¿Qué es Tiled?

Tiled Map Editor es una herramienta de escritorio gratuita para diseñar niveles en cuadrícula. Exporta a `.json` que Phaser puede cargar directamente.

### Configuración del mapa

- **Tamaño del tile:** 32x32 píxeles
- **Tamaño del mapa:** 50 tiles de ancho × 20 tiles de alto (1600x640px)
- **Orientación:** Orthogonal
- **Formato de capa:** CSV
- **Guardar como:** `assets/tilemaps/nivel-01.json`

### Capas requeridas en Tiled

Crear estas capas en orden (de abajo hacia arriba en el panel de Tiled):

| Nombre de capa | Tipo | Descripción |
|---|---|---|
| `fondo` | Tile Layer | Decoración — no tiene colisión |
| `plataformas` | Tile Layer | Tiles con colisión — el suelo y plataformas |
| `spawns` | Object Layer | Puntos de spawn del jugador (objeto `spawn-jugador`) |
| `zona-meta` | Object Layer | Zona que marca el final del nivel |

### Propiedad de colisión en Tiled

Para que Phaser sepa qué tiles tienen colisión, agregar una propiedad custom al tileset en Tiled:

1. Abrir el Tileset Editor
2. Seleccionar los tiles de plataforma
3. Agregar propiedad: `colision` → tipo `bool` → valor `true`

En Phaser se leerá así:
```typescript
// En EscenaJuego.ts
const capaTiles = mapa.createLayer('plataformas', tileset, 0, 0)
capaTiles?.setCollisionByProperty({ colision: true })
```

### Estructura mínima del nivel

El primer nivel debe tener:
- Suelo continuo en los primeros 10 tiles para que el jugador aprenda a moverse
- 3-5 plataformas en altura para practicar el salto
- Un hueco de 3-4 tiles para que el jugador aprenda a saltar sobre huecos
- Zona de meta visible al final

> 💡 **Consejo de diseño:** El primer nivel de cualquier plataformer es un tutorial implícito. Diseñarlo de izquierda a derecha con dificultad creciente gradual.

---

## 5. Paso 2 — EscenaCarga

Reemplazar el contenido placeholder de `EscenaCarga.ts` con la carga real de assets.

```typescript
import Phaser from 'phaser'
import { ASSETS } from '@constantes/constantes-assets'
import { ESCENAS } from '@constantes/constantes-escenas'

export class EscenaCarga extends Phaser.Scene {
  constructor() {
    super({ key: ESCENAS.CARGA })
  }

  preload(): void {
    this.mostrarBarraCarga()

    // Tilemap del primer nivel
    this.load.tilemapTiledJSON(ASSETS.MAPA_NIVEL_01, 'assets/tilemaps/nivel-01.json')

    // Tileset — imagen de tiles
    this.load.image(ASSETS.TILESET_PRINCIPAL, 'assets/tilesets/tileset-principal.png')

    // Spritesheet del jugador (placeholder: imagen de 32x48 con frames de animación)
    this.load.spritesheet(ASSETS.JUGADOR_SPRITE, 'assets/sprites/jugador/jugador.png', {
      frameWidth: 32,
      frameHeight: 48,
    })
  }

  create(): void {
    // Ir directo a la escena de juego al terminar la carga
    this.scene.start(ESCENAS.JUEGO)
  }

  private mostrarBarraCarga(): void {
    const { width, height } = this.scale

    // Barra de progreso simple — reemplazar con arte final en Fase 4
    const barraFondo = this.add.rectangle(width / 2, height / 2, 400, 20, 0x333333)
    const barra = this.add.rectangle(width / 2 - 200, height / 2, 0, 16, 0x4ade80)
    barra.setOrigin(0, 0.5)

    this.load.on('progress', (progreso: number) => {
      barra.width = 400 * progreso
    })
  }
}
```

---

## 6. Paso 3 — Jugador

El `Jugador` extiende `Phaser.Physics.Arcade.Sprite` para tener física integrada.

### `src/entidades/jugador/Jugador.ts`

```typescript
import Phaser from 'phaser'
import { ASSETS } from '@constantes/constantes-assets'
import { ControlJugador } from './ControlJugador'
import { EstadosJugador } from './EstadosJugador'
import type { EstadoJugador } from '@tipos/tipos-jugador'

export class Jugador extends Phaser.Physics.Arcade.Sprite {
  private control: ControlJugador
  private estados: EstadosJugador
  public estado: EstadoJugador = 'idle'

  constructor(escena: Phaser.Scene, x: number, y: number) {
    super(escena, x, y, ASSETS.JUGADOR_SPRITE)

    // Registrar en la escena y en el sistema de física
    escena.add.existing(this)
    escena.physics.add.existing(this)

    this.control = new ControlJugador(escena)
    this.estados = new EstadosJugador(this)

    this.configurarCuerpo()
  }

  private configurarCuerpo(): void {
    const body = this.body as Phaser.Physics.Arcade.Body

    // Ajustar hitbox para que sea más precisa que el sprite completo
    body.setSize(24, 40)        // Ancho y alto del hitbox
    body.setOffset(4, 8)        // Centrar el hitbox dentro del sprite
    body.setMaxVelocityX(300)   // Velocidad horizontal máxima
    body.setGravityY(0)         // La gravedad global se aplica en configuracion-juego.ts
  }

  update(): void {
    this.estados.actualizar(this.control.obtenerInput())
  }

  public estaEnSuelo(): boolean {
    return (this.body as Phaser.Physics.Arcade.Body).blocked.down
  }
}
```

### Consideraciones del hitbox

El hitbox casi nunca debe ser del tamaño exacto del sprite. En plataformers se hace más pequeño para que se sienta justo al jugador. Un hitbox más pequeño que el sprite visible es siempre preferible a uno más grande.

---

## 7. Paso 4 — ControlJugador

Centraliza todos los inputs. Si en el futuro se agrega gamepad o controles touch, solo se modifica este archivo.

### `src/entidades/jugador/ControlJugador.ts`

```typescript
import Phaser from 'phaser'
import type { InputJugador } from '@tipos/tipos-jugador'

export class ControlJugador {
  private teclas: {
    izquierda: Phaser.Input.Keyboard.Key
    derecha: Phaser.Input.Keyboard.Key
    saltar: Phaser.Input.Keyboard.Key
    saltarAlt: Phaser.Input.Keyboard.Key
  }

  constructor(escena: Phaser.Scene) {
    const teclado = escena.input.keyboard!

    this.teclas = {
      izquierda:  teclado.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      derecha:    teclado.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      saltar:     teclado.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      saltarAlt:  teclado.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    }
  }

  public obtenerInput(): InputJugador {
    return {
      izquierda: this.teclas.izquierda.isDown,
      derecha:   this.teclas.derecha.isDown,
      saltar:    Phaser.Input.Keyboard.JustDown(this.teclas.saltar) ||
                 Phaser.Input.Keyboard.JustDown(this.teclas.saltarAlt),
    }
  }

  public destruir(): void {
    // Importante: limpiar listeners al destruir la escena para evitar memory leaks
    Object.values(this.teclas).forEach(tecla => tecla.destroy())
  }
}
```

### Por qué `JustDown` para el salto

`JustDown` retorna `true` solo en el frame exacto en que se presiona la tecla, no mientras se mantiene. Esto evita que el jugador salte automáticamente al aterrizar si la tecla sigue presionada.

---

## 8. Paso 5 — EstadosJugador

La máquina de estados controla qué hace el jugador según su estado actual y el input recibido.

### `src/entidades/jugador/EstadosJugador.ts`

```typescript
import { FISICA } from '@constantes/constantes-fisica'
import type { Jugador } from './Jugador'
import type { InputJugador, EstadoJugador } from '@tipos/tipos-jugador'
import Phaser from 'phaser'

export class EstadosJugador {
  private jugador: Jugador

  constructor(jugador: Jugador) {
    this.jugador = jugador
  }

  public actualizar(input: InputJugador): void {
    this.manejarMovimientoHorizontal(input)
    this.manejarSalto(input)
    this.actualizarAnimacion()
  }

  private manejarMovimientoHorizontal(input: InputJugador): void {
    if (input.izquierda) {
      this.jugador.setVelocityX(-FISICA.VELOCIDAD_JUGADOR)
      this.jugador.setFlipX(true)   // Voltear sprite hacia la izquierda
      this.jugador.estado = 'corriendo'
    } else if (input.derecha) {
      this.jugador.setVelocityX(FISICA.VELOCIDAD_JUGADOR)
      this.jugador.setFlipX(false)
      this.jugador.estado = 'corriendo'
    } else {
      // Desaceleración — no frenar instantáneamente para que se sienta natural
      this.jugador.setVelocityX(
        Phaser.Math.Linear(this.jugador.body!.velocity.x, 0, FISICA.FRICCION)
      )
      this.jugador.estado = 'idle'
    }
  }

  private manejarSalto(input: InputJugador): void {
    if (input.saltar && this.jugador.estaEnSuelo()) {
      this.jugador.setVelocityY(FISICA.FUERZA_SALTO)
      this.jugador.estado = 'saltando'
    }

    // Si el jugador está en el aire pero no saltando activamente, está cayendo
    if (!this.jugador.estaEnSuelo() && this.jugador.body!.velocity.y > 0) {
      this.jugador.estado = 'cayendo'
    }
  }

  private actualizarAnimacion(): void {
    switch (this.jugador.estado) {
      case 'idle':
        this.jugador.anims.play('jugador-idle', true)
        break
      case 'corriendo':
        this.jugador.anims.play('jugador-correr', true)
        break
      case 'saltando':
      case 'cayendo':
        this.jugador.anims.play('jugador-saltar', true)
        break
    }
  }
}
```

---

## 9. Paso 6 — SistemaFisicas

### `src/sistemas/SistemaFisicas.ts`

```typescript
import Phaser from 'phaser'
import { FISICA } from '@constantes/constantes-fisica'

export class SistemaFisicas {
  // Configura los bounds del mundo físico según el tamaño del mapa
  public static configurarMundo(
    escena: Phaser.Scene,
    anchoMundo: number,
    altoMundo: number
  ): void {
    escena.physics.world.setBounds(0, 0, anchoMundo, altoMundo)
    escena.physics.world.gravity.y = FISICA.GRAVEDAD
  }

  // Helper para aplicar knockback a un sprite
  public static aplicarKnockback(
    sprite: Phaser.Physics.Arcade.Sprite,
    direccion: 'izquierda' | 'derecha'
  ): void {
    const fuerza = direccion === 'izquierda' ? -FISICA.FUERZA_KNOCKBACK : FISICA.FUERZA_KNOCKBACK
    sprite.setVelocityX(fuerza)
    sprite.setVelocityY(FISICA.FUERZA_SALTO * 0.5)
  }
}
```

---

## 10. Paso 7 — SistemaColisiones

### `src/sistemas/SistemaColisiones.ts`

```typescript
import Phaser from 'phaser'
import type { Jugador } from '@entidades/jugador/Jugador'

export class SistemaColisiones {
  private escena: Phaser.Scene

  constructor(escena: Phaser.Scene) {
    this.escena = escena
  }

  // Colisión jugador vs tilemap (suelo y plataformas)
  public registrarJugadorConMapa(
    jugador: Jugador,
    capaTiles: Phaser.Tilemaps.TilemapLayer
  ): void {
    this.escena.physics.add.collider(jugador, capaTiles)
  }

  // En fases posteriores se agregan aquí:
  // registrarJugadorConEnemigos()
  // registrarJugadorConMonedas()
  // registrarJugadorConPowerUps()
  // registrarEnemigosConMapa()
}
```

---

## 11. Paso 8 — EscenaJuego

Esta es la escena principal que ensambla todo.

### `src/escenas/EscenaJuego.ts`

```typescript
import Phaser from 'phaser'
import { ESCENAS } from '@constantes/constantes-escenas'
import { ASSETS } from '@constantes/constantes-assets'
import { Jugador } from '@entidades/jugador/Jugador'
import { SistemaFisicas } from '@sistemas/SistemaFisicas'
import { SistemaColisiones } from '@sistemas/SistemaColisiones'

export class EscenaJuego extends Phaser.Scene {
  private jugador!: Jugador
  private colisiones!: SistemaColisiones
  private capaPlataformas!: Phaser.Tilemaps.TilemapLayer

  constructor() {
    super({ key: ESCENAS.JUEGO })
  }

  create(): void {
    const mapa = this.crearMapa()
    this.crearJugador(mapa)
    this.configurarFisica(mapa)
    this.configurarColisiones()
    this.configurarCamara(mapa)
  }

  private crearMapa(): Phaser.Tilemaps.Tilemap {
    const mapa = this.make.tilemap({ key: ASSETS.MAPA_NIVEL_01 })
    const tileset = mapa.addTilesetImage('tileset-principal', ASSETS.TILESET_PRINCIPAL)!

    // Capa de fondo — sin colisión
    mapa.createLayer('fondo', tileset, 0, 0)

    // Capa de plataformas — con colisión
    this.capaPlataformas = mapa.createLayer('plataformas', tileset, 0, 0)!
    this.capaPlataformas.setCollisionByProperty({ colision: true })

    return mapa
  }

  private crearJugador(mapa: Phaser.Tilemaps.Tilemap): void {
    // Obtener punto de spawn desde la capa de objetos de Tiled
    const spawns = mapa.getObjectLayer('spawns')
    const puntoSpawn = spawns?.objects.find(o => o.name === 'spawn-jugador')

    const x = puntoSpawn?.x ?? 100
    const y = puntoSpawn?.y ?? 400

    this.jugador = new Jugador(this, x, y)
  }

  private configurarFisica(mapa: Phaser.Tilemaps.Tilemap): void {
    SistemaFisicas.configurarMundo(
      this,
      mapa.widthInPixels,
      mapa.heightInPixels
    )
  }

  private configurarColisiones(): void {
    this.colisiones = new SistemaColisiones(this)
    this.colisiones.registrarJugadorConMapa(this.jugador, this.capaPlataformas)
  }

  private configurarCamara(mapa: Phaser.Tilemaps.Tilemap): void {
    this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels)
    this.cameras.main.startFollow(this.jugador, true, 0.1, 0.1)
    // 0.1 = lerp de la cámara — valor entre 0 y 1
    // Más bajo = más suave y con más retraso
    // Más alto = más rígida y responsiva
  }

  update(): void {
    this.jugador.update()
  }
}
```

---

## 12. Paso 9 — Cámara

### Configuración recomendada

```typescript
// Seguir al jugador con lerp suave
this.cameras.main.startFollow(jugador, true, 0.1, 0.1)

// Limitar la cámara a los bordes del mapa
this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels)

// Zoom — 1 es normal, >1 acerca, <1 aleja
this.cameras.main.setZoom(1)

// Dead zone — área donde el jugador se mueve sin que la cámara reaccione
// Útil para plataformers donde el jugador salta mucho
this.cameras.main.setDeadzone(100, 80)
```

### Eje Y de la cámara

En Mario Bros clásico, la cámara solo sigue al jugador en el eje X. En el eje Y solo sube si el jugador sube, pero no baja hasta que el jugador llega muy abajo. Considerar implementar esto para mayor fidelidad al género:

```typescript
// Alternativa: seguir solo en X, fijar Y
this.cameras.main.startFollow(jugador, true, 0.08, 0)
// El último parámetro (lerpY = 0) fija la cámara verticalmente
// Ajustar según lo que se sienta mejor durante las pruebas
```

---

## 13. Paso 10 — Tipos e interfaces

### `src/tipos/tipos-jugador.ts`

```typescript
export type EstadoJugador =
  | 'idle'
  | 'corriendo'
  | 'saltando'
  | 'cayendo'
  | 'muerto'
  | 'invencible'  // Estado después de recibir daño — se agrega en Fase 2

export interface InputJugador {
  izquierda: boolean
  derecha:   boolean
  saltar:    boolean
}

export interface DatosJugador {
  vidas:    number
  monedas:  number
  puntos:   number
  estado:   EstadoJugador
}
```

### `src/tipos/tipos-nivel.ts`

```typescript
export interface ConfigNivel {
  clave:        string
  nombreMapa:   string
  nombreMusica: string
  tiempoLimite: number
}

export interface DatosNivel {
  completado:  boolean
  estrellas:   number   // 0-3, para sistema de puntuación futuro
  mejorTiempo: number
  monedasRecogidas: number
}
```

---

## 14. Paso 11 — Constantes de la fase

### Actualizar `src/constantes/constantes-fisica.ts`

```typescript
export const FISICA = {
  // Mundo
  GRAVEDAD:           600,

  // Jugador
  VELOCIDAD_JUGADOR:  200,
  FUERZA_SALTO:       -520,   // Negativo porque Y crece hacia abajo en Phaser
  FRICCION:           0.15,   // Qué tan rápido frena al soltar teclas (0=inmediato, 1=nunca)
  FUERZA_KNOCKBACK:   180,

  // Enemigos (se usan en Fase 2)
  VELOCIDAD_ENEMIGO:  80,
} as const
```

### Actualizar `src/constantes/constantes-assets.ts`

```typescript
export const ASSETS = {
  // Tilemaps
  MAPA_NIVEL_01:       'mapa-nivel-01',

  // Tilesets
  TILESET_PRINCIPAL:   'tileset-principal',

  // Jugador
  JUGADOR_SPRITE:      'jugador-sprite',

  // Se agregan más keys en fases posteriores
} as const
```

---

## 15. Ajuste del salto — lo más importante

El salto es la mecánica más importante de un plataformer. Si el salto no se siente bien, el juego no se siente bien. Dedicar tiempo específico a esto antes de avanzar.

### Variables que afectan el salto

| Variable | Efecto | Dónde vive |
|---|---|---|
| `FISICA.GRAVEDAD` | Qué tan rápido cae | `constantes-fisica.ts` y `configuracion-juego.ts` |
| `FISICA.FUERZA_SALTO` | Qué tan alto llega | `constantes-fisica.ts` |
| Lerp de cámara Y | Qué tan suave sigue la cámara | `EscenaJuego.ts` |

### Técnica de salto variable (recomendada)

En los mejores plataformers, si el jugador suelta la tecla de salto antes de llegar al tope, el personaje cae antes. Esto da control sobre la altura del salto:

```typescript
// En EstadosJugador.ts — dentro de manejarSalto()
// Si el jugador suelta la tecla mientras sube, aplicar gravedad extra
if (!input.saltar && this.jugador.body!.velocity.y < 0) {
  const body = this.jugador.body as Phaser.Physics.Arcade.Body
  body.setGravityY(FISICA.GRAVEDAD * 1.5)  // Caída más rápida al soltar
} else {
  const body = this.jugador.body as Phaser.Physics.Arcade.Body
  body.setGravityY(0)  // Gravedad normal del mundo
}
```

### Valores de referencia para ajustar

Empezar con estos valores y ajustar hasta que se sienta natural:

```typescript
GRAVEDAD:      600   // Probar entre 400 y 800
FUERZA_SALTO: -520   // Probar entre -400 y -650
```

> ⚠️ **Regla:** No avanzar a la Fase 2 hasta que los 3 integrantes del equipo estén de acuerdo en que el salto se siente bien. Es más fácil ajustar ahora que cuando haya enemigos y niveles complejos encima.

---

## 16. Assets placeholder

Para esta fase no se necesita arte final. Usar estos placeholders:

### Opción A — Generar con código (sin archivos externos)

En `EscenaCarga.ts` generar texturas por código:

```typescript
// Jugador — rectángulo azul con frames de animación
this.make.graphics({ x: 0, y: 0 })
  .fillStyle(0x3b82f6)
  .fillRect(0, 0, 32, 48)
  .generateTexture(ASSETS.JUGADOR_SPRITE, 32 * 4, 48)  // 4 frames
  .destroy()
```

### Opción B — Imágenes placeholder simples

Descargar spritesheets gratuitos de:
- https://kenney.nl/assets — assets 2D gratuitos de alta calidad, estilo plataformer
- Buscar "Platformer Pack" o "Jumper Pack"

Kenney.nl es el recurso estándar de la industria para placeholders y prototipos.

### Dimensiones esperadas del spritesheet del jugador

```
Frame size:   32 x 48 px
Frames idle:  1-2 frames
Frames correr: 4-6 frames
Frames saltar: 1 frame
Layout:        horizontal (todos los frames en una fila)
```

---

## 17. Checklist de verificación

### Técnico

- [ ] `npm run dev` sin errores en consola
- [ ] El tilemap carga y se ve correctamente
- [ ] El jugador aparece en el punto de spawn definido en Tiled
- [ ] El jugador corre hacia izquierda y derecha
- [ ] El jugador voltea el sprite al cambiar de dirección
- [ ] El jugador salta al presionar flecha arriba o espacio
- [ ] No se puede saltar mientras se está en el aire
- [ ] El jugador colisiona con el suelo y no lo atraviesa
- [ ] El jugador colisiona con plataformas y puede pararse sobre ellas
- [ ] El jugador no puede salir del mapa por los lados
- [ ] La cámara sigue al jugador sin glitches
- [ ] La cámara no muestra zona fuera del mapa
- [ ] Las animaciones cambian según el estado

### Calidad del juego

- [ ] El salto se siente responsivo (no hay delay perceptible)
- [ ] La gravedad no se siente ni demasiado flotante ni demasiado pesada
- [ ] El frenado al soltar teclas no es instantáneo pero tampoco muy lento
- [ ] Los 3 integrantes probaron el juego y aprueban las físicas

---

## 18. Errores comunes

### El jugador cae a través del suelo

**Causa:** La capa de tiles no tiene colisión configurada, o el nombre de la propiedad en Tiled no coincide.
**Solución:** Verificar que en Tiled los tiles tienen la propiedad `colision: true` y que en el código se usa `setCollisionByProperty({ colision: true })` con el mismo nombre exacto.

### El jugador puede saltar múltiples veces en el aire

**Causa:** `estaEnSuelo()` no está verificando `body.blocked.down` correctamente, o el body no tiene física arcade asignada.
**Solución:** Verificar que `escena.physics.add.existing(this)` se llama en el constructor y que el body es de tipo `Phaser.Physics.Arcade.Body`.

### La cámara tiembla o salta

**Causa:** El lerp de la cámara está en 1 (sin suavizado) o el jugador tiene velocidades muy altas.
**Solución:** Bajar el lerp a 0.08-0.12 en `startFollow`.

### El tilemap no carga — error "key not found"

**Causa:** El key usado en `load.tilemapTiledJSON()` no coincide con el key usado en `make.tilemap()`.
**Solución:** Usar siempre las constantes de `ASSETS` en vez de strings directos.

### Las animaciones no reproducen

**Causa:** Las animaciones no están creadas antes de intentar reproducirlas, o el key del animation no existe.
**Solución:** Crear todas las animaciones en `AnimacionesJugador.ts` y llamar a esa función en el `create()` de `EscenaJuego` antes de instanciar el jugador.

---

## 19. Margen de mejora para el agente

Los siguientes puntos son intencionales y están abiertos a que el agente de IA proponga e implemente mejoras:

### Mejoras sugeridas a evaluar

- **Coyote time:** Técnica estándar en plataformers donde el jugador puede saltar durante ~100ms después de caminar fuera de una plataforma. Hace el juego más justo y menos frustrante.

- **Jump buffering:** Si el jugador presiona saltar justo antes de aterrizar, el salto se ejecuta al aterrizar. Mejora la responsividad.

- **Aceleración gradual:** En vez de velocidad constante al presionar la tecla, acelerar progresivamente hasta la velocidad máxima. Se siente más natural.

- **Animación de aterrizaje:** Un frame de "squash" al aterrizar antes de volver a idle. Pequeño detalle que mejora mucho el game feel.

- **Separación de AnimacionesJugador:** Si el agente considera más limpio registrar todas las animaciones en `AnimacionesJugador.ts` y llamarlas desde la escena, hacerlo así.

- **Pool de objetos:** Si el agente identifica oportunidades de usar object pooling para mejorar rendimiento desde esta fase, implementarlo.

> Si implementas alguna de estas mejoras o cualquier otra no listada, agregar un comentario en el código con el prefijo `// MEJORA:` explicando qué se hizo y por qué.
