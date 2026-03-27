import Phaser from 'phaser';

/**
 * Gestiona puramente los efectos visuales de la invencibilidad (parpadeo).
 * Escucha eventos de cambio de estado para iniciar o detener los tweens.
 */
export class VisualInvencibilidad {
  private escena: Phaser.Scene;
  private objetivo: Phaser.GameObjects.Sprite;
  private parpadeoTween?: Phaser.Tweens.Tween;
  private eventoCambio: string;

  constructor(escena: Phaser.Scene, objetivo: Phaser.GameObjects.Sprite, eventoCambio: string = 'invencibilidad:cambio') {
    this.escena = escena;
    this.objetivo = objetivo;
    this.eventoCambio = eventoCambio;
    this.registrarEventos();
  }

  private registrarEventos(): void {
    // Escucha el evento de cambio para activar o desactivar el efecto visual
    this.escena.events.on(this.eventoCambio, (activado: boolean) => {
      if (activado) {
        this.empezarEfecto();
      } else {
        this.detenerEfecto();
      }
    });

    // Limpieza automática al destruir el sprite
    this.objetivo.once(Phaser.GameObjects.Events.DESTROY, () => {
      this.detenerEfecto();
      this.escena.events.off(this.eventoCambio);
    });
  }

  private empezarEfecto(): void {
    if (this.parpadeoTween) return;

    this.parpadeoTween = this.escena.tweens.add({
      targets: this.objetivo,
      alpha: 0,
      duration: 100,
      yoyo: true,
      repeat: -1
    });
  }

  private detenerEfecto(): void {
    if (this.parpadeoTween) {
      this.parpadeoTween.stop();
      this.parpadeoTween = undefined;
    }
    this.objetivo.setAlpha(1);
  }
}
