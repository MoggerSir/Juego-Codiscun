import Phaser from 'phaser';

/**
 * Gestiona puramente el estado lógico de invencibilidad y el temporizador.
 * No tiene dependencias de visuales ni animaciones.
 */
export class ComponenteInvencibilidad {
  private escena: Phaser.Scene;
  private invencible: boolean = false;
  private duracion: number;
  private eventoCambio: string;

  constructor(escena: Phaser.Scene, duracionMs: number = 1200, eventoCambio: string = 'invencibilidad:cambio') {
    this.escena = escena;
    this.duracion = duracionMs;
    this.eventoCambio = eventoCambio;
  }

  /**
   * Activa el estado invencible por la duración especificada.
   */
  public activar(): void {
    if (this.invencible) return;

    this.invencible = true;
    this.notificar(true);

    // Temporizador usando el sistema de tiempo de Phaser (independiente de FPS)
    this.escena.time.delayedCall(this.duracion, () => {
      this.desactivar();
    });
  }

  private desactivar(): void {
    this.invencible = false;
    this.notificar(false);
  }

  public estaActiva(): boolean {
    return this.invencible;
  }

  private notificar(estado: boolean): void {
    // Notifica el cambio de estado (puede ser mediante un bus de eventos)
    this.escena.events.emit(this.eventoCambio, estado);
    // También enviamos al bus global si es necesario
    this.escena.game.events.emit(this.eventoCambio, estado);
  }
}
