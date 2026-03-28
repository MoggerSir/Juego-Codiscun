import Phaser from "phaser";
import { ESCENAS } from "@constantes/constantes-escenas";

export class EscenaGameOver extends Phaser.Scene {
  private puntosFinal: number = 0;

  constructor() {
    super({ key: ESCENAS.GAME_OVER });
  }

  init(data: { puntos: number }): void {
    this.puntosFinal = data.puntos || 0;
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 3, "GAME OVER", {
        fontSize: "48px",
        color: "#ff4444",
        fontFamily: "Arial",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2, `Puntuación: ${this.puntosFinal}`, {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 60, "Presiona ESPACIO o Toca para Reintentar", {
        fontSize: "18px",
        color: "#aaaaaa",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);

    // Reiniciar
    const reintentar = () => {
      this.scene.start(ESCENAS.JUEGO);
    };

    this.input.keyboard?.once("keydown-SPACE", reintentar);
    this.input.once("pointerdown", reintentar);
  }
}
