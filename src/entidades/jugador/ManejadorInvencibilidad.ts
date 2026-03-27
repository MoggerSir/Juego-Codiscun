import Phaser from 'phaser';

/**
 * Gestiona el estado de invencibilidad y el feedback visual del jugador.
 */
export class ManejadorInvencibilidad {
  private escena: Phaser.Scene;
  private objetivo: Phaser.GameObjects.Sprite;
  private invencible: boolean = false;
  private duracion: number;
  private parpadeoTween?: Phaser.Tweens.Tween;

  constructor(escena: Phaser.Scene, objetivo: Phaser.GameObjects.Sprite, duracionMs: number = 1200) {
    this.escena = escena;
    this.objetivo = objetivo;
    this.duracion = duracionMs;
  }

  /**
   * Activa el modo invencible y el parpadeo visual.
   */
  public activar(): void {
    if (this.invencible) return;

    this.invencible = true;

    // Feedback visual: Parpadeo usando un Tween de Phaser
    this.parpadeoTween = this.escena.tweens.add({
      targets: this.objetivo,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: -1 // Infinito hasta que se detenga
    });

    // Desactivar tras la duración especificada usando el sistema de tiempo de Phaser
    this.escena.time.delayedCall(this.duracion, () => {
      this.desactivar();
    });
  }

  /**
   * Desactiva el modo invencible y restaura el estado visual original.
   */
  private desactivar(): void {
    this.invencible = false;
    
    if (this.parpadeoTween) {
      this.parpadeoTween.stop();
      this.parpadeoTween = undefined;
    }
    
    this.objetivo.setAlpha(1);
  }

  public estaActiva(): boolean {
    return this.invencible;
  }
}
