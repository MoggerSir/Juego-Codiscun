# 🗺️ FASE 3 — Niveles, Progresión y Guardado
### Dirigido al equipo de desarrollo

---

> **Antes de empezar:** La Fase 2 está cerrada con arquitectura de combate completa, FabricaEnemigos, SistemaDano, SistemaEventos y 4 tipos de enemigos funcionando. Esta fase construye encima de esa base sin tocar nada de lo que ya existe. Si algo de la Fase 2 tiene bugs pendientes, resolverlos antes de empezar aquí.

---

## ¿Qué construimos en esta fase?

Hasta ahora el juego tiene un solo nivel sin inicio ni fin real. El jugador puede morir pero no hay progresión, no se guarda nada, no hay selector de niveles y la Bandera/zona-meta no hace nada útil todavía.

Esta fase conecta todo eso:

1. **Múltiples niveles reales** — Diseñar y conectar al menos 3 niveles completos con diseño progresivo
2. **GestorNiveles** — Sistema que controla el orden, desbloqueo y transición entre niveles
3. **SistemaGuardado** — Persistencia con LocalStorage: progreso, puntuación máxima, monedas, niveles desbloqueados
4. **EscenaNiveles** — Pantalla de selección de niveles con estado de progreso visual
5. **Bandera funcional** — Meta del nivel que dispara la transición correcta
6. **TemporizadorNivel** — Cuenta regresiva con penalización al agotarse
7. **EscenaVictoria** — Pantalla de nivel completado con resumen de puntos y tiempo
8. **Checkpoint system** — Punto de respawn intermedio dentro del nivel

**Al terminar esta fase el juego debe poderse jugar de principio a fin:** menú → selector → nivel 1 → victoria → nivel 2 → victoria → nivel 3 → victoria final → créditos o loop.

---

## Índice de tareas

1. [Reparto de trabajo](#1-reparto-de-trabajo)
2. [Diseño de los 3 niveles en Tiled](#2-diseño-de-los-3-niveles-en-tiled)
3. [NivelBase y clases de nivel](#3-nivelbase-y-clases-de-nivel)
4. [GestorNiveles](#4-gestorniveles)
5. [Bandera — meta del nivel](#5-bandera--meta-del-nivel)
6. [Checkpoint](#6-checkpoint)
7. [TemporizadorNivel](#7-temporizadornivel)
8. [SistemaGuardado](#8-sistemaguardado)
9. [EscenaVictoria](#9-escenavicloria)
10. [EscenaNiveles — selector](#10-escenaniveles--selector)
11. [EscenaMenu — actualizar](#11-escenamenu--actualizar)
12. [Actualizar EscenaJuego](#12-actualizar-escenajuego)
13. [Actualizar SistemaPuntuacion](#13-actualizar-sistemapuntuacion)
14. [Nuevos eventos en SistemaEventos](#14-nuevos-eventos-en-sistemaeventos)
15. [Nuevas constantes](#15-nuevas-constantes)
16. [Nuevos tipos](#16-nuevos-tipos)
17. [Checklist de verificación](#17-checklist-de-verificación)
18. [Errores comunes de esta fase](#18-errores-comunes-de-esta-fase)

---

## 1. Reparto de trabajo

```
Dev 1 → GestorNiveles + SistemaGuardado + NivelBase + clases de nivel
Dev 2 → Diseño de los 3 niveles en Tiled + Bandera + Checkpoint + TemporizadorNivel
Dev 3 → EscenaVictoria + EscenaNiveles + EscenaMenu actualizado + Actualizar EscenaJuego
```

Dev 3 depende de que Dev 1 termine `GestorNiveles` y `SistemaGuardado` primero — son los que alimentan las pantallas. Dev 1 y Dev 2 pueden arrancar en paralelo desde el día uno.

**Punto de integración:** cuando los tres terminan, Dev 1 conecta `GestorNiveles` con `EscenaJuego` y verifica el flujo completo de principio a fin.

---

## 2. Diseño de los 3 niveles en Tiled

**Responsable:** Dev 2  
**Archivos:** `assets/tilemaps/nivel-01.json`, `nivel-02.json`, `nivel-03.json`

### Principios de diseño para plataformers

El nivel 1 ya existe de la Fase 1-2. Hay que completarlo y crear los dos nuevos. Cada nivel debe ser más difícil que el anterior de forma gradual y honesta — el jugador aprende mecánicas nuevas en cada uno.

| Nivel | Tema | Mecánica nueva | Enemigos presentes |
|---|---|---|---|
| **Nivel 1** | Mundo verde / tutorial | Movimiento básico, monedas, bloques | Goomba, Koopa |
| **Nivel 2** | Cueva / subterráneo | Plataformas suspendidas, huecos largos, más densidad de enemigos | Goomba, Koopa, Tanque |
| **Nivel 3** | Castillo / final | Secciones verticales, enemigos voladores, precisión requerida | Todos los tipos |

### Estructura de capas requerida en cada nivel

Cada archivo `.json` debe tener exactamente estas capas con estos nombres:

```
fondo              → Tile Layer     — decoración, sin colisión
plataformas        → Tile Layer     — suelo y plataformas con colisión
objetos-bloques    → Object Layer   — BloqueLadrillo, BloqueInterrogacion
objetos-monedas    → Object Layer   — Monedas flotantes
enemigos           → Object Layer   — Goombas, Koopas, Tanques, Voladores
spawns             → Object Layer   — spawn-jugador, zona-meta, checkpoints
```

### Objetos requeridos en la capa `spawns`

Cada nivel necesita al menos estos objetos en la capa `spawns`:

| Nombre (`name`) | Descripción |
|---|---|
| `spawn-jugador` | Punto de inicio del jugador al comenzar el nivel |
| `zona-meta` | Zona donde está la bandera — dispara la victoria |
| `checkpoint-1` | Punto de respawn intermedio (puede haber más de uno) |

### Guía de dificultad progresiva

**Nivel 1 — Tutorial implícito**
- Los primeros 15 tiles son suelo plano para que el jugador aprenda a moverse
- El primer enemigo aparece solo, en campo abierto, fácil de ver
- Los huecos no superan 3 tiles de ancho
- Hay al menos 3 bloques interrogación visibles para enseñar esa mecánica
- Longitud: 60-70 tiles de ancho

**Nivel 2 — Incremento moderado**
- Plataformas con huecos desde el inicio
- Grupos de 2-3 enemigos en espacios cerrados
- Secciones con altura variable (subir y bajar)
- Huecos de hasta 5 tiles
- Longitud: 80-90 tiles de ancho

**Nivel 3 — Desafío real**
- Sección vertical obligatoria (el jugador sube en vez de avanzar a la derecha)
- EnemigoVolador como obstáculo en pasillos angostos
- EnemigoTanque como miniboss antes de la meta
- Plataformas que requieren timing preciso
- Longitud: 90-100 tiles de ancho

### Consideración importante para el nivel vertical

Phaser por defecto la cámara sigue horizontalmente. Si el Nivel 3 tiene una sección vertical, hay que ajustar temporalmente el `lerpY` de la cámara en `EscenaJuego` cuando el jugador entre en esa sección. Documentar esto en el nivel con un objeto de tipo `zona-vertical` en la capa `spawns` para que `EscenaJuego` lo detecte.

---

## 3. NivelBase y clases de nivel

**Responsable:** Dev 1  
**Archivos:** `src/niveles/NivelBase.ts`, `Nivel01.ts`, `Nivel02.ts`, `Nivel03.ts`

### ¿Por qué existe NivelBase?

Cada nivel tiene configuración distinta: qué mapa cargar, qué música poner, cuánto tiempo tiene el jugador, qué tileset usar. En vez de hardcodear eso en `EscenaJuego`, cada nivel es un objeto de configuración que `EscenaJuego` consume.

### NivelBase

```typescript
// src/niveles/NivelBase.ts
import type { ConfigNivel } from '@tipos/tipos-nivel'

export abstract class NivelBase {
  abstract obtenerConfig(): ConfigNivel
}
```

### ConfigNivel — lo que define cada nivel

```typescript
// Agregar a src/tipos/tipos-nivel.ts
export interface ConfigNivel {
  clave:             string    // 'nivel-01', 'nivel-02', etc.
  nombreMapa:        string    // key del asset en EscenaCarga
  rutaMapa:          string    // path al JSON de Tiled
  nombreTileset:     string    // key del tileset principal
  rutaTileset:       string    // path a la imagen del tileset
  nombreMusica:      string    // key del audio
  tiempoLimite:      number    // segundos — 0 = sin límite
  indice:            number    // posición en el orden de niveles (0, 1, 2)
  nombreDisplay:     string    // texto visible en el selector: "Nivel 1 — Mundo Verde"
}
```

### Nivel01, Nivel02, Nivel03

```typescript
// src/niveles/Nivel01.ts
import { NivelBase } from './NivelBase'
import { ASSETS } from '@constantes/constantes-assets'
import type { ConfigNivel } from '@tipos/tipos-nivel'

export class Nivel01 extends NivelBase {
  obtenerConfig(): ConfigNivel {
    return {
      clave:          'nivel-01',
      nombreMapa:     ASSETS.MAPA_NIVEL_01,
      rutaMapa:       'assets/tilemaps/nivel-01.json',
      nombreTileset:  ASSETS.TILESET_PRINCIPAL,
      rutaTileset:    'assets/tilesets/tileset-principal.png',
      nombreMusica:   ASSETS.MUSICA_NIVEL_01,
      tiempoLimite:   300,
      indice:         0,
      nombreDisplay:  'Nivel 1 — Mundo Verde',
    }
  }
}
```

Repetir para `Nivel02` y `Nivel03` con sus propios valores.

---

## 4. GestorNiveles

**Responsable:** Dev 1  
**Archivo:** `src/niveles/GestorNiveles.ts` — clase nueva

### Responsabilidades

- Conocer el orden de todos los niveles
- Saber cuál es el nivel actual
- Decir cuál es el siguiente nivel
- Consultar al `SistemaGuardado` qué niveles están desbloqueados
- Desbloquear el siguiente nivel al completar el actual

```typescript
import { Nivel01 } from './Nivel01'
import { Nivel02 } from './Nivel02'
import { Nivel03 } from './Nivel03'
import { SistemaGuardado } from '@sistemas/SistemaGuardado'
import type { NivelBase } from './NivelBase'
import type { ConfigNivel } from '@tipos/tipos-nivel'

export class GestorNiveles {
  // Lista ordenada de todos los niveles del juego
  private static readonly niveles: NivelBase[] = [
    new Nivel01(),
    new Nivel02(),
    new Nivel03(),
  ]

  public static obtenerConfig(indice: number): ConfigNivel {
    const nivel = GestorNiveles.niveles[indice]
    if (!nivel) throw new Error(`GestorNiveles: índice ${indice} no existe`)
    return nivel.obtenerConfig()
  }

  public static obtenerSiguienteConfig(indiceActual: number): ConfigNivel | null {
    const siguiente = indiceActual + 1
    if (siguiente >= GestorNiveles.niveles.length) return null // era el último nivel
    return GestorNiveles.obtenerConfig(siguiente)
  }

  public static completarNivel(indice: number): void {
    const siguiente = indice + 1
    if (siguiente < GestorNiveles.niveles.length) {
      SistemaGuardado.desbloquearNivel(siguiente)
    }
    SistemaGuardado.marcarNivelCompletado(indice)
  }

  public static estaDesbloqueado(indice: number): boolean {
    if (indice === 0) return true // el primer nivel siempre está desbloqueado
    return SistemaGuardado.obtenerDatos().nivelesDesbloqueados.includes(indice)
  }

  public static obtenerTodos(): ConfigNivel[] {
    return GestorNiveles.niveles.map(n => n.obtenerConfig())
  }

  public static estaCompletado(indice: number): boolean {
    return SistemaGuardado.obtenerDatos().nivelesCompletados.includes(indice)
  }
}
```

---

## 5. Bandera — meta del nivel

**Responsable:** Dev 2  
**Archivo:** `src/entidades/objetos/Bandera.ts` — clase nueva

### Comportamiento

La bandera es el objeto que marca el final del nivel. Cuando el jugador hace overlap con ella, se dispara la secuencia de victoria.

```
Jugador hace overlap con la zona de la bandera
  → detener al jugador (setVelocity(0, 0), deshabilitar controles)
  → reproducir animación de la bandera bajando
  → emitir evento EVENTOS.NIVEL_COMPLETADO con los datos de la partida
  → EscenaJuego escucha ese evento y lanza la transición a EscenaVictoria
```

```typescript
// src/entidades/objetos/Bandera.ts
import Phaser from 'phaser'
import { SistemaEventos } from '@sistemas/SistemaEventos'
import { EVENTOS } from '@constantes/constantes-eventos'
import { ASSETS } from '@constantes/constantes-assets'

export class Bandera extends Phaser.Physics.Arcade.Sprite {
  private activada: boolean = false

  constructor(escena: Phaser.Scene, x: number, y: number) {
    super(escena, x, y, ASSETS.BANDERA_SPRITE)
    escena.add.existing(this)
    escena.physics.add.existing(this, true) // estática
  }

  public activar(datosNivel: DatosFinNivel): void {
    if (this.activada) return
    this.activada = true

    // Animación de victoria — la bandera baja
    this.scene.tweens.add({
      targets: this,
      y: this.y + 150,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        SistemaEventos.obtener().emit(EVENTOS.NIVEL_COMPLETADO, datosNivel)
      }
    })
  }
}
```

### Cómo EscenaJuego detecta el overlap con la bandera

```typescript
// En SistemaColisiones.ts — agregar
public registrarJugadorConBandera(
  jugador: Jugador,
  bandera: Bandera
): void {
  this.escena.physics.add.overlap(jugador, bandera, () => {
    bandera.activar({
      indiceNivel:  this.indiceNivelActual,
      puntos:       this.sistemaPuntuacion.obtenerPuntos(),
      monedas:      this.sistemaPuntuacion.obtenerMonedas(),
      tiempoRestante: this.temporizador.obtenerTiempoRestante(),
    })
  })
}
```

---

## 6. Checkpoint

**Responsable:** Dev 2  
**Archivo:** `src/entidades/objetos/Checkpoint.ts` — clase nueva

### ¿Qué es un checkpoint?

Un punto de respawn intermedio dentro del nivel. Cuando el jugador lo toca por primera vez, queda activado. Si el jugador muere después, reaparece en el último checkpoint activado en vez del spawn inicial.

### Comportamiento

```
Jugador hace overlap con el checkpoint (primera vez)
  → checkpoint se activa visualmente (cambio de sprite/color)
  → emitir evento EVENTOS.CHECKPOINT_ACTIVADO con la posición
  → Jugador actualiza su posicionSpawn a las coordenadas del checkpoint
  → los checkpoints anteriores siguen activados pero el spawn se actualiza al más reciente
```

```typescript
// src/entidades/objetos/Checkpoint.ts
import Phaser from 'phaser'
import { SistemaEventos } from '@sistemas/SistemaEventos'
import { EVENTOS } from '@constantes/constantes-eventos'
import { ASSETS } from '@constantes/constantes-assets'

export class Checkpoint extends Phaser.Physics.Arcade.Sprite {
  private activado: boolean = false

  constructor(escena: Phaser.Scene, x: number, y: number) {
    super(escena, x, y, ASSETS.CHECKPOINT_SPRITE)
    escena.add.existing(this)
    escena.physics.add.existing(this, true)
  }

  public intentarActivar(): void {
    if (this.activado) return
    this.activado = true

    // Cambio visual — de inactivo a activo
    this.setTexture(ASSETS.CHECKPOINT_ACTIVO_SPRITE)

    SistemaEventos.obtener().emit(EVENTOS.CHECKPOINT_ACTIVADO, {
      x: this.x,
      y: this.y,
    })
  }

  public estaActivado(): boolean {
    return this.activado
  }
}
```

### Actualizar Jugador.ts para checkpoints

```typescript
// En Jugador.ts — actualizar posicionSpawn al activarse un checkpoint
// Se hace dentro del create() de EscenaJuego escuchando el evento:

SistemaEventos.obtener().on(EVENTOS.CHECKPOINT_ACTIVADO, (datos: { x: number, y: number }) => {
  this.jugador.actualizarSpawn(datos.x, datos.y)
})
```

### Persistencia del checkpoint entre muertes

El checkpoint no se guarda en `LocalStorage` — solo persiste mientras la escena está activa. Si el jugador cierra el juego y vuelve, empieza desde el inicio del nivel. Guardar el checkpoint es complejidad extra que no aporta suficiente en este punto.

---

## 7. TemporizadorNivel

**Responsable:** Dev 2  
**Archivo:** `src/ui/TemporizadorNivel.ts` — clase nueva

### Lógica

```
Al iniciar el nivel → empezar cuenta regresiva desde ConfigNivel.tiempoLimite
Cada segundo → emitir EVENTOS.TIEMPO_ACTUALIZADO con el tiempo restante
Al llegar a 0 → emitir EVENTOS.TIEMPO_AGOTADO
  → Jugador pierde una vida (misma lógica que recibir daño)
  → Si hay vidas restantes → reiniciar el temporizador y respawnear
  → Si no hay vidas → EVENTOS.JUGADOR_SIN_VIDAS → EscenaGameOver
Cuando el nivel se completa → detener el temporizador
```

```typescript
// src/ui/TemporizadorNivel.ts
import Phaser from 'phaser'
import { SistemaEventos } from '@sistemas/SistemaEventos'
import { EVENTOS } from '@constantes/constantes-eventos'

export class TemporizadorNivel {
  private tiempoRestante: number
  private temporizadorPhaser: Phaser.Time.TimerEvent | null = null
  private activo: boolean = false
  private escena: Phaser.Scene

  constructor(escena: Phaser.Scene, tiempoInicial: number) {
    this.escena = escena
    this.tiempoRestante = tiempoInicial
  }

  public iniciar(): void {
    if (this.tiempoRestante === 0) return // nivel sin límite de tiempo
    this.activo = true

    this.temporizadorPhaser = this.escena.time.addEvent({
      delay: 1000,
      repeat: this.tiempoRestante - 1,
      callback: this.tick,
      callbackScope: this,
    })
  }

  private tick(): void {
    this.tiempoRestante -= 1
    SistemaEventos.obtener().emit(EVENTOS.TIEMPO_ACTUALIZADO, {
      tiempo: this.tiempoRestante
    })

    if (this.tiempoRestante <= 0) {
      this.activo = false
      SistemaEventos.obtener().emit(EVENTOS.TIEMPO_AGOTADO)
    }
  }

  public detener(): void {
    this.temporizadorPhaser?.destroy()
    this.activo = false
  }

  public reiniciar(tiempoInicial: number): void {
    this.detener()
    this.tiempoRestante = tiempoInicial
    this.iniciar()
  }

  public obtenerTiempoRestante(): number {
    return this.tiempoRestante
  }
}
```

### Puntos por tiempo restante

Al completar el nivel, el tiempo restante se convierte en puntos bonus. Esto incentiva al jugador a terminar rápido:

```typescript
// En EscenaJuego al detectar NIVEL_COMPLETADO
const puntosBonus = temporizador.obtenerTiempoRestante() * JUEGO.PUNTOS_POR_SEGUNDO_RESTANTE
sistemaPuntuacion.sumarPuntos(puntosBonus)
```

---

## 8. SistemaGuardado

**Responsable:** Dev 1  
**Archivo:** `src/sistemas/SistemaGuardado.ts` — clase nueva

### Qué guarda

```typescript
// src/tipos/tipos-guardado.ts
export interface DatosGuardado {
  nivelesDesbloqueados: number[]    // índices de niveles disponibles
  nivelesCompletados:   number[]    // índices de niveles terminados
  puntuacionMaxima:     number      // mejor puntuación histórica
  monedasTotales:       number      // monedas acumuladas en toda la sesión
  configuracion: {
    volumenMusica:   number         // 0 a 1
    volumenEfectos:  number         // 0 a 1
  }
}
```

### Implementación

```typescript
// src/sistemas/SistemaGuardado.ts
import type { DatosGuardado } from '@tipos/tipos-guardado'

const CLAVE_STORAGE = 'juego-mario-empresa-datos'

const DATOS_INICIALES: DatosGuardado = {
  nivelesDesbloqueados: [0],  // nivel 0 desbloqueado por defecto
  nivelesCompletados:   [],
  puntuacionMaxima:     0,
  monedasTotales:       0,
  configuracion: {
    volumenMusica:  0.7,
    volumenEfectos: 1.0,
  }
}

export class SistemaGuardado {
  public static obtenerDatos(): DatosGuardado {
    try {
      const raw = localStorage.getItem(CLAVE_STORAGE)
      if (!raw) return { ...DATOS_INICIALES }
      return JSON.parse(raw) as DatosGuardado
    } catch {
      // Si el JSON está corrompido, resetear
      console.warn('SistemaGuardado: datos corrompidos, reseteando.')
      return { ...DATOS_INICIALES }
    }
  }

  private static guardar(datos: DatosGuardado): void {
    try {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(datos))
    } catch {
      console.error('SistemaGuardado: no se pudo guardar. LocalStorage lleno o bloqueado.')
    }
  }

  public static desbloquearNivel(indice: number): void {
    const datos = SistemaGuardado.obtenerDatos()
    if (!datos.nivelesDesbloqueados.includes(indice)) {
      datos.nivelesDesbloqueados.push(indice)
      SistemaGuardado.guardar(datos)
    }
  }

  public static marcarNivelCompletado(indice: number): void {
    const datos = SistemaGuardado.obtenerDatos()
    if (!datos.nivelesCompletados.includes(indice)) {
      datos.nivelesCompletados.push(indice)
      SistemaGuardado.guardar(datos)
    }
  }

  public static actualizarPuntuacionMaxima(puntos: number): void {
    const datos = SistemaGuardado.obtenerDatos()
    if (puntos > datos.puntuacionMaxima) {
      datos.puntuacionMaxima = puntos
      SistemaGuardado.guardar(datos)
    }
  }

  public static sumarMonedas(cantidad: number): void {
    const datos = SistemaGuardado.obtenerDatos()
    datos.monedasTotales += cantidad
    SistemaGuardado.guardar(datos)
  }

  public static guardarConfiguracion(config: DatosGuardado['configuracion']): void {
    const datos = SistemaGuardado.obtenerDatos()
    datos.configuracion = config
    SistemaGuardado.guardar(datos)
  }

  public static resetearProgreso(): void {
    // Para el botón "Nueva partida" — no borra configuración
    const datos = SistemaGuardado.obtenerDatos()
    const datosReseteados: DatosGuardado = {
      ...DATOS_INICIALES,
      configuracion: datos.configuracion, // conservar volumen y configuración
    }
    SistemaGuardado.guardar(datosReseteados)
  }
}
```

### Consideración importante — LocalStorage en Capacitor

`localStorage` funciona igual en Capacitor (Android/iOS) que en web porque Capacitor corre un WebView. No hay que cambiar nada de este código para móvil. Pero hay un límite de ~5MB por dominio. Para este juego está más que bien.

---

## 9. EscenaVictoria

**Responsable:** Dev 3  
**Archivo:** `src/escenas/EscenaVictoria.ts` — clase nueva

### Qué muestra

Pantalla que aparece al completar un nivel. Muestra el resumen de la partida y da opciones de continuar o ir al selector.

```
┌─────────────────────────────────┐
│       ¡NIVEL COMPLETADO!        │
│                                 │
│   Puntos:          8,450        │
│   Monedas:            23        │
│   Tiempo restante:   1:42       │
│   Bonus de tiempo:  +5,040      │
│   ─────────────────────────     │
│   Total:           13,490       │
│                                 │
│   [ SIGUIENTE NIVEL ]           │
│   [ SELECTOR DE NIVELES ]       │
└─────────────────────────────────┘
```

```typescript
// src/escenas/EscenaVictoria.ts
import Phaser from 'phaser'
import { ESCENAS } from '@constantes/constantes-escenas'
import { GestorNiveles } from '@niveles/GestorNiveles'
import { SistemaGuardado } from '@sistemas/SistemaGuardado'
import { JUEGO } from '@constantes/constantes-juego'
import type { DatosFinNivel } from '@tipos/tipos-nivel'

export class EscenaVictoria extends Phaser.Scene {
  private datos!: DatosFinNivel

  constructor() {
    super({ key: ESCENAS.VICTORIA })
  }

  init(datos: DatosFinNivel): void {
    this.datos = datos
  }

  create(): void {
    // Calcular bonus de tiempo y total
    const puntosBonus = this.datos.tiempoRestante * JUEGO.PUNTOS_POR_SEGUNDO_RESTANTE
    const puntosTotales = this.datos.puntos + puntosBonus

    // Guardar progreso
    GestorNiveles.completarNivel(this.datos.indiceNivel)
    SistemaGuardado.actualizarPuntuacionMaxima(puntosTotales)
    SistemaGuardado.sumarMonedas(this.datos.monedas)

    // Construir UI — arte placeholder, se reemplaza en Fase 4
    const { width, height } = this.scale
    const cx = width / 2

    this.add.text(cx, height * 0.2, '¡NIVEL COMPLETADO!', {
      fontSize: '36px', color: '#ffd700'
    }).setOrigin(0.5)

    this.mostrarResumen(cx, height, puntosBonus, puntosTotales)
    this.mostrarBotones(cx, height)
  }

  private mostrarResumen(
    cx: number,
    height: number,
    puntosBonus: number,
    puntosTotales: number
  ): void {
    const lineas = [
      `Puntos:             ${this.datos.puntos.toLocaleString()}`,
      `Monedas:            ${this.datos.monedas}`,
      `Tiempo restante:    ${this.formatearTiempo(this.datos.tiempoRestante)}`,
      `Bonus de tiempo:    +${puntosBonus.toLocaleString()}`,
      `─────────────────────────────`,
      `Total:              ${puntosTotales.toLocaleString()}`,
    ]

    lineas.forEach((linea, i) => {
      this.add.text(cx, height * 0.4 + i * 36, linea, {
        fontSize: '20px', color: '#ffffff', fontFamily: 'monospace'
      }).setOrigin(0.5)
    })
  }

  private mostrarBotones(cx: number, height: number): void {
    const siguienteConfig = GestorNiveles.obtenerSiguienteConfig(this.datos.indiceNivel)

    if (siguienteConfig) {
      // Hay un nivel siguiente
      const btnSiguiente = this.add.text(cx, height * 0.78, '[ SIGUIENTE NIVEL ]', {
        fontSize: '24px', color: '#4ade80'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })

      btnSiguiente.on('pointerdown', () => {
        this.scene.start(ESCENAS.JUEGO, { indiceNivel: this.datos.indiceNivel + 1 })
      })
    } else {
      // Era el último nivel
      this.add.text(cx, height * 0.75, '¡JUEGO COMPLETADO!', {
        fontSize: '28px', color: '#ffd700'
      }).setOrigin(0.5)
    }

    const btnSelector = this.add.text(cx, height * 0.88, '[ SELECTOR DE NIVELES ]', {
      fontSize: '20px', color: '#94a3b8'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    btnSelector.on('pointerdown', () => {
      this.scene.start(ESCENAS.NIVELES)
    })
  }

  private formatearTiempo(segundos: number): string {
    const min = Math.floor(segundos / 60)
    const seg = segundos % 60
    return `${min}:${seg.toString().padStart(2, '0')}`
  }
}
```

---

## 10. EscenaNiveles — selector

**Responsable:** Dev 3  
**Archivo:** `src/escenas/EscenaNiveles.ts` — clase nueva

### Qué muestra

Una tarjeta por nivel con su nombre, estado (bloqueado / disponible / completado) y puntuación máxima si fue completado.

```typescript
export class EscenaNiveles extends Phaser.Scene {
  constructor() {
    super({ key: ESCENAS.NIVELES })
  }

  create(): void {
    const { width, height } = this.scale
    const niveles = GestorNiveles.obtenerTodos()

    this.add.text(width / 2, 60, 'SELECCIONAR NIVEL', {
      fontSize: '32px', color: '#ffffff'
    }).setOrigin(0.5)

    // Crear una tarjeta por nivel
    niveles.forEach((config, i) => {
      this.crearTarjetaNivel(config, i, width, height)
    })

    // Botón volver
    const btnVolver = this.add.text(width / 2, height - 50, '← VOLVER AL MENÚ', {
      fontSize: '18px', color: '#94a3b8'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    btnVolver.on('pointerdown', () => this.scene.start(ESCENAS.MENU))
  }

  private crearTarjetaNivel(
    config: ConfigNivel,
    indice: number,
    width: number,
    height: number
  ): void {
    const desbloqueado = GestorNiveles.estaDesbloqueado(indice)
    const completado   = GestorNiveles.estaCompletado(indice)

    // Posición de la tarjeta
    const x = width / 2
    const y = 180 + indice * 130

    // Color según estado
    const colorFondo  = completado ? 0x166534 : desbloqueado ? 0x1e3a5f : 0x374151
    const colorTexto  = desbloqueado ? '#ffffff' : '#6b7280'

    // Fondo de la tarjeta
    this.add.rectangle(x, y, 500, 100, colorFondo)
      .setStrokeStyle(2, desbloqueado ? 0x4ade80 : 0x4b5563)

    // Nombre del nivel
    this.add.text(x, y - 18, config.nombreDisplay, {
      fontSize: '22px', color: colorTexto
    }).setOrigin(0.5)

    // Estado
    const etiqueta = completado ? '✅ Completado' : desbloqueado ? '▶ Jugar' : '🔒 Bloqueado'
    this.add.text(x, y + 18, etiqueta, {
      fontSize: '16px', color: colorTexto
    }).setOrigin(0.5)

    // Hacer clickeable solo si está desbloqueado
    if (desbloqueado) {
      this.add.rectangle(x, y, 500, 100, 0x000000, 0)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.scene.start(ESCENAS.JUEGO, { indiceNivel: indice })
        })
        .on('pointerover', () => {
          // Efecto hover — escalar ligeramente
        })
    }
  }
}
```

---

## 11. EscenaMenu — actualizar

**Responsable:** Dev 3  
**Archivo:** `src/escenas/EscenaMenu.ts` — modificar existente

Agregar el botón "Continuar" si hay progreso guardado, y conectar el botón "Jugar" al selector de niveles en vez de ir directo al juego:

```typescript
create(): void {
  const datos = SistemaGuardado.obtenerDatos()
  const hayProgreso = datos.nivelesCompletados.length > 0

  // Botón principal
  const textoBtnJugar = hayProgreso ? 'CONTINUAR' : 'JUGAR'
  const btnJugar = this.add.text(...)
  btnJugar.on('pointerdown', () => {
    if (hayProgreso) {
      // Ir al selector para que el jugador elija desde dónde continuar
      this.scene.start(ESCENAS.NIVELES)
    } else {
      // Primera vez — ir directo al nivel 1
      this.scene.start(ESCENAS.JUEGO, { indiceNivel: 0 })
    }
  })

  // Botón Nueva Partida solo si hay progreso guardado
  if (hayProgreso) {
    const btnNueva = this.add.text(...)
    btnNueva.on('pointerdown', () => {
      SistemaGuardado.resetearProgreso()
      this.scene.start(ESCENAS.JUEGO, { indiceNivel: 0 })
    })
  }

  // Puntuación máxima histórica
  if (datos.puntuacionMaxima > 0) {
    this.add.text(..., `Mejor puntuación: ${datos.puntuacionMaxima.toLocaleString()}`)
  }
}
```

---

## 12. Actualizar EscenaJuego

**Responsable:** Dev 3 (con inputs de Dev 1)  
**Archivo:** `src/escenas/EscenaJuego.ts`

### Recibir el índice de nivel como parámetro

```typescript
private indiceNivel: number = 0
private configNivel!: ConfigNivel

// init() se llama antes de create() y recibe los datos pasados con scene.start()
init(datos: { indiceNivel: number }): void {
  this.indiceNivel = datos.indiceNivel ?? 0
  this.configNivel = GestorNiveles.obtenerConfig(this.indiceNivel)
}
```

### Usar configNivel para cargar el mapa correcto

```typescript
create(): void {
  const mapa = this.make.tilemap({ key: this.configNivel.nombreMapa })
  // ... resto igual que antes pero usando this.configNivel
}
```

### Escuchar eventos de esta fase

```typescript
private escucharEventosDeJuego(): void {
  const bus = SistemaEventos.obtener()

  // Ya existían:
  bus.on(EVENTOS.JUGADOR_SIN_VIDAS, () => {
    this.scene.start(ESCENAS.GAME_OVER, { puntos: this.sistemaPuntuacion.obtenerPuntos() })
  })

  // Nuevos de esta fase:
  bus.on(EVENTOS.NIVEL_COMPLETADO, (datos: DatosFinNivel) => {
    this.temporizador.detener()
    this.scene.start(ESCENAS.VICTORIA, datos)
  })

  bus.on(EVENTOS.TIEMPO_AGOTADO, () => {
    this.jugador.recibirDano()
    if (this.jugador.tieneVidas()) {
      this.temporizador.reiniciar(this.configNivel.tiempoLimite)
    }
  })

  bus.on(EVENTOS.CHECKPOINT_ACTIVADO, (pos: { x: number, y: number }) => {
    this.jugador.actualizarSpawn(pos.x, pos.y)
  })
}
```

### Limpiar listeners al destruir la escena

Este es el punto más importante de toda la fase para evitar memory leaks. Cada vez que `EscenaJuego` se destruye (al cambiar de escena), los listeners del `SistemaEventos` deben limpiarse:

```typescript
// En EscenaJuego.ts — agregar este método
shutdown(): void {
  const bus = SistemaEventos.obtener()
  bus.off(EVENTOS.JUGADOR_SIN_VIDAS)
  bus.off(EVENTOS.NIVEL_COMPLETADO)
  bus.off(EVENTOS.TIEMPO_AGOTADO)
  bus.off(EVENTOS.CHECKPOINT_ACTIVADO)
  this.temporizador?.detener()
}
```

> ⚠️ **Crítico:** Si no se limpian los listeners en `shutdown()`, cada vez que la escena se recrea (al morir y reintentar) se acumulan listeners duplicados. El resultado es que los eventos se disparan 2, 4, 8 veces en cada reinicio sucesivo. Es uno de los bugs más difíciles de diagnosticar en Phaser.

---

## 13. Actualizar SistemaPuntuacion

**Responsable:** Dev 1  
**Archivo:** `src/sistemas/SistemaPuntuacion.ts`

Agregar el método `resetear()` para que los puntos vuelvan a 0 al iniciar un nivel nuevo:

```typescript
public resetear(): void {
  this.puntos = 0
  this.monedas = 0
}
```

Y llamarlo desde `EscenaJuego.init()` para asegurar que cada nivel empieza desde cero:

```typescript
init(datos: { indiceNivel: number }): void {
  this.indiceNivel = datos.indiceNivel ?? 0
  this.configNivel = GestorNiveles.obtenerConfig(this.indiceNivel)
  // Los puntos se resetean en init(), no en create(), para que ocurra antes de que nada se renderice
}
```

---

## 14. Nuevos eventos en SistemaEventos

**Responsable:** Dev 1  
**Archivo:** `src/sistemas/SistemaEventos.ts` — agregar al objeto `EVENTOS` existente

```typescript
// Agregar a EVENTOS:
NIVEL_COMPLETADO:      'nivel:completado',
CHECKPOINT_ACTIVADO:   'checkpoint:activado',
TIEMPO_ACTUALIZADO:    'tiempo:actualizado',
TIEMPO_AGOTADO:        'tiempo:agotado',
NIVEL_DESBLOQUEADO:    'nivel:desbloqueado',
```

---

## 15. Nuevas constantes

### Actualizar `src/constantes/constantes-juego.ts`

```typescript
export const JUEGO = {
  // ... existentes ...
  PUNTOS_POR_SEGUNDO_RESTANTE: 50,   // bonus por tiempo al completar nivel
  TIEMPO_NIVEL_1: 300,               // 5 minutos
  TIEMPO_NIVEL_2: 250,
  TIEMPO_NIVEL_3: 200,
} as const
```

### Actualizar `src/constantes/constantes-assets.ts`

```typescript
export const ASSETS = {
  // ... existentes ...
  BANDERA_SPRITE:          'bandera-sprite',
  CHECKPOINT_SPRITE:       'checkpoint-sprite',
  CHECKPOINT_ACTIVO_SPRITE: 'checkpoint-activo-sprite',
  MAPA_NIVEL_02:           'mapa-nivel-02',
  MAPA_NIVEL_03:           'mapa-nivel-03',
  MUSICA_NIVEL_01:         'musica-nivel-01',
  MUSICA_NIVEL_02:         'musica-nivel-02',
  MUSICA_NIVEL_03:         'musica-nivel-03',
} as const
```

### Actualizar `src/constantes/constantes-escenas.ts`

```typescript
export const ESCENAS = {
  // ... existentes ...
  NIVELES:  'EscenaNiveles',
  VICTORIA: 'EscenaVictoria',
} as const
```

---

## 16. Nuevos tipos

### Actualizar `src/tipos/tipos-nivel.ts`

```typescript
export interface DatosFinNivel {
  indiceNivel:     number
  puntos:          number
  monedas:         number
  tiempoRestante:  number
}

export interface ConfigNivel {
  clave:            string
  nombreMapa:       string
  rutaMapa:         string
  nombreTileset:    string
  rutaTileset:      string
  nombreMusica:     string
  tiempoLimite:     number
  indice:           number
  nombreDisplay:    string
}
```

---

## 17. Checklist de verificación

### Niveles y mapas
- [ ] Los 3 niveles existen como archivos `.json` en `assets/tilemaps/`
- [ ] Cada nivel tiene las 6 capas requeridas con nombres exactos
- [ ] Cada nivel tiene los objetos `spawn-jugador` y `zona-meta` en la capa `spawns`
- [ ] Los 3 niveles tienen al menos un `checkpoint-1`
- [ ] La dificultad sube progresivamente entre niveles

### Progresión y guardado
- [ ] Al completar Nivel 1 se desbloquea el Nivel 2
- [ ] Al completar Nivel 2 se desbloquea el Nivel 3
- [ ] El progreso persiste al recargar el navegador (F5)
- [ ] `SistemaGuardado.resetearProgreso()` vuelve al estado inicial
- [ ] La puntuación máxima se actualiza solo si se supera la anterior

### Flujo completo
- [ ] Menú → Nivel 1 → Victoria → Nivel 2 → Victoria → Nivel 3 → Victoria final
- [ ] Menú → Selector → Nivel 2 (si está desbloqueado) → funciona
- [ ] Morir en Nivel 2 → GameOver → Reintentar → vuelve al inicio del Nivel 2 (no al 1)
- [ ] El temporizador se detiene al morir y al completar el nivel
- [ ] Al agotar el tiempo el jugador pierde una vida y el temporizador se reinicia
- [ ] Los puntos se resetean a 0 al iniciar cada nivel
- [ ] El bonus de tiempo se calcula y suma correctamente en EscenaVictoria

### Checkpoints
- [ ] Activar un checkpoint cambia su apariencia visual
- [ ] Morir después de activar un checkpoint respawnea en ese punto
- [ ] Los checkpoints NO se guardan en LocalStorage

### Memory leaks
- [ ] Jugar Nivel 1 → morir 3 veces → reintentar → los eventos no se disparan múltiples veces
- [ ] `npm run build` pasa sin errores
- [ ] `npm run preview` funciona igual que `npm run dev`

---

## 18. Errores comunes de esta fase

### Los eventos se disparan 2, 4, 8 veces en reinicios sucesivos

**Causa:** Los listeners del `SistemaEventos` no se limpian en `shutdown()`.
**Solución:** Implementar `shutdown()` en `EscenaJuego` y llamar `bus.off()` para cada evento registrado.

### El nivel 2 no carga aunque está desbloqueado

**Causa:** Los assets del nivel 2 (mapa, tileset, música) no están en `EscenaCarga.preload()`.
**Solución:** `EscenaCarga` debe precargar los assets de todos los niveles, no solo del nivel 1.

### Los puntos del nivel anterior aparecen en el nivel nuevo

**Causa:** `SistemaPuntuacion.resetear()` no se llama al iniciar el nivel.
**Solución:** Llamarlo en `EscenaJuego.init()`, no en `create()`.

### El selector muestra todos los niveles desbloqueados aunque no se han completado

**Causa:** `SistemaGuardado.obtenerDatos()` retorna `DATOS_INICIALES` en vez de los datos guardados.
**Solución:** Verificar que `localStorage.getItem(CLAVE_STORAGE)` retorna el string correcto. Revisar que la `CLAVE_STORAGE` es consistente entre escrituras y lecturas.

### La EscenaVictoria guarda el progreso cada vez que se entra

**Causa:** `GestorNiveles.completarNivel()` se llama en `create()` que puede ejecutarse más de una vez si la escena se recrea.
**Solución:** Usar un flag `private yaGuardado = false` en `EscenaVictoria` para garantizar que el guardado ocurre exactamente una vez.
