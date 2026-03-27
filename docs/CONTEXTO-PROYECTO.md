# CONTEXTO DEL PROYECTO — Juego tipo Mario Bros
### Documento para agente de IA — Referencia completa del proyecto

> Este documento contiene todo el contexto necesario para que se entienda el proyecto, su arquitectura, decisiones técnicas, convenciones y estado actual. Leer completo antes de generar cualquier código.

---

## 1. Descripción general del proyecto

**Nombre:** Juego tipo Mario Bros para empresa  
**Tipo:** Juego 2D plataformer web, con versión móvil futura  
**Plataformas objetivo:** Web (navegador) → Android APK → iOS App Store  
**Estado actual:** Fase 0 completada (setup y configuración base)

### ¿Qué es el juego?

Un juego de plataformas estilo Mario Bros desarrollado para uso empresarial. El jugador corre, salta, esquiva enemigos, recolecta monedas y completa niveles. Tiene menú principal, selector de niveles, sistema de vidas, puntuación y guardado de progreso.

### Equipo de desarrollo

- 3 desarrolladores trabajando en paralelo
- Nivel de experiencia: JavaScript, TypeScript, Node.js, HTML, CSS
- Sin experiencia previa en desarrollo de videojuegos

---

## 2. Stack tecnológico

| Capa                 | Tecnología                   | Versión | Por qué |

| Motor de juego       | **Phaser 3**                 | ^3.x    | Framework 2D más popular para web, soporte nativo TS |

| Lenguaje             | **TypeScript**               | ^5.x    | Tipado estático, el equipo ya lo conoce |

| Bundler              | **Vite**                     | ^5.x    | Build rápido, manejo de assets, genera dist/ para Capacitor |

| Móvil                | **Capacitor**                | ^6.x    | Convierte web app a APK/IPA sin reescribir código |

| Diseño de niveles    | **Tiled Map Editor**         | Desktop | Crea tilemaps .json compatibles con Phaser |

| Control de versiones | **GitHub**                   |   —     | Repositorio privado |

| Cliente Git          | **GitHub Desktop + VS Code** |   —     | Sin comandos de terminal |

### Comandos del proyecto

```bash
npm run dev      # Servidor de desarrollo en localhost:3000
npm run build    # Compilar TypeScript + generar dist/ con Vite
npm run preview  # Previsualizar el build de producción localmente
```

---

## 3. Estructura de archivos completa

```
juego-mario-empresa/
│
├── index.html                           # HTML base — contiene div#game-container
├── package.json
├── tsconfig.json
├── vite.config.ts
├── capacitor.config.ts
├── .gitignore
├── README.md
│
├── publico/                             # Assets estáticos sin procesar por Vite
│   ├── favicon/
│   └── fuentes/
│
├── src/
│   ├── main.ts                          # Punto de entrada — new Phaser.Game(configuracionJuego)
│   ├── configuracion-juego.ts           # GameConfig de Phaser (resolución, física, escenas)
│   │
│   ├── escenas/                         # Cada pantalla del juego es una escena de Phaser
│   │   ├── EscenaCarga.ts               # Preload de todos los assets
│   │   ├── EscenaMenu.ts                # Menú principal con branding de la empresa
│   │   ├── EscenaJuego.ts               # Escena principal de gameplay
│   │   ├── EscenaUI.ts                  # HUD superpuesto (vidas, monedas, tiempo, puntos)
│   │   ├── EscenaGameOver.ts            # Pantalla de game over
│   │   ├── EscenaVictoria.ts            # Pantalla de nivel completado
│   │   ├── EscenaPausa.ts               # Menú de pausa
│   │   └── EscenaNiveles.ts             # Selector de niveles con progreso
│   │
│   ├── entidades/                       # Objetos del juego con lógica propia
│   │   ├── jugador/
│   │   │   ├── Jugador.ts               # Clase principal — extiende Phaser.Physics.Arcade.Sprite
│   │   │   ├── EstadosJugador.ts        # Máquina de estados: idle | corriendo | saltando | muerto | grande
│   │   │   └── ControlJugador.ts        # Mapeo de inputs: teclado, touch, gamepad
│   │   ├── enemigos/
│   │   │   ├── EnemigoBase.ts           # Clase abstracta — patrullaje, detección de bordes, muerte
│   │   │   ├── Goomba.ts                # Extiende EnemigoBase
│   │   │   ├── Koopa.ts                 # Extiende EnemigoBase — tiene estado concha
│   │   │   └── EnemigoVolador.ts        # Extiende EnemigoBase — movimiento en Y
│   │   └── objetos/
│   │       ├── Moneda.ts                # Overlap con jugador → suma puntos
│   │       ├── BloqueLadrillo.ts        # Golpe desde abajo → se rompe
│   │       ├── BloqueInterrogacion.ts   # Golpe desde abajo → suelta item
│   │       ├── PowerUp.ts               # Clase base para power-ups
│   │       ├── Hongo.ts                 # Extiende PowerUp → jugador crece
│   │       └── Bandera.ts               # Meta del nivel → dispara EscenaVictoria
│   │
│   ├── niveles/
│   │   ├── NivelBase.ts                 # Clase abstracta — carga tilemap, crea grupos, spawns
│   │   ├── Nivel01.ts                   # Extiende NivelBase
│   │   ├── Nivel02.ts                   # Extiende NivelBase
│   │   └── GestorNiveles.ts             # Controla progresión, desbloqueo y orden de niveles
│   │
│   ├── sistemas/                        # Servicios singleton reutilizables entre escenas
│   │   ├── SistemaFisicas.ts            # Config y helpers de física Arcade
│   │   ├── SistemaColisiones.ts         # Registro centralizado de todas las colisiones
│   │   ├── SistemaAudio.ts              # Reproducción de música y efectos
│   │   ├── SistemaParticulas.ts         # Efectos visuales (monedas, explosiones, humo)
│   │   ├── SistemaGuardado.ts           # Persistencia con LocalStorage (progreso, puntos, monedas)
│   │   ├── SistemaPuntuacion.ts         # Lógica de score, combos y multiplicadores
│   │   └── SistemaEventos.ts            # Event bus global para comunicación entre escenas
│   │
│   ├── ui/
│   │   ├── BarraVidas.ts
│   │   ├── ContadorMonedas.ts
│   │   ├── TemporizadorNivel.ts
│   │   ├── MarcadorPuntos.ts
│   │   ├── BotonMovil.ts                # Controles táctiles para versión APK
│   │   └── PantallaTransicion.ts        # Fade/transición entre escenas
│   │
│   ├── animaciones/
│   │   ├── AnimacionesJugador.ts        # Define todos los atlas y frames del jugador
│   │   ├── AnimacionesEnemigos.ts
│   │   └── AnimacionesObjetos.ts
│   │
│   ├── constantes/
│   │   ├── constantes-fisica.ts         # FISICA.GRAVEDAD, FISICA.VELOCIDAD_JUGADOR, etc.
│   │   ├── constantes-escenas.ts        # ESCENAS.CARGA, ESCENAS.MENU, etc.
│   │   ├── constantes-assets.ts         # ASSETS.JUGADOR_SPRITE, ASSETS.MUSICA_NIVEL_1, etc.
│   │   └── constantes-juego.ts          # JUEGO.VIDAS_INICIALES, JUEGO.TIEMPO_POR_NIVEL, etc.
│   │
│   ├── tipos/
│   │   ├── tipos-jugador.ts             # Interfaces: EstadoJugador, DatosJugador
│   │   ├── tipos-nivel.ts               # Interfaces: ConfigNivel, DatosNivel
│   │   ├── tipos-guardado.ts            # Interface: DatosGuardado
│   │   └── tipos-eventos.ts             # Interfaces de eventos del SistemaEventos
│   │
│   └── utilidades/
│       ├── matematicas.ts               # lerp(), clamp(), aleatorio(), etc.
│       ├── depuracion.ts                # Logger condicional, debug overlay toggle
│       └── plataforma.ts                # Detecta si corre en web, Android o iOS
│
├── assets/
│   ├── sprites/
│   │   ├── jugador/                     # Spritesheets + atlas JSON del jugador
│   │   ├── enemigos/
│   │   └── objetos/
│   ├── tilemaps/                        # Archivos .json exportados de Tiled Map Editor
│   ├── tilesets/                        # Imágenes de tiles usadas por los tilemaps
│   ├── audio/
│   │   ├── musica/                      # .ogg + .mp3 (ambos formatos para compatibilidad)
│   │   └── efectos/
│   └── ui/                              # Botones, fondos de menú, iconos del HUD
│
├── android/                             # Generado por Capacitor — NO editar manualmente
├── ios/                                 # Generado por Capacitor — NO editar manualmente
└── dist/                                # Generado por Vite al correr npm run build
```

---

## 4. Configuraciones clave del proyecto

### tsconfig.json — Alias de paths

Los alias permiten imports absolutos. Siempre usar alias, nunca rutas relativas largas.

```typescript
// ✅ Correcto
import { Jugador } from '@entidades/jugador/Jugador'
import { ESCENAS } from '@constantes/constantes-escenas'

// ❌ Incorrecto — nunca usar esto
import { Jugador } from '../../../entidades/jugador/Jugador'
```

| Alias | Apunta a |
|---|---|
| `@escenas/*` | `src/escenas/*` |
| `@entidades/*` | `src/entidades/*` |
| `@sistemas/*` | `src/sistemas/*` |
| `@niveles/*` | `src/niveles/*` |
| `@ui/*` | `src/ui/*` |
| `@animaciones/*` | `src/animaciones/*` |
| `@constantes/*` | `src/constantes/*` |
| `@tipos/*` | `src/tipos/*` |
| `@utilidades/*` | `src/utilidades/*` |
| `@assets/*` | `assets/*` |

### Configuración de Phaser

- **Resolución:** 800x600
- **Física:** Arcade Physics (más rápida, ideal para plataformers)
- **Gravedad:** 600 (eje Y)
- **Escala:** `Phaser.Scale.FIT` — se adapta a cualquier pantalla
- **Renderer:** `Phaser.AUTO` — usa WebGL si está disponible, Canvas como fallback

---

## 5. Fases del proyecto

### Estado actual
- ✅ **Fase 0** — Setup completado

### Fases pendientes

| Fase | Descripción | Entregable |
|---|---|---|
| **Fase 1** | Prototipo jugable | Jugador se mueve, salta y colisiona en 1 nivel |
| **Fase 2** | Enemigos y objetos | Goomba, Koopa, monedas, bloques, power-ups |
| **Fase 3** | Niveles y progresión | Todos los niveles, selector, guardado |
| **Fase 4** | Arte, audio y UI | Assets finales, animaciones, sonido, branding |
| **Fase 5** | Optimización y QA web | 60fps estables, todos los navegadores, controles touch |
| **Fase 6** | Deploy web | URL pública en Vercel/Netlify |
| **Fase 7** | APK Android | Capacitor → Android Studio → .apk |
| **Fase 8** | App Store iOS | Capacitor → Xcode → .ipa |

---

## 6. Convenciones de código

### Nomenclatura de archivos

```
PascalCase  → Clases:        EscenaJuego.ts, Jugador.ts, EnemigoBase.ts
kebab-case  → Constantes:    constantes-fisica.ts, constantes-escenas.ts
kebab-case  → Configuración: configuracion-juego.ts, vite.config.ts
```

### Convenciones TypeScript

- **Siempre tipar** parámetros y retornos de funciones. Nunca dejar que TypeScript infiera tipos en firmas públicas.
- **Nunca usar `any`**. Usar `unknown` si el tipo no se conoce y luego narrowing.
- **Interfaces para datos**, `type` para uniones y aliases.
- **`as const`** para objetos de constantes.
- **Una clase por archivo**, siempre.

```typescript
// ✅ Correcto
function calcularPuntaje(monedas: number, tiempo: number): number {
  return monedas * 10 + tiempo * 5
}

// ❌ Incorrecto
function calcularPuntaje(monedas, tiempo) {
  return monedas * 10 + tiempo * 5
}
```

### Constantes — nunca strings o números mágicos

```typescript
// ✅ Correcto
this.scene.start(ESCENAS.MENU)
this.jugador.setVelocityY(FISICA.FUERZA_SALTO)

// ❌ Incorrecto
this.scene.start('EscenaMenu')
this.jugador.setVelocityY(-500)
```

### Mensajes de commit

```
feat:     Nueva funcionalidad
fix:      Corrección de bug
refactor: Limpieza de código sin cambio de comportamiento
style:    Cambios de formato
docs:     Documentación
chore:    Tareas de mantenimiento (actualizar dependencias, etc.)
```

### Nombres de ramas

```
feature/movimiento-jugador
fix/colision-goomba-movil
refactor/sistema-eventos
```

---

## 7. Arquitectura de escenas en Phaser

Phaser usa un sistema de escenas donde múltiples escenas pueden correr en paralelo. En este proyecto:

- `EscenaJuego` — corre el gameplay
- `EscenaUI` — corre sobre `EscenaJuego` mostrando el HUD
- `EscenaPausa` — se inicia encima de `EscenaJuego` pausándola

Para iniciar una escena encima de otra:
```typescript
this.scene.launch('EscenaUI')   // Inicia sin detener la actual
this.scene.start('EscenaMenu')  // Inicia y detiene la actual
this.scene.pause('EscenaJuego') // Pausa sin destruir
```

### Comunicación entre escenas

Usar `SistemaEventos.ts` como event bus. Las escenas no deben referenciarse directamente.

```typescript
// En EscenaJuego — emitir evento
SistemaEventos.emit('jugador:murio', { vidas: 2 })

// En EscenaUI — escuchar evento
SistemaEventos.on('jugador:murio', (datos) => {
  this.actualizarVidas(datos.vidas)
})
```

---

## 8. Convenciones de Phaser 3

### Ciclo de vida de una escena

```typescript
export class MiEscena extends Phaser.Scene {
  preload(): void {
    // Cargar assets (imágenes, audio, tilemaps)
    // Se ejecuta UNA vez al inicio
  }

  create(): void {
    // Crear objetos, grupos, colisiones, animaciones
    // Se ejecuta UNA vez después de preload
  }

  update(time: number, delta: number): void {
    // Lógica que corre CADA frame (60 veces por segundo)
    // Mantener lo más ligero posible
  }
}
```

### Grupos de física — siempre usar grupos, no sprites sueltos

```typescript
// ✅ Correcto — grupo estático para el tilemap
const plataformas = this.physics.add.staticGroup()

// ✅ Correcto — grupo dinámico para enemigos
const enemigos = this.physics.add.group({
  classType: Goomba,
  runChildUpdate: true  // Llama update() en cada hijo automáticamente
})

// ❌ Incorrecto para colecciones — sprite dinámico suelto
const enemigo1 = this.physics.add.sprite(100, 100, 'goomba')
```

### Assets — siempre usar claves de constantes

```typescript
// En EscenaCarga.ts
this.load.spritesheet(ASSETS.JUGADOR_SPRITE, 'assets/sprites/jugador/jugador.png', {
  frameWidth: 32,
  frameHeight: 48
})

// En EscenaJuego.ts
this.add.sprite(100, 100, ASSETS.JUGADOR_SPRITE)
```

---

## 9. Sistema de guardado

El `SistemaGuardado.ts` usa `localStorage` para la versión web. En móvil, Capacitor expone el mismo `localStorage` dentro del WebView, por lo que funciona sin cambios.

### Estructura de datos guardados

```typescript
interface DatosGuardado {
  nivelActual:      number
  nivelesDesbloqueados: number[]
  puntuacionMaxima: number
  monedasTotales:   number
  configuracion: {
    volumenMusica:  number  // 0 a 1
    volumenEfectos: number  // 0 a 1
  }
}
```

---

## 10. Consideraciones para móvil (Capacitor)

Aunque la versión móvil se desarrolla en fases posteriores, estas decisiones deben tomarse desde el inicio:

### Resolución y escala

La configuración `Phaser.Scale.FIT` en `configuracion-juego.ts` hace que el canvas se adapte automáticamente a cualquier pantalla sin código adicional.

### Controles táctiles

`BotonMovil.ts` implementa un D-pad virtual para móvil. `plataforma.ts` detecta si es touch device y activa estos controles automáticamente:

```typescript
// En ControlJugador.ts
if (plataforma.esTactil()) {
  this.activarControlesMovil()
} else {
  this.activarControlesToclado()
}
```

### Audio en móvil

Los navegadores móviles bloquean el audio hasta que el usuario interactúa con la pantalla. `SistemaAudio.ts` debe manejar esto:

```typescript
// Iniciar audio solo después de un tap del usuario
this.input.once('pointerdown', () => {
  this.sound.context.resume()
})
```

### Orientación

El juego debe correr en landscape. Configurar en `capacitor.config.ts` y en `index.html` con meta tag:
```html
<meta name="screen-orientation" content="landscape">
```

---

## 11. Reglas para el agente de IA

Al generar código para este proyecto, siempre seguir estas reglas:

1. **Usar TypeScript estricto** — tipar todos los parámetros y retornos
2. **Usar los alias de paths** — nunca rutas relativas largas
3. **Usar las constantes** — nunca strings o números mágicos
4. **Seguir la estructura de carpetas** — cada archivo en su lugar correspondiente
5. **Extender las clases base** — Jugador extiende `Phaser.Physics.Arcade.Sprite`, escenas extienden `Phaser.Scene`, etc.
6. **Usar el event bus** — las escenas se comunican por `SistemaEventos`, no por referencia directa
7. **Nombres en español** — todos los archivos, clases, variables y funciones en español (excepto métodos heredados de Phaser como `preload`, `create`, `update`)
8. **Una clase por archivo** — sin excepciones
9. **Comentar decisiones no obvias** — especialmente lógica de física y colisiones
10. **No usar `any`** — si el tipo es desconocido, usar `unknown` + type guard

### Ejemplo de código correcto para este proyecto

```typescript
import Phaser from 'phaser'
import { FISICA } from '@constantes/constantes-fisica'
import { ASSETS } from '@constantes/constantes-assets'
import type { EstadoJugador } from '@tipos/tipos-jugador'

export class Jugador extends Phaser.Physics.Arcade.Sprite {
  private estado: EstadoJugador = 'idle'
  private vidasRestantes: number = 3

  constructor(escena: Phaser.Scene, x: number, y: number) {
    super(escena, x, y, ASSETS.JUGADOR_SPRITE)
    escena.add.existing(this)
    escena.physics.add.existing(this)
  }

  public saltar(): void {
    if (this.body?.blocked.down) {
      this.setVelocityY(FISICA.FUERZA_SALTO)
      this.estado = 'saltando'
    }
  }

  public recibirDano(): void {
    this.vidasRestantes -= 1
    if (this.vidasRestantes <= 0) {
      this.morir()
    }
  }

  private morir(): void {
    this.estado = 'muerto'
    // La escena escucha este evento para mostrar game over
    this.scene.events.emit('jugador:murio')
  }

  update(): void {
    // La lógica de input se maneja en ControlJugador.ts
    // Este método solo actualiza el estado visual
  }
}
```
