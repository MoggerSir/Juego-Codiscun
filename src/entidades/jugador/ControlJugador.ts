import Phaser from 'phaser';
import type { InputJugador } from '@tipos/tipos-jugador';
import { EstadoSession, EstadoJuego } from '@sistemas/EstadoSession';
import { EVENTOS, SistemaEventos } from '@sistemas/SistemaEventos';

export type ModoInput = 'teclado' | 'touch';

export class ControlJugador {
  private escena: Phaser.Scene;
  private modoInput: ModoInput;
  private ultimoCambioModo: number = 0;
  private readonly COOLDOWN_CAMBIO: number = 500;

  private teclas: {
    izquierda: Phaser.Input.Keyboard.Key;
    derecha: Phaser.Input.Keyboard.Key;
    saltar: Phaser.Input.Keyboard.Key;
    saltarAlt: Phaser.Input.Keyboard.Key;
  };

  private saltoBufferTiempo: number = 0;
  private readonly BUFFER_TIEMPO_MILI: number = 100;

  constructor(escena: Phaser.Scene) {
    this.escena = escena;
    const teclado = escena.input.keyboard!;

    // Inicialización pro: Detectar si tiene touch real
    this.modoInput = navigator.maxTouchPoints > 0 ? 'touch' : 'teclado';

    this.teclas = {
      izquierda: teclado.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      derecha: teclado.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      saltar: teclado.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      saltarAlt: teclado.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };

    this.registrarEscuchasModo();
    
    // LIMPIEZA OBLIGATORIA
    escena.events.on('shutdown', this.destruir, this);
  }

  private registrarEscuchasModo(): void {
    // Cambio a Touch (Solo si es táctil real, no mouse)
    this.escena.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.wasTouch) {
        this.intentarCambiarModo('touch');
      }
    });

    // Cambio a Teclado
    this.escena.input.keyboard?.on('keydown', () => {
      this.intentarCambiarModo('teclado');
    });
  }

  private intentarCambiarModo(nuevoModo: ModoInput): void {
    const ahora = Date.now();
    if (this.modoInput !== nuevoModo && ahora - this.ultimoCambioModo > this.COOLDOWN_CAMBIO) {
      this.modoInput = nuevoModo;
      this.ultimoCambioModo = ahora;
      console.log(`[Input] Modo cambiado a: ${nuevoModo}`);
      SistemaEventos.obtener().emit(EVENTOS.INPUT_MODO_CAMBIO, nuevoModo);
    }
  }

  public obtenerInput(): InputJugador {
    const session = EstadoSession.obtener();
    
    // Bloqueo Global: Si no estamos jugando, no hay input
    if (session.getEstado() !== EstadoJuego.JUGANDO) {
      return { izquierda: false, derecha: false, saltar: false };
    }

    if (this.modoInput === 'teclado') {
      return this.procesarInputTeclado();
    } else {
      return this.procesarInputTouch();
    }
  }

  private procesarInputTeclado(): InputJugador {
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

  private procesarInputTouch(): InputJugador {
    const time = Date.now();
    const { width } = this.escena.scale;
    const pointers = [this.escena.input.pointer1, this.escena.input.pointer2, this.escena.input.pointer3];
    
    let izquierda = false;
    let derecha = false;
    let quiereSaltar = false;

    // Zona de Muerte (Dead Zone) Proporcional: 10% del centro del área de movimiento
    const centroMov = width * 0.25;
    const deadZone = width * 0.05;

    pointers.forEach(pointer => {
      if (!pointer || !pointer.isDown) return;

      // Dividimos pantalla en 50/50
      if (pointer.x < width / 2) {
        // ZONA MOVIMIENTO (Izquierda)
        if (pointer.getDuration() < 50) {
            SistemaEventos.obtener().emit(EVENTOS.INPUT_FLASH_ZONA, 'izq');
        }

        // Dividido en izquierda y derecha
        if (pointer.x < centroMov - deadZone) izquierda = true;
        if (pointer.x > centroMov + deadZone) derecha = true;
      } else {
        // ZONA ACCIÓN (Derecha)
        if (pointer.getDuration() < 50) {
          this.saltoBufferTiempo = time;
          SistemaEventos.obtener().emit(EVENTOS.INPUT_FLASH_ZONA, 'der');
        }
        quiereSaltar = true; 
      }
    });

    if (time - this.saltoBufferTiempo < this.BUFFER_TIEMPO_MILI) {
      quiereSaltar = true;
    }

    return { izquierda, derecha, saltar: quiereSaltar };
  }
  
  public consumirSalto(): void {
    this.saltoBufferTiempo = 0;
  }
  
  public soltoSalto(): boolean {
    if (this.modoInput === 'teclado') {
      return this.teclas.saltar.isUp && this.teclas.saltarAlt.isUp;
    } else {
      // En touch, se suelta si no hay ningún pointer presionando la zona de acción
      const { width } = this.escena.scale;
      const ptrs = [this.escena.input.pointer1, this.escena.input.pointer2, this.escena.input.pointer3];
      return !ptrs.some(p => p && p.isDown && p.x > width / 2);
    }
  }

  public destruir(): void {
    // Sanidad Senior: Limpiar listeners de eventos del sistema de input
    this.escena.input.off('pointerdown');
    this.escena.input.keyboard?.off('keydown');
    
    Object.values(this.teclas).forEach(tecla => tecla.destroy());
  }
}
