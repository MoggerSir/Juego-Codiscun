import Phaser from "phaser";
import { FISICA } from "@constantes/constantes-fisica";
import type { Jugador } from "@entidades/jugador/Jugador";

export abstract class PowerUp extends Phaser.Physics.Arcade.Sprite {
  constructor(escena: Phaser.Scene, x: number, y: number, textura: string) {
    super(escena, x, y, textura);
    
    escena.add.existing(this);
    escena.physics.add.existing(this);
    
    // Configurar cuerpo físico genérico para PowerUps
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setGravityY(FISICA.GRAVEDAD);
    body.setBounce(0);
    body.setCollideWorldBounds(true);
  }

  /**
   * Método que se llamará al hacer overlap con el jugador.
   */
  public abstract alSerRecogido(jugador: Jugador): void;

  /**
   * Los power-ups como el Hongo empiezan a moverse automáticamente.
   */
  public iniciarMovimiento(direccion: 1 | -1 = 1): void {
    if (!this.active || !this.body) return;
    this.setVelocityX(FISICA.VELOCIDAD_POWERUP * direccion);
  }
}
