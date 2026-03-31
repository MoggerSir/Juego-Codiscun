import Phaser from "phaser";
import { ASSETS } from "@constantes/constantes-assets";
import { EVENTOS, SistemaEventos } from "@sistemas/SistemaEventos";
import { Hongo } from "./Hongo";
import { JUEGO } from "@constantes/constantes-juego";

export class BloqueInterrogacion extends Phaser.Physics.Arcade.Image {
  private activo: boolean = true;

  constructor(escena: Phaser.Scene, x: number, y: number) {
    super(escena, x, y, ASSETS.BLOQUE_PREGUNTA);
    
    // Cuerpo estático
    escena.add.existing(this);
    escena.physics.add.existing(this, true);
  }

  public alSerGolpeado(): void {
    if (!this.activo) return;
    this.activo = false;

    // Feedback sonoro inmediato (Play Safe)
    if (this.scene.cache.audio.exists(ASSETS.SFX_ROMPER_BLOQUE)) {
      this.scene.sound.play(ASSETS.SFX_ROMPER_BLOQUE, { volume: 0.4, detune: 500 });
    }

    // Cambiar visualmente a bloque vacío (desactivado)
    this.setTexture(ASSETS.BLOQUE_VACIO);

    // Sumar puntos
    SistemaEventos.obtener().emit(EVENTOS.PUNTUACION_SUMAR, { puntos: JUEGO.PUNTOS_BLOQUE });

    // Animación de temblor
    if (this.scene.tweens.isTweening(this)) return;

    const originalY = this.y;
    this.scene.tweens.add({
      targets: this,
      y: originalY - 10,
      yoyo: true,
      duration: 100,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        (this.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
      },
      onComplete: () => {
        this.soltarItem();
      }
    });
  }

  private soltarItem(): void {
    // Por defecto, soltamos un Hongo
    const hongo = new Hongo(this.scene, this.x, this.y - 16);
    
    // Emitir evento para que la escena pueda añadir este hongo al grupo de físicas (importante para gravedad y colisiones)
    SistemaEventos.obtener().emit(EVENTOS.ITEM_RECOGIDO, { item: hongo });
  }
}
