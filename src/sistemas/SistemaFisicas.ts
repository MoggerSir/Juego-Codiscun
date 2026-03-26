import Phaser from 'phaser';
import { FISICA } from '@constantes/constantes-fisica';

export class SistemaFisicas {
  public static configurarMundo(
    escena: Phaser.Scene,
    anchoMundo: number,
    altoMundo: number
  ): void {
    escena.physics.world.setBounds(0, 0, anchoMundo, altoMundo);
    escena.physics.world.gravity.y = FISICA.GRAVEDAD;
  }

  public static aplicarKnockback(
    sprite: Phaser.Physics.Arcade.Sprite,
    direccion: 'izquierda' | 'derecha'
  ): void {
    const fuerza = direccion === 'izquierda' ? -FISICA.FUERZA_KNOCKBACK : FISICA.FUERZA_KNOCKBACK;
    sprite.setVelocityX(fuerza);
    sprite.setVelocityY(FISICA.FUERZA_SALTO * 0.5);
  }
}
