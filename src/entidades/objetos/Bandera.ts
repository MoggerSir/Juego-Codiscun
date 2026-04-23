import Phaser from "phaser";
import { EVENTOS, SistemaEventos } from "@sistemas/SistemaEventos";
import { ASSETS } from "@constantes/constantes-assets";
import { CONFIG_AUDIO } from "@constantes/config-audio";

/**
 * Entidad física Bandera.
 * Representa la zona de meta. Al ser tocada emite un pulso interno al Sistema
 * para validar la transición del nivel.
 */
export class Bandera extends Phaser.Physics.Arcade.Sprite {
  // Cortafuegos de prevención contra múltiples colisiones en frame overlap
  private activada: boolean = false;

  constructor(escena: Phaser.Scene, x: number, y: number) {
    super(escena, x, y, ASSETS.BANDERA_SPRITE);
    escena.add.existing(this);
    escena.physics.add.existing(this, true); // Estático inamovible
  }

  /**
   * Disparado visual por la Escena o el Manager cuando validan
   * que el jugador activó la bandera y el estado es seguro.
   */
  public animarBajada(onComplete: () => void): void {
    this.scene.tweens.add({
      targets: this,
      y: this.y + 150, // Arbitrario: bajar 150px
      duration: 1200,
      ease: "Power1",
      onComplete: onComplete,
    });
  }

  /**
   * Intenta activar el mecanismo. Retorna false si ya fue activado.
   * Evita llamadas parásitas.
   */
  public tocar(): boolean {
    if (this.activada) return false;

    this.activada = true;
    this.body!.enable = false; // Desactivar collider preventivamente

    // Reproducir sonido de victoria (Safe play)
    if (this.scene.cache.audio.exists(ASSETS.SFX_VICTORIA)) {
      console.log(`[AudioVictoria] Reproduciendo SFX: ${ASSETS.SFX_VICTORIA}`);
      this.scene.sound.play(ASSETS.SFX_VICTORIA, { 
        volume: CONFIG_AUDIO.obtenerVolumen(ASSETS.SFX_VICTORIA) 
      });
    } else {
      console.warn(`[AudioVictoria] ⚠️ No se encontró el asset de audio: ${ASSETS.SFX_VICTORIA} en el cache.`);
    }

    SistemaEventos.obtener().emit(EVENTOS.META_ALCANZADA, {
      x: this.x,
      y: this.y,
      bandera: this,
    });
    return true;
  }
}
