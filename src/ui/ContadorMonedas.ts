import Phaser from "phaser";

/**
 * Representación visual del contador de monedas en el HUD.
 */
export class ContadorMonedas {
  private texto: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    monedasIniciales: number = 0,
  ) {
    this.texto = scene.add.text(x, y, `MONEDAS: ${monedasIniciales}`, {
      fontSize: "10px",
      fontFamily: '"Press Start 2P"',
      color: "#ffff00",
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: "#000",
        blur: 2,
        fill: true,
      },
    });

    this.texto.setScrollFactor(0);
  }

  /**
   * Actualiza el texto mostrado y ejecuta un pequeño salto visual para dar feedback.
   */
  public actualizar(monedas: number): void {
    // Seguridad: Si el objeto fue destruido o la escena ya no es válida, abortamos
    if (!this.texto || !this.texto.scene || !this.texto.active) return;

    if (this.texto.text === `MONEDAS: ${monedas}`) return;

    this.texto.setText(`MONEDAS: ${monedas}`);

    this.texto.scene.tweens.add({
      targets: this.texto,
      scale: 1.2,
      duration: 100,
      yoyo: true,
    });
  }
}
