import { FISICA } from "@constantes/constantes-fisica";
import { ASSETS } from "@constantes/constantes-assets";
import type { Jugador } from "./Jugador";
import type { InputJugador } from "@tipos/tipos-jugador";
import Phaser from "phaser";

export class EstadosJugador {
  private jugador: Jugador;

  private tiempoUltimoSuelo: number = 0;
  private readonly COYOTE_TIEMPO_MILI: number = 120;

  constructor(jugador: Jugador) {
    this.jugador = jugador;
  }

  public actualizar(input: InputJugador): void {
    if (this.jugador.estaEnSuelo()) {
      this.tiempoUltimoSuelo = Date.now();
    }

    this.manejarMovimientoHorizontal(input);
    this.manejarSalto(input);
    this.actualizarAnimacion();
  }

  private manejarMovimientoHorizontal(input: InputJugador): void {
    const body = this.jugador.body as Phaser.Physics.Arcade.Body;
    const accelX = 1200;

    if (input.izquierda) {
      body.setAccelerationX(-accelX);
      this.jugador.setFlipX(true);
    } else if (input.derecha) {
      body.setAccelerationX(accelX);
      this.jugador.setFlipX(false);
    } else {
      body.setAccelerationX(0);
      this.jugador.setVelocityX(
        Phaser.Math.Linear(body.velocity.x, 0, FISICA.FRICCION),
      );
    }

    // --- Determinación de estado limpia y en un solo lugar ---
    // El estado se decide DESPUÉS de aplicar física, no entremezclado con ella.
    const hayInputHorizontal = input.izquierda || input.derecha;
    const hayInercia = Math.abs(body.velocity.x) > 10;

    if (hayInputHorizontal || hayInercia) {
      this.jugador.estado = "corriendo";
    } else {
      this.jugador.estado = "idle";
    }
  }

  private puedeSaltarCoyote(): boolean {
    return Date.now() - this.tiempoUltimoSuelo < this.COYOTE_TIEMPO_MILI;
  }

  private manejarSalto(input: InputJugador): void {
    const body = this.jugador.body as Phaser.Physics.Arcade.Body;

    if (input.saltar && this.puedeSaltarCoyote()) {
      this.jugador.setVelocityY(FISICA.FUERZA_SALTO);
      this.jugador.estado = "saltando";
      this.tiempoUltimoSuelo = 0;
      this.jugador.consumirSalto();

      if (this.jugador.scene.cache.audio.exists(ASSETS.SFX_SALTO)) {
        this.jugador.scene.sound.play(ASSETS.SFX_SALTO, { volume: 0.6 });
      }
    }

    if (this.jugador.soltoSalto() && body.velocity.y < 0) {
      body.setGravityY(FISICA.GRAVEDAD * 1.5);
    } else {
      body.setGravityY(0);
    }

    // El estado aéreo tiene prioridad sobre el horizontal solo al caer
    if (!this.jugador.estaEnSuelo() && body.velocity.y > 0) {
      this.jugador.estado = "cayendo";
    }
  }

  private actualizarAnimacion(): void {
    if (!this.jugador.active) return;

    const currentAnim = this.jugador.anims.currentAnim?.key;
    let nextAnim = "jugador-idle";

    switch (this.jugador.estado) {
      case "idle":
        nextAnim = "jugador-idle";
        break;
      case "corriendo":
        nextAnim = "jugador-correr";
        break;
      case "saltando":
      case "cayendo":
        nextAnim = "jugador-saltar";
        break;
    }

    if (currentAnim !== nextAnim) {
      if (this.jugador.scene.anims.exists(nextAnim)) {
        console.log(
          `[EstadosJugador] Transición: ${currentAnim || "None"} -> ${nextAnim}`,
        );
        this.jugador.anims.play(nextAnim, true);
      } else {
        console.warn(`[EstadosJugador] Animación no encontrada: ${nextAnim}`);
      }
    }
  }
}
