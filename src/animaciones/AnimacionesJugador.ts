import Phaser from "phaser";
import { ASSETS } from "@constantes/constantes-assets";

export class AnimacionesJugador {
  public static crear(escena: Phaser.Scene): void {
    escena.anims.create({
      key: "jugador-idle",
      frames: escena.anims.generateFrameNumbers(ASSETS.JUGADOR_SPRITE, {
        start: 0,
        end: 0,
      }),
      frameRate: 10,
      repeat: -1,
    });

    escena.anims.create({
      key: "jugador-correr",
      frames: escena.anims.generateFrameNumbers(ASSETS.JUGADOR_SPRITE, {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    escena.anims.create({
      key: "jugador-saltar",
      frames: escena.anims.generateFrameNumbers(ASSETS.JUGADOR_SPRITE, {
        start: 4,
        end: 4,
      }),
      frameRate: 10,
      repeat: 0,
    });
  }
}
