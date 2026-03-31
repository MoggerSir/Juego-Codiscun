import Phaser from "phaser";
import { PowerUp } from "./PowerUp";
import { ASSETS } from "@constantes/constantes-assets";
import { EVENTOS, SistemaEventos } from "@sistemas/SistemaEventos";
import type { Jugador } from "@entidades/jugador/Jugador";
import { JUEGO } from "@constantes/constantes-juego";

export class Hongo extends PowerUp {
  private direccion: 1 | -1 = 1;

  constructor(escena: Phaser.Scene, x: number, y: number) {
    // Usamos el sprite del hongo
    super(escena, x, y, ASSETS.HONGO_SPRITE);
    
    // El sprite mide típicamente 16x16, ajustamos collision box si es necesario
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 16);
    
    // Animación de aparición ascendente (opcional)
    this.scene.tweens.add({
      targets: this,
      y: y - 16,
      duration: 300,
      ease: 'Linear',
      onComplete: () => {
        this.iniciarMovimiento(this.direccion);
      }
    });
  }

  public update(): void {
    if (!this.active || !this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Girar en colisiones laterales (paredes)
    if (body.blocked.left || body.blocked.right) {
      this.direccion = (this.direccion === 1 ? -1 : 1) as 1 | -1;
      this.iniciarMovimiento(this.direccion);
    }
  }

  public alSerRecogido(jugador: Jugador): void {
    // Evitar recolecciones dobles
    if (!this.active) return;

    // Feedback sonoro inmediato (Play Safe)
    if (this.scene.cache.audio.exists(ASSETS.SFX_POWER_UP)) {
      this.scene.sound.play(ASSETS.SFX_POWER_UP, { volume: 0.7 });
    }

    this.setActive(false);

    // Sumar puntos
    const bus = SistemaEventos.obtener();
    bus.emit(EVENTOS.PUNTUACION_SUMAR, { puntos: JUEGO.PUNTOS_HONGO });
    bus.emit(EVENTOS.PUNTOS_FLOTANTES, { x: this.x, y: this.y, puntos: JUEGO.PUNTOS_HONGO });

    // Hacer crecer al jugador y darle vida extra real
    jugador.crecer();
    jugador.ganarVidaExtra();

    // Destruir el power-up
    this.destroy();
  }
}
