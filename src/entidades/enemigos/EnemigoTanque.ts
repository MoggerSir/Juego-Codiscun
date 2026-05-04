import { EnemigoBase } from "./EnemigoBase";
import { FISICA } from "@constantes/constantes-fisica";
import { ASSETS } from "@constantes/constantes-assets";

/**
 * Enemigo acorazado que requiere ser pisado dos veces para morir.
 */
export class EnemigoTanque extends EnemigoBase {
  protected velocidad = FISICA.VELOCIDAD_ENEMIGO * 0.8; // Más lento
  protected claveAnimacion = "tanque";
  protected sfxMuerte = ASSETS.SFX_MUERTE_TANQUE;
  private vidasRestantes = 2; // Soporta 2 golpes

  constructor(
    escena: Phaser.Scene,
    x: number,
    y: number,
    capaPlataformas: Phaser.Tilemaps.TilemapLayer,
  ) {
    super(escena, x, y, ASSETS.TANQUE_SPRITE, capaPlataformas);

    // Frame 72×72; el arte del tanque ocupa la parte baja del celda — la hitbox debe ir abajo
    // (antes offsetY=7 dejaba el cuerpo arriba y los pies del sprite pasaban del suelo).
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(46, 36);
    body.setOffset(13, 36);
  }

  /**
   * El spritesheet del tanque viene mirando a la izquierda (al revés que goomba).
   */
  protected override patrullar(): void {
    super.patrullar();
    this.setFlipX(this.direccion === 1);
  }

  public alSerPisado(): void {
    if (this.getData("muerto")) return;

    this.vidasRestantes--;

    if (this.vidasRestantes > 0) {
      // Perdió su armadura pero sigue vivo.
      // Le quitamos el tinte oscuro y parpadea en rojo
      this.clearTint();
      this.setTintFill(0xff0000);

      this.scene.time.delayedCall(150, () => {
        if (!this.getData("muerto")) {
          this.clearTint();
        }
      });
      // Acelera por estar enfadado
      this.velocidad = FISICA.VELOCIDAD_ENEMIGO * 1.8;
      this.setVelocityX(this.velocidad * this.direccion);

      // Sumamos unos pocos puntos por el primer golpe
      import("@sistemas/SistemaEventos").then((mod) => {
        const bus = mod.SistemaEventos.obtener();
        bus.emit(mod.EVENTOS.PUNTUACION_SUMAR, { puntos: 50 });
        bus.emit(mod.EVENTOS.PUNTOS_FLOTANTES, { x: this.x, y: this.y, puntos: 50 });
      });
    } else {
      // Golpe fatal
      this.setData("muerto", true);
      this.setVelocity(0, 0);

      // Recompensa final (400 puntos totales por matar al tanque)
      import("@sistemas/SistemaEventos").then((mod) => {
        const bus = mod.SistemaEventos.obtener();
        bus.emit(mod.EVENTOS.PUNTUACION_SUMAR, { puntos: 300 });
        bus.emit(mod.EVENTOS.PUNTOS_FLOTANTES, { x: this.x, y: this.y, puntos: 300 });
      });

      this.morir();
    }
  }
}
