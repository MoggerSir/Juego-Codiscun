import Phaser from "phaser";
import { ASSETS } from "@constantes/constantes-assets";
import { EVENTOS, SistemaEventos } from "@sistemas/SistemaEventos";
import type { Jugador } from "@entidades/jugador/Jugador";
import { JUEGO } from "@constantes/constantes-juego";

export class BloqueLadrillo extends Phaser.Physics.Arcade.Image {
  constructor(escena: Phaser.Scene, x: number, y: number) {
    super(escena, x, y, ASSETS.BLOQUE_LADRILLO);
    
    // Como es inamovible, usamos Arcada Physics en modo estático
    escena.add.existing(this);
    escena.physics.add.existing(this, true); 
  }

  public alSerGolpeado(jugador: Jugador): void {
    // Si Mario es grande, destruye el bloque
    if (jugador.estado === 'grande') {
      this.romper();
    } else {
      // Si es pequeño, solo tiembla
      this.temblar();
    }
  }

  private romper(): void {
    // Feedback sonoro inmediato (Play Safe)
    if (this.scene.cache.audio.exists(ASSETS.SFX_ROMPER_BLOQUE)) {
      this.scene.sound.play(ASSETS.SFX_ROMPER_BLOQUE, { volume: 0.8 });
    }

    // TODO: Emitir partículas aquí en el futuro a través de SistemaParticulas
    SistemaEventos.obtener().emit(EVENTOS.PUNTUACION_SUMAR, { puntos: JUEGO.PUNTOS_BLOQUE });
    
    this.destroy();
  }

  private temblar(): void {
    // Previene múltiples temblores
    if (this.scene.tweens.isTweening(this)) return;

    const originalY = this.y;
    this.scene.tweens.add({
      targets: this,
      y: originalY - 8,
      yoyo: true,
      duration: 80,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        // Actualizamos el body estático para mantener sincronía física
        (this.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
      }
    });
  }
}
