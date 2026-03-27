import Phaser from "phaser";

/**
 * Representación visual del contador de vidas en el HUD.
 */
export class UI_Vidas {
  private texto: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, vidasIniciales: number) {
    this.texto = scene.add.text(x, y, `VIDAS: ${vidasIniciales}`, {
      fontSize: "18px", 
      fontFamily: '"Press Start 2P"',
      color: "#ffffff",
    });
    
    // Asegurar que el texto no se mueva con la cámara del juego (aunque está en EscenaUI)
    this.texto.setScrollFactor(0);
  }

  /**
   * Actualiza el texto mostrado.
   */
  public actualizar(vidas: number): void {
    this.texto.setText(`VIDAS: ${vidas}`);
    
    // Efecto visual de parpadeo rápido al cambiar
    this.texto.scene.tweens.add({
      targets: this.texto,
      scale: 1.2,
      duration: 100,
      yoyo: true
    });
  }
}
