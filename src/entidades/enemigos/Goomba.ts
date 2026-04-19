import { EnemigoBase } from "./EnemigoBase";
import { FISICA } from "@constantes/constantes-fisica";
import { ASSETS } from "@constantes/constantes-assets";
import { JUEGO } from "@constantes/constantes-juego";

/**
 * Enemigo básico que patrulla en línea recta y muere al ser pisado.
 */
export class Goomba extends EnemigoBase {
  protected velocidad = FISICA.VELOCIDAD_ENEMIGO;
  protected claveAnimacion = "goomba";

  constructor(
    escena: Phaser.Scene,
    x: number,
    y: number,
    capaPlataformas: Phaser.Tilemaps.TilemapLayer,
  ) {
    // Usamos el asset definido en las constantes
    super(escena, x, y, ASSETS.GOOMBA_SPRITE, capaPlataformas);

    // Ajuste de hitbox para el Goomba (sprite 44x44, hitbox reducido en altura para tocar el piso)
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(35, 20);
    body.setOffset(4, 20);
  }

  /**
   * Lógica específica cuando el jugador pisa al Goomba.
   */
  public alSerPisado(): void {
    // Evitar múltiples llamadas si ya está muriendo
    if (this.getData("muerto")) return;
    this.setData("muerto", true);

    // Detener movimiento
    this.setVelocity(0, 0);

    // Sumar puntos a través del sistema global de eventos
    import("@sistemas/SistemaEventos").then((mod) => {
      const bus = mod.SistemaEventos.obtener();
      bus.emit(mod.EVENTOS.PUNTUACION_SUMAR, { puntos: JUEGO.PUNTOS_GOOMBA });
      bus.emit(mod.EVENTOS.PUNTOS_FLOTANTES, {
        x: this.x,
        y: this.y,
        puntos: JUEGO.PUNTOS_GOOMBA,
      });
    });

    // Ejecutar la secuencia de muerte (animación y destrucción)
    this.morir();
  }
}
