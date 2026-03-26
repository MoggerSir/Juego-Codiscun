import Phaser from 'phaser';
import type { InputJugador } from '@tipos/tipos-jugador';

export class ControlJugador {
  private teclas: {
    izquierda: Phaser.Input.Keyboard.Key;
    derecha: Phaser.Input.Keyboard.Key;
    saltar: Phaser.Input.Keyboard.Key;
    saltarAlt: Phaser.Input.Keyboard.Key;
  };

  // MEJORA: Jump buffering para capturar pulsaciones justas antes de tocar suelo
  private saltoBufferTiempo: number = 0;
  private readonly BUFFER_TIEMPO_MILI: number = 100;

  constructor(escena: Phaser.Scene) {
    const teclado = escena.input.keyboard!;

    this.teclas = {
      izquierda: teclado.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      derecha: teclado.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      saltar: teclado.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      saltarAlt: teclado.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };

    // LIMPIEZA OBLIGATORIA al destruir la escena para evitar memory leaks 
    escena.events.on('shutdown', this.destruir, this);
  }

  public obtenerInput(): InputJugador {
    const time = Date.now();
    let quiereSaltar = false;

    if (
      Phaser.Input.Keyboard.JustDown(this.teclas.saltar) ||
      Phaser.Input.Keyboard.JustDown(this.teclas.saltarAlt)
    ) {
      this.saltoBufferTiempo = time;
    }

    if (time - this.saltoBufferTiempo < this.BUFFER_TIEMPO_MILI) {
      quiereSaltar = true;
    }

    return {
      izquierda: this.teclas.izquierda.isDown,
      derecha: this.teclas.derecha.isDown,
      saltar: quiereSaltar,
    };
  }
  
  public consumirSalto(): void {
    this.saltoBufferTiempo = 0;
  }
  
  public soltoSalto(): boolean {
    return this.teclas.saltar.isUp && this.teclas.saltarAlt.isUp;
  }

  public destruir(): void {
    Object.values(this.teclas).forEach(tecla => tecla.destroy());
  }
}
