import { FISICA } from '@constantes/constantes-fisica';
import type { Jugador } from './Jugador';
import type { InputJugador } from '@tipos/tipos-jugador';
import Phaser from 'phaser';

export class EstadosJugador {
  private jugador: Jugador;
  
  // MEJORA: Coyote time temporal (te permite saltar al salir del borde)
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
    const accelX = 1200; // Aceleración firme
    
    // MEJORA: Set Acceleration en lugar de Velocity pura
    if (input.izquierda) {
      body.setAccelerationX(-accelX);
      this.jugador.setFlipX(true);
      this.jugador.estado = 'corriendo';
    } else if (input.derecha) {
      body.setAccelerationX(accelX);
      this.jugador.setFlipX(false);
      this.jugador.estado = 'corriendo';
    } else {
      body.setAccelerationX(0);
      this.jugador.setVelocityX(
        Phaser.Math.Linear(body.velocity.x, 0, FISICA.FRICCION)
      );
      this.jugador.estado = 'idle';
    }
    
    if (!input.izquierda && !input.derecha && Math.abs(body.velocity.x) > 10) {
      this.jugador.estado = 'corriendo';
    }
  }

  private puedeSaltarCoyote(): boolean {
    return (Date.now() - this.tiempoUltimoSuelo) < this.COYOTE_TIEMPO_MILI;
  }

  private manejarSalto(input: InputJugador): void {
    const body = this.jugador.body as Phaser.Physics.Arcade.Body;

    if (input.saltar && this.puedeSaltarCoyote()) {
      this.jugador.setVelocityY(FISICA.FUERZA_SALTO);
      this.jugador.estado = 'saltando';
      this.tiempoUltimoSuelo = 0; // Agota coyote time
      this.jugador.consumirSalto(); // Limpia jump buffer
    }

    // MEJORA: Controlador de Salto Variable
    if (this.jugador.soltoSalto() && body.velocity.y < 0) {
      body.setGravityY(FISICA.GRAVEDAD * 1.5);
    } else {
      body.setGravityY(0);
    }

    if (!this.jugador.estaEnSuelo() && body.velocity.y > 0) {
      this.jugador.estado = 'cayendo';
    }
  }

  private actualizarAnimacion(): void {
    const currentAnim = this.jugador.anims.currentAnim?.key;
    let nextAnim = 'jugador-idle';

    switch (this.jugador.estado) {
      case 'idle':        nextAnim = 'jugador-idle'; break;
      case 'corriendo':   nextAnim = 'jugador-correr'; break;
      case 'saltando':    
      case 'cayendo':     nextAnim = 'jugador-saltar'; break;
    }

    if (currentAnim !== nextAnim) {
      this.jugador.anims.play(nextAnim, true);
    }
  }
}
