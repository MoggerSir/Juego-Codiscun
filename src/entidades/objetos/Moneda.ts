import Phaser from "phaser";
import { ASSETS } from "@constantes/constantes-assets";
import { EVENTOS, SistemaEventos } from "@sistemas/SistemaEventos";
import { JUEGO } from "@constantes/constantes-juego";

export class Moneda extends Phaser.Physics.Arcade.Sprite {
  constructor(escena: Phaser.Scene, x: number, y: number) {
    super(escena, x, y, ASSETS.MONEDA_SPRITE);

    escena.add.existing(this);
    escena.physics.add.existing(this);

    // Las monedas flotan y no se ven afectadas por gravedad
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);

    this.anims.play(`${ASSETS.MONEDA_SPRITE}-anim`, true);
  }

  public alSerRecogida(): void {
    if (!this.active) return;

    // Feedback sonoro inmediato
    this.scene.sound.play(ASSETS.SFX_MONEDA, { volume: 0.6 });

    this.setActive(false);
    
    // Desactivar físicas para no recogerla múltiples veces
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;

    // Emitir eventos para la UI y el SistemaPuntuacion
    const bus = SistemaEventos.obtener();
    bus.emit(EVENTOS.MONEDA_RECOGIDA);
    bus.emit(EVENTOS.PUNTUACION_SUMAR, { puntos: JUEGO.PUNTOS_MONEDA });
    bus.emit(EVENTOS.PUNTOS_FLOTANTES, { x: this.x, y: this.y, puntos: JUEGO.PUNTOS_MONEDA });

    // Tween visual de recolección
    this.scene.tweens.add({
      targets: this,
      y: this.y - 40,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      }
    });
  }
}
