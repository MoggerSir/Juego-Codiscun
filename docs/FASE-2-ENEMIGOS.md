# FASE 2 — Enemigos, Objetos e Interacciones

### Dirigido al equipo de desarrollo

---

> **Antes de empezar esta fase:** La Fase 1 debe estar 100% completa y el checklist de su sección 17 debe pasar entero. El salto debe sentirse bien. Si hay dudas sobre algún punto de la Fase 1, resolverlas antes de tocar esta fase. (ya deberia estar al 100% segun yop)

---

## ¿Qué construimos en esta fase?

Poblamos el mundo con cosas con las que el jugador puede interactuar. Al terminar esta fase el juego debe sentirse como un juego real: hay enemigos que matan, monedas que recoger, bloques que golpear y power-ups que cambian al personaje.

**Al terminar esta fase debe ser posible:**

- Morir al tocar un enemigo de lado
- Matar un enemigo saltando encima
- Recoger monedas
- Golpear bloques desde abajo y que suelten items
- Agarrar un hongo y que el personaje crezca
- Perder una vida y respawnear
- Ver game over al quedarse sin vidas

---

## Índice de tareas

1.  [Sistema de vidas y daño              ](#1-sistema-de-vidas-y-daño)
2.  [EnemigoBase                          ](#2-enemigobase)
3.  [Goomba                               ](#3-goomba)
4.  [Koopa                                ](#4-koopa)
5.  [Moneda                               ](#5-moneda)
6.  [BloqueLadrillo y BloqueInterrogacion ](#6-bloqueladrillo-y-bloqueinterrogacion)
7.  [PowerUp y Hongo                      ](#7-powerup-y-hongo)
8.  [SistemaPuntuacion                    ](#8-sistemapuntuacion)
9.  [SistemaColisiones — actualización    ](#9-sistemacolisiones--actualización)
10. [EscenaGameOver                       ](#10-escenagameover)
11. [Actualizar EscenaJuego               ](#11-actualizar-escenajuego)
12. [Actualizar el tilemap en Tiled       ](#12-actualizar-el-tilemap-en-tiled)
13. [Tipos nuevos                         ](#13-tipos-nuevos)
14. [Constantes nuevas                    ](#14-constantes-nuevas)
15. [Checklist de verificación            ](#15-checklist-de-verificación)

---

## 1. Sistema de vidas y daño

**Archivo:** `src/entidades/jugador/Jugador.ts` — ampliar la clase existente

### Qué implementar

El jugador debe tener un contador de vidas y un estado de invencibilidad temporal después de recibir daño. Sin el estado de invencibilidad, el jugador moriría múltiples veces en un solo contacto con un enemigo porque la colisión se detecta en múltiples frames seguidos.

### Lógica esperada

```
Jugador toca enemigo de lado
  → pierde 1 vida
  → entra en estado "invencible" por 2 segundos
  → durante esos 2 segundos parpadea visualmente
  → si vidas > 0: respawn en el último checkpoint
  → si vidas === 0: emitir evento "jugador:sinVidas" → EscenaGameOver
```

### Estado de invencibilidad

```typescript
// Dentro de Jugador.ts
private tiempoInvencible: number = 0
private readonly DURACION_INVENCIBLE: number = 2000 // ms

public recibirDano(): void {
  if (this.estaInvencible()) return  // ignorar daño durante invencibilidad

  this.vidas -= 1
  this.tiempoInvencible = this.DURACION_INVENCIBLE
  this.estado = 'invencible'

  if (this.vidas <= 0) {
    this.scene.events.emit('jugador:sinVidas')
  } else {
    this.scene.events.emit('jugador:recibioDano', { vidas: this.vidas })
    this.respawnear()
  }
}

public estaInvencible(): boolean {
  return this.tiempoInvencible > 0
}

// En update(), decrementar el temporizador con delta
public update(delta: number): void {
  if (this.tiempoInvencible > 0) {
    this.tiempoInvencible -= delta
    // Parpadeo visual — alternar visibilidad cada 100ms
    this.setAlpha(Math.floor(this.tiempoInvencible / 100) % 2 === 0 ? 0.3 : 1)
  } else {
    this.setAlpha(1)
  }
  this.estados.actualizar(this.control.obtenerInput())
}
```

### Respawn

El jugador debe volver al punto de spawn del nivel, no al inicio del mapa. Guardar las coordenadas del spawn al crear el jugador:

```typescript
private posicionSpawn: { x: number, y: number }

private respawnear(): void {
  this.setPosition(this.posicionSpawn.x, this.posicionSpawn.y)
  this.setVelocity(0, 0)
}
```

---

## 2. EnemigoBase

**Archivo:** `src/entidades/enemigos/EnemigoBase.ts` — clase nueva  
**Responsable sugerido:** Dev 2

### Qué es

Una clase abstracta que contiene la lógica común a todos los enemigos: patrullaje horizontal, detección de bordes, muerte al ser pisado y colisión con el mapa. Todos los enemigos concretos (Goomba, Koopa) extienden esta clase.

### Comportamiento base

```
Spawn en posición X
  → caminar en dirección inicial (izquierda por defecto)
  → al llegar al borde de una plataforma: girar
  → al chocar con una pared: girar
  → al ser pisado por el jugador: morir (animación + destruir)
  → al tocar al jugador de lado: llamar jugador.recibirDano()
```

### Detección de borde

La detección de borde es el punto más técnico de los enemigos. Se hace con un raycast hacia abajo desde el frente del enemigo:

```typescript
// Dentro del update() del enemigo
private detectarBorde(): boolean {
  const body = this.body as Phaser.Physics.Arcade.Body
  // Si el enemigo va hacia la derecha, revisar el borde derecho
  // Si va hacia la izquierda, revisar el borde izquierdo
  // Phaser.Physics.Arcade no tiene raycast nativo —
  // la forma estándar es revisar si el tile al frente y abajo existe
  const tileAlFrente = this.capaMapa.getTileAtWorldXY(
    this.x + (this.direccion * (this.width / 2 + 2)),
    this.y + this.height / 2 + 1
  )
  return tileAlFrente === null
}
```

> 💡 **Nota:** La referencia a `capaMapa` debe pasarse al constructor del enemigo desde `EscenaJuego`. El enemigo necesita saber qué capa revisar para detectar bordes.

### Muerte del enemigo

```typescript
public morir(): void {
  // Desactivar física para que no siga colisionando
  this.body?.destroy()
  // Reproducir animación de muerte
  this.anims.play(`${this.claveAnimacion}-muerte`, true)
  // Destruir el objeto al terminar la animación
  this.once('animationcomplete', () => this.destroy())
}
```

### Interfaz abstracta

```typescript
export abstract class EnemigoBase extends Phaser.Physics.Arcade.Sprite {
  protected direccion: 1 | -1 = -1  // 1 = derecha, -1 = izquierda
  protected capaMapa: Phaser.Tilemaps.TilemapLayer
  protected abstract velocidad: number
  protected abstract claveAnimacion: string

  // Cada enemigo concreto define su comportamiento al ser pisado
  public abstract alSerPisado(): void

  // Lógica común de patrullaje — todos la usan igual
  protected patrullar(): void { ... }
}
```

---

## 3. Goomba

**Archivo:** `src/entidades/enemigos/Goomba.ts` — clase nueva  
**Responsable sugerido:** Dev 2

### Comportamiento

El enemigo más simple. Camina en línea recta, gira en bordes y paredes, muere al ser pisado sin ningún comportamiento especial.

```
Al ser pisado → animación aplastado (1 frame) → desaparecer en 500ms
Al tocar jugador de lado → jugador.recibirDano()
```

```typescript
export class Goomba extends EnemigoBase {
  protected velocidad = FISICA.VELOCIDAD_ENEMIGO;
  protected claveAnimacion = "goomba";

  public alSerPisado(): void {
    // Sumar puntos
    this.scene.events.emit("puntuacion:sumar", { puntos: JUEGO.PUNTOS_GOOMBA });
    this.morir();
  }
}
```

---

## 4. Koopa

**Archivo:** `src/entidades/enemigos/Koopa.ts` — clase nueva  
**Responsable sugerido:** Dev 2

### Comportamiento

Más complejo que el Goomba. Al ser pisado no muere, se mete en su concha. La concha puede ser pateada por el jugador y se convierte en un proyectil que mata otros enemigos.

```
Estado "caminando":
  → mismo comportamiento que Goomba

Al ser pisado → estado "concha" (se detiene)

Estado "concha":
  → el jugador puede tocarla sin daño
  → si el jugador la toca mientras se mueve → la concha sale disparada
  → la concha en movimiento mata enemigos que toca
  → la concha en movimiento daña al jugador si la toca
  → si la concha llega a una pared → rebota
```

### Máquina de estados del Koopa

```typescript
type EstadoKoopa = "caminando" | "concha" | "concha-movimiento";
```

> ⚠️ **Importante:** La concha en movimiento debe registrarse como una colisión separada en `SistemaColisiones`. No es lo mismo que el Koopa caminando.

---

## 5. Moneda

**Archivo:** `src/entidades/objetos/Moneda.ts` — clase nueva  
**Responsable sugerido:** Dev 3

### Comportamiento

Objeto estático que al hacer overlap con el jugador desaparece con una animación y suma puntos y al contador de monedas.

```
Jugador hace overlap con moneda
  → animación de recolección (escalar + fade out)
  → emitir evento 'puntuacion:moneda'
  → destruir el objeto
```

```typescript
export class Moneda extends Phaser.Physics.Arcade.Sprite {
  constructor(escena: Phaser.Scene, x: number, y: number) {
    super(escena, x, y, ASSETS.MONEDA_SPRITE);
    escena.add.existing(this);
    escena.physics.add.existing(this, true); // true = cuerpo estático
  }

  public recolectar(): void {
    this.scene.events.emit("puntuacion:moneda");
    // Animación de recolección antes de destruir
    this.scene.tweens.add({
      targets: this,
      y: this.y - 30,
      alpha: 0,
      duration: 300,
      onComplete: () => this.destroy(),
    });
  }
}
```

### Spawneo desde Tiled

Las monedas no se hardcodean en el código. Se colocan en una capa de objetos en Tiled llamada `monedas` y se leen desde `EscenaJuego`:

```typescript
// En EscenaJuego.ts
const objetosMonedas = mapa.getObjectLayer("monedas")?.objects ?? [];
objetosMonedas.forEach((obj) => {
  this.grupoMonedas.add(new Moneda(this, obj.x!, obj.y!));
});
```

---

## 6. BloqueLadrillo y BloqueInterrogacion

**Archivos:**

- `src/entidades/objetos/BloqueLadrillo.ts`
- `src/entidades/objetos/BloqueInterrogacion.ts`

**Responsable sugerido:** Dev 3

### BloqueLadrillo

Al ser golpeado desde abajo por el jugador se rompe y desaparece. Solo se rompe si el jugador está en estado "grande" (con hongo). Si el jugador es pequeño, el bloque tiembla pero no se rompe.

```
Jugador (pequeño) golpea desde abajo → animación de temblor → nada más
Jugador (grande) golpea desde abajo  → animación de rotura → destruir
```

### BloqueInterrogacion

Al ser golpeado desde abajo suelta un item (hongo, moneda, etc.) y se convierte en un bloque vacío inactivo. Solo puede ser golpeado una vez.

```
Jugador golpea desde abajo (primera vez)
  → animación de golpe (saltar hacia arriba y volver)
  → spawnear item arriba del bloque
  → cambiar sprite a "bloque-vacio"
  → desactivar colisión de golpe (ya no responde)
```

### Detección del golpe desde abajo

La colisión estándar de Phaser no distingue desde qué dirección viene. Para detectar golpe desde abajo se revisa la velocidad Y del jugador y la posición relativa:

```typescript
// En SistemaColisiones.ts
public registrarJugadorConBloques(
  jugador: Jugador,
  grupoBloques: Phaser.Physics.Arcade.StaticGroup
): void {
  this.escena.physics.add.collider(jugador, grupoBloques, (j, b) => {
    const jugadorObj = j as Jugador
    const bloqueObj = b as BloqueLadrillo | BloqueInterrogacion

    // El jugador viene desde abajo si su velocidad Y era negativa (subiendo)
    // y el jugador está debajo del bloque
    const vieneDesdAbajo =
      jugadorObj.body!.velocity.y < 0 &&
      jugadorObj.y > bloqueObj.y

    if (vieneDesdAbajo) {
      bloqueObj.alSerGolpeado(jugadorObj)
    }
  })
}
```

---

## 7. PowerUp y Hongo

**Archivos:**

- `src/entidades/objetos/PowerUp.ts`
- `src/entidades/objetos/Hongo.ts`

**Responsable sugerido:** Dev 3

### PowerUp (clase base)

```typescript
export abstract class PowerUp extends Phaser.Physics.Arcade.Sprite {
  public abstract alSerRecogido(jugador: Jugador): void;

  // Movimiento estándar de power-ups: aparecen y se mueven solos
  protected iniciarMovimiento(): void {
    this.setVelocityX(FISICA.VELOCIDAD_POWERUP);
  }
}
```

### Hongo

Al ser recogido cambia el estado del jugador de `normal` a `grande`. Visualmente el jugador debe verse más grande (escalar el sprite).

```
Hongo aparece sobre el bloque
  → cae al suelo
  → camina hacia la derecha
  → al llegar a un borde: gira
  → jugador hace overlap con el hongo
  → jugador pasa a estado "grande"
  → hongo desaparece
```

```typescript
export class Hongo extends PowerUp {
  public alSerRecogido(jugador: Jugador): void {
    jugador.crecer();
    this.scene.events.emit("puntuacion:sumar", { puntos: JUEGO.PUNTOS_HONGO });
    this.destroy();
  }
}
```

### Estado "grande" en el jugador

Agregar a `Jugador.ts`:

```typescript
public crecer(): void {
  if (this.estado === 'grande') return  // ya es grande
  this.estado = 'grande'
  // Escalar el sprite y ajustar el hitbox
  this.setScale(1, 1.5)
  const body = this.body as Phaser.Physics.Arcade.Body
  body.setSize(24, 64)
  body.setOffset(4, 8)
}

public encoger(): void {
  this.estado = 'normal'
  this.setScale(1, 1)
  const body = this.body as Phaser.Physics.Arcade.Body
  body.setSize(24, 40)
  body.setOffset(4, 8)
}

// Modificar recibirDano() para que si es grande, encoja en vez de perder vida
public recibirDano(): void {
  if (this.estaInvencible()) return
  if (this.estado === 'grande') {
    this.encoger()
    this.tiempoInvencible = this.DURACION_INVENCIBLE
    return
  }
  // Si es pequeño, sí pierde vida
  this.vidas -= 1
  ...
}
```

---

## 8. SistemaPuntuacion

**Archivo:** `src/sistemas/SistemaPuntuacion.ts` — clase nueva  
**Responsable sugerido:** Dev 3

### Qué maneja

Escucha eventos del bus de eventos y acumula puntos, monedas y vidas. En esta fase no persiste datos (eso es Fase 3), solo los mantiene en memoria durante la sesión.

```typescript
export class SistemaPuntuacion {
  private puntos: number = 0;
  private monedas: number = 0;

  constructor(escena: Phaser.Scene) {
    // Escuchar eventos del juego
    escena.events.on("puntuacion:sumar", this.sumarPuntos, this);
    escena.events.on("puntuacion:moneda", this.sumarMoneda, this);
  }

  private sumarPuntos(datos: { puntos: number }): void {
    this.puntos += datos.puntos;
    // Emitir para que la UI lo muestre (se implementa en Fase 4)
  }

  private sumarMoneda(): void {
    this.monedas += 1;
    this.puntos += JUEGO.PUNTOS_MONEDA;
    // Cada 100 monedas = 1 vida extra
    if (this.monedas % 100 === 0) {
      // emitir evento de vida extra
    }
  }

  public obtenerPuntos(): number {
    return this.puntos;
  }
  public obtenerMonedas(): number {
    return this.monedas;
  }
}
```

---

## 9. SistemaColisiones — actualización

**Archivo:** `src/sistemas/SistemaColisiones.ts` — ampliar el existente  
**Responsable sugerido:** Dev que hizo Fase 1

Agregar estos métodos nuevos al sistema existente:

```typescript
// Jugador vs enemigos — colisión lateral daña al jugador
public registrarJugadorConEnemigos(
  jugador: Jugador,
  grupoEnemigos: Phaser.Physics.Arcade.Group
): void { ... }

// Jugador vs monedas — overlap las recolecta
public registrarJugadorConMonedas(
  jugador: Jugador,
  grupoMonedas: Phaser.Physics.Arcade.Group
): void { ... }

// Jugador vs power-ups — overlap los activa
public registrarJugadorConPowerUps(
  jugador: Jugador,
  grupoPowerUps: Phaser.Physics.Arcade.Group
): void { ... }

// Jugador vs bloques — detecta golpe desde abajo
public registrarJugadorConBloques(
  jugador: Jugador,
  grupoBloques: Phaser.Physics.Arcade.StaticGroup
): void { ... }

// Enemigos vs mapa — para que no caigan al vacío
public registrarEnemigosConMapa(
  grupoEnemigos: Phaser.Physics.Arcade.Group,
  capaTiles: Phaser.Tilemaps.TilemapLayer
): void { ... }

// Concha Koopa vs enemigos
public registrarConchaConEnemigos(
  concha: Koopa,
  grupoEnemigos: Phaser.Physics.Arcade.Group
): void { ... }
```

### Diferencia entre collider y overlap

```typescript
// collider → ambos objetos rebotan físicamente entre sí
this.physics.add.collider(jugador, enemigo, callback);

// overlap → se detecta la intersección pero no hay rebote físico
this.physics.add.overlap(jugador, moneda, callback);

// Regla general:
// collider → enemigos, paredes, suelo
// overlap  → monedas, power-ups, zona de meta
```

---

## 10. EscenaGameOver

**Archivo:** `src/escenas/EscenaGameOver.ts` — clase nueva  
**Responsable sugerido:** Dev 1

### Qué debe mostrar

Por ahora una pantalla simple: texto "GAME OVER", puntuación final y un botón o texto para volver a intentar. El arte final se pone en Fase 4.

```typescript
export class EscenaGameOver extends Phaser.Scene {
  constructor() {
    super({ key: ESCENAS.GAME_OVER });
  }

  // Recibe la puntuación como data al iniciarse
  init(data: { puntos: number }): void {
    this.puntosFinal = data.puntos;
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 3, "GAME OVER", {
        fontSize: "48px",
        color: "#ff4444",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2, `Puntos: ${this.puntosFinal}`, {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Reintentar al presionar cualquier tecla
    this.input.keyboard?.once("keydown", () => {
      this.scene.start(ESCENAS.JUEGO);
    });
  }
}
```

### Cómo se llega aquí

Desde `EscenaJuego`, escuchar el evento de sin vidas:

```typescript
// En EscenaJuego.ts — dentro de create()
this.events.on("jugador:sinVidas", () => {
  this.scene.start(ESCENAS.GAME_OVER, {
    puntos: this.sistemaPuntuacion.obtenerPuntos(),
  });
});
```

---

## 11. Actualizar EscenaJuego

**Archivo:** `src/escenas/EscenaJuego.ts` — ampliar el existente

Agregar al `create()` existente:

```typescript
// Grupos de física para cada tipo de entidad
private grupoEnemigos!:  Phaser.Physics.Arcade.Group
private grupoMonedas!:   Phaser.Physics.Arcade.Group
private grupoPowerUps!:  Phaser.Physics.Arcade.Group
private grupoBloques!:   Phaser.Physics.Arcade.StaticGroup
private sistemaPuntuacion!: SistemaPuntuacion

create(): void {
  // ... código existente de Fase 1 ...

  this.sistemaPuntuacion = new SistemaPuntuacion(this)
  this.crearGrupos()
  this.spawnearEntidadesDesdeMapaTiled()
  this.configurarColisionesCompletas()
  this.escucharEventosDeJuego()
}

private crearGrupos(): void {
  this.grupoEnemigos = this.physics.add.group({ runChildUpdate: true })
  this.grupoMonedas  = this.physics.add.group()
  this.grupoPowerUps = this.physics.add.group({ runChildUpdate: true })
  this.grupoBloques  = this.physics.add.staticGroup()
}
```

### Spawneo desde Tiled

Todas las entidades se colocan en Tiled en capas de objetos separadas. En `EscenaJuego` se leen y se instancian:

```typescript
private spawnearEntidadesDesdeMapaTiled(): void {
  // Enemigos
  this.mapa.getObjectLayer('enemigos')?.objects.forEach(obj => {
    const tipo = obj.type  // 'goomba' o 'koopa' definido en Tiled
    if (tipo === 'goomba') {
      this.grupoEnemigos.add(new Goomba(this, obj.x!, obj.y!, this.capaPlataformas))
    }
    if (tipo === 'koopa') {
      this.grupoEnemigos.add(new Koopa(this, obj.x!, obj.y!, this.capaPlataformas))
    }
  })

  // Monedas
  this.mapa.getObjectLayer('monedas')?.objects.forEach(obj => {
    this.grupoMonedas.add(new Moneda(this, obj.x!, obj.y!))
  })

  // Bloques
  this.mapa.getObjectLayer('bloques')?.objects.forEach(obj => {
    const tipo = obj.type
    if (tipo === 'ladrillo') {
      this.grupoBloques.add(new BloqueLadrillo(this, obj.x!, obj.y!))
    }
    if (tipo === 'interrogacion') {
      this.grupoBloques.add(new BloqueInterrogacion(this, obj.x!, obj.y!))
    }
  })
}
```

---

## 12. Actualizar el tilemap en Tiled

El dev encargado de niveles debe agregar estas capas de objetos al `nivel-01.json`:

| Capa       | Tipo         | Contenido                                            |
| ---------- | ------------ | ---------------------------------------------------- |
| `enemigos` | Object Layer | Objetos con `type: goomba` o `type: koopa`           |
| `monedas`  | Object Layer | Puntos de spawn de monedas                           |
| `bloques`  | Object Layer | Objetos con `type: ladrillo` o `type: interrogacion` |

### Distribución recomendada para el nivel 1

- 8-10 monedas distribuidas por el nivel, algunas en el aire para motivar el salto
- 3-4 Goombas en posiciones visibles para que el jugador aprenda a esquivarlos
- 1-2 Koopas más adelante en el nivel
- 4-5 bloques interrogación con hongos y monedas
- 3-4 bloques ladrillo para que el jugador "grande" pueda romper

---

## 13. Tipos nuevos

### Agregar a `src/tipos/tipos-jugador.ts`

```typescript
export type EstadoJugador =
  | "idle"
  | "corriendo"
  | "saltando"
  | "cayendo"
  | "muerto"
  | "invencible"
  | "normal" // tamaño normal
  | "grande"; // con hongo
```

### Crear `src/tipos/tipos-enemigo.ts`

```typescript
export type EstadoEnemigo = "caminando" | "muerto";

export type EstadoKoopa = "caminando" | "concha" | "concha-movimiento";

export interface DatosEnemigo {
  velocidad: number;
  puntos: number;
}
```

---

## 14. Constantes nuevas

### Actualizar `src/constantes/constantes-juego.ts`

```typescript
export const JUEGO = {
  VIDAS_INICIALES: 3,
  PUNTOS_GOOMBA: 100,
  PUNTOS_KOOPA: 200,
  PUNTOS_MONEDA: 50,
  PUNTOS_HONGO: 100,
  MONEDAS_VIDA_EXTRA: 100,
  DURACION_INVENCIBLE: 2000, // ms
} as const;
```

### Actualizar `src/constantes/constantes-assets.ts`

```typescript
export const ASSETS = {
  // ... existentes de Fase 1 ...

  // Enemigos
  GOOMBA_SPRITE: "goomba-sprite",
  KOOPA_SPRITE: "koopa-sprite",

  // Objetos
  MONEDA_SPRITE: "moneda-sprite",
  BLOQUE_LADRILLO: "bloque-ladrillo",
  BLOQUE_PREGUNTA: "bloque-pregunta",
  BLOQUE_VACIO: "bloque-vacio",
  HONGO_SPRITE: "hongo-sprite",
} as const;
```

### Actualizar `src/constantes/constantes-fisica.ts`

```typescript
export const FISICA = {
  // ... existentes de Fase 1 ...
  VELOCIDAD_POWERUP: 80,
  VELOCIDAD_CONCHA: 350,
} as const;
```

---

## 15. Checklist de verificación

### Jugador y daño

- [ ] El jugador pierde vida al tocar un enemigo de lado
- [ ] El jugador NO pierde vida mientras está en estado invencible
- [ ] El jugador parpadea durante la invencibilidad
- [ ] Al llegar a 0 vidas aparece la pantalla de Game Over
- [ ] Desde Game Over se puede volver a intentar

### Enemigos

- [ ] El Goomba camina solo en línea recta
- [ ] El Goomba gira al llegar al borde de una plataforma
- [ ] El Goomba gira al chocar con una pared
- [ ] El Goomba muere al ser pisado
- [ ] El Koopa se mete en su concha al ser pisado
- [ ] La concha del Koopa puede ser pateada
- [ ] La concha en movimiento mata otros enemigos
- [ ] Los enemigos colisionan con el mapa y no caen al vacío

### Objetos

- [ ] Las monedas desaparecen al ser tocadas
- [ ] El contador de monedas sube correctamente
- [ ] El bloque ladrillo tiembla si el jugador es pequeño
- [ ] El bloque ladrillo se rompe si el jugador es grande
- [ ] El bloque interrogación suelta un item al ser golpeado
- [ ] El bloque interrogación queda inactivo después del primer golpe
- [ ] El hongo cae, camina y gira en bordes
- [ ] El jugador crece al recoger el hongo
- [ ] El jugador grande encoge al recibir daño (no pierde vida)
- [ ] El jugador pequeño sí pierde vida al recibir daño

### Puntuación

- [ ] Los puntos suben al matar enemigos
- [ ] Los puntos suben al recoger monedas

---

## Notas finales para el equipo

**Coordinación:** Los enemigos y los objetos pueden desarrollarse en paralelo porque no dependen entre sí. El sistema de colisiones sí depende de que ambos estén listos. Sugerencia de reparto:

```
Dev 1 → Sistema de vidas, daño, invencibilidad en Jugador + EscenaGameOver
Dev 2 → EnemigoBase, Goomba, Koopa
Dev 3 → Moneda, Bloques, PowerUp, Hongo, SistemaPuntuacion
```

Al terminar los tres, un solo dev integra todo en `SistemaColisiones` y `EscenaJuego` y verifica el checklist completo.

**Comunicación entre clases:** Todo pasa por eventos. Ninguna clase debe tener referencia directa a otra clase que no sea la suya. Si el Goomba necesita decirle algo al sistema de puntuación, emite un evento. Si necesita decirle algo al jugador, emite un evento. Eso mantiene el código desacoplado y fácil de modificar.
