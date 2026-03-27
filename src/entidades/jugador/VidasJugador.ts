import Phaser from "phaser";

export class Vidas {
  private vidas: number;

  constructor(vidasIniciales: number = 3) {
    this.vidas = vidasIniciales;
  }

  perderVida(): boolean {
    this.vidas--;
    return this.vidas <= 0;
  }

  ganarVida(): void {
    this.vidas++;
  }

  obtenerVidas(): number {
    return this.vidas;
  }
}

export class UI_Vidas {
  private texto: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, vidas: number) {
    this.texto = scene.add.text(10, 10, `Vidas: ${vidas}`, {
      fontSize: "24px",
      color: "#fff",
    });
  }

  actualizar(vidas: number) {
    this.texto.setText(`Vidas: ${vidas}`);
  }
}