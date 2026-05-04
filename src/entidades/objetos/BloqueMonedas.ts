import Phaser from "phaser";
import { ASSETS } from "@constantes/constantes-assets";
import { EVENTOS, SistemaEventos } from "@sistemas/SistemaEventos";
import { JUEGO } from "@constantes/constantes-juego";
import type { Jugador } from "@entidades/jugador/Jugador";

export class BloqueMonedas extends Phaser.Physics.Arcade.Image {
  private activo: boolean = true;

  constructor(escena: Phaser.Scene, x: number, y: number) {
    // Para que parezca bloque ? (mismo provisional que el que suelta hongo)
    super(escena, x, y, ASSETS.BLOQUE_PREGUNTA);
    
    escena.add.existing(this);
    escena.physics.add.existing(this, true);
  }

  public alSerGolpeado(_jugador: Jugador): void {
    if (!this.activo) return;
    this.activo = false;

    // Feedback sonoro inmediato (Play Safe)
    if (this.scene.cache.audio.exists(ASSETS.SFX_MONEDA)) {
      this.scene.sound.play(ASSETS.SFX_MONEDA, { volume: 0.6 });
    }

    // Spawneamos visualmente las monedas
    this.soltarMonedasVisuales();

    // Puntos por romper el bloque
    const bus = SistemaEventos.obtener();
    bus.emit(EVENTOS.PUNTUACION_SUMAR, { puntos: JUEGO.PUNTOS_BLOQUE });
    bus.emit(EVENTOS.PUNTOS_FLOTANTES, { x: this.x, y: this.y, puntos: JUEGO.PUNTOS_BLOQUE });

    
    // El bloque se rompe inmediatamente y desaparece
    this.destroy();
  }

  private soltarMonedasVisuales(): void {
    // Se generan 3 monedas en forma de fuente/abanico
    const numMonedas = 3;
    const escena = this.scene;
    
    for (let i = 0; i < numMonedas; i++) {
      const offsetX = (i - 1) * 15; // -15, 0, 15
      
      // Creamos un sprite puramente visual (sin interacción con el jugador)
      const monedaVisual = escena.physics.add.sprite(this.x, this.y - 16, ASSETS.MONEDA_SPRITE);
      monedaVisual.setGravityY(700);
      monedaVisual.setVelocity(offsetX * 5, -350 - Math.random() * 50);
      
      // Las destruimos al caer
      escena.time.delayedCall(450, () => {
        escena.tweens.add({
          targets: monedaVisual,
          alpha: 0,
          duration: 150,
          onComplete: () => monedaVisual.destroy()
        });
      });

      // Efectuamos lógicamente la recolección
      const bus = SistemaEventos.obtener();
      bus.emit(EVENTOS.MONEDA_RECOGIDA);
      bus.emit(EVENTOS.PUNTUACION_SUMAR, { puntos: JUEGO.PUNTOS_MONEDA });
      bus.emit(EVENTOS.PUNTOS_FLOTANTES, { x: this.x + offsetX, y: this.y - 32, puntos: JUEGO.PUNTOS_MONEDA });
    }
  }
}
